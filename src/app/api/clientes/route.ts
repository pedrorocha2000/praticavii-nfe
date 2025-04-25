import { NextResponse } from 'next/server';
import { sql } from '@/database';

// GET - Listar todos os clientes
export async function GET() {
  try {
    const clientes = await sql`
      SELECT c.codcli, c.codcondpgto, p.tipopessoa, p.nomerazao, p.nomefantasia, p.cpfcnpj,
             p.rg_inscricaoestadual, p.endereco, p.numero, p.complemento,
             p.bairro, p.cep, p.codcid, p.telefone, p.email, p.datacadastro,
             cid.nomecidade, est.nomeestado, pais.nomepais,
             cp.descricao as condicao_pagamento
      FROM sistema_nfe.clientes c
      LEFT JOIN sistema_nfe.pessoa p ON c.codcli = p.codigo
      LEFT JOIN sistema_nfe.cidades cid ON p.codcid = cid.codcid
      LEFT JOIN sistema_nfe.estados est ON cid.codest = est.codest
      LEFT JOIN sistema_nfe.paises pais ON est.codpais = pais.codpais
      LEFT JOIN sistema_nfe.cond_pgto cp ON c.codcondpgto = cp.codcondpgto
      ORDER BY p.nomerazao
    `;
    return NextResponse.json(clientes);
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    return NextResponse.json({ error: 'Erro ao buscar clientes' }, { status: 500 });
  }
}

// POST - Criar novo cliente
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

    // Verificar se já existe uma pessoa com o mesmo CPF/CNPJ (apenas se cpfcnpj não for nulo)
    if (cpfcnpj) {
      const cpfcnpjExiste = await sql`
        SELECT 1 FROM sistema_nfe.pessoa WHERE cpfcnpj = ${cpfcnpj}
      `;

      if (cpfcnpjExiste.length > 0) {
        return NextResponse.json(
          { error: 'Já existe uma pessoa cadastrada com este CPF/CNPJ' },
          { status: 400 }
        );
      }
    }

    const pessoa = await sql`
      INSERT INTO sistema_nfe.pessoa (
        tipopessoa, nomerazao, nomefantasia, cpfcnpj, 
        rg_inscricaoestadual, endereco, numero, complemento, 
        bairro, cep, codcid, telefone, email
      ) 
      VALUES (
        ${tipopessoa}, ${nomerazao}, ${nomefantasia}, ${cpfcnpj || null}, 
        ${rg_inscricaoestadual}, ${endereco}, ${numero}, ${complemento}, 
        ${bairro}, ${cep}, ${codcid}, ${telefone}, ${email}
      )
      RETURNING codigo
    `;

    await sql`
      INSERT INTO sistema_nfe.clientes (codcli, codcondpgto)
      VALUES (${pessoa[0].codigo}, ${codcondpgto || null})
    `;

    return NextResponse.json({ 
      message: 'Cliente criado com sucesso',
      codigo: pessoa[0].codigo 
    }, { status: 201 });

  } catch (error: any) {
    console.error('Erro ao criar cliente:', error);
    // Melhorar a mensagem de erro para o usuário
    let errorMessage = 'Erro ao criar cliente';
    if (error.message) {
      if (error.message.includes('check_cpf_cnpj')) {
        errorMessage = 'Formato de CPF/CNPJ inválido';
      } else if (error.message.includes('pessoa_cpfcnpj_key')) {
        errorMessage = 'CPF/CNPJ já cadastrado';
      }
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// PUT - Atualizar cliente
export async function PUT(request: Request) {
  try {
    const {
      codcli,
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

    if (!codcli) {
      return NextResponse.json(
        { error: 'Código do cliente é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se já existe uma pessoa com o mesmo CPF/CNPJ (apenas se cpfcnpj não for nulo)
    if (cpfcnpj) {
      const cpfcnpjExiste = await sql`
        SELECT 1 FROM sistema_nfe.pessoa 
        WHERE cpfcnpj = ${cpfcnpj} AND codigo != ${codcli}
      `;

      if (cpfcnpjExiste.length > 0) {
        return NextResponse.json(
          { error: 'Já existe uma pessoa cadastrada com este CPF/CNPJ' },
          { status: 400 }
        );
      }
    }

    // Verificar se o cliente existe
    const clienteExiste = await sql`
      SELECT 1 FROM sistema_nfe.clientes WHERE codcli = ${codcli}
    `;

    if (clienteExiste.length === 0) {
      return NextResponse.json(
        { error: 'Cliente não encontrado' },
        { status: 404 }
      );
    }

    // Atualizar os dados do cliente
    await sql`
      UPDATE sistema_nfe.clientes 
      SET codcondpgto = ${codcondpgto}
      WHERE codcli = ${codcli}
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
      WHERE codigo = ${codcli}
    `;

    // Retornar os dados atualizados do cliente
    const cliente = await sql`
      SELECT c.codcli, c.codcondpgto, p.tipopessoa, p.nomerazao, p.nomefantasia, p.cpfcnpj,
             p.rg_inscricaoestadual, p.endereco, p.numero, p.complemento,
             p.bairro, p.cep, p.codcid, p.telefone, p.email, p.datacadastro,
             cid.nomecidade, est.nomeestado, pais.nomepais,
             cp.descricao as condicao_pagamento
      FROM sistema_nfe.clientes c
      LEFT JOIN sistema_nfe.pessoa p ON c.codcli = p.codigo
      LEFT JOIN sistema_nfe.cidades cid ON p.codcid = cid.codcid
      LEFT JOIN sistema_nfe.estados est ON cid.codest = est.codest
      LEFT JOIN sistema_nfe.paises pais ON est.codpais = pais.codpais
      LEFT JOIN sistema_nfe.cond_pgto cp ON c.codcondpgto = cp.codcondpgto
      WHERE c.codcli = ${codcli}
    `;

    return NextResponse.json(cliente[0]);
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error);
    return NextResponse.json({ error: 'Erro ao atualizar cliente', details: error.message }, { status: 500 });
  }
}

// DELETE - Excluir cliente
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const codcli = searchParams.get('codcli');

    if (!codcli) {
      return NextResponse.json(
        { error: 'Código do cliente é obrigatório' },
        { status: 400 }
      );
    }

    await sql`
      DELETE FROM sistema_nfe.clientes 
      WHERE codcli = ${codcli}
    `;

    await sql`
      DELETE FROM sistema_nfe.pessoa 
      WHERE codigo = ${codcli}
    `;

    return NextResponse.json({ message: 'Cliente excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir cliente:', error);
    return NextResponse.json({ error: 'Erro ao excluir cliente' }, { status: 500 });
  }
} 