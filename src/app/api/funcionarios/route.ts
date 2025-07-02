import { NextResponse } from 'next/server';
import { sql } from '@/database';

// GET - Listar todos os funcionários
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
    const funcionarios = await sql`
      SELECT f.codfunc, f.codpessoa, f.departamento, f.data_admissao, f.salario, f.situacao, f.codfuncao_fk, f.numero_cnh,
             f.data_criacao, f.data_alteracao, f.datavalidadecnh,
             p.tipopessoa, p.nomerazao, p.nomefantasia, p.cpfcnpj, p.rg_inscricaoestadual, p.endereco, 
             p.numero, p.complemento, p.bairro, p.cep, p.codcid, p.telefone, p.email, p.datacadastro,
             cid.nomecidade, est.nomeestado, pais.nomepais,
             func.nome_funcao, func.exige_cnh
      FROM sistema_nfe.funcionarios f
      LEFT JOIN sistema_nfe.pessoa p ON f.codpessoa = p.codigo
      LEFT JOIN sistema_nfe.cidades cid ON p.codcid = cid.codcid
      LEFT JOIN sistema_nfe.estados est ON cid.codest = est.codest
      LEFT JOIN sistema_nfe.paises pais ON est.codpais = pais.codpais
      LEFT JOIN sistema_nfe.funcoes_funcionario func ON f.codfuncao_fk = func.codfuncao
      ORDER BY p.nomerazao
    `;
    return NextResponse.json(funcionarios);
  } catch (error) {
    console.error('Erro ao buscar funcionários:', error);
    return NextResponse.json({ error: 'Erro ao buscar funcionários' }, { status: 500 });
  }
}

