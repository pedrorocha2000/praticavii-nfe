import { NextResponse } from 'next/server';
import { sql } from '@/database';

// GET - Listar todos os relacionamentos transportadora-fornecedor
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const codtrans = searchParams.get('codtrans');
    const codforn = searchParams.get('codforn');

    if (!codtrans && !codforn) {
      return NextResponse.json(
        { error: 'Código da transportadora ou código do fornecedor é obrigatório' },
        { status: 400 }
      );
    }

    const result = await sql`
      SELECT 
        tf.codtrans,
        tf.codforn,
        pt.nomerazao as nome_transportadora,
        pf.nomerazao as nome_fornecedor
      FROM sistema_nfe.transp_forn tf
      JOIN sistema_nfe.transportadoras t ON t.codtrans = tf.codtrans
      JOIN sistema_nfe.fornecedores f ON f.codforn = tf.codforn
      JOIN sistema_nfe.pessoa pt ON pt.codigo = t.codpessoa
      JOIN sistema_nfe.pessoa pf ON pf.codigo = f.codpessoa
      WHERE ${codtrans ? sql`tf.codtrans = ${codtrans}` : sql`tf.codforn = ${codforn}`}
      ORDER BY ${codtrans ? sql`pf.nomerazao` : sql`pt.nomerazao`}
    `;

    return NextResponse.json(result);
  } catch (error) {
    console.error('Erro ao buscar relacionamentos transportadora-fornecedor:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar relacionamentos transportadora-fornecedor' },
      { status: 500 }
    );
  }
}

// POST - Criar novo relacionamento transportadora-fornecedor
export async function POST(request: Request) {
  try {
    const { codtrans, codforn } = await request.json();

    if (!codtrans || !codforn) {
      return NextResponse.json(
        { error: 'Código da transportadora e código do fornecedor são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se a transportadora existe
    const transportadoraExiste = await sql`
      SELECT 1 FROM sistema_nfe.transportadoras WHERE codtrans = ${codtrans}
    `;

    if (transportadoraExiste.length === 0) {
      return NextResponse.json(
        { error: 'Transportadora não encontrada' },
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
      FROM sistema_nfe.transp_forn 
      WHERE codtrans = ${codtrans} AND codforn = ${codforn}
    `;

    if (relacionamentoExiste.length > 0) {
      return NextResponse.json(
        { error: 'Relacionamento transportadora-fornecedor já existe' },
        { status: 400 }
      );
    }

    // Criar o relacionamento
    const novoRelacionamento = await sql`
      INSERT INTO sistema_nfe.transp_forn (codtrans, codforn)
      VALUES (${codtrans}, ${codforn})
      RETURNING *
    `;

    return NextResponse.json(novoRelacionamento[0], { status: 201 });
  } catch (error) {
    console.error('Erro ao criar relacionamento transportadora-fornecedor:', error);
    return NextResponse.json(
      { error: 'Erro ao criar relacionamento transportadora-fornecedor' },
      { status: 500 }
    );
  }
}

// DELETE - Excluir relacionamento transportadora-fornecedor
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const codtrans = searchParams.get('codtrans');
    const codforn = searchParams.get('codforn');

    if (!codtrans || !codforn) {
      return NextResponse.json(
        { error: 'Código da transportadora e código do fornecedor são obrigatórios' },
        { status: 400 }
      );
    }

    // Excluir o relacionamento
    const relacionamentoExcluido = await sql`
      DELETE FROM sistema_nfe.transp_forn
      WHERE codtrans = ${codtrans} AND codforn = ${codforn}
      RETURNING *
    `;

    if (relacionamentoExcluido.length === 0) {
      return NextResponse.json(
        { error: 'Relacionamento transportadora-fornecedor não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Relacionamento transportadora-fornecedor excluído com sucesso' }
    );
  } catch (error) {
    console.error('Erro ao excluir relacionamento transportadora-fornecedor:', error);
    return NextResponse.json(
      { error: 'Erro ao excluir relacionamento transportadora-fornecedor' },
      { status: 500 }
    );
  }
} 
 
 
 