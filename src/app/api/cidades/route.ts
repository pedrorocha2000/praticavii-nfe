import { NextResponse } from 'next/server';
import { sql } from '@/database';

// GET - Listar todas as cidades
export async function GET() {
  try {
    const cidades = await sql`
      SELECT c.codcid, c.nomecidade, c.codest, c.data_criacao, c.data_alteracao, c.situacao, e.nomeestado, e.siglaest, p.nomepais
      FROM sistema_nfe.cidades c
      LEFT JOIN sistema_nfe.estados e ON c.codest = e.codest
      LEFT JOIN sistema_nfe.paises p ON e.codpais = p.codpais
      ORDER BY c.nomecidade
    `;
    return NextResponse.json(cidades);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar cidades' }, { status: 500 });
  }
}

// POST - Criar nova cidade
export async function POST(request: Request) {
  try {
    const { nomecidade, codest, situacao } = await request.json();

    if (!nomecidade || !codest) {
      return NextResponse.json(
        { error: 'Nome da cidade e estado são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se o estado existe
    const estadoExiste = await sql`
      SELECT 1 FROM sistema_nfe.estados WHERE codest = ${codest}
    `;

    if (estadoExiste.length === 0) {
      return NextResponse.json(
        { error: 'Estado não encontrado' },
        { status: 404 }
      );
    }

    const novaCidade = await sql`
      INSERT INTO sistema_nfe.cidades (nomecidade, codest, situacao)
      VALUES (${nomecidade}, ${codest}, ${situacao || null})
      RETURNING *
    `;

    return NextResponse.json(novaCidade[0], { status: 201 });
  } catch (error: any) {
    console.error('Erro ao criar cidade:', error);
    return NextResponse.json(
      { error: 'Erro ao criar cidade. Verifique os dados e tente novamente.' },
      { status: 500 }
    );
  }
}

// PUT - Atualizar cidade
export async function PUT(request: Request) {
  try {
    const { codcid, nomecidade, codest, situacao } = await request.json();

    if (!codcid || !nomecidade || !codest) {
      return NextResponse.json(
        { error: 'Código, nome da cidade e código do estado são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se o estado existe
    const estadoExiste = await sql`
      SELECT 1 FROM sistema_nfe.estados WHERE codest = ${codest}
    `;

    if (estadoExiste.length === 0) {
      return NextResponse.json(
        { error: 'Estado não encontrado' },
        { status: 404 }
      );
    }

    const cidadeAtualizada = await sql`
      UPDATE sistema_nfe.cidades
      SET nomecidade = ${nomecidade}, codest = ${codest}, situacao = ${situacao || null}
      WHERE codcid = ${codcid}
      RETURNING *
    `;

    if (cidadeAtualizada.length === 0) {
      return NextResponse.json({ error: 'Cidade não encontrada' }, { status: 404 });
    }

    return NextResponse.json(cidadeAtualizada[0]);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao atualizar cidade' }, { status: 500 });
  }
}

// DELETE - Excluir cidade
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const codcid = searchParams.get('codcid');

    if (!codcid) {
      return NextResponse.json(
        { error: 'Código da cidade é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se existem empresas ou pessoas vinculadas
    const vinculosExistentes = await sql`
      SELECT 1 FROM sistema_nfe.empresa WHERE codcid = ${codcid}
      UNION
      SELECT 1 FROM sistema_nfe.pessoa WHERE codcid = ${codcid}
    `;

    if (vinculosExistentes.length > 0) {
      return NextResponse.json(
        { error: 'Não é possível excluir a cidade pois existem empresas ou pessoas vinculadas' },
        { status: 400 }
      );
    }

    const cidadeExcluida = await sql`
      DELETE FROM sistema_nfe.cidades
      WHERE codcid = ${codcid}
      RETURNING *
    `;

    if (cidadeExcluida.length === 0) {
      return NextResponse.json({ error: 'Cidade não encontrada' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Cidade excluída com sucesso' });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao excluir cidade' }, { status: 500 });
  }
} 