function validateCPFCNPJ(cpfcnpj: string, tipopessoa: 'F' | 'J'): boolean {
  const numbers = cpfcnpj.replace(/\D/g, '');
  if (tipopessoa === 'F') {
    // Validação de CPF
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
    // Validação de CNPJ
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
      departamento,
      data_admissao,
      salario,
      codfuncao_fk,
      numero_cnh,
      datavalidadecnh,
      situacao
    } = await request.json();

    // Validações obrigatórias
    if (!nomerazao || !codcid || !departamento || !data_admissao || !salario || !codfuncao_fk) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: nome/razão social, cidade, departamento, data de admissão, salário e função' },
        { status: 400 }
      );
    }

    // Validar apelido
    if (!nomefantasia || nomefantasia.trim() === '') {
      return NextResponse.json(
        { error: 'Apelido é obrigatório' },
        { status: 400 }
      );
    }

    // Validar RG
    if (!rg_inscricaoestadual || rg_inscricaoestadual.trim() === '') {
      return NextResponse.json(
        { error: 'RG é obrigatório' },
        { status: 400 }
      );
    }

    // Validar endereço
    if (!endereco || endereco.trim() === '') {
      return NextResponse.json(
        { error: 'Endereço é obrigatório' },
        { status: 400 }
      );
    }

    // Validar número
    if (!numero || numero.trim() === '') {
      return NextResponse.json(
        { error: 'Número é obrigatório' },
        { status: 400 }
      );
    }

    // Validar bairro
    if (!bairro || bairro.trim() === '') {
      return NextResponse.json(
        { error: 'Bairro é obrigatório' },
        { status: 400 }
      );
    }

    // Validar CEP
    if (!cep || cep.trim() === '') {
      return NextResponse.json(
        { error: 'CEP é obrigatório' },
        { status: 400 }
      );
    }

    // Validar telefone
    if (!telefone || telefone.trim() === '') {
      return NextResponse.json(
        { error: 'Telefone é obrigatório' },
        { status: 400 }
      );
    }

    // Validar salário
    if (salario <= 0) {
      return NextResponse.json(
        { error: 'Salário deve ser maior que zero' },
        { status: 400 }
      );
    }

    // Validar data de admissão (não pode ser futura)
    const hoje = new Date();
    const dataAdmissao = new Date(data_admissao);
    if (dataAdmissao > hoje) {
      return NextResponse.json(
        { error: 'Data de admissão não pode ser futura' },
        { status: 400 }
      );
    }

    // Verificar se a função existe e se exige CNH
    const funcao = await sql`
      SELECT exige_cnh FROM sistema_nfe.funcoes_funcionario WHERE codfuncao = ${codfuncao_fk}
    `;

    if (funcao.length === 0) {
      return NextResponse.json(
        { error: 'Função não encontrada' },
        { status: 400 }
      );
    }

    // Se a função exige CNH, o número da CNH é obrigatório
    if (funcao[0].exige_cnh && (!numero_cnh || numero_cnh.trim() === '')) {
      return NextResponse.json(
        { error: 'Esta função exige CNH. Por favor, informe o número da CNH' },
        { status: 400 }
      );
    }

    if (funcao[0].exige_cnh && (!datavalidadecnh || datavalidadecnh.trim() === '')) {
      return NextResponse.json(
        { error: 'Esta função exige CNH. Por favor, informe a data de validade da CNH' },
        { status: 400 }
      );
    }

    // Validar se a CNH não está vencida (se a função exige CNH)
    if (funcao[0].exige_cnh && datavalidadecnh) {
      const hoje = new Date();
      const validadeCnh = new Date(datavalidadecnh);
      if (validadeCnh < hoje) {
        return NextResponse.json(
          { error: 'A CNH está vencida. Por favor, renove antes de prosseguir' },
          { status: 400 }
        );
      }
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

    // Antes do insert/update:
    const situacaoValida = (!situacao || situacao === '' || situacao === undefined) ? null : situacao;

    // Inserir na tabela funcionarios
    const funcionario = await sql`
      INSERT INTO sistema_nfe.funcionarios (
        codpessoa, departamento, data_admissao, salario, situacao, codfuncao_fk, numero_cnh, datavalidadecnh
      )
      VALUES (
        ${codpessoa}, ${departamento}, ${data_admissao}, ${salario}, 
        ${situacaoValida}, ${codfuncao_fk}, ${numero_cnh || null}, ${datavalidadecnh || null}
      )
      RETURNING codfunc
    `;

    return NextResponse.json({ 
      message: 'Funcionário criado com sucesso',
      codfunc: funcionario[0].codfunc,
      codpessoa: codpessoa 
    }, { status: 201 });

  } catch (error: any) {
    console.error('Erro ao criar funcionário:', error);
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
      departamento,
      data_admissao,
      salario,
      codfuncao_fk,
      numero_cnh,
      datavalidadecnh,
      situacao
    } = await request.json();

    if (!codfunc || !codpessoa) {
      return NextResponse.json(
        { error: 'Código do funcionário e código da pessoa são obrigatórios' },
        { status: 400 }
      );
    }

    // Validações obrigatórias
    if (!nomerazao || !codcid || !departamento || !data_admissao || !salario || !codfuncao_fk) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: nome/razão social, cidade, departamento, data de admissão, salário e função' },
        { status: 400 }
      );
    }

    // Validar apelido
    if (!nomefantasia || nomefantasia.trim() === '') {
      return NextResponse.json(
        { error: 'Apelido é obrigatório' },
        { status: 400 }
      );
    }

    // Validar RG
    if (!rg_inscricaoestadual || rg_inscricaoestadual.trim() === '') {
      return NextResponse.json(
        { error: 'RG é obrigatório' },
        { status: 400 }
      );
    }

    // Validar endereço
    if (!endereco || endereco.trim() === '') {
      return NextResponse.json(
        { error: 'Endereço é obrigatório' },
        { status: 400 }
      );
    }

    // Validar número
    if (!numero || numero.trim() === '') {
      return NextResponse.json(
        { error: 'Número é obrigatório' },
        { status: 400 }
      );
    }

    // Validar bairro
    if (!bairro || bairro.trim() === '') {
      return NextResponse.json(
        { error: 'Bairro é obrigatório' },
        { status: 400 }
      );
    }

    // Validar CEP
    if (!cep || cep.trim() === '') {
      return NextResponse.json(
        { error: 'CEP é obrigatório' },
        { status: 400 }
      );
    }

    // Validar telefone
    if (!telefone || telefone.trim() === '') {
      return NextResponse.json(
        { error: 'Telefone é obrigatório' },
        { status: 400 }
      );
    }

    // Validar salário
    if (salario <= 0) {
      return NextResponse.json(
        { error: 'Salário deve ser maior que zero' },
        { status: 400 }
      );
    }

    // Validar data de admissão (não pode ser futura)
    const hoje = new Date();
    const dataAdmissao = new Date(data_admissao);
    if (dataAdmissao > hoje) {
      return NextResponse.json(
        { error: 'Data de admissão não pode ser futura' },
        { status: 400 }
      );
    }

    // Verificar se a função existe e se exige CNH
    const funcao = await sql`
      SELECT exige_cnh FROM sistema_nfe.funcoes_funcionario WHERE codfuncao = ${codfuncao_fk}
    `;

    if (funcao.length === 0) {
      return NextResponse.json(
        { error: 'Função não encontrada' },
        { status: 400 }
      );
    }

    // Se a função exige CNH, o número da CNH é obrigatório
    if (funcao[0].exige_cnh && (!numero_cnh || numero_cnh.trim() === '')) {
      return NextResponse.json(
        { error: 'Esta função exige CNH. Por favor, informe o número da CNH' },
        { status: 400 }
      );
    }

    if (funcao[0].exige_cnh && (!datavalidadecnh || datavalidadecnh.trim() === '')) {
      return NextResponse.json(
        { error: 'Esta função exige CNH. Por favor, informe a data de validade da CNH' },
        { status: 400 }
      );
    }

    // Validar se a CNH não está vencida (se a função exige CNH)
    if (funcao[0].exige_cnh && datavalidadecnh) {
      const hoje = new Date();
      const validadeCnh = new Date(datavalidadecnh);
      if (validadeCnh < hoje) {
        return NextResponse.json(
          { error: 'A CNH está vencida. Por favor, renove antes de prosseguir' },
          { status: 400 }
        );
      }
    }

    // Validação de CPF/CNPJ
    if (cpfcnpj && !validateCPFCNPJ(cpfcnpj, tipopessoa)) {
      return NextResponse.json(
        { error: 'CPF/CNPJ inválido' },
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

    // Antes do insert/update:
    const situacaoValida = (!situacao || situacao === '' || situacao === undefined) ? null : situacao;

    // Atualizar os dados do funcionário
    await sql`
      UPDATE sistema_nfe.funcionarios 
      SET 
        departamento = ${departamento},
        data_admissao = ${data_admissao},
        salario = ${salario},
        situacao = ${situacaoValida},
        codfuncao_fk = ${codfuncao_fk},
        numero_cnh = ${numero_cnh || null},
        datavalidadecnh = ${datavalidadecnh || null}
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

    return NextResponse.json({ message: 'Funcionário atualizado com sucesso' });
  } catch (error: any) {
    console.error('Erro ao atualizar funcionário:', error);
    let errorMessage = 'Erro ao atualizar funcionário';
    if (error.message) {
      if (error.message.includes('funcionarios_status_check')) {
        errorMessage = 'Status inválido. Use: Ativo, Inativo, Afastado ou Demitido';
      }
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// DELETE - Soft delete (desativar funcionário) ou hard delete
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const codfunc = searchParams.get('codfunc');
    const force = searchParams.get('force') === 'true'; // Para hard delete

    if (!codfunc) {
      return NextResponse.json(
        { error: 'Código do funcionário é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se o funcionário existe e está ativo
    const funcionario = await sql`
      SELECT codfunc, situacao FROM sistema_nfe.funcionarios WHERE codfunc = ${codfunc}
    `;

    if (funcionario.length === 0) {
      return NextResponse.json(
        { error: 'Funcionário não encontrado' },
        { status: 404 }
      );
    }

    if (force) {
      // Hard delete - verificar se há dependências (exemplo: lançamentos, etc.)
      // Aqui pode adicionar validação se necessário
    await sql`
      DELETE FROM sistema_nfe.funcionarios WHERE codfunc = ${codfunc}
    `;
      return NextResponse.json({ message: 'Funcionário excluído permanentemente' });
    } else {
      // Soft delete - desativar funcionário
      if (funcionario[0].situacao) {
        return NextResponse.json(
          { error: 'Funcionário já está desativado' },
          { status: 400 }
        );
      }
      await sql`
        UPDATE sistema_nfe.funcionarios 
        SET situacao = CURRENT_TIMESTAMP 
        WHERE codfunc = ${codfunc}
      `;
      return NextResponse.json({ message: 'Funcionário desativado com sucesso' });
    }
  } catch (error) {
    console.error('Erro ao processar funcionário:', error);
    return NextResponse.json({ error: 'Erro ao processar funcionário' }, { status: 500 });
  }
}

// PATCH - Reativar funcionário desativado
export async function PATCH(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const codfunc = searchParams.get('codfunc');
    const action = searchParams.get('action');

    if (!codfunc) {
      return NextResponse.json(
        { error: 'Código do funcionário é obrigatório' },
        { status: 400 }
      );
    }

    if (action === 'reativar') {
      // Verificar se o funcionário existe e está desativado
      const funcionario = await sql`
        SELECT codfunc, situacao FROM sistema_nfe.funcionarios WHERE codfunc = ${codfunc}
      `;
      if (funcionario.length === 0) {
        return NextResponse.json(
          { error: 'Funcionário não encontrado' },
          { status: 404 }
        );
      }
      if (!funcionario[0].situacao) {
        return NextResponse.json(
          { error: 'Funcionário já está ativo' },
          { status: 400 }
        );
      }
      // Reativar funcionário (limpar situacao)
      await sql`
        UPDATE sistema_nfe.funcionarios 
        SET situacao = NULL 
        WHERE codfunc = ${codfunc}
      `;
      return NextResponse.json({ message: 'Funcionário reativado com sucesso' });
    }
    return NextResponse.json({ error: 'Ação não reconhecida' }, { status: 400 });
  } catch (error) {
    console.error('Erro ao reativar funcionário:', error);
    return NextResponse.json({ error: 'Erro ao reativar funcionário' }, { status: 500 });
  }
} 