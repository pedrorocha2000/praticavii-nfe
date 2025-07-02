import { NextResponse } from 'next/server';
import { sql } from '@/database';

// GET - Listar todas as categorias
export async function GET() {
  try {
    const categorias = await sql`
      SELECT codcategoria, nome_categoria, data_criacao, data_alteracao, situacao
      FROM sistema_nfe.categorias
      ORDER BY nome_categoria
    `;
    return NextResponse.json(categorias);
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    return NextResponse.json({ error: 'Erro ao buscar categorias' }, { status: 500 });
  }
}

// POST - Criar nova categoria
export async function POST(request: Request) {
  try {
    const { nome_categoria, situacao } = await request.json();

    if (!nome_categoria || nome_categoria.trim() === '') {
      return NextResponse.json(
        { error: 'Nome da categoria é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se já existe uma categoria com o mesmo nome
    const categoriaExiste = await sql`
      SELECT 1 FROM sistema_nfe.categorias 
      WHERE LOWER(nome_categoria) = LOWER(${nome_categoria.trim()})
    `;

    if (categoriaExiste.length > 0) {
      return NextResponse.json(
        { error: 'Já existe uma categoria com este nome' },
        { status: 400 }
      );
    }

    const novaCategoria = await sql`
      INSERT INTO sistema_nfe.categorias (nome_categoria, situacao)
      VALUES (${nome_categoria.trim()}, ${situacao || null})
      RETURNING *
    `;

    return NextResponse.json(novaCategoria[0], { status: 201 });
  } catch (error: any) {
    console.error('Erro ao criar categoria:', error);
    
    // Verificar se é erro de chave duplicada (unique constraint)
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'Já existe uma categoria com este nome' },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ error: 'Erro ao criar categoria' }, { status: 500 });
  }
}

// PUT - Atualizar categoria
export async function PUT(request: Request) {
  try {
    const { codcategoria, nome_categoria, situacao } = await request.json();

    if (!codcategoria || !nome_categoria || nome_categoria.trim() === '') {
      return NextResponse.json(
        { error: 'Código da categoria e nome são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se já existe outra categoria com o mesmo nome
    const categoriaExiste = await sql`
      SELECT 1 FROM sistema_nfe.categorias 
      WHERE LOWER(nome_categoria) = LOWER(${nome_categoria.trim()})
      AND codcategoria != ${codcategoria}
    `;

    if (categoriaExiste.length > 0) {
      return NextResponse.json(
        { error: 'Já existe uma categoria com este nome' },
        { status: 400 }
      );
    }

    const categoriaAtualizada = await sql`
      UPDATE sistema_nfe.categorias
      SET nome_categoria = ${nome_categoria.trim()}, situacao = ${situacao || null}
      WHERE codcategoria = ${codcategoria}
      RETURNING *
    `;

    if (categoriaAtualizada.length === 0) {
      return NextResponse.json({ error: 'Categoria não encontrada' }, { status: 404 });
    }

    return NextResponse.json(categoriaAtualizada[0]);
  } catch (error: any) {
    console.error('Erro ao atualizar categoria:', error);
    
    // Verificar se é erro de chave duplicada (unique constraint)
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'Já existe uma categoria com este nome' },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ error: 'Erro ao atualizar categoria' }, { status: 500 });
  }
}

// DELETE - Excluir categoria
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const codcategoria = searchParams.get('codcategoria');

    if (!codcategoria) {
      return NextResponse.json(
        { error: 'Código da categoria é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se existem produtos vinculados
    const produtosVinculados = await sql`
      SELECT 1 FROM sistema_nfe.produtos WHERE codcategoria = ${codcategoria}
    `;

    if (produtosVinculados.length > 0) {
      return NextResponse.json(
        { error: 'Não é possível excluir a categoria pois existem produtos vinculados' },
        { status: 400 }
      );
    }

    const categoriaExcluida = await sql`
      DELETE FROM sistema_nfe.categorias
      WHERE codcategoria = ${codcategoria}
      RETURNING *
    `;

    if (categoriaExcluida.length === 0) {
      return NextResponse.json({ error: 'Categoria não encontrada' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Categoria excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir categoria:', error);
    return NextResponse.json({ error: 'Erro ao excluir categoria' }, { status: 500 });
  }
} 