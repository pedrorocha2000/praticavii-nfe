import { NextResponse } from 'next/server';
import { sql } from '@/database';

// GET - Retornar a empresa (única)
export async function GET() {
  try {
    const empresa = await sql`
      SELECT e.*, c.nomecidade, es.nomeestado, p.nomepais
      FROM sistema_nfe.empresa e
      LEFT JOIN sistema_nfe.cidades c ON e.codcid = c.codcid
      LEFT JOIN sistema_nfe.estados es ON c.codest = es.codest
      LEFT JOIN sistema_nfe.paises p ON es.codpais = p.codpais
      WHERE e.codigo = 1
    `;

    if (empresa.length === 0) {
      return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 });
    }

    return NextResponse.json(empresa[0]);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar empresa' }, { status: 500 });
  }
}

// POST - Não permitir criação de novas empresas
export async function POST() {
  return NextResponse.json(
    { error: 'Não é permitido criar novas empresas. A empresa é única e já está cadastrada.' },
    { status: 405 }
  );
}

// PUT - Atualizar a empresa existente
export async function PUT(request: Request) {
  try {
    const {
      razaosocial,
      nomefantasia,
      cnpj,
      inscricaoestadual,
      endereco,
      numero,
      complemento,
      bairro,
      codcid,
      cep,
      telefone,
      email
    } = await request.json();

    if (!razaosocial || !cnpj || !codcid) {
      return NextResponse.json(
        { error: 'Razão social, CNPJ e cidade são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se a cidade existe
    const cidadeExiste = await sql`
      SELECT 1 FROM sistema_nfe.cidades WHERE codcid = ${codcid}
    `;

    if (cidadeExiste.length === 0) {
      return NextResponse.json(
        { error: 'Cidade não encontrada' },
        { status: 404 }
      );
    }

    // Atualizar a empresa
    const empresaAtualizada = await sql`
      UPDATE sistema_nfe.empresa
      SET 
        razaosocial = ${razaosocial},
        nomefantasia = ${nomefantasia},
        cnpj = ${cnpj},
        inscricaoestadual = ${inscricaoestadual},
        endereco = ${endereco},
        numero = ${numero},
        complemento = ${complemento},
        bairro = ${bairro},
        codcid = ${codcid},
        cep = ${cep},
        telefone = ${telefone},
        email = ${email}
      WHERE codigo = 1
      RETURNING *
    `;

    if (empresaAtualizada.length === 0) {
      return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 });
    }

    return NextResponse.json(empresaAtualizada[0]);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao atualizar empresa' }, { status: 500 });
  }
}

// DELETE - Não permitir exclusão da empresa
export async function DELETE() {
  return NextResponse.json(
    { error: 'Não é permitido excluir a empresa. Ela é necessária para o funcionamento do sistema.' },
    { status: 405 }
  );
} 
// DELETE - Excluir empresa
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const codigo = searchParams.get('codigo');

    if (!codigo) {
      return NextResponse.json(
        { error: 'Código da empresa é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se existem notas fiscais vinculadas
    const notasVinculadas = await sql`
      SELECT 1 FROM sistema_nfe.nfe WHERE codemp = ${codigo}
    `;

    if (notasVinculadas.length > 0) {
      return NextResponse.json(
        { error: 'Não é possível excluir a empresa pois existem notas fiscais vinculadas' },
        { status: 400 }
      );
    }

    // Excluir a empresa
    const empresaExcluida = await sql`
      DELETE FROM sistema_nfe.empresa
      WHERE codigo = ${codigo}
      RETURNING *
    `;

    if (empresaExcluida.length === 0) {
      return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Empresa excluída com sucesso' });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao excluir empresa' }, { status: 500 });
  }
} 