import { NextResponse } from 'next/server';
import { sql } from '@/database';

// GET - Listar todos os relacionamentos produto-fornecedor
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const codprod = searchParams.get('codprod');
    const codforn = searchParams.get('codforn');

    if (!codprod && !codforn) {
      return NextResponse.json(
        { error: 'Código do produto ou código do fornecedor é obrigatório' },
        { status: 400 }
      );
    }

    const result = await sql`
      SELECT 
        pf.codprod,
        pf.codforn,
        pf.valor_custo,
        p.nome as nome_produto,
        pes.nomerazao as nome_fornecedor
      FROM sistema_nfe.produto_forn pf
      JOIN sistema_nfe.produtos p ON p.codprod = pf.codprod
      JOIN sistema_nfe.fornecedores f ON f.codforn = pf.codforn
      JOIN sistema_nfe.pessoa pes ON pes.codigo = f.codforn
      WHERE ${codprod ? sql`pf.codprod = ${codprod}` : sql`pf.codforn = ${codforn}`}
      ORDER BY ${codprod ? sql`pes.nomerazao` : sql`p.nome`}
    `;

    return NextResponse.json(result);
  } catch (error) {
    console.error('Erro ao buscar relacionamentos produto-fornecedor:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar relacionamentos produto-fornecedor' },
      { status: 500 }
    );
  }
}

// POST - Criar novo relacionamento produto-fornecedor
export async function POST(request: Request) {
  try {
    const { codprod, codforn, valor_custo } = await request.json();

    if (!codprod || !codforn) {
      return NextResponse.json(
        { error: 'Código do produto e código do fornecedor são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se o produto existe
    const produtoExiste = await sql`
      SELECT 1 FROM sistema_nfe.produtos WHERE codprod = ${codprod}
    `;

    if (produtoExiste.length === 0) {
      return NextResponse.json(
        { error: 'Produto não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se o fornecedor existe
    const fornecedorExiste = await sql`
      SELECT 1 FROM sistema_nfe.fornecedores WHERE codforn = ${codforn}
    `;

    if (fornecedorExiste.length === 0) {
      return NextResponse.json(
        { error: 'Fornecedor não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se o relacionamento já existe
    const relacionamentoExiste = await sql`
      SELECT 1 
      FROM sistema_nfe.produto_forn 
      WHERE codprod = ${codprod} AND codforn = ${codforn}
    `;

    if (relacionamentoExiste.length > 0) {
      return NextResponse.json(
        { error: 'Relacionamento produto-fornecedor já existe' },
        { status: 400 }
      );
    }

    // Criar o relacionamento com valor_custo
    const novoRelacionamento = await sql`
      INSERT INTO sistema_nfe.produto_forn (codprod, codforn, valor_custo)
      VALUES (${codprod}, ${codforn}, ${valor_custo || 0})
      RETURNING *
    `;

    return NextResponse.json(novoRelacionamento[0], { status: 201 });
  } catch (error) {
    console.error('Erro ao criar relacionamento produto-fornecedor:', error);
    return NextResponse.json(
      { error: 'Erro ao criar relacionamento produto-fornecedor' },
      { status: 500 }
    );
  }
}

// DELETE - Excluir relacionamento produto-fornecedor
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const codprod = searchParams.get('codprod');
    const codforn = searchParams.get('codforn');

    if (!codprod || !codforn) {
      return NextResponse.json(
        { error: 'Código do produto e código do fornecedor são obrigatórios' },
        { status: 400 }
      );
    }

    // Excluir o relacionamento
    const relacionamentoExcluido = await sql`
      DELETE FROM sistema_nfe.produto_forn
      WHERE codprod = ${codprod} AND codforn = ${codforn}
      RETURNING *
    `;

    if (relacionamentoExcluido.length === 0) {
      return NextResponse.json(
        { error: 'Relacionamento produto-fornecedor não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Relacionamento produto-fornecedor excluído com sucesso' }
    );
  } catch (error) {
    console.error('Erro ao excluir relacionamento produto-fornecedor:', error);
    return NextResponse.json(
      { error: 'Erro ao excluir relacionamento produto-fornecedor' },
      { status: 500 }
    );
  }
}

// PUT - Atualizar valor_custo do relacionamento produto-fornecedor
export async function PUT(request: Request) {
  try {
    const { codprod, codforn, valor_custo } = await request.json();

    if (!codprod || !codforn) {
      return NextResponse.json(
        { error: 'Código do produto e código do fornecedor são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se o relacionamento existe
    const relacionamentoExiste = await sql`
      SELECT 1 
      FROM sistema_nfe.produto_forn 
      WHERE codprod = ${codprod} AND codforn = ${codforn}
    `;

    if (relacionamentoExiste.length === 0) {
      return NextResponse.json(
        { error: 'Relacionamento produto-fornecedor não encontrado' },
        { status: 404 }
      );
    }

    // Atualizar o valor_custo
    const relacionamentoAtualizado = await sql`
      UPDATE sistema_nfe.produto_forn
      SET valor_custo = ${valor_custo || 0}
      WHERE codprod = ${codprod} AND codforn = ${codforn}
      RETURNING *
    `;

    return NextResponse.json(relacionamentoAtualizado[0]);
  } catch (error) {
    console.error('Erro ao atualizar relacionamento produto-fornecedor:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar relacionamento produto-fornecedor' },
      { status: 500 }
    );
  }
} 