import { NextResponse } from 'next/server';
import { sql } from '@/database';

// GET - Listar todos os itens de notas fiscais
export async function GET() {
  try {
    const itensNfe = await sql`
      SELECT i.*, n.datanfe, n.numnfe, n.valortotal as valortotalnfe,
             p.descricao as descproduto, p.unidade,
             f.nome as nomefornecedor
      FROM sistema_nfe.itens_nfe i
      LEFT JOIN sistema_nfe.nfe n ON i.codemp = n.codemp AND i.numnfe = n.numnfe
      LEFT JOIN sistema_nfe.produtos p ON i.codprod = p.codprod
      LEFT JOIN sistema_nfe.fornecedores f ON p.codforn = f.codforn
      ORDER BY n.datanfe DESC, i.item ASC
    `;
    return NextResponse.json(itensNfe);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar itens de notas fiscais' }, { status: 500 });
  }
}

// POST - Criar novo item de nota fiscal
export async function POST(request: Request) {
  try {
    const {
      codemp,
      numnfe,
      item,
      codprod,
      quantidade,
      valorunitario,
      valortotal
    } = await request.json();

    if (!codemp || !numnfe || !item || !codprod || !quantidade || !valorunitario || !valortotal) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se a nota fiscal existe
    const nfeExiste = await sql`
      SELECT 1 FROM sistema_nfe.nfe 
      WHERE codemp = ${codemp} AND numnfe = ${numnfe}
    `;

    if (nfeExiste.length === 0) {
      return NextResponse.json(
        { error: 'Nota fiscal não encontrada' },
        { status: 404 }
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

    // Verificar se já existe um item com o mesmo número para esta nota fiscal
    const itemExiste = await sql`
      SELECT 1 FROM sistema_nfe.itens_nfe 
      WHERE codemp = ${codemp} AND numnfe = ${numnfe} AND item = ${item}
    `;

    if (itemExiste.length > 0) {
      return NextResponse.json(
        { error: 'Já existe um item com este número para esta nota fiscal' },
        { status: 400 }
      );
    }

    // Inserir o item
    const novoItem = await sql`
      INSERT INTO sistema_nfe.itens_nfe (
        codemp, numnfe, item, codprod, quantidade, valorunitario, valortotal
      )
      VALUES (
        ${codemp}, ${numnfe}, ${item}, ${codprod}, ${quantidade}, ${valorunitario}, ${valortotal}
      )
      RETURNING *
    `;

    // Atualizar o valor total da nota fiscal
    await sql`
      UPDATE sistema_nfe.nfe
      SET valortotal = (
        SELECT SUM(valortotal)
        FROM sistema_nfe.itens_nfe
        WHERE codemp = ${codemp} AND numnfe = ${numnfe}
      )
      WHERE codemp = ${codemp} AND numnfe = ${numnfe}
    `;

    return NextResponse.json(novoItem[0], { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao criar item de nota fiscal' }, { status: 500 });
  }
}

// PUT - Atualizar item de nota fiscal
export async function PUT(request: Request) {
  try {
    const {
      codemp,
      numnfe,
      item,
      codprod,
      quantidade,
      valorunitario,
      valortotal
    } = await request.json();

    if (!codemp || !numnfe || !item || !codprod || !quantidade || !valorunitario || !valortotal) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se a nota fiscal existe
    const nfeExiste = await sql`
      SELECT 1 FROM sistema_nfe.nfe 
      WHERE codemp = ${codemp} AND numnfe = ${numnfe}
    `;

    if (nfeExiste.length === 0) {
      return NextResponse.json(
        { error: 'Nota fiscal não encontrada' },
        { status: 404 }
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

    // Atualizar o item
    const itemAtualizado = await sql`
      UPDATE sistema_nfe.itens_nfe
      SET 
        codprod = ${codprod},
        quantidade = ${quantidade},
        valorunitario = ${valorunitario},
        valortotal = ${valortotal}
      WHERE codemp = ${codemp} AND numnfe = ${numnfe} AND item = ${item}
      RETURNING *
    `;

    if (itemAtualizado.length === 0) {
      return NextResponse.json({ error: 'Item não encontrado' }, { status: 404 });
    }

    // Atualizar o valor total da nota fiscal
    await sql`
      UPDATE sistema_nfe.nfe
      SET valortotal = (
        SELECT SUM(valortotal)
        FROM sistema_nfe.itens_nfe
        WHERE codemp = ${codemp} AND numnfe = ${numnfe}
      )
      WHERE codemp = ${codemp} AND numnfe = ${numnfe}
    `;

    return NextResponse.json(itemAtualizado[0]);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao atualizar item de nota fiscal' }, { status: 500 });
  }
}

// DELETE - Excluir item de nota fiscal
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const codemp = searchParams.get('codemp');
    const numnfe = searchParams.get('numnfe');
    const item = searchParams.get('item');

    if (!codemp || !numnfe || !item) {
      return NextResponse.json(
        { error: 'Código da empresa, número da nota fiscal e número do item são obrigatórios' },
        { status: 400 }
      );
    }

    // Excluir o item
    const itemExcluido = await sql`
      DELETE FROM sistema_nfe.itens_nfe
      WHERE codemp = ${codemp} AND numnfe = ${numnfe} AND item = ${item}
      RETURNING *
    `;

    if (itemExcluido.length === 0) {
      return NextResponse.json({ error: 'Item não encontrado' }, { status: 404 });
    }

    // Atualizar o valor total da nota fiscal
    await sql`
      UPDATE sistema_nfe.nfe
      SET valortotal = (
        SELECT COALESCE(SUM(valortotal), 0)
        FROM sistema_nfe.itens_nfe
        WHERE codemp = ${codemp} AND numnfe = ${numnfe}
      )
      WHERE codemp = ${codemp} AND numnfe = ${numnfe}
    `;

    return NextResponse.json({ message: 'Item excluído com sucesso' });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao excluir item de nota fiscal' }, { status: 500 });
  }
} 