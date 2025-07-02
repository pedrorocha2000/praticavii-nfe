import { NextResponse } from 'next/server';
import { sql } from '@/database';

// GET - Listar todas as transportadoras com busca por CPF/CNPJ
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cpfcnpj = searchParams.get('cpfcnpj');
    const search = searchParams.get('search');

    // Se está buscando por CPF/CNPJ específico
    if (cpfcnpj) {
      const cleanCpfCnpj = cpfcnpj.replace(/\D/g, '');
      
      const pessoa = await sql`
        SELECT 
          p.codigo,
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
        FROM sistema_nfe.pessoa p
        LEFT JOIN sistema_nfe.cidades cid ON p.codcid = cid.codcid
        LEFT JOIN sistema_nfe.estados est ON cid.codest = est.codest
        LEFT JOIN sistema_nfe.paises pais ON est.codpais = pais.codpais
        WHERE p.cpfcnpj = ${cleanCpfCnpj}
      `;

      if (pessoa.length > 0) {
        return NextResponse.json({
          exists: true,
          data: pessoa[0]
        });
      } else {
        return NextResponse.json({
          exists: false,
          data: null
        });
      }
    }

    // Busca geral de transportadoras
    let whereClause = sql``;
    if (search) {
      whereClause = sql`
        WHERE (
          p.nomerazao ILIKE ${`%${search}%`} OR
          p.nomefantasia ILIKE ${`%${search}%`} OR
          p.cpfcnpj ILIKE ${`%${search}%`}
        )
      `;
    }

    const transportadoras = await sql`
      SELECT 
        t.codtrans, 
        t.codpessoa,
        t.codcondpgto,
        t.data_criacao,
        t.data_alteracao,
        t.situacao,
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
        pais.nomepais,
        cp.descricao as descricao_condpgto
      FROM sistema_nfe.transportadoras t
      JOIN sistema_nfe.pessoa p ON t.codpessoa = p.codigo
      LEFT JOIN sistema_nfe.cidades cid ON p.codcid = cid.codcid
      LEFT JOIN sistema_nfe.estados est ON cid.codest = est.codest
      LEFT JOIN sistema_nfe.paises pais ON est.codpais = pais.codpais
      LEFT JOIN sistema_nfe.cond_pgto cp ON t.codcondpgto = cp.codcondpgto
      ${whereClause}
      ORDER BY p.nomerazao
    `;

    return NextResponse.json(transportadoras);
  } catch (error) {
    console.error('Erro ao buscar transportadoras:', error);
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
      email,
      situacao,
      codcondpgto
    } = await request.json();

    // Validações básicas
    if (!nomerazao || !codcid) {
      return NextResponse.json(
        { error: 'Nome/Razão Social e Cidade são obrigatórios' },
        { status: 400 }
      );
    }

    let pessoaId;
    const cleanCpfCnpj = cpfcnpj ? cpfcnpj.replace(/\D/g, '') : '';

    // Se tem CPF/CNPJ, verificar se pessoa já existe
    if (cleanCpfCnpj) {
      const pessoaExistente = await sql`
        SELECT codigo FROM sistema_nfe.pessoa WHERE cpfcnpj = ${cleanCpfCnpj}
      `;

      if (pessoaExistente.length > 0) {
        // Reutilizar pessoa existente
        pessoaId = pessoaExistente[0].codigo;
        
        // Atualizar dados da pessoa existente
        await sql`
          UPDATE sistema_nfe.pessoa
          SET
            tipopessoa = ${tipopessoa},
            nomerazao = ${nomerazao},
            nomefantasia = ${nomefantasia || ''},
            rg_inscricaoestadual = ${rg_inscricaoestadual || ''},
            endereco = ${endereco || ''},
            numero = ${numero || ''},
            complemento = ${complemento || ''},
            bairro = ${bairro || ''},
            cep = ${cep || ''},
            codcid = ${codcid},
            telefone = ${telefone || ''},
            email = ${email || ''}
          WHERE codigo = ${pessoaId}
        `;
      } else {
        // Criar nova pessoa
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
            ${nomefantasia || ''},
            ${cleanCpfCnpj},
            ${rg_inscricaoestadual || ''},
            ${endereco || ''},
            ${numero || ''},
            ${complemento || ''},
            ${bairro || ''},
            ${cep || ''},
            ${codcid},
            ${telefone || ''},
            ${email || ''},
            CURRENT_TIMESTAMP
          )
          RETURNING codigo
        `;
        pessoaId = novaPessoa[0].codigo;
      }
    } else {
      // Criar nova pessoa sem CPF/CNPJ
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
          ${nomefantasia || ''},
          '',
          ${rg_inscricaoestadual || ''},
          ${endereco || ''},
          ${numero || ''},
          ${complemento || ''},
          ${bairro || ''},
          ${cep || ''},
        ${codcid},
          ${telefone || ''},
          ${email || ''},
        CURRENT_TIMESTAMP
      )
      RETURNING codigo
    `;
      pessoaId = novaPessoa[0].codigo;
    }

    // Verificar se já existe transportadora para esta pessoa
    const transportadoraExistente = await sql`
      SELECT 1 FROM sistema_nfe.transportadoras WHERE codpessoa = ${pessoaId}
    `;

    if (transportadoraExistente.length > 0) {
      return NextResponse.json(
        { error: 'Esta pessoa já está cadastrada como transportadora' },
        { status: 400 }
      );
    }

    // Criar nova transportadora
    const novaTransportadora = await sql`
      INSERT INTO sistema_nfe.transportadoras (codpessoa, situacao, codcondpgto)
      VALUES (${pessoaId}, ${situacao || null}, ${codcondpgto || null})
      RETURNING codtrans
    `;

    // Retornar dados completos
    const transportadora = await sql`
      SELECT 
        t.codtrans,
        t.codpessoa,
        t.codcondpgto,
        t.data_criacao,
        t.data_alteracao,
        t.situacao,
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
        pais.nomepais,
        cp.descricao as descricao_condpgto
      FROM sistema_nfe.transportadoras t
      JOIN sistema_nfe.pessoa p ON t.codpessoa = p.codigo
      LEFT JOIN sistema_nfe.cidades cid ON p.codcid = cid.codcid
      LEFT JOIN sistema_nfe.estados est ON cid.codest = est.codest
      LEFT JOIN sistema_nfe.paises pais ON est.codpais = pais.codpais
      LEFT JOIN sistema_nfe.cond_pgto cp ON t.codcondpgto = cp.codcondpgto
      WHERE t.codtrans = ${novaTransportadora[0].codtrans}
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
      situacao,
      codcondpgto
    } = await request.json();

    if (!codtrans || !codpessoa) {
      return NextResponse.json(
        { error: 'Código da transportadora e código da pessoa são obrigatórios' },
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

    const cleanCpfCnpj = cpfcnpj ? cpfcnpj.replace(/\D/g, '') : '';

    // Se tem CPF/CNPJ, verificar se não existe em outra transportadora
    if (cleanCpfCnpj) {
      const cpfExistente = await sql`
      SELECT p.codigo, p.cpfcnpj, t.codtrans
      FROM sistema_nfe.pessoa p
      LEFT JOIN sistema_nfe.transportadoras t ON p.codigo = t.codpessoa
      WHERE p.cpfcnpj = ${cleanCpfCnpj} 
        AND p.codigo != ${codpessoa}
        AND t.codtrans IS NOT NULL
        AND t.codtrans != ${codtrans}
    `;

      if (cpfExistente.length > 0) {
      return NextResponse.json(
          { error: `Este CPF/CNPJ já está cadastrado para a transportadora ${cpfExistente[0].codtrans}` },
        { status: 400 }
      );
      }
    }

    // Atualizar dados da pessoa
    await sql`
      UPDATE sistema_nfe.pessoa
      SET
        tipopessoa = ${tipopessoa},
        nomerazao = ${nomerazao},
        nomefantasia = ${nomefantasia || ''},
        cpfcnpj = ${cleanCpfCnpj},
        rg_inscricaoestadual = ${rg_inscricaoestadual || ''},
        endereco = ${endereco || ''},
        numero = ${numero || ''},
        complemento = ${complemento || ''},
        bairro = ${bairro || ''},
        cep = ${cep || ''},
        codcid = ${codcid},
        telefone = ${telefone || ''},
        email = ${email || ''}
      WHERE codigo = ${codpessoa}
    `;

    // Atualizar a transportadora para disparar o trigger de data_alteracao e atualizar situacao
    await sql`
      UPDATE sistema_nfe.transportadoras
      SET codpessoa = ${codpessoa}, situacao = ${situacao || null}, codcondpgto = ${codcondpgto || null}
      WHERE codtrans = ${codtrans}
    `;

    // Retornar dados atualizados
    const transportadora = await sql`
      SELECT 
        t.codtrans,
        t.codpessoa,
        t.codcondpgto,
        t.data_criacao,
        t.data_alteracao,
        t.situacao,
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
        pais.nomepais,
        cp.descricao as descricao_condpgto
      FROM sistema_nfe.transportadoras t
      JOIN sistema_nfe.pessoa p ON t.codpessoa = p.codigo
      LEFT JOIN sistema_nfe.cidades cid ON p.codcid = cid.codcid
      LEFT JOIN sistema_nfe.estados est ON cid.codest = est.codest
      LEFT JOIN sistema_nfe.paises pais ON est.codpais = pais.codpais
      LEFT JOIN sistema_nfe.cond_pgto cp ON t.codcondpgto = cp.codcondpgto
      WHERE t.codtrans = ${codtrans}
    `;

    return NextResponse.json(transportadora[0]);
  } catch (error) {
    console.error('Erro ao atualizar transportadora:', error);
    return NextResponse.json({ error: 'Erro ao atualizar transportadora' }, { status: 500 });
  }
}

// DELETE - Excluir transportadora (preserva pessoa para reutilização)
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

    // Verificar se existem fornecedores vinculados
    const fornecedoresVinculados = await sql`
      SELECT 1 FROM sistema_nfe.transp_forn WHERE codtrans = ${codtrans} LIMIT 1
    `;

    if (fornecedoresVinculados.length > 0) {
      return NextResponse.json(
        { error: 'Não é possível excluir a transportadora pois existem fornecedores vinculados' },
        { status: 400 }
      );
    }

    // Verificar se existem veículos vinculados via relacionamento N:N
    const veiculosVinculados = await sql`
      SELECT 1 FROM sistema_nfe.veiculo_transportadora WHERE codtrans = ${codtrans} LIMIT 1
    `;

    if (veiculosVinculados.length > 0) {
      return NextResponse.json(
        { error: 'Não é possível excluir a transportadora pois existem veículos vinculados' },
        { status: 400 }
      );
    }

    // Verificar se existem notas fiscais vinculadas
    const notasVinculadas = await sql`
      SELECT 1 FROM sistema_nfe.nfe WHERE codtrans = ${codtrans} LIMIT 1
    `;

    if (notasVinculadas.length > 0) {
      return NextResponse.json(
        { error: 'Não é possível excluir a transportadora pois existem notas fiscais vinculadas' },
        { status: 400 }
      );
    }

    // Excluir apenas o vínculo de transportadora (preserva pessoa para reutilização)
    const transportadoraExcluida = await sql`
      DELETE FROM sistema_nfe.transportadoras
      WHERE codtrans = ${codtrans}
      RETURNING *
    `;

    if (transportadoraExcluida.length === 0) {
      return NextResponse.json({ error: 'Transportadora não encontrada' }, { status: 404 });
    }

    return NextResponse.json({ 
      message: 'Transportadora excluída com sucesso. Dados da pessoa foram preservados para reutilização.' 
    });
  } catch (error) {
    console.error('Erro ao excluir transportadora:', error);
    return NextResponse.json({ error: 'Erro ao excluir transportadora' }, { status: 500 });
  }
} 