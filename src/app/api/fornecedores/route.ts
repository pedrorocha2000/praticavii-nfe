import { NextResponse } from 'next/server';
import { sql } from '@/database';

// GET - Listar todos os fornecedores
export async function GET() {
  try {
    const fornecedores = await sql`
      SELECT f.codforn, f.codcondpgto, p.tipopessoa, p.nomerazao, p.nomefantasia, p.cpfcnpj,
             p.rg_inscricaoestadual, p.endereco, p.numero, p.complemento,
             p.bairro, p.cep, p.codcid, p.telefone, p.email, p.datacadastro,
             cid.nomecidade, est.nomeestado, pais.nomepais,
             cp.descricao as condicao_pagamento
      FROM sistema_nfe.fornecedores f
      LEFT JOIN sistema_nfe.pessoa p ON f.codforn = p.codigo
      LEFT JOIN sistema_nfe.cidades cid ON p.codcid = cid.codcid
      LEFT JOIN sistema_nfe.estados est ON cid.codest = est.codest
      LEFT JOIN sistema_nfe.paises pais ON est.codpais = pais.codpais
      LEFT JOIN sistema_nfe.cond_pgto cp ON f.codcondpgto = cp.codcondpgto
      ORDER BY p.nomerazao
    `;
    return NextResponse.json(fornecedores);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar fornecedores' }, { status: 500 });
  }
}

// POST - Criar novo fornecedor
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
      email,
      codcondpgto
    } = await request.json();

    // Verificar se a cidade foi selecionada (codcid deve ser maior que 0)
    if (!codcid || parseInt(codcid) <= 0) {
      return NextResponse.json(
        { error: 'É necessário selecionar uma cidade válida' },
        { status: 400 }
      );
    }

    // Verificar se já existe uma pessoa com o mesmo CPF/CNPJ
    const cpfcnpjExiste = await sql`
      SELECT 1 FROM sistema_nfe.pessoa WHERE cpfcnpj = ${cpfcnpj}
    `;

    if (cpfcnpjExiste.length > 0) {
      return NextResponse.json(
        { error: 'Já existe uma pessoa cadastrada com este CPF/CNPJ' },
        { status: 400 }
      );
    }

    const pessoa = await sql`
      INSERT INTO sistema_nfe.pessoa (
        tipopessoa, nomerazao, nomefantasia, cpfcnpj, 
        rg_inscricaoestadual, endereco, numero, complemento, 
        bairro, cep, codcid, telefone, email
      ) 
      VALUES (
        ${tipopessoa}, ${nomerazao}, ${nomefantasia}, ${cpfcnpj}, 
        ${rg_inscricaoestadual}, ${endereco}, ${numero}, ${complemento}, 
        ${bairro}, ${cep}, ${codcid}, ${telefone}, ${email}
      )
      RETURNING codigo
    `;

    // Verificar se codcondpgto é válido (maior que 0)
    const condPgtoValue = codcondpgto && parseInt(codcondpgto) > 0 ? parseInt(codcondpgto) : null;

    await sql`
      INSERT INTO sistema_nfe.fornecedores (codforn, codcondpgto)
      VALUES (${pessoa[0].codigo}, ${condPgtoValue})
    `;

    return NextResponse.json({ 
      message: 'Fornecedor criado com sucesso',
      codigo: pessoa[0].codigo 
    }, { status: 201 });

  } catch (error) {
    console.error('Erro ao criar fornecedor:', error);
    return NextResponse.json({ error: 'Erro ao criar fornecedor', details: error.message }, { status: 500 });
  }
}

// PUT - Atualizar fornecedor
export async function PUT(request: Request) {
  try {
    const {
      codforn,
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
      codcondpgto
    } = await request.json();

    if (!codforn) {
      return NextResponse.json(
        { error: 'Código do fornecedor é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se já existe uma pessoa com o mesmo CPF/CNPJ (exceto a própria pessoa)
    const cpfcnpjExiste = await sql`
      SELECT 1 FROM sistema_nfe.pessoa 
      WHERE cpfcnpj = ${cpfcnpj} AND codigo != ${codforn}
    `;

    if (cpfcnpjExiste.length > 0) {
      return NextResponse.json(
        { error: 'Já existe uma pessoa cadastrada com este CPF/CNPJ' },
        { status: 400 }
      );
    }

    // Verificar se o fornecedor existe
    const fornecedorExiste = await sql`
      SELECT 1 FROM sistema_nfe.fornecedores WHERE codforn = ${codforn}
    `;

    if (fornecedorExiste.length === 0) {
      return NextResponse.json(
        { error: 'Fornecedor não encontrado' },
        { status: 404 }
      );
    }

    // Atualizar os dados do fornecedor
    await sql`
      UPDATE sistema_nfe.fornecedores 
      SET codcondpgto = ${codcondpgto}
      WHERE codforn = ${codforn}
    `;

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
      WHERE codigo = ${codforn}
    `;

    // Retornar os dados atualizados do fornecedor
    const fornecedor = await sql`
      SELECT f.codforn, f.codcondpgto, p.tipopessoa, p.nomerazao, p.nomefantasia, p.cpfcnpj,
             p.rg_inscricaoestadual, p.endereco, p.numero, p.complemento,
             p.bairro, p.cep, p.codcid, p.telefone, p.email, p.datacadastro,
             cid.nomecidade, est.nomeestado, pais.nomepais,
             cp.descricao as condicao_pagamento
      FROM sistema_nfe.fornecedores f
      LEFT JOIN sistema_nfe.pessoa p ON f.codforn = p.codigo
      LEFT JOIN sistema_nfe.cidades cid ON p.codcid = cid.codcid
      LEFT JOIN sistema_nfe.estados est ON cid.codest = est.codest
      LEFT JOIN sistema_nfe.paises pais ON est.codpais = pais.codpais
      LEFT JOIN sistema_nfe.cond_pgto cp ON f.codcondpgto = cp.codcondpgto
      WHERE f.codforn = ${codforn}
    `;

    return NextResponse.json(fornecedor[0]);
  } catch (error) {
    console.error('Erro ao atualizar fornecedor:', error);
    return NextResponse.json({ error: 'Erro ao atualizar fornecedor', details: error.message }, { status: 500 });
  }
}

// DELETE - Excluir fornecedor
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const codforn = searchParams.get('codforn');

    if (!codforn) {
      return NextResponse.json(
        { error: 'Código do fornecedor é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se existem notas fiscais vinculadas
    const notasVinculadas = await sql`
      SELECT 1 FROM sistema_nfe.nfe WHERE codforn = ${codforn}
    `;

    if (notasVinculadas.length > 0) {
      return NextResponse.json(
        { error: 'Não é possível excluir o fornecedor pois existem notas fiscais vinculadas' },
        { status: 400 }
      );
    }

    // Excluir o fornecedor
    const fornecedorExcluido = await sql`
      DELETE FROM sistema_nfe.fornecedores
      WHERE codforn = ${codforn}
      RETURNING *
    `;

    if (fornecedorExcluido.length === 0) {
      return NextResponse.json({ error: 'Fornecedor não encontrado' }, { status: 404 });
    }

    // Excluir a pessoa
    await sql`
      DELETE FROM sistema_nfe.pessoa
      WHERE codigo = ${codforn}
    `;

    return NextResponse.json({ message: 'Fornecedor excluído com sucesso' });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao excluir fornecedor' }, { status: 500 });
  }
} 