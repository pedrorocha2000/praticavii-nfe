import { NextResponse } from 'next/server';
import { sql } from '@/database';

// GET - Listar relacionamentos veiculo-transportadora
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const codveiculo = searchParams.get('codveiculo');
    const codtrans = searchParams.get('codtrans');

    let whereClause = sql``;
    const conditions = [];

    if (codveiculo) {
      conditions.push(sql`vt.codveiculo = ${codveiculo}`);
    }

    if (codtrans) {
      conditions.push(sql`vt.codtrans = ${codtrans}`);
    }

    if (conditions.length > 0) {
      whereClause = sql`WHERE ${conditions.reduce((acc, condition, index) => 
        index === 0 ? condition : sql`${acc} AND ${condition}`, sql``)}`;
    }

    const relacionamentos = await sql`
      SELECT 
        vt.codveiculo,
        vt.codtrans,
        v.placa,
        v.modelo,
        v.descricao as descricao_veiculo,
        v.situacao as situacao_veiculo,
        p.nomerazao as nome_transportadora,
        p.nomefantasia as fantasia_transportadora,
        t.situacao as situacao_transportadora
      FROM sistema_nfe.veiculo_transportadora vt
      JOIN sistema_nfe.veiculos v ON vt.codveiculo = v.codveiculo
      JOIN sistema_nfe.transportadoras t ON vt.codtrans = t.codtrans
      JOIN sistema_nfe.pessoa p ON t.codpessoa = p.codigo
      ${whereClause}
      ORDER BY v.placa, p.nomerazao
    `;

    return NextResponse.json(relacionamentos);
  } catch (error) {
    console.error('Erro ao buscar relacionamentos veiculo-transportadora:', error);
    return NextResponse.json({ error: 'Erro ao buscar relacionamentos' }, { status: 500 });
  }
}

// POST - Criar novo relacionamento veiculo-transportadora
export async function POST(request: Request) {
  try {
    const { codveiculo, codtrans } = await request.json();

    // Validações básicas
    if (!codveiculo || !codtrans) {
      return NextResponse.json(
        { error: 'Código do veículo e código da transportadora são obrigatórios' },
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

    // Verificar se o relacionamento já existe
    const relacionamentoExiste = await sql`
      SELECT 1 FROM sistema_nfe.veiculo_transportadora 
      WHERE codveiculo = ${codveiculo} AND codtrans = ${codtrans}
    `;

    if (relacionamentoExiste.length > 0) {
      return NextResponse.json(
        { error: 'Este veículo já está vinculado a esta transportadora' },
        { status: 400 }
      );
    }

    // Criar o relacionamento
    await sql`
      INSERT INTO sistema_nfe.veiculo_transportadora (codveiculo, codtrans)
      VALUES (${codveiculo}, ${codtrans})
    `;

    // Retornar dados completos do relacionamento criado
    const relacionamento = await sql`
      SELECT 
        vt.codveiculo,
        vt.codtrans,
        v.placa,
        v.modelo,
        v.descricao as descricao_veiculo,
        v.situacao as situacao_veiculo,
        p.nomerazao as nome_transportadora,
        p.nomefantasia as fantasia_transportadora,
        t.situacao as situacao_transportadora
      FROM sistema_nfe.veiculo_transportadora vt
      JOIN sistema_nfe.veiculos v ON vt.codveiculo = v.codveiculo
      JOIN sistema_nfe.transportadoras t ON vt.codtrans = t.codtrans
      JOIN sistema_nfe.pessoa p ON t.codpessoa = p.codigo
      WHERE vt.codveiculo = ${codveiculo} AND vt.codtrans = ${codtrans}
    `;

    return NextResponse.json(relacionamento[0], { status: 201 });
  } catch (error) {
    console.error('Erro ao criar relacionamento veiculo-transportadora:', error);
    return NextResponse.json({ error: 'Erro ao criar relacionamento' }, { status: 500 });
  }
}

// DELETE - Excluir relacionamento veiculo-transportadora
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const codveiculo = searchParams.get('codveiculo');
    const codtrans = searchParams.get('codtrans');

    if (!codveiculo || !codtrans) {
      return NextResponse.json(
        { error: 'Código do veículo e código da transportadora são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se o relacionamento existe
    const relacionamentoExiste = await sql`
      SELECT 1 FROM sistema_nfe.veiculo_transportadora 
      WHERE codveiculo = ${codveiculo} AND codtrans = ${codtrans}
    `;

    if (relacionamentoExiste.length === 0) {
      return NextResponse.json(
        { error: 'Relacionamento não encontrado' },
        { status: 404 }
      );
    }

    // Excluir o relacionamento
    await sql`
      DELETE FROM sistema_nfe.veiculo_transportadora
      WHERE codveiculo = ${codveiculo} AND codtrans = ${codtrans}
    `;

    return NextResponse.json({ 
      message: 'Relacionamento excluído com sucesso' 
    });
  } catch (error) {
    console.error('Erro ao excluir relacionamento veiculo-transportadora:', error);
    return NextResponse.json({ error: 'Erro ao excluir relacionamento' }, { status: 500 });
  }
} 