import { NextResponse } from 'next/server';
import { sql } from '@/database';

export async function POST(request: Request) {
  try {
    const { codprod, codforn, valor_custo } = await request.json();

    if (!codprod || !codforn) {
      return NextResponse.json(
        { error: 'Código do produto e código do fornecedor são obrigatórios' },
        { status: 400 }
      );
    }

    // Verifica se o produto existe
    const produto = await sql`
      SELECT codprod FROM sistema_nfe.produtos WHERE codprod = ${codprod}
    `;

    if (produto.length === 0) {
      return NextResponse.json(
        { error: 'Produto não encontrado' },
        { status: 404 }
      );
    }

    // Verifica se o fornecedor existe
    const fornecedor = await sql`
      SELECT codforn FROM sistema_nfe.fornecedores WHERE codforn = ${codforn}
    `;

    if (fornecedor.length === 0) {
      return NextResponse.json(
        { error: 'Fornecedor não encontrado' },
        { status: 404 }
      );
    }

    // Verifica se o vínculo já existe
    const vinculoExistente = await sql`
      SELECT codprod, codforn 
      FROM sistema_nfe.produto_forn 
      WHERE codprod = ${codprod} AND codforn = ${codforn}
    `;

    if (vinculoExistente.length > 0) {
      return NextResponse.json(
        { error: 'Este produto já está vinculado a este fornecedor' },
        { status: 400 }
      );
    }

    // Insere o novo vínculo com valor_custo
    const result = await sql`
      INSERT INTO sistema_nfe.produto_forn (codprod, codforn, valor_custo)
      VALUES (${codprod}, ${codforn}, ${valor_custo || 0})
      RETURNING *
    `;

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Erro ao vincular produto ao fornecedor:', error);
    return NextResponse.json(
      { error: 'Erro ao vincular produto ao fornecedor' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { codprod, codforn, valor_custo } = await request.json();

    if (!codprod || !codforn) {
      return NextResponse.json(
        { error: 'Código do produto e código do fornecedor são obrigatórios' },
        { status: 400 }
      );
    }

    // Verifica se o vínculo existe
    const vinculoExistente = await sql`
      SELECT codprod, codforn 
      FROM sistema_nfe.produto_forn 
      WHERE codprod = ${codprod} AND codforn = ${codforn}
    `;

    if (vinculoExistente.length === 0) {
      return NextResponse.json(
        { error: 'Vínculo não encontrado' },
        { status: 404 }
      );
    }

    // Atualiza o vínculo com o novo valor_custo
    const result = await sql`
      UPDATE sistema_nfe.produto_forn
      SET valor_custo = ${valor_custo || 0}
      WHERE codprod = ${codprod} AND codforn = ${codforn}
      RETURNING *
    `;

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Erro ao atualizar vínculo:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar vínculo' },
      { status: 500 }
    );
  }
}

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

    // Verifica se o vínculo existe
    const vinculoExistente = await sql`
      SELECT codprod, codforn 
      FROM sistema_nfe.produto_forn 
      WHERE codprod = ${codprod} AND codforn = ${codforn}
    `;

    if (vinculoExistente.length === 0) {
      return NextResponse.json(
        { error: 'Vínculo não encontrado' },
        { status: 404 }
      );
    }

    // Remove o vínculo
    await sql`
      DELETE FROM sistema_nfe.produto_forn
      WHERE codprod = ${codprod} AND codforn = ${codforn}
    `;

    return NextResponse.json({ message: 'Vínculo removido com sucesso' });
  } catch (error) {
    console.error('Erro ao remover vínculo:', error);
    return NextResponse.json(
      { error: 'Erro ao remover vínculo' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const codprod = searchParams.get('codprod');

    if (!codprod) {
      return NextResponse.json(
        { error: 'Código do produto é obrigatório' },
        { status: 400 }
      );
    }

    const result = await sql`
      SELECT 
        pf.codprod,
        pf.codforn,
        pf.valor_custo,
        f.nome as nome_fornecedor
      FROM sistema_nfe.produto_forn pf
      JOIN sistema_nfe.fornecedores f ON f.codforn = pf.codforn
      WHERE pf.codprod = ${codprod}
      ORDER BY f.nome
    `;

    return NextResponse.json(result);
  } catch (error) {
    console.error('Erro ao buscar fornecedores do produto:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar fornecedores do produto' },
      { status: 500 }
    );
  }
} 