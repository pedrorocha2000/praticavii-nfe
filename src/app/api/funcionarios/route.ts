import { NextResponse } from 'next/server';
import { sql } from '@/database';

// GET - Listar todos os funcionários
export async function GET() {
  try {
    const funcionarios = await sql`
      SELECT f.codfunc, f.codpessoa, f.cargo, f.departamento, f.data_admissao, f.salario, f.status,
             p.tipopessoa, p.nomerazao, p.nomefantasia, p.cpfcnpj, p.rg_inscricaoestadual, p.endereco, 
             p.numero, p.complemento, p.bairro, p.cep, p.codcid, p.telefone, p.email, p.datacadastro,
             cid.nomecidade, est.nomeestado, pais.nomepais
      FROM sistema_nfe.funcionarios f
      LEFT JOIN sistema_nfe.pessoa p ON f.codpessoa = p.codigo
      LEFT JOIN sistema_nfe.cidades cid ON p.codcid = cid.codcid
      LEFT JOIN sistema_nfe.estados est ON cid.codest = est.codest
      LEFT JOIN sistema_nfe.paises pais ON est.codpais = pais.codpais
      ORDER BY p.nomerazao
    `;
    return NextResponse.json(funcionarios);
  } catch (error) {
    console.error('Erro ao buscar funcionários:', error);
    return NextResponse.json({ error: 'Erro ao buscar funcionários' }, { status: 500 });
  }
}

// POST - Criar novo funcionário
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
      cargo,
      departamento,
      data_admissao,
      salario,
      status
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

    // Inserir na tabela pessoa
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

    // Inserir na tabela funcionarios
    await sql`
      INSERT INTO sistema_nfe.funcionarios (
        codpessoa, cargo, departamento, data_admissao, salario, status
      )
      VALUES (
        ${pessoa[0].codigo}, ${cargo}, ${departamento}, ${data_admissao}, ${salario}, ${status || 'Ativo'}
      )
    `;

    return NextResponse.json({ 
      message: 'Funcionário criado com sucesso',
      codigo: pessoa[0].codigo 
    }, { status: 201 });

  } catch (error: any) {
    console.error('Erro ao criar funcionário:', error);
    // Melhorar a mensagem de erro para o usuário
    let errorMessage = 'Erro ao criar funcionário';
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

// PUT - Atualizar funcionário
export async function PUT(request: Request) {
  try {
    const {
      codfunc,
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
      cargo,
      departamento,
      data_admissao,
      salario,
      status
    } = await request.json();

    if (!codfunc || !codpessoa) {
      return NextResponse.json(
        { error: 'Código do funcionário e código da pessoa são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se já existe uma pessoa com o mesmo CPF/CNPJ (apenas se cpfcnpj não for nulo)
    if (cpfcnpj) {
      const cpfcnpjExiste = await sql`
        SELECT 1 FROM sistema_nfe.pessoa 
        WHERE cpfcnpj = ${cpfcnpj} AND codigo != ${codpessoa}
      `;

      if (cpfcnpjExiste.length > 0) {
        return NextResponse.json(
          { error: 'Já existe uma pessoa cadastrada com este CPF/CNPJ' },
          { status: 400 }
        );
      }
    }

    // Verificar se o funcionário existe
    const funcionarioExiste = await sql`
      SELECT 1 FROM sistema_nfe.funcionarios WHERE codfunc = ${codfunc}
    `;

    if (funcionarioExiste.length === 0) {
      return NextResponse.json(
        { error: 'Funcionário não encontrado' },
        { status: 404 }
      );
    }

    // Atualizar os dados do funcionário
    await sql`
      UPDATE sistema_nfe.funcionarios 
      SET 
        cargo = ${cargo},
        departamento = ${departamento},
        data_admissao = ${data_admissao},
        salario = ${salario},
        status = ${status}
      WHERE codfunc = ${codfunc}
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

    // Retornar os dados atualizados do funcionário
    const funcionario = await sql`
      SELECT f.codfunc, f.codpessoa, f.cargo, f.departamento, f.data_admissao, f.salario, f.status,
             p.tipopessoa, p.nomerazao, p.nomefantasia, p.cpfcnpj, p.rg_inscricaoestadual, p.endereco, 
             p.numero, p.complemento, p.bairro, p.cep, p.codcid, p.telefone, p.email, p.datacadastro,
             cid.nomecidade, est.nomeestado, pais.nomepais
      FROM sistema_nfe.funcionarios f
      LEFT JOIN sistema_nfe.pessoa p ON f.codpessoa = p.codigo
      LEFT JOIN sistema_nfe.cidades cid ON p.codcid = cid.codcid
      LEFT JOIN sistema_nfe.estados est ON cid.codest = est.codest
      LEFT JOIN sistema_nfe.paises pais ON est.codpais = pais.codpais
      WHERE f.codfunc = ${codfunc}
    `;

    return NextResponse.json(funcionario[0]);
  } catch (error) {
    console.error('Erro ao atualizar funcionário:', error);
    return NextResponse.json({ error: 'Erro ao atualizar funcionário', details: error.message }, { status: 500 });
  }
}

// DELETE - Excluir funcionário
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const codfunc = searchParams.get('codfunc');
    const codpessoa = searchParams.get('codpessoa');

    if (!codfunc || !codpessoa) {
      return NextResponse.json(
        { error: 'Código do funcionário e código da pessoa são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se o funcionário existe
    const funcionarioExiste = await sql`
      SELECT 1 FROM sistema_nfe.funcionarios WHERE codfunc = ${codfunc}
    `;

    if (funcionarioExiste.length === 0) {
      return NextResponse.json(
        { error: 'Funcionário não encontrado' },
        { status: 404 }
      );
    }

    // Excluir o funcionário
    await sql`
      DELETE FROM sistema_nfe.funcionarios WHERE codfunc = ${codfunc}
    `;

    // Excluir a pessoa
    await sql`
      DELETE FROM sistema_nfe.pessoa WHERE codigo = ${codpessoa}
    `;

    return NextResponse.json({ message: 'Funcionário excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir funcionário:', error);
    return NextResponse.json({ error: 'Erro ao excluir funcionário' }, { status: 500 });
  }
} 