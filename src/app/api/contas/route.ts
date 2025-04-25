import { NextResponse } from 'next/server';
import { sql } from '@/database';

// GET - Listar contas com filtros
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tipo = searchParams.get('tipo'); // P = Pagar, R = Receber
    const status = searchParams.get('status'); // PAGO, ABERTO
    const modelo = searchParams.get('modelo');
    const serie = searchParams.get('serie');
    const numnfe = searchParams.get('numnfe');

    let query = sql`
      SELECT 
        c.*,
        f.descricao as forma_pagamento,
        CASE 
          WHEN c.datapagamento IS NOT NULL THEN 'PAGO'
          WHEN c.datavencimento < CURRENT_DATE THEN 'VENCIDO'
          ELSE 'ABERTO'
        END as status
      FROM sistema_nfe.contas c
      LEFT JOIN sistema_nfe.formapgto f ON c.codformapgto = f.codformapgto
      WHERE 1=1
    `;

    // Filtros
    if (tipo) {
      query = sql`${query} AND c.tipo = ${tipo}`;
    }

    if (status === 'PAGO') {
      query = sql`${query} AND c.datapagamento IS NOT NULL`;
    } else if (status === 'ABERTO') {
      query = sql`${query} AND c.datapagamento IS NULL`;
    }

    if (modelo && serie && numnfe) {
      query = sql`${query} 
        AND c.modelo = ${parseInt(modelo)}
        AND c.serie = ${parseInt(serie)}
        AND c.numnfe = ${parseInt(numnfe)}
      `;
    }

    // Ordenação
    query = sql`${query} 
      ORDER BY 
        CASE WHEN c.datapagamento IS NULL THEN 0 ELSE 1 END,
        c.datavencimento,
        c.modelo, 
        c.serie, 
        c.numnfe, 
        c.codparc
    `;

    const contas = await query;
    return NextResponse.json(contas);
  } catch (error) {
    console.error('Erro ao buscar contas:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar contas' },
      { status: 500 }
    );
  }
}

