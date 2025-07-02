import { NextResponse } from 'next/server';
import { sql } from '@/database';

// GET - Listar todas as formas de pagamento
export async function GET() {
  try {
    const formasPagamento = await sql`
      SELECT codformapgto, descricao, data_criacao, data_alteracao, situacao
      FROM sistema_nfe.formapgto
      ORDER BY descricao
    `;
    return NextResponse.json(formasPagamento);
  } catch (error) {
    console.error('Erro ao buscar formas de pagamento:', error);
    return NextResponse.json({ error: 'Erro ao buscar formas de pagamento' }, { status: 500 });
  }
}

// POST - Criar nova forma de pagamento
export async function POST(request: Request) {
  try {
    const { descricao, situacao } = await request.json();

    if (!descricao) {
      return NextResponse.json(
        { error: 'Descrição é obrigatória' },
        { status: 400 }
      );
    }

    // Verificar se já existe uma forma de pagamento com a mesma descrição
    const formaPagamentoExiste = await sql`
      SELECT 1 FROM sistema_nfe.formapgto WHERE LOWER(descricao) = LOWER(${descricao})
    `;

    if (formaPagamentoExiste.length > 0) {
      return NextResponse.json(
        { error: 'Já existe uma forma de pagamento com esta descrição' },
        { status: 400 }
      );
    }

    // Inserir a forma de pagamento (codformapgto será gerado automaticamente)
    const novaFormaPagamento = await sql`
      INSERT INTO sistema_nfe.formapgto (descricao, situacao)
      VALUES (${descricao}, ${situacao || null})
      RETURNING *
    `;

    return NextResponse.json(novaFormaPagamento[0], { status: 201 });
  } catch (error) {
    console.error('Erro ao criar forma de pagamento:', error);
    return NextResponse.json({ error: 'Erro ao criar forma de pagamento' }, { status: 500 });
  }
}

// PUT - Atualizar forma de pagamento
export async function PUT(request: Request) {
  try {
    const { codformapgto, descricao, situacao } = await request.json();

    if (!codformapgto || !descricao) {
      return NextResponse.json(
        { error: 'Código e descrição são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se a forma de pagamento existe
    const formaPagamentoExiste = await sql`
      SELECT 1 FROM sistema_nfe.formapgto WHERE codformapgto = ${codformapgto}
    `;

    if (formaPagamentoExiste.length === 0) {
      return NextResponse.json(
        { error: 'Forma de pagamento não encontrada' },
        { status: 404 }
      );
    }

    // Verificar se já existe outra forma de pagamento com a mesma descrição
    const descricaoExiste = await sql`
      SELECT 1 FROM sistema_nfe.formapgto 
      WHERE LOWER(descricao) = LOWER(${descricao}) 
      AND codformapgto != ${codformapgto}
    `;

    if (descricaoExiste.length > 0) {
      return NextResponse.json(
        { error: 'Já existe outra forma de pagamento com esta descrição' },
        { status: 400 }
      );
    }

    // Atualizar a forma de pagamento
    const formaPagamentoAtualizada = await sql`
      UPDATE sistema_nfe.formapgto
      SET descricao = ${descricao}, situacao = ${situacao || null}
      WHERE codformapgto = ${codformapgto}
      RETURNING *
    `;

    return NextResponse.json(formaPagamentoAtualizada[0]);
  } catch (error) {
    console.error('Erro ao atualizar forma de pagamento:', error);
    return NextResponse.json({ error: 'Erro ao atualizar forma de pagamento' }, { status: 500 });
  }
}

// DELETE - Excluir forma de pagamento
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const codformapgto = searchParams.get('codformapgto');

    if (!codformapgto) {
      return NextResponse.json(
        { error: 'Código da forma de pagamento é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se a forma de pagamento existe
    const formaPagamentoExiste = await sql`
      SELECT 1 FROM sistema_nfe.formapgto WHERE codformapgto = ${codformapgto}
    `;

    if (formaPagamentoExiste.length === 0) {
      return NextResponse.json(
        { error: 'Forma de pagamento não encontrada' },
        { status: 404 }
      );
    }

    // Verificar se existem NFEs vinculadas
    const nfesVinculadas = await sql`
      SELECT 1 FROM sistema_nfe.nfe WHERE codformapgto = ${codformapgto}
    `;

    if (nfesVinculadas.length > 0) {
      return NextResponse.json(
        { error: 'Não é possível excluir a forma de pagamento pois existem NFEs vinculadas' },
        { status: 400 }
      );
    }

    // Verificar se existem contas vinculadas
    const contasVinculadas = await sql`
      SELECT 1 FROM sistema_nfe.contas WHERE codformapgto = ${codformapgto}
    `;

    if (contasVinculadas.length > 0) {
      return NextResponse.json(
        { error: 'Não é possível excluir a forma de pagamento pois existem contas vinculadas' },
        { status: 400 }
      );
    }

    // Verificar se existem parcelas vinculadas
    const parcelasVinculadas = await sql`
      SELECT 1 FROM sistema_nfe.parcelas_contapgto WHERE codformapgto = ${codformapgto}
    `;

    if (parcelasVinculadas.length > 0) {
      return NextResponse.json(
        { error: 'Não é possível excluir a forma de pagamento pois existem parcelas vinculadas' },
        { status: 400 }
      );
    }

    // Excluir a forma de pagamento
    const formaPagamentoExcluida = await sql`
      DELETE FROM sistema_nfe.formapgto
      WHERE codformapgto = ${codformapgto}
      RETURNING *
    `;

    return NextResponse.json({ message: 'Forma de pagamento excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir forma de pagamento:', error);
    return NextResponse.json({ error: 'Erro ao excluir forma de pagamento' }, { status: 500 });
  }
} 