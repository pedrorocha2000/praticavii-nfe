import { NextResponse } from 'next/server';
import { sql } from '@/database';

// GET - Listar todos os estados
export async function GET() {
  try {
    const estados = await sql`
      SELECT e.codest, e.nomeestado, e.codpais, p.nomepais
      FROM sistema_nfe.estados e
      LEFT JOIN sistema_nfe.paises p ON e.codpais = p.codpais
      ORDER BY e.nomeestado
    `;
    return NextResponse.json(estados);
  } catch (error) {
    console.error('Erro ao buscar estados:', error);
    return NextResponse.json({ error: 'Erro ao buscar estados' }, { status: 500 });
  }
}

// POST - Criar novo estado
export async function POST(request: Request) {
  try {
    const { codest, nomeestado, codpais } = await request.json();

    if (!codest || !nomeestado || !codpais) {
      return NextResponse.json(
        { error: 'Código, nome do estado e código do país são obrigatórios' },
        { status: 400 }
      );
    }

    // Validar o tamanho do código do estado
    if (codest.length !== 2) {
      return NextResponse.json(
        { error: 'O código do estado deve ter exatamente 2 caracteres' },
        { status: 400 }
      );
    }

    // Converter para maiúsculas
    const codestUpper = codest.toUpperCase();

    // Verificar se o estado já existe
    const estadoExiste = await sql`
      SELECT 1 FROM sistema_nfe.estados WHERE codest = ${codestUpper}
    `;

    if (estadoExiste.length > 0) {
      return NextResponse.json(
        { error: 'Este código de estado já está em uso' },
        { status: 400 }
      );
    }

    // Verificar se o país existe
    const paisExiste = await sql`
      SELECT 1 FROM sistema_nfe.paises WHERE codpais = ${codpais}
    `;

    if (paisExiste.length === 0) {
      return NextResponse.json(
        { error: 'País não encontrado' },
        { status: 404 }
      );
    }

    const novoEstado = await sql`
      INSERT INTO sistema_nfe.estados (codest, nomeestado, codpais)
      VALUES (${codestUpper}, ${nomeestado}, ${codpais})
      RETURNING *
    `;

    return NextResponse.json(novoEstado[0], { status: 201 });
  } catch (error: any) {
    console.error('Erro ao criar estado:', error);
    
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'Este código de estado já está em uso' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Erro ao criar estado. Verifique os dados e tente novamente.' },
      { status: 500 }
    );
  }
}

// PUT - Atualizar estado
export async function PUT(request: Request) {
  try {
    const { codest, nomeestado, codpais } = await request.json();

    if (!codest || !nomeestado || !codpais) {
      return NextResponse.json(
        { error: 'Código, nome do estado e código do país são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se o país existe
    const paisExiste = await sql`
      SELECT 1 FROM sistema_nfe.paises WHERE codpais = ${codpais}
    `;

    if (paisExiste.length === 0) {
      return NextResponse.json(
        { error: 'País não encontrado' },
        { status: 404 }
      );
    }

    const estadoAtualizado = await sql`
      UPDATE sistema_nfe.estados
      SET nomeestado = ${nomeestado}, codpais = ${codpais}
      WHERE codest = ${codest}
      RETURNING *
    `;

    if (estadoAtualizado.length === 0) {
      return NextResponse.json({ error: 'Estado não encontrado' }, { status: 404 });
    }

    return NextResponse.json(estadoAtualizado[0]);
  } catch (error) {
    console.error('Erro ao atualizar estado:', error);
    return NextResponse.json({ error: 'Erro ao atualizar estado' }, { status: 500 });
  }
}

// DELETE - Excluir estado
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const codest = searchParams.get('codest');

    if (!codest) {
      return NextResponse.json(
        { error: 'Código do estado é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se existem cidades vinculadas
    const cidadesVinculadas = await sql`
      SELECT 1 FROM sistema_nfe.cidades WHERE codest = ${codest}
    `;

    if (cidadesVinculadas.length > 0) {
      return NextResponse.json(
        { error: 'Não é possível excluir o estado pois existem cidades vinculadas' },
        { status: 400 }
      );
    }

    const estadoExcluido = await sql`
      DELETE FROM sistema_nfe.estados
      WHERE codest = ${codest}
      RETURNING *
    `;

    if (estadoExcluido.length === 0) {
      return NextResponse.json({ error: 'Estado não encontrado' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Estado excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir estado:', error);
    return NextResponse.json({ error: 'Erro ao excluir estado' }, { status: 500 });
  }
} 