import { NextResponse } from 'next/server';
import { sql } from '@/database';

// GET - Listar todas as condições de pagamento com suas parcelas
export async function GET(request: Request) {
  try {
    const condPgto = await sql`
      SELECT 
        cp.codcondpgto,
        cp.descricao,
        cp.juros_perc,
        cp.multa_perc,
        cp.desconto_perc,
        json_agg(
          json_build_object(
            'numparc', pcp.numparc,
            'codformapgto', pcp.codformapgto,
            'descricao_forma', fp.descricao,
            'dias', pcp.dias,
            'percentual', pcp.percentual
          ) ORDER BY pcp.numparc
        ) as parcelas
      FROM sistema_nfe.cond_pgto cp
      LEFT JOIN sistema_nfe.parcelas_contapgto pcp ON cp.codcondpgto = pcp.codcondpgto
      LEFT JOIN sistema_nfe.formapgto fp ON pcp.codformapgto = fp.codformapgto
      GROUP BY cp.codcondpgto, cp.descricao, cp.juros_perc, cp.multa_perc, cp.desconto_perc
      ORDER BY cp.codcondpgto
    `;

    return NextResponse.json(condPgto);
  } catch (error) {
    console.error('Erro ao buscar condições de pagamento:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar condições de pagamento' },
      { status: 500 }
    );
  }
}

// POST - Criar nova condição de pagamento
export async function POST(request: Request) {
  try {
    const { codcondpgto, descricao, juros_perc, multa_perc, desconto_perc, parcelas } = await request.json();

    // Validações básicas
    if (!codcondpgto || !descricao || !parcelas || !Array.isArray(parcelas) || parcelas.length === 0) {
      return NextResponse.json(
        { error: 'Campos obrigatórios não preenchidos' },
        { status: 400 }
      );
    }

    // Validar soma dos percentuais = 100%
    const somaPercentuais = parcelas.reduce((sum, parcela) => sum + (parcela.percentual || 0), 0);
    if (Math.abs(somaPercentuais - 100) > 0.01) {
      return NextResponse.json(
        { error: 'A soma dos percentuais das parcelas deve ser 100%' },
        { status: 400 }
      );
    }

    // Verificar se já existe
    const condPgtoExiste = await sql`
      SELECT 1 FROM sistema_nfe.cond_pgto WHERE codcondpgto = ${codcondpgto}
    `;

    if (condPgtoExiste.length > 0) {
      return NextResponse.json(
        { error: 'Condição de pagamento já existe' },
        { status: 400 }
      );
    }

    // Validar formas de pagamento das parcelas
    for (const parcela of parcelas) {
      if (!parcela.numparc || !parcela.codformapgto || !parcela.dias || parcela.percentual === undefined) {
        return NextResponse.json(
          { error: 'Dados da parcela incompletos' },
          { status: 400 }
        );
      }

      const formaPgtoExiste = await sql`
        SELECT 1 FROM sistema_nfe.formapgto WHERE codformapgto = ${parcela.codformapgto}
      `;

      if (formaPgtoExiste.length === 0) {
        return NextResponse.json(
          { error: `Forma de pagamento ${parcela.codformapgto} não encontrada` },
          { status: 400 }
        );
      }
    }

    // Inserir condição de pagamento
    const novaCondPgto = await sql`
      INSERT INTO sistema_nfe.cond_pgto (
        codcondpgto,
        descricao,
        juros_perc,
        multa_perc,
        desconto_perc
      ) VALUES (
        ${codcondpgto},
        ${descricao},
        ${juros_perc || 0},
        ${multa_perc || 0},
        ${desconto_perc || 0}
      )
      RETURNING *
    `;

    // Inserir parcelas
    for (const parcela of parcelas) {
      await sql`
        INSERT INTO sistema_nfe.parcelas_contapgto (
          codcondpgto,
          numparc,
          codformapgto,
          dias,
          percentual
        ) VALUES (
          ${codcondpgto},
          ${parcela.numparc},
          ${parcela.codformapgto},
          ${parcela.dias},
          ${parcela.percentual}
        )
      `;
    }

    return NextResponse.json(novaCondPgto[0], { status: 201 });
  } catch (error) {
    console.error('Erro ao criar condição de pagamento:', error);
    return NextResponse.json(
      { error: 'Erro ao criar condição de pagamento' },
      { status: 500 }
    );
  }
}

