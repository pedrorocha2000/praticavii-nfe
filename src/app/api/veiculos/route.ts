import { NextResponse } from 'next/server';
import { sql } from '@/database';

// GET - Listar todos os veículos
export async function GET() {
  try {
    const veiculos = await sql`
      SELECT 
        codveiculo,
        placa, 
        modelo,
        descricao,
        data_criacao,
        data_alteracao,
        situacao
      FROM sistema_nfe.veiculos
      ORDER BY placa
    `;
    return NextResponse.json(veiculos);
  } catch (error) {
    console.error('Erro ao buscar veículos:', error);
    return NextResponse.json({ error: 'Erro ao buscar veículos' }, { status: 500 });
  }
}

// POST - Criar novo veículo
export async function POST(request: Request) {
  try {
    const {
      placa,
      modelo,
      descricao
    } = await request.json();

    if (!placa) {
      return NextResponse.json(
        { error: 'Placa é obrigatória' },
        { status: 400 }
      );
    }

    // Verificar se já existe um veículo com a mesma placa
    const veiculoExiste = await sql`
      SELECT 1 FROM sistema_nfe.veiculos WHERE placa = ${placa}
    `;

    if (veiculoExiste.length > 0) {
      return NextResponse.json(
        { error: 'Já existe um veículo com esta placa' },
        { status: 400 }
      );
    }

    // Inserir o veículo
    const novoVeiculo = await sql`
      INSERT INTO sistema_nfe.veiculos (placa, modelo, descricao)
      VALUES (${placa}, ${modelo || null}, ${descricao || null})
      RETURNING *
    `;

    return NextResponse.json(novoVeiculo[0], { status: 201 });
  } catch (error) {
    console.error('Erro ao criar veículo:', error);
    return NextResponse.json({ error: 'Erro ao criar veículo' }, { status: 500 });
  }
}

// PUT - Atualizar veículo
export async function PUT(request: Request) {
  try {
    const {
      codveiculo,
      placa,
      modelo,
      descricao,
      situacao
    } = await request.json();

    if (!codveiculo) {
      return NextResponse.json(
        { error: 'Código do veículo é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se o veículo existe
    const veiculoExiste = await sql`
      SELECT 1 FROM sistema_nfe.veiculos WHERE codveiculo = ${codveiculo}
    `;

    if (veiculoExiste.length === 0) {
      return NextResponse.json(
        { error: 'Veículo não encontrado' },
        { status: 404 }
      );
    }

    // Atualizar o veículo
    const veiculoAtualizado = await sql`
      UPDATE sistema_nfe.veiculos
      SET 
        placa = ${placa},
        modelo = ${modelo || null},
        descricao = ${descricao || null},
        situacao = ${situacao || null}
      WHERE codveiculo = ${codveiculo}
      RETURNING *
    `;

    return NextResponse.json(veiculoAtualizado[0]);
  } catch (error) {
    console.error('Erro ao atualizar veículo:', error);
    return NextResponse.json({ error: 'Erro ao atualizar veículo' }, { status: 500 });
  }
}

// DELETE - Excluir veículo
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const codveiculo = searchParams.get('codveiculo');

    if (!codveiculo) {
      return NextResponse.json(
        { error: 'Código do veículo é obrigatório' },
        { status: 400 }
      );
    }

    // Excluir o veículo
    const veiculoExcluido = await sql`
      DELETE FROM sistema_nfe.veiculos
      WHERE codveiculo = ${codveiculo}
      RETURNING *
    `;

    if (veiculoExcluido.length === 0) {
      return NextResponse.json({ error: 'Veículo não encontrado' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Veículo excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir veículo:', error);
    return NextResponse.json({ error: 'Erro ao excluir veículo' }, { status: 500 });
  }
} 