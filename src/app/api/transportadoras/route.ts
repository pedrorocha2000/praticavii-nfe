import { NextResponse } from 'next/server';
import { sql } from '@/database';

// GET - Listar todas as transportadoras
export async function GET() {
  try {
    const transportadoras = await sql`
      SELECT 
        t.codtrans, 
        p.tipopessoa, 
        p.nomerazao, 
        p.nomefantasia, 
        p.cpfcnpj,
        p.rg_inscricaoestadual, 
        p.endereco, 
        p.numero, 
        p.complemento,
        p.bairro, 
        p.cep, 
        p.codcid, 
        p.telefone, 
        p.email, 
        p.datacadastro,
        cid.nomecidade, 
        est.nomeestado, 
        pais.nomepais
      FROM sistema_nfe.transportadoras t
      LEFT JOIN sistema_nfe.pessoa p ON t.codtrans = p.codigo
      LEFT JOIN sistema_nfe.cidades cid ON p.codcid = cid.codcid
      LEFT JOIN sistema_nfe.estados est ON cid.codest = est.codest
      LEFT JOIN sistema_nfe.paises pais ON est.codpais = pais.codpais
      ORDER BY p.nomerazao
    `;
    return NextResponse.json(transportadoras);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar transportadoras' }, { status: 500 });
  }
}

// POST - Criar nova transportadora
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

    // Verificar se já existe uma pessoa com o mesmo CPF/CNPJ
    const pessoaExiste = await sql`
      SELECT 1 FROM sistema_nfe.pessoa WHERE cpfcnpj = ${cpfcnpj}
    `;

    if (pessoaExiste.length > 0) {
      return NextResponse.json(
        { error: 'Já existe uma pessoa cadastrada com este CPF/CNPJ' },
        { status: 400 }
      );
    }

    // Criar a pessoa e obter o código gerado
    const novaPessoa = await sql`
      INSERT INTO sistema_nfe.pessoa (
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
        email,
        datacadastro
      ) VALUES (
        ${tipopessoa},
        ${nomerazao},
        ${nomefantasia},
        ${cpfcnpj},
        ${rg_inscricaoestadual},
        ${endereco},
        ${numero},
        ${complemento},
        ${bairro},
        ${cep},
        ${codcid},
        ${telefone},
        ${email},
        CURRENT_TIMESTAMP
      )
      RETURNING codigo
    `;

    const codtrans = novaPessoa[0].codigo;

    // Inserir a transportadora usando o código da pessoa
    await sql`
      INSERT INTO sistema_nfe.transportadoras (codtrans)
      VALUES (${codtrans})
    `;

    // Retornar os dados completos
    const transportadora = await sql`
      SELECT t.codtrans, p.tipopessoa, p.nomerazao, p.nomefantasia, p.cpfcnpj,
             p.rg_inscricaoestadual, p.endereco, p.numero, p.complemento,
             p.bairro, p.cep, p.codcid, p.telefone, p.email, p.datacadastro,
             cid.nomecidade, est.nomeestado, pais.nomepais
      FROM sistema_nfe.transportadoras t
      LEFT JOIN sistema_nfe.pessoa p ON t.codtrans = p.codigo
      LEFT JOIN sistema_nfe.cidades cid ON p.codcid = cid.codcid
      LEFT JOIN sistema_nfe.estados est ON cid.codest = est.codest
      LEFT JOIN sistema_nfe.paises pais ON est.codpais = pais.codpais
      WHERE t.codtrans = ${codtrans}
    `;

    return NextResponse.json(transportadora[0], { status: 201 });
  } catch (error) {
    console.error('Erro ao criar transportadora:', error);
    return NextResponse.json({ error: 'Erro ao criar transportadora' }, { status: 500 });
  }
}

// PUT - Atualizar transportadora
export async function PUT(request: Request) {
  try {
    const {
      codtrans,
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

    if (!codtrans) {
      return NextResponse.json(
        { error: 'Código da transportadora é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se a transportadora existe
    const transportadoraExiste = await sql`
      SELECT 1 FROM sistema_nfe.transportadoras WHERE codtrans = ${codtrans}
    `;

    if (transportadoraExiste.length === 0) {
      return NextResponse.json(
        { error: 'Transportadora não encontrada' },
        { status: 404 }
      );
    }

    // Verificar se já existe outra pessoa com o mesmo CPF/CNPJ
    const pessoaExiste = await sql`
      SELECT 1 FROM sistema_nfe.pessoa 
      WHERE cpfcnpj = ${cpfcnpj} AND codigo != ${codtrans}
    `;

    if (pessoaExiste.length > 0) {
      return NextResponse.json(
        { error: 'Já existe outra pessoa cadastrada com este CPF/CNPJ' },
        { status: 400 }
      );
    }

    // Atualizar os dados da pessoa
    await sql`
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
      WHERE codigo = ${codtrans}
    `;

    // Retornar os dados atualizados
    const transportadora = await sql`
      SELECT t.codtrans, p.tipopessoa, p.nomerazao, p.nomefantasia, p.cpfcnpj,
             p.rg_inscricaoestadual, p.endereco, p.numero, p.complemento,
             p.bairro, p.cep, p.codcid, p.telefone, p.email, p.datacadastro,
             cid.nomecidade, est.nomeestado, pais.nomepais
      FROM sistema_nfe.transportadoras t
      LEFT JOIN sistema_nfe.pessoa p ON t.codtrans = p.codigo
      LEFT JOIN sistema_nfe.cidades cid ON p.codcid = cid.codcid
      LEFT JOIN sistema_nfe.estados est ON cid.codest = est.codest
      LEFT JOIN sistema_nfe.paises pais ON est.codpais = pais.codpais
      WHERE t.codtrans = ${codtrans}
    `;

    return NextResponse.json(transportadora[0]);
  } catch (error) {
    console.error('Erro ao atualizar transportadora:', error);
    return NextResponse.json({ error: 'Erro ao atualizar transportadora' }, { status: 500 });
  }
}

// DELETE - Excluir transportadora
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const codtrans = searchParams.get('codtrans');

    if (!codtrans) {
      return NextResponse.json(
        { error: 'Código da transportadora é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se existem notas fiscais vinculadas
    const notasVinculadas = await sql`
      SELECT 1 FROM sistema_nfe.nfe WHERE codtrans = ${codtrans}
    `;

    if (notasVinculadas.length > 0) {
      return NextResponse.json(
        { error: 'Não é possível excluir a transportadora pois existem notas fiscais vinculadas' },
        { status: 400 }
      );
    }

    // Excluir a transportadora
    const transportadoraExcluida = await sql`
      DELETE FROM sistema_nfe.transportadoras
      WHERE codtrans = ${codtrans}
      RETURNING *
    `;

    if (transportadoraExcluida.length === 0) {
      return NextResponse.json({ error: 'Transportadora não encontrada' }, { status: 404 });
    }

    await sql`
      DELETE FROM sistema_nfe.pessoa
      WHERE codigo = ${codtrans}
    `;

    return NextResponse.json({ message: 'Transportadora excluída com sucesso' });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao excluir transportadora' }, { status: 500 });
  }
} 