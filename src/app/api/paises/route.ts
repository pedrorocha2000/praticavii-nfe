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
    const { codpais, nomepais } = await request.json();

    if (!codpais || !nomepais) {
      return NextResponse.json(
        { error: 'Código e nome do país são obrigatórios' },
        { status: 400 }
      );
    }

    // Validar o tamanho do código do país
    if (codpais.length !== 2) {
      return NextResponse.json(
        { error: 'O código do país deve ter exatamente 2 caracteres' },
        { status: 400 }
      );
    }

    // Converter para maiúsculas
    const codpaisUpper = codpais.toUpperCase();

    const novoPais = await sql`
      INSERT INTO sistema_nfe.paises (codpais, nomepais)
      VALUES (${codpaisUpper}, ${nomepais})
      RETURNING *
    `;

    return NextResponse.json(novoPais[0], { status: 201 });
  } catch (error: any) {
    // Verificar se é erro de chave duplicada
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'Este código de país já está em uso' },
        { status: 400 }
      );
    }
    
    console.error('Erro ao criar país:', error);
    return NextResponse.json(
      { error: 'Erro ao criar país. Verifique os dados e tente novamente.' },
      { status: 500 }
    );
  }
}

// PUT - Atualizar país
export async function PUT(request: Request) {
  try {
    const { codpais, nomepais } = await request.json();

    if (!codpais || !nomepais) {
      return NextResponse.json(
        { error: 'Código e nome do país são obrigatórios' },
        { status: 400 }
      );
    }

    const paisAtualizado = await sql`
      UPDATE sistema_nfe.paises
      SET nomepais = ${nomepais}
      WHERE codpais = ${codpais}
      RETURNING *
    `;

    if (paisAtualizado.length === 0) {
      return NextResponse.json({ error: 'País não encontrado' }, { status: 404 });
    }

    return NextResponse.json(paisAtualizado[0]);
  } catch (error) {
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
    return NextResponse.json({ error: 'Erro ao excluir país' }, { status: 500 });
  }
} 
 
 
 