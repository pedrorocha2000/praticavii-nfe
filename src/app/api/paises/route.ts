import { NextResponse } from 'next/server';
import { sql } from '@/database';

// GET - Listar todos os países
export async function GET() {
  try {
    const paises = await sql`
      SELECT * FROM sistema_nfe.paises
      ORDER BY nomepais
    `;
    return NextResponse.json(paises);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar países' }, { status: 500 });
  }
}

// POST - Criar novo país
export async function POST(request: Request) {
  try {
    const { siglapais, nomepais, situacao } = await request.json();

    if (!siglapais || !nomepais) {
      return NextResponse.json(
        { error: 'Sigla e nome do país são obrigatórios' },
        { status: 400 }
      );
    }

    // Validar o tamanho da sigla do país
    if (siglapais.length !== 2) {
      return NextResponse.json(
        { error: 'A sigla do país deve ter exatamente 2 caracteres' },
        { status: 400 }
      );
    }

    // Converter sigla para maiúsculas
    const siglapaisUpper = siglapais.toUpperCase();

    // Verificar se a sigla já existe
    const siglaExiste = await sql`
      SELECT 1 FROM sistema_nfe.paises WHERE siglapais = ${siglapaisUpper}
    `;

    if (siglaExiste.length > 0) {
      return NextResponse.json(
        { error: 'Esta sigla de país já está em uso' },
        { status: 400 }
      );
    }

    const novoPais = await sql`
      INSERT INTO sistema_nfe.paises (siglapais, nomepais, situacao)
      VALUES (${siglapaisUpper}, ${nomepais}, ${situacao || null})
      RETURNING *
    `;

    return NextResponse.json(novoPais[0], { status: 201 });
  } catch (error: any) {
    console.error('Erro ao criar país:', error);
    
    // Verificar se é erro de chave duplicada
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'Esta sigla de país já está em uso' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Erro ao criar país. Verifique os dados e tente novamente.' },
      { status: 500 }
    );
  }
}

// PUT - Atualizar país
export async function PUT(request: Request) {
  try {
    const { codpais, siglapais, nomepais, situacao } = await request.json();

    if (!codpais || !siglapais || !nomepais) {
      return NextResponse.json(
        { error: 'Código, sigla e nome do país são obrigatórios' },
        { status: 400 }
      );
    }

    // Validar o tamanho da sigla do país
    if (siglapais.length !== 2) {
      return NextResponse.json(
        { error: 'A sigla do país deve ter exatamente 2 caracteres' },
        { status: 400 }
      );
    }

    // Converter sigla para maiúsculas
    const siglapaisUpper = siglapais.toUpperCase();

    // Verificar se a sigla já existe em outro país
    const siglaExiste = await sql`
      SELECT 1 FROM sistema_nfe.paises 
      WHERE siglapais = ${siglapaisUpper} AND codpais != ${codpais}
    `;

    if (siglaExiste.length > 0) {
      return NextResponse.json(
        { error: 'Esta sigla de país já está em uso' },
        { status: 400 }
      );
    }

    const paisAtualizado = await sql`
      UPDATE sistema_nfe.paises
      SET siglapais = ${siglapaisUpper}, nomepais = ${nomepais}, situacao = ${situacao || null}
      WHERE codpais = ${codpais}
      RETURNING *
    `;

    if (paisAtualizado.length === 0) {
      return NextResponse.json({ error: 'País não encontrado' }, { status: 404 });
    }

    return NextResponse.json(paisAtualizado[0]);
  } catch (error) {
    console.error('Erro ao atualizar país:', error);
    return NextResponse.json({ error: 'Erro ao atualizar país' }, { status: 500 });
  }
}

// DELETE - Excluir país
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const codpais = searchParams.get('codpais');

    if (!codpais) {
      return NextResponse.json(
        { error: 'Código do país é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se existem estados vinculados
    const estadosVinculados = await sql`
      SELECT 1 FROM sistema_nfe.estados WHERE codpais = ${codpais}
    `;

    if (estadosVinculados.length > 0) {
      return NextResponse.json(
        { error: 'Não é possível excluir o país pois existem estados vinculados' },
        { status: 400 }
      );
    }

    const paisExcluido = await sql`
      DELETE FROM sistema_nfe.paises
      WHERE codpais = ${codpais}
      RETURNING *
    `;

    if (paisExcluido.length === 0) {
      return NextResponse.json({ error: 'País não encontrado' }, { status: 404 });
    }

    return NextResponse.json({ message: 'País excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir país:', error);
    return NextResponse.json({ error: 'Erro ao excluir país' }, { status: 500 });
  }
} 
 
 
 