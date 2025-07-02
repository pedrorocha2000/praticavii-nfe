import { NextResponse } from 'next/server';
import { sql } from '@/database';

// GET - Listar todas as unidades de medida
export async function GET() {
  try {
    const unidades = await sql`
      SELECT codunidade, nome_unidade, sigla_unidade, data_criacao, data_alteracao, situacao
      FROM sistema_nfe.unidades_medida
      ORDER BY nome_unidade
    `;
    return NextResponse.json(unidades);
  } catch (error) {
    console.error('Erro ao buscar unidades de medida:', error);
    return NextResponse.json({ error: 'Erro ao buscar unidades de medida' }, { status: 500 });
  }
}

// POST - Criar nova unidade de medida
export async function POST(request: Request) {
  try {
    const { nome_unidade, sigla_unidade, situacao } = await request.json();

    if (!nome_unidade || nome_unidade.trim() === '') {
      return NextResponse.json(
        { error: 'Nome da unidade é obrigatório' },
        { status: 400 }
      );
    }

    if (!sigla_unidade || sigla_unidade.trim() === '') {
      return NextResponse.json(
        { error: 'Sigla da unidade é obrigatória' },
        { status: 400 }
      );
    }

    // Verificar se já existe uma unidade com o mesmo nome
    const nomeExiste = await sql`
      SELECT 1 FROM sistema_nfe.unidades_medida 
      WHERE LOWER(nome_unidade) = LOWER(${nome_unidade.trim()})
    `;

    if (nomeExiste.length > 0) {
      return NextResponse.json(
        { error: 'Já existe uma unidade com este nome' },
        { status: 400 }
      );
    }

    // Verificar se já existe uma unidade com a mesma sigla
    const siglaExiste = await sql`
      SELECT 1 FROM sistema_nfe.unidades_medida 
      WHERE LOWER(sigla_unidade) = LOWER(${sigla_unidade.trim()})
    `;

    if (siglaExiste.length > 0) {
      return NextResponse.json(
        { error: 'Já existe uma unidade com esta sigla' },
        { status: 400 }
      );
    }

    const novaUnidade = await sql`
      INSERT INTO sistema_nfe.unidades_medida (nome_unidade, sigla_unidade, situacao)
      VALUES (${nome_unidade.trim()}, ${sigla_unidade.trim().toUpperCase()}, ${situacao || null})
      RETURNING *
    `;

    return NextResponse.json(novaUnidade[0], { status: 201 });
  } catch (error: any) {
    console.error('Erro ao criar unidade de medida:', error);
    
    // Verificar se é erro de chave duplicada (unique constraint)
    if (error.code === '23505') {
      if (error.constraint?.includes('nome_unidade')) {
        return NextResponse.json(
          { error: 'Já existe uma unidade com este nome' },
          { status: 400 }
        );
      } else if (error.constraint?.includes('sigla_unidade')) {
        return NextResponse.json(
          { error: 'Já existe uma unidade com esta sigla' },
          { status: 400 }
        );
      }
    }
    
    return NextResponse.json({ error: 'Erro ao criar unidade de medida' }, { status: 500 });
  }
}

// PUT - Atualizar unidade de medida
export async function PUT(request: Request) {
  try {
    const { codunidade, nome_unidade, sigla_unidade, situacao } = await request.json();

    if (!codunidade || !nome_unidade || nome_unidade.trim() === '' || !sigla_unidade || sigla_unidade.trim() === '') {
      return NextResponse.json(
        { error: 'Código, nome e sigla da unidade são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se já existe outra unidade com o mesmo nome
    const nomeExiste = await sql`
      SELECT 1 FROM sistema_nfe.unidades_medida 
      WHERE LOWER(nome_unidade) = LOWER(${nome_unidade.trim()})
      AND codunidade != ${codunidade}
    `;

    if (nomeExiste.length > 0) {
      return NextResponse.json(
        { error: 'Já existe uma unidade com este nome' },
        { status: 400 }
      );
    }

    // Verificar se já existe outra unidade com a mesma sigla
    const siglaExiste = await sql`
      SELECT 1 FROM sistema_nfe.unidades_medida 
      WHERE LOWER(sigla_unidade) = LOWER(${sigla_unidade.trim()})
      AND codunidade != ${codunidade}
    `;

    if (siglaExiste.length > 0) {
      return NextResponse.json(
        { error: 'Já existe uma unidade com esta sigla' },
        { status: 400 }
      );
    }

    const unidadeAtualizada = await sql`
      UPDATE sistema_nfe.unidades_medida
      SET nome_unidade = ${nome_unidade.trim()}, 
          sigla_unidade = ${sigla_unidade.trim().toUpperCase()},
          situacao = ${situacao || null}
      WHERE codunidade = ${codunidade}
      RETURNING *
    `;

    if (unidadeAtualizada.length === 0) {
      return NextResponse.json({ error: 'Unidade de medida não encontrada' }, { status: 404 });
    }

    return NextResponse.json(unidadeAtualizada[0]);
  } catch (error: any) {
    console.error('Erro ao atualizar unidade de medida:', error);
    
    // Verificar se é erro de chave duplicada (unique constraint)
    if (error.code === '23505') {
      if (error.constraint?.includes('nome_unidade')) {
        return NextResponse.json(
          { error: 'Já existe uma unidade com este nome' },
          { status: 400 }
        );
      } else if (error.constraint?.includes('sigla_unidade')) {
        return NextResponse.json(
          { error: 'Já existe uma unidade com esta sigla' },
          { status: 400 }
        );
      }
    }
    
    return NextResponse.json({ error: 'Erro ao atualizar unidade de medida' }, { status: 500 });
  }
}

// DELETE - Excluir unidade de medida
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const codunidade = searchParams.get('codunidade');

    if (!codunidade) {
      return NextResponse.json(
        { error: 'Código da unidade é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se existem produtos vinculados
    const produtosVinculados = await sql`
      SELECT 1 FROM sistema_nfe.produtos WHERE codunidade = ${codunidade}
    `;

    if (produtosVinculados.length > 0) {
      return NextResponse.json(
        { error: 'Não é possível excluir a unidade pois existem produtos vinculados' },
        { status: 400 }
      );
    }

    const unidadeExcluida = await sql`
      DELETE FROM sistema_nfe.unidades_medida
      WHERE codunidade = ${codunidade}
      RETURNING *
    `;

    if (unidadeExcluida.length === 0) {
      return NextResponse.json({ error: 'Unidade de medida não encontrada' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Unidade de medida excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir unidade de medida:', error);
    return NextResponse.json({ error: 'Erro ao excluir unidade de medida' }, { status: 500 });
  }
} 