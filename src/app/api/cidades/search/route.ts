import { NextResponse } from 'next/server';
import { sql } from '@/database';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
      return NextResponse.json({ error: 'Parâmetro de busca não fornecido' }, { status: 400 });
    }

    const result = await sql`
      SELECT c.codcid, c.nomecidade, e.nomeestado
      FROM sistema_nfe.cidades c
      JOIN sistema_nfe.estados e ON c.codest = e.codest
      WHERE LOWER(c.nomecidade) LIKE LOWER(${'%' + query + '%'})
      ORDER BY c.nomecidade
      LIMIT 10
    `;

    return NextResponse.json(result);
  } catch (error) {
    console.error('Erro ao buscar cidades:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar cidades' },
      { status: 500 }
    );
  }
} 
 
 
 