import { NextResponse } from 'next/server';
import { sql } from '@/database';

// GET - Listar todos os veículos
export async function GET() {
  try {
    const veiculos = await sql`
      SELECT v.placa, v.codtrans, p.nomerazao as nome_transportadora
      FROM sistema_nfe.veiculos v
      LEFT JOIN sistema_nfe.transportadoras t ON v.codtrans = t.codtrans
      LEFT JOIN sistema_nfe.pessoa p ON t.codtrans = p.codigo
      ORDER BY v.placa
    `;
    return NextResponse.json(veiculos);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar veículos' }, { status: 500 });
  }
}

// POST - Criar novo veículo
export async function POST(request: Request) {
  try {
    const {
      placa,
      codtrans
    } = await request.json();

    if (!placa || !codtrans) {
      return NextResponse.json(
        { error: 'Placa e código da transportadora são obrigatórios' },
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
      INSERT INTO sistema_nfe.veiculos (placa, codtrans)
      VALUES (${placa}, ${codtrans})
      RETURNING *
    `;

    return NextResponse.json(novoVeiculo[0], { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao criar veículo' }, { status: 500 });
  }
}

// PUT - Atualizar veículo
export async function PUT(request: Request) {
  try {
    const {
      placa,
      codtrans
    } = await request.json();

    if (!placa || !codtrans) {
      return NextResponse.json(
        { error: 'Placa e código da transportadora são obrigatórios' },
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

    // Verificar se o veículo existe
    const veiculoExiste = await sql`
      SELECT 1 FROM sistema_nfe.veiculos WHERE placa = ${placa}
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
      SET codtrans = ${codtrans}
      WHERE placa = ${placa}
      RETURNING *
    `;

    return NextResponse.json(veiculoAtualizado[0]);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao atualizar veículo' }, { status: 500 });
  }
}

// DELETE - Excluir veículo
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const placa = searchParams.get('placa');

    if (!placa) {
      return NextResponse.json(
        { error: 'Placa do veículo é obrigatória' },
        { status: 400 }
      );
    }

    // Excluir o veículo
    const veiculoExcluido = await sql`
      DELETE FROM sistema_nfe.veiculos
      WHERE placa = ${placa}
      RETURNING *
    `;

    if (veiculoExcluido.length === 0) {
      return NextResponse.json({ error: 'Veículo não encontrado' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Veículo excluído com sucesso' });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao excluir veículo' }, { status: 500 });
  }
} 