// PUT - Atualizar condição de pagamento
export async function PUT(request: Request) {
  try {
    const { codcondpgto, descricao, juros_perc, multa_perc, desconto_perc, parcelas } = await request.json();

    // Validações básicas
    if (!codcondpgto || !descricao || !parcelas || !Array.isArray(parcelas) || parcelas.length === 0) {
      return NextResponse.json(
        { error: 'Campos obrigatórios não preenchidos' },
        { status: 400 }
      );
    }

    // Validar soma dos percentuais = 100%
    const somaPercentuais = parcelas.reduce((sum, parcela) => sum + (parcela.percentual || 0), 0);
    if (Math.abs(somaPercentuais - 100) > 0.01) {
      return NextResponse.json(
        { error: 'A soma dos percentuais das parcelas deve ser 100%' },
        { status: 400 }
      );
    }

    // Verificar se existe
    const condPgtoExiste = await sql`
      SELECT 1 FROM sistema_nfe.cond_pgto WHERE codcondpgto = ${codcondpgto}
    `;

    if (condPgtoExiste.length === 0) {
      return NextResponse.json(
        { error: 'Condição de pagamento não encontrada' },
        { status: 404 }
      );
    }

    // Validar formas de pagamento das parcelas
    for (const parcela of parcelas) {
      if (!parcela.numparc || !parcela.codformapgto || !parcela.dias || parcela.percentual === undefined) {
        return NextResponse.json(
          { error: 'Dados da parcela incompletos' },
          { status: 400 }
        );
      }

      const formaPgtoExiste = await sql`
        SELECT 1 FROM sistema_nfe.formapgto WHERE codformapgto = ${parcela.codformapgto}
      `;

      if (formaPgtoExiste.length === 0) {
        return NextResponse.json(
          { error: `Forma de pagamento ${parcela.codformapgto} não encontrada` },
          { status: 400 }
        );
      }
    }

    // Atualizar condição de pagamento
    const condPgtoAtualizada = await sql`
      UPDATE sistema_nfe.cond_pgto
      SET 
        descricao = ${descricao},
        juros_perc = ${juros_perc || 0},
        multa_perc = ${multa_perc || 0},
        desconto_perc = ${desconto_perc || 0}
      WHERE codcondpgto = ${codcondpgto}
      RETURNING *
    `;

    // Excluir parcelas antigas
    await sql`
      DELETE FROM sistema_nfe.parcelas_contapgto
      WHERE codcondpgto = ${codcondpgto}
    `;

    // Inserir novas parcelas
    for (const parcela of parcelas) {
      await sql`
        INSERT INTO sistema_nfe.parcelas_contapgto (
          codcondpgto,
          numparc,
          codformapgto,
          dias,
          percentual
        ) VALUES (
          ${codcondpgto},
          ${parcela.numparc},
          ${parcela.codformapgto},
          ${parcela.dias},
          ${parcela.percentual}
        )
      `;
    }

    return NextResponse.json(condPgtoAtualizada[0]);
  } catch (error) {
    console.error('Erro ao atualizar condição de pagamento:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar condição de pagamento' },
      { status: 500 }
    );
  }
}

// DELETE - Excluir condição de pagamento
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const codcondpgto = searchParams.get('codcondpgto');

    if (!codcondpgto) {
      return NextResponse.json(
        { error: 'Código da condição de pagamento é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se está sendo usada em notas fiscais
    const notasVinculadas = await sql`
      SELECT 1 FROM sistema_nfe.nfe WHERE codcondpgto = ${parseInt(codcondpgto)}
    `;

    if (notasVinculadas.length > 0) {
      return NextResponse.json(
        { error: 'Não é possível excluir pois existem notas fiscais vinculadas' },
        { status: 400 }
      );
    }

    // Excluir parcelas
    await sql`
      DELETE FROM sistema_nfe.parcelas_contapgto
      WHERE codcondpgto = ${parseInt(codcondpgto)}
    `;

    // Excluir condição de pagamento
    const condPgtoExcluida = await sql`
      DELETE FROM sistema_nfe.cond_pgto
      WHERE codcondpgto = ${parseInt(codcondpgto)}
      RETURNING *
    `;

    if (condPgtoExcluida.length === 0) {
      return NextResponse.json(
        { error: 'Condição de pagamento não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Condição de pagamento excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir condição de pagamento:', error);
    return NextResponse.json(
      { error: 'Erro ao excluir condição de pagamento' },
      { status: 500 }
    );
  }
} 