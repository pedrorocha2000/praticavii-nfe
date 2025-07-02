import { NextResponse } from 'next/server';
import { sql } from '@/database';

// GET - Listar todos os fornecedores ou buscar por CPF/CNPJ
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cpfcnpj = searchParams.get('cpfcnpj');

  // Se tiver cpfcnpj como parâmetro, buscar pessoa específica
  if (cpfcnpj) {
    try {
      const pessoa = await sql`
        SELECT p.codigo, p.tipopessoa, p.nomerazao, p.nomefantasia, p.cpfcnpj, 
               p.rg_inscricaoestadual, p.endereco, p.numero, p.complemento, 
               p.bairro, p.cep, p.codcid, p.telefone, p.email,
               cid.nomecidade, est.nomeestado, pais.nomepais
        FROM sistema_nfe.pessoa p
        LEFT JOIN sistema_nfe.cidades cid ON p.codcid = cid.codcid
        LEFT JOIN sistema_nfe.estados est ON cid.codest = est.codest
        LEFT JOIN sistema_nfe.paises pais ON est.codpais = pais.codpais
        WHERE p.cpfcnpj = ${cpfcnpj}
      `;
      
      if (pessoa.length > 0) {
        return NextResponse.json({ exists: true, data: pessoa[0] });
      } else {
        return NextResponse.json({ exists: false });
      }
    } catch (error) {
      console.error('Erro ao buscar pessoa por CPF/CNPJ:', error);
      return NextResponse.json({ error: 'Erro ao buscar pessoa' }, { status: 500 });
    }
  }

  try {
    const fornecedores = await sql`
      SELECT f.codforn, f.codpessoa, f.codcondpgto, f.data_criacao, f.data_alteracao,
             f.situacao, f.limite_credito,
             p.tipopessoa, p.nomerazao, p.nomefantasia, p.cpfcnpj,
             p.rg_inscricaoestadual, p.endereco, p.numero, p.complemento,
             p.bairro, p.cep, p.codcid, p.telefone, p.email, p.datacadastro,
             cid.nomecidade, est.nomeestado, pais.nomepais,
             cp.descricao as condicao_pagamento
      FROM sistema_nfe.fornecedores f
      LEFT JOIN sistema_nfe.pessoa p ON f.codpessoa = p.codigo
      LEFT JOIN sistema_nfe.cidades cid ON p.codcid = cid.codcid
      LEFT JOIN sistema_nfe.estados est ON cid.codest = est.codest
      LEFT JOIN sistema_nfe.paises pais ON est.codpais = pais.codpais
      LEFT JOIN sistema_nfe.cond_pgto cp ON f.codcondpgto = cp.codcondpgto
      ORDER BY p.nomerazao
    `;
    return NextResponse.json(fornecedores);
  } catch (error) {
    console.error('Erro ao buscar fornecedores:', error);
    return NextResponse.json({ error: 'Erro ao buscar fornecedores' }, { status: 500 });
  }
}

