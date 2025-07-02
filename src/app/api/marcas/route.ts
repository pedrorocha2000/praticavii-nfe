import { NextResponse } from 'next/server';
import { sql } from '@/database';

// GET - Listar todas as marcas
export async function GET() {
  try {
    const marcas = await sql`
      SELECT codmarca, nome_marca, data_criacao, data_alteracao, situacao
      FROM sistema_nfe.marcas
      ORDER BY nome_marca
    `;
    return NextResponse.json(marcas);
  } catch (error) {
    console.error('Erro ao buscar marcas:', error);
    return NextResponse.json({ error: 'Erro ao buscar marcas' }, { status: 500 });
  }
}

// POST - Criar nova marca
export async function POST(request: Request) {
  try {
    const { nome_marca, situacao } = await request.json();

    if (!nome_marca || nome_marca.trim() === '') {
      return NextResponse.json(
        { error: 'Nome da marca é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se já existe uma marca com o mesmo nome
    const marcaExiste = await sql`
      SELECT 1 FROM sistema_nfe.marcas 
      WHERE LOWER(nome_marca) = LOWER(${nome_marca.trim()})
    `;

    if (marcaExiste.length > 0) {
      return NextResponse.json(
        { error: 'Já existe uma marca com este nome' },
        { status: 400 }
      );
    }

    const novaMarca = await sql`
      INSERT INTO sistema_nfe.marcas (nome_marca, situacao)
      VALUES (${nome_marca.trim()}, ${situacao || null})
      RETURNING *
    `;

    return NextResponse.json(novaMarca[0], { status: 201 });
  } catch (error: any) {
    console.error('Erro ao criar marca:', error);
    
    // Verificar se é erro de chave duplicada (unique constraint)
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'Já existe uma marca com este nome' },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ error: 'Erro ao criar marca' }, { status: 500 });
  }
}

// PUT - Atualizar marca
export async function PUT(request: Request) {
  try {
    const { codmarca, nome_marca, situacao } = await request.json();

    if (!codmarca || !nome_marca || nome_marca.trim() === '') {
      return NextResponse.json(
        { error: 'Código da marca e nome são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se já existe outra marca com o mesmo nome
    const marcaExiste = await sql`
      SELECT 1 FROM sistema_nfe.marcas 
      WHERE LOWER(nome_marca) = LOWER(${nome_marca.trim()})
      AND codmarca != ${codmarca}
    `;

    if (marcaExiste.length > 0) {
      return NextResponse.json(
        { error: 'Já existe uma marca com este nome' },
        { status: 400 }
      );
    }

    const marcaAtualizada = await sql`
      UPDATE sistema_nfe.marcas
      SET nome_marca = ${nome_marca.trim()}, situacao = ${situacao || null}
      WHERE codmarca = ${codmarca}
      RETURNING *
    `;

    if (marcaAtualizada.length === 0) {
      return NextResponse.json({ error: 'Marca não encontrada' }, { status: 404 });
    }

    return NextResponse.json(marcaAtualizada[0]);
  } catch (error: any) {
    console.error('Erro ao atualizar marca:', error);
    
    // Verificar se é erro de chave duplicada (unique constraint)
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'Já existe uma marca com este nome' },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ error: 'Erro ao atualizar marca' }, { status: 500 });
  }
}

// DELETE - Excluir marca
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const codmarca = searchParams.get('codmarca');

    if (!codmarca) {
      return NextResponse.json(
        { error: 'Código da marca é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se existem produtos vinculados
    const produtosVinculados = await sql`
      SELECT 1 FROM sistema_nfe.produtos WHERE codmarca = ${codmarca}
    `;

    if (produtosVinculados.length > 0) {
      return NextResponse.json(
        { error: 'Não é possível excluir a marca pois existem produtos vinculados' },
        { status: 400 }
      );
    }

    const marcaExcluida = await sql`
      DELETE FROM sistema_nfe.marcas
      WHERE codmarca = ${codmarca}
      RETURNING *
    `;

    if (marcaExcluida.length === 0) {
      return NextResponse.json({ error: 'Marca não encontrada' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Marca excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir marca:', error);
    return NextResponse.json({ error: 'Erro ao excluir marca' }, { status: 500 });
  }
} 