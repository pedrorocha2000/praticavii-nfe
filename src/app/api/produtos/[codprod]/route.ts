import { NextResponse } from 'next/server';
import { sql } from '@/database';

export async function GET(
  request: Request,
  { params }: { params: { codprod: string } }
) {
  try {
    const codprod = params.codprod;

    if (!codprod) {
      return NextResponse.json(
        { error: 'Código do produto é obrigatório' },
        { status: 400 }
      );
    }

    const result = await sql`
      SELECT 
        codprod, 
        nome, 
        ncm, 
        cfop, 
        unidade, 
        valorunitario, 
        datacadastro,
        aliq_icms,
        aliq_ipi,
        aliq_pis,
        aliq_cofins
      FROM sistema_nfe.produtos
      WHERE codprod = ${codprod}
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Produto não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Erro ao buscar produto:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar produto' },
      { status: 500 }
    );
  }
} 