// POST - Criar contas a partir de uma NFe
export async function POST(request: Request) {
  try {
    const {
      modelo,
      serie,
      numnfe,
      tipo,
      parcelas
    } = await request.json();

    // Validações básicas
    if (!modelo || !serie || !numnfe || !tipo || !parcelas || !parcelas.length) {
      return NextResponse.json(
        { error: 'Dados obrigatórios não fornecidos' },
        { status: 400 }
      );
    }

    // Verificar se a nota fiscal existe
    const notaExiste = await sql`
      SELECT valortotal, codformapgto, codcondpgto
      FROM sistema_nfe.nfe 
      WHERE modelo = ${modelo}
      AND serie = ${serie}
      AND numnfe = ${numnfe}
    `;

    if (notaExiste.length === 0) {
      return NextResponse.json(
        { error: 'Nota fiscal não encontrada' },
        { status: 404 }
      );
    }

    // Verificar se já existem contas para esta nota
    const contasExistentes = await sql`
      SELECT 1
      FROM sistema_nfe.contas
      WHERE modelo = ${modelo}
      AND serie = ${serie}
      AND numnfe = ${numnfe}
    `;

    if (contasExistentes.length > 0) {
      return NextResponse.json(
        { error: 'Já existem contas cadastradas para esta nota fiscal' },
        { status: 400 }
      );
    }

    // Inserir as contas
    const contasInseridas = [];
    for (const parcela of parcelas) {
      const novaConta = await sql`
        INSERT INTO sistema_nfe.contas (
          modelo,
          serie,
          numnfe,
          codparc,
          numparc,
          datavencimento,
          valorparcela,
          codformapgto,
          tipo
        ) VALUES (
          ${modelo},
          ${serie},
          ${numnfe},
          ${parcela.codparc},
          ${parcela.numparc},
          ${parcela.datavencimento},
          ${parcela.valorparcela},
          ${parcela.codformapgto},
          ${tipo}
        )
        RETURNING *
      `;
      contasInseridas.push(novaConta[0]);
    }

    return NextResponse.json(contasInseridas, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar contas:', error);
    return NextResponse.json(
      { error: 'Erro ao criar contas' },
      { status: 500 }
    );
  }
}

// PUT - Atualizar conta (registrar pagamento)
export async function PUT(request: Request) {
  try {
    const {
      modelo,
      serie,
      numnfe,
      codparc,
      numparc,
      datapagamento,
      valorpago,
      codformapgto
    } = await request.json();

    // Validações básicas
    if (!modelo || !serie || !numnfe || !codparc || !numparc || !datapagamento || !valorpago) {
      return NextResponse.json(
        { error: 'Dados obrigatórios não fornecidos' },
        { status: 400 }
      );
    }

    // Verificar se a conta existe
    const contaExiste = await sql`
      SELECT valorparcela, datapagamento
      FROM sistema_nfe.contas
      WHERE modelo = ${modelo}
      AND serie = ${serie}
      AND numnfe = ${numnfe}
      AND codparc = ${codparc}
      AND numparc = ${numparc}
    `;

    if (contaExiste.length === 0) {
      return NextResponse.json(
        { error: 'Conta não encontrada' },
        { status: 404 }
      );
    }

    // Se a conta já foi paga, não permite alterar
    if (contaExiste[0].datapagamento) {
      return NextResponse.json(
        { error: 'Esta conta já foi paga' },
        { status: 400 }
      );
    }

    // Atualizar a conta
    const contaAtualizada = await sql`
      UPDATE sistema_nfe.contas
      SET 
        datapagamento = ${datapagamento},
        valorpago = ${valorpago},
        codformapgto = COALESCE(${codformapgto}, codformapgto)
      WHERE modelo = ${modelo}
      AND serie = ${serie}
      AND numnfe = ${numnfe}
      AND codparc = ${codparc}
      AND numparc = ${numparc}
      RETURNING *
    `;

    return NextResponse.json(contaAtualizada[0]);
  } catch (error) {
    console.error('Erro ao atualizar conta:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar conta' },
      { status: 500 }
    );
  }
}

// DELETE - Excluir conta
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const modelo = searchParams.get('modelo');
    const serie = searchParams.get('serie');
    const numnfe = searchParams.get('numnfe');
    const codparc = searchParams.get('codparc');
    const numparc = searchParams.get('numparc');

    // Validações básicas
    if (!modelo || !serie || !numnfe || !codparc || !numparc) {
      return NextResponse.json(
        { error: 'Dados obrigatórios não fornecidos' },
        { status: 400 }
      );
    }

    // Verificar se a conta existe e não está paga
    const contaExiste = await sql`
      SELECT datapagamento
      FROM sistema_nfe.contas
      WHERE modelo = ${parseInt(modelo)}
      AND serie = ${parseInt(serie)}
      AND numnfe = ${parseInt(numnfe)}
      AND codparc = ${parseInt(codparc)}
      AND numparc = ${parseInt(numparc)}
    `;

    if (contaExiste.length === 0) {
      return NextResponse.json(
        { error: 'Conta não encontrada' },
        { status: 404 }
      );
    }

    if (contaExiste[0].datapagamento) {
      return NextResponse.json(
        { error: 'Não é possível excluir uma conta já paga' },
        { status: 400 }
      );
    }

    // Excluir a conta
    await sql`
      DELETE FROM sistema_nfe.contas
      WHERE modelo = ${parseInt(modelo)}
      AND serie = ${parseInt(serie)}
      AND numnfe = ${parseInt(numnfe)}
      AND codparc = ${parseInt(codparc)}
      AND numparc = ${parseInt(numparc)}
    `;

    return NextResponse.json({ message: 'Conta excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir conta:', error);
    return NextResponse.json(
      { error: 'Erro ao excluir conta' },
      { status: 500 }
    );
  }
} 