import { NextResponse } from 'next/server';
import { sql } from '@/database';

// GET - Listar todas as pessoas
export async function GET() {
  try {
    const pessoas = await sql`
      SELECT *
      FROM sistema_nfe.pessoa
      ORDER BY nomerazao
    `;
    return NextResponse.json(pessoas);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar pessoas' }, { status: 500 });
  }
}

// POST - Criar nova pessoa
export async function POST(request: Request) {
  try {
    const {
      tipopessoa,
      nomerazao,
      nomefantasia,
      cpfcnpj,
      rg_inscricaoestadual,
      endereco,
      numero,
      complemento,
      bairro,
      cep,
      codcid,
      telefone,
      email
    } = await request.json();

    if (!tipopessoa || !nomerazao || !endereco || !numero || !bairro || !cep || !codcid) {
      return NextResponse.json(
        { error: 'Tipo de pessoa, nome/razão social, endereço, número, bairro, CEP e cidade são obrigatórios' },
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

    // Inserir a pessoa
    const novaPessoa = await sql`
      INSERT INTO sistema_nfe.pessoa (
        tipopessoa, nomerazao, nomefantasia,
        cpfcnpj, rg_inscricaoestadual, endereco, numero,
        complemento, bairro, cep, codcid, telefone,
        email, datacadastro
      )
      VALUES (
        ${tipopessoa}, ${nomerazao}, ${nomefantasia},
        ${cpfcnpj}, ${rg_inscricaoestadual}, ${endereco}, ${numero},
        ${complemento}, ${bairro}, ${cep}, ${codcid}, ${telefone},
        ${email}, CURRENT_DATE
      )
      RETURNING *
    `;

    return NextResponse.json(novaPessoa[0], { status: 201 });
  } catch (error) {
    console.error('Erro ao criar pessoa:', error);
    return NextResponse.json({ error: 'Erro ao criar pessoa' }, { status: 500 });
  }
}

// PUT - Atualizar pessoa
export async function PUT(request: Request) {
  try {
    const {
      codigo,
      tipopessoa,
      nomerazao,
      nomefantasia,
      cpfcnpj,
      rg_inscricaoestadual,
      endereco,
      numero,
      complemento,
      bairro,
      cep,
      codcid,
      telefone,
      email
    } = await request.json();

    if (!codigo || !tipopessoa || !nomerazao || !endereco || !numero || !bairro || !cep || !codcid) {
      return NextResponse.json(
        { error: 'Código, tipo de pessoa, nome/razão social, endereço, número, bairro, CEP e cidade são obrigatórios' },
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

    // Atualizar a pessoa
    const pessoaAtualizada = await sql`
      UPDATE sistema_nfe.pessoa
      SET 
        tipopessoa = ${tipopessoa},
        nomerazao = ${nomerazao},
        nomefantasia = ${nomefantasia},
        cpfcnpj = ${cpfcnpj},
        rg_inscricaoestadual = ${rg_inscricaoestadual},
        endereco = ${endereco},
        numero = ${numero},
        complemento = ${complemento},
        bairro = ${bairro},
        cep = ${cep},
        codcid = ${codcid},
        telefone = ${telefone},
        email = ${email}
      WHERE codigo = ${codigo}
      RETURNING *
    `;

    if (pessoaAtualizada.length === 0) {
      return NextResponse.json({ error: 'Pessoa não encontrada' }, { status: 404 });
    }

    return NextResponse.json(pessoaAtualizada[0]);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao atualizar pessoa' }, { status: 500 });
  }
}

// DELETE - Excluir pessoa
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const codigo = searchParams.get('codigo');

    if (!codigo) {
      return NextResponse.json(
        { error: 'Código da pessoa é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se existem empresas vinculadas
    const empresasVinculadas = await sql`
      SELECT 1 FROM sistema_nfe.empresa WHERE codpessoa = ${codigo}
    `;

    if (empresasVinculadas.length > 0) {
      return NextResponse.json(
        { error: 'Não é possível excluir a pessoa pois existem empresas vinculadas' },
        { status: 400 }
      );
    }

    // Verificar se existem clientes vinculados
    const clientesVinculados = await sql`
      SELECT 1 FROM sistema_nfe.clientes WHERE codpessoa = ${codigo}
    `;

    if (clientesVinculados.length > 0) {
      return NextResponse.json(
        { error: 'Não é possível excluir a pessoa pois existem clientes vinculados' },
        { status: 400 }
      );
    }

    // Verificar se existem fornecedores vinculados
    const fornecedoresVinculados = await sql`
      SELECT 1 FROM sistema_nfe.fornecedores WHERE codpessoa = ${codigo}
    `;

    if (fornecedoresVinculados.length > 0) {
      return NextResponse.json(
        { error: 'Não é possível excluir a pessoa pois existem fornecedores vinculados' },
        { status: 400 }
      );
    }

    // Verificar se existem transportadoras vinculadas
    const transportadorasVinculadas = await sql`
      SELECT 1 FROM sistema_nfe.transportadoras WHERE codpessoa = ${codigo}
    `;

    if (transportadorasVinculadas.length > 0) {
      return NextResponse.json(
        { error: 'Não é possível excluir a pessoa pois existem transportadoras vinculadas' },
        { status: 400 }
      );
    }

    // Excluir a pessoa
    const pessoaExcluida = await sql`
      DELETE FROM sistema_nfe.pessoa
      WHERE codigo = ${codigo}
      RETURNING *
    `;

    if (pessoaExcluida.length === 0) {
      return NextResponse.json({ error: 'Pessoa não encontrada' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Pessoa excluída com sucesso' });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao excluir pessoa' }, { status: 500 });
  }
} 