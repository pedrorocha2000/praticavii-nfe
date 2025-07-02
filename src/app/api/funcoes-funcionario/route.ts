import { NextResponse } from 'next/server';
import { sql } from '@/database';

// GET - Listar todas as funções de funcionário
export async function GET() {
  try {
    const funcoes = await sql`
      SELECT codfuncao, nome_funcao, exige_cnh, carga_horaria_semanal, data_criacao, data_alteracao, situacao
      FROM sistema_nfe.funcoes_funcionario
      ORDER BY nome_funcao
    `;
    return NextResponse.json(funcoes);
  } catch (error) {
    console.error('Erro ao buscar funções de funcionário:', error);
    return NextResponse.json({ error: 'Erro ao buscar funções de funcionário' }, { status: 500 });
  }
}

// POST - Criar nova função de funcionário
export async function POST(request: Request) {
  try {
    const { nome_funcao, exige_cnh, carga_horaria_semanal, situacao } = await request.json();

    if (!nome_funcao || nome_funcao.trim() === '') {
      return NextResponse.json(
        { error: 'Nome da função é obrigatório' },
        { status: 400 }
      );
    }

    // Validar carga horária se fornecida
    if (carga_horaria_semanal !== null && carga_horaria_semanal !== undefined) {
      if (typeof carga_horaria_semanal !== 'number' || carga_horaria_semanal < 0 || carga_horaria_semanal > 168) {
        return NextResponse.json(
          { error: 'Carga horária semanal deve ser um número entre 0 e 168 horas' },
          { status: 400 }
        );
      }
    }

    // Verificar se já existe uma função com o mesmo nome
    const funcaoExiste = await sql`
      SELECT 1 FROM sistema_nfe.funcoes_funcionario 
      WHERE LOWER(nome_funcao) = LOWER(${nome_funcao.trim()})
    `;

    if (funcaoExiste.length > 0) {
      return NextResponse.json(
        { error: 'Já existe uma função com este nome' },
        { status: 400 }
      );
    }

    const novaFuncao = await sql`
      INSERT INTO sistema_nfe.funcoes_funcionario (nome_funcao, exige_cnh, carga_horaria_semanal, situacao)
      VALUES (
        ${nome_funcao.trim()}, 
        ${exige_cnh || false}, 
        ${carga_horaria_semanal || null},
        ${situacao || null}
      )
      RETURNING *
    `;

    return NextResponse.json(novaFuncao[0], { status: 201 });
  } catch (error: any) {
    console.error('Erro ao criar função de funcionário:', error);
    
    // Verificar se é erro de chave duplicada (unique constraint)
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'Já existe uma função com este nome' },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ error: 'Erro ao criar função de funcionário' }, { status: 500 });
  }
}

// PUT - Atualizar função de funcionário
export async function PUT(request: Request) {
  try {
    const { codfuncao, nome_funcao, exige_cnh, carga_horaria_semanal, situacao } = await request.json();

    if (!codfuncao || !nome_funcao || nome_funcao.trim() === '') {
      return NextResponse.json(
        { error: 'Código e nome da função são obrigatórios' },
        { status: 400 }
      );
    }

    // Validar carga horária se fornecida
    if (carga_horaria_semanal !== null && carga_horaria_semanal !== undefined) {
      if (typeof carga_horaria_semanal !== 'number' || carga_horaria_semanal < 0 || carga_horaria_semanal > 168) {
        return NextResponse.json(
          { error: 'Carga horária semanal deve ser um número entre 0 e 168 horas' },
          { status: 400 }
        );
      }
    }

    // Verificar se já existe outra função com o mesmo nome
    const funcaoExiste = await sql`
      SELECT 1 FROM sistema_nfe.funcoes_funcionario 
      WHERE LOWER(nome_funcao) = LOWER(${nome_funcao.trim()})
      AND codfuncao != ${codfuncao}
    `;

    if (funcaoExiste.length > 0) {
      return NextResponse.json(
        { error: 'Já existe uma função com este nome' },
        { status: 400 }
      );
    }

    const funcaoAtualizada = await sql`
      UPDATE sistema_nfe.funcoes_funcionario
      SET nome_funcao = ${nome_funcao.trim()}, 
          exige_cnh = ${exige_cnh || false},
          carga_horaria_semanal = ${carga_horaria_semanal || null},
          situacao = ${situacao || null}
      WHERE codfuncao = ${codfuncao}
      RETURNING *
    `;

    if (funcaoAtualizada.length === 0) {
      return NextResponse.json({ error: 'Função de funcionário não encontrada' }, { status: 404 });
    }

    return NextResponse.json(funcaoAtualizada[0]);
  } catch (error: any) {
    console.error('Erro ao atualizar função de funcionário:', error);
    
    // Verificar se é erro de chave duplicada (unique constraint)
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'Já existe uma função com este nome' },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ error: 'Erro ao atualizar função de funcionário' }, { status: 500 });
  }
}

// DELETE - Excluir função de funcionário
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const codfuncao = searchParams.get('codfuncao');

    if (!codfuncao) {
      return NextResponse.json(
        { error: 'Código da função é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se existem funcionários vinculados
    const funcionariosVinculados = await sql`
      SELECT 1 FROM sistema_nfe.funcionarios WHERE codfuncao_fk = ${codfuncao}
    `;

    if (funcionariosVinculados.length > 0) {
      return NextResponse.json(
        { error: 'Não é possível excluir a função pois existem funcionários vinculados' },
        { status: 400 }
      );
    }

    const funcaoExcluida = await sql`
      DELETE FROM sistema_nfe.funcoes_funcionario
      WHERE codfuncao = ${codfuncao}
      RETURNING *
    `;

    if (funcaoExcluida.length === 0) {
      return NextResponse.json({ error: 'Função de funcionário não encontrada' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Função de funcionário excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir função de funcionário:', error);
    return NextResponse.json({ error: 'Erro ao excluir função de funcionário' }, { status: 500 });
  }
} 