function validateCPFCNPJ(cpfcnpj: string, tipopessoa: 'F' | 'J'): boolean {
  const numbers = cpfcnpj.replace(/\D/g, '');
  if (tipopessoa === 'F') {
    if (numbers.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(numbers)) return false;
    let soma = 0;
    for (let i = 0; i < 9; i++) {
      soma += parseInt(numbers.charAt(i)) * (10 - i);
    }
    let resto = 11 - (soma % 11);
    let digito1 = resto > 9 ? 0 : resto;
    soma = 0;
    for (let i = 0; i < 10; i++) {
      soma += parseInt(numbers.charAt(i)) * (11 - i);
    }
    resto = 11 - (soma % 11);
    let digito2 = resto > 9 ? 0 : resto;
    return digito1 === parseInt(numbers.charAt(9)) && digito2 === parseInt(numbers.charAt(10));
  } else {
    if (numbers.length !== 14) return false;
    if (/^(\d)\1{13}$/.test(numbers)) return false;
    let soma = 0;
    let peso = 5;
    for (let i = 0; i < 12; i++) {
      soma += parseInt(numbers.charAt(i)) * peso;
      peso = peso === 2 ? 9 : peso - 1;
    }
    let resto = soma % 11;
    let digito1 = resto < 2 ? 0 : 11 - resto;
    soma = 0;
    peso = 6;
    for (let i = 0; i < 13; i++) {
      soma += parseInt(numbers.charAt(i)) * peso;
      peso = peso === 2 ? 9 : peso - 1;
    }
    resto = soma % 11;
    let digito2 = resto < 2 ? 0 : 11 - resto;
    return digito1 === parseInt(numbers.charAt(12)) && digito2 === parseInt(numbers.charAt(13));
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
      codcondpgto,
      limite_credito
    } = await request.json();

    // Validações obrigatórias
    if (!nomerazao || !codcid) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: nome/razão social e cidade' },
        { status: 400 }
      );
    }

    // Validação de CPF/CNPJ
    if (cpfcnpj && !validateCPFCNPJ(cpfcnpj, tipopessoa)) {
      return NextResponse.json(
        { error: 'CPF/CNPJ inválido' },
        { status: 400 }
      );
    }

    let codpessoa;

    // Verificar se já existe uma pessoa com o mesmo CPF/CNPJ
    if (cpfcnpj) {
      const pessoaExistente = await sql`
        SELECT codigo FROM sistema_nfe.pessoa WHERE cpfcnpj = ${cpfcnpj}
      `;

      if (pessoaExistente.length > 0) {
        // Usar pessoa existente e atualizar seus dados
        codpessoa = pessoaExistente[0].codigo;
        
        await sql`
          UPDATE sistema_nfe.pessoa 
          SET 
            tipopessoa = ${tipopessoa},
            nomerazao = ${nomerazao},
            nomefantasia = ${nomefantasia || null},
            rg_inscricaoestadual = ${rg_inscricaoestadual || null},
            endereco = ${endereco || null},
            numero = ${numero || null},
            complemento = ${complemento || null},
            bairro = ${bairro || null},
            cep = ${cep || null},
            codcid = ${codcid},
            telefone = ${telefone || null},
            email = ${email || null}
          WHERE codigo = ${codpessoa}
        `;
      } else {
        // Criar nova pessoa
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
        codpessoa = pessoa[0].codigo;
      }
    } else {
      // Criar nova pessoa (sem CPF/CNPJ)
      const pessoa = await sql`
        INSERT INTO sistema_nfe.pessoa (
          tipopessoa, nomerazao, nomefantasia, cpfcnpj, 
          rg_inscricaoestadual, endereco, numero, complemento, 
          bairro, cep, codcid, telefone, email
        ) 
        VALUES (
          ${tipopessoa}, ${nomerazao}, ${nomefantasia}, null, 
          ${rg_inscricaoestadual}, ${endereco}, ${numero}, ${complemento}, 
          ${bairro}, ${cep}, ${codcid}, ${telefone}, ${email}
        )
        RETURNING codigo
      `;
      codpessoa = pessoa[0].codigo;
    }

    // Inserir na tabela fornecedores
    const fornecedor = await sql`
      INSERT INTO sistema_nfe.fornecedores (
        codpessoa, codcondpgto, limite_credito
      )
      VALUES (
        ${codpessoa}, ${codcondpgto || null}, ${limite_credito || 0.00}
      )
      RETURNING codforn
    `;

    return NextResponse.json({ 
      message: 'Fornecedor criado com sucesso',
      codforn: fornecedor[0].codforn,
      codpessoa: codpessoa 
    }, { status: 201 });

  } catch (error: any) {
    console.error('Erro ao criar fornecedor:', error);
    let errorMessage = 'Erro ao criar fornecedor';
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

// PUT - Atualizar fornecedor
export async function PUT(request: Request) {
  try {
    const {
      codforn,
      codpessoa,
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
      codcondpgto,
      limite_credito,
      situacao
    } = await request.json();

    if (!codforn || !codpessoa) {
      return NextResponse.json(
        { error: 'Código do fornecedor e código da pessoa são obrigatórios' },
        { status: 400 }
      );
    }

    // Validações obrigatórias
    if (!nomerazao || !codcid) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: nome/razão social e cidade' },
        { status: 400 }
      );
    }

    // Validação de CPF/CNPJ
    if (cpfcnpj && !validateCPFCNPJ(cpfcnpj, tipopessoa)) {
      return NextResponse.json(
        { error: 'CPF/CNPJ inválido' },
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
      SET 
        codcondpgto = ${codcondpgto || null},
        limite_credito = ${limite_credito || 0.00},
        situacao = ${situacao || null}
      WHERE codforn = ${codforn}
    `;

    // Atualizar os dados da pessoa
    await sql`
      UPDATE sistema_nfe.pessoa 
      SET 
        tipopessoa = ${tipopessoa},
        nomerazao = ${nomerazao},
        nomefantasia = ${nomefantasia},
        cpfcnpj = ${cpfcnpj || null},
        rg_inscricaoestadual = ${rg_inscricaoestadual},
        endereco = ${endereco},
        numero = ${numero},
        complemento = ${complemento},
        bairro = ${bairro},
        cep = ${cep},
        codcid = ${codcid},
        telefone = ${telefone},
        email = ${email}
      WHERE codigo = ${codpessoa}
    `;

    return NextResponse.json({ message: 'Fornecedor atualizado com sucesso' });
  } catch (error: any) {
    console.error('Erro ao atualizar fornecedor:', error);
    return NextResponse.json({ error: 'Erro ao atualizar fornecedor' }, { status: 500 });
  }
}

// DELETE - Soft delete (desativar fornecedor) ou hard delete
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const codforn = searchParams.get('codforn');
    const force = searchParams.get('force') === 'true'; // Para hard delete

    if (!codforn) {
      return NextResponse.json(
        { error: 'Código do fornecedor é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se o fornecedor existe e está ativo
    const fornecedor = await sql`
      SELECT codforn, situacao FROM sistema_nfe.fornecedores WHERE codforn = ${codforn}
    `;

    if (fornecedor.length === 0) {
      return NextResponse.json(
        { error: 'Fornecedor não encontrado' },
        { status: 404 }
      );
    }

    if (force) {
      // Hard delete - verificar se há dependências (NFes, produtos, etc.)
      const nfesVinculadas = await sql`
        SELECT 1 FROM sistema_nfe.nfe WHERE codforn = ${codforn} LIMIT 1
      `;

      if (nfesVinculadas.length > 0) {
        return NextResponse.json(
          { error: 'Não é possível excluir o fornecedor pois existem notas fiscais vinculadas' },
          { status: 400 }
        );
      }

      // Verificar produtos vinculados
      const produtosVinculados = await sql`
        SELECT 1 FROM sistema_nfe.produto_forn WHERE codforn = ${codforn} LIMIT 1
      `;

      if (produtosVinculados.length > 0) {
        return NextResponse.json(
          { error: 'Não é possível excluir o fornecedor pois existem produtos vinculados' },
          { status: 400 }
        );
      }

      // Excluir permanentemente
    await sql`
      DELETE FROM sistema_nfe.fornecedores WHERE codforn = ${codforn}
    `;

      return NextResponse.json({ message: 'Fornecedor excluído permanentemente' });
    } else {
      // Soft delete - desativar fornecedor
      if (fornecedor[0].situacao) {
        return NextResponse.json(
          { error: 'Fornecedor já está desativado' },
          { status: 400 }
        );
      }

      await sql`
        UPDATE sistema_nfe.fornecedores 
        SET situacao = CURRENT_TIMESTAMP 
        WHERE codforn = ${codforn}
      `;

      return NextResponse.json({ message: 'Fornecedor desativado com sucesso' });
    }
  } catch (error) {
    console.error('Erro ao processar fornecedor:', error);
    return NextResponse.json({ error: 'Erro ao processar fornecedor' }, { status: 500 });
  }
}

// PATCH - Reativar fornecedor desativado
export async function PATCH(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const codforn = searchParams.get('codforn');
    const action = searchParams.get('action');

    if (!codforn) {
      return NextResponse.json(
        { error: 'Código do fornecedor é obrigatório' },
        { status: 400 }
      );
    }

    if (action === 'reativar') {
      // Verificar se o fornecedor existe e está desativado
      const fornecedor = await sql`
        SELECT codforn, situacao FROM sistema_nfe.fornecedores WHERE codforn = ${codforn}
      `;

      if (fornecedor.length === 0) {
        return NextResponse.json(
          { error: 'Fornecedor não encontrado' },
          { status: 404 }
        );
      }

      if (!fornecedor[0].situacao) {
        return NextResponse.json(
          { error: 'Fornecedor já está ativo' },
          { status: 400 }
        );
      }

      // Reativar fornecedor (limpar situacao)
      await sql`
        UPDATE sistema_nfe.fornecedores 
        SET situacao = NULL 
        WHERE codforn = ${codforn}
      `;

      return NextResponse.json({ message: 'Fornecedor reativado com sucesso' });
    }

    return NextResponse.json({ error: 'Ação não reconhecida' }, { status: 400 });
  } catch (error) {
    console.error('Erro ao reativar fornecedor:', error);
    return NextResponse.json({ error: 'Erro ao reativar fornecedor' }, { status: 500 });
  }
} 