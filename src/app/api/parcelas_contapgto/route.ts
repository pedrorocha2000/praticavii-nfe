import { NextResponse } from 'next/server';
import { sql } from '@/database';

// GET - Listar todas as parcelas de contas a pagar
export async function GET() {
  try {
    const parcelas = await sql`
      SELECT pc.*, cp.descricao as desccondpgto, fp.descricao as descformapgto
      FROM sistema_nfe.parcelas_contapgto pc
      LEFT JOIN sistema_nfe.cond_pgto cp ON pc.codcondpgto = cp.codcondpgto
      LEFT JOIN sistema_nfe.formapgto fp ON cp.codformapgto = fp.codformapgto
      ORDER BY pc.codcondpgto, pc.parcela
    `;
    return NextResponse.json(parcelas);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar parcelas de contas a pagar' }, { status: 500 });
  }
}

// POST - Criar nova parcela de conta a pagar
export async function POST(request: Request) {
  try {
    const { codcondpgto, parcela, dias } = await request.json();

    if (!codcondpgto || !parcela || !dias) {
      return NextResponse.json(
        { error: 'Código da condição de pagamento, número da parcela e dias são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se a condição de pagamento existe
    const condPagtoExiste = await sql`
      SELECT 1 FROM sistema_nfe.cond_pgto WHERE codcondpgto = ${codcondpgto}
    `;

    if (condPagtoExiste.length === 0) {
      return NextResponse.json(
        { error: 'Condição de pagamento não encontrada' },
        { status: 404 }
      );
    }

    // Verificar se já existe uma parcela com o mesmo número para a mesma condição
    const parcelaExiste = await sql`
      SELECT 1 FROM sistema_nfe.parcelas_contapgto 
      WHERE codcondpgto = ${codcondpgto} AND parcela = ${parcela}
    `;

    if (parcelaExiste.length > 0) {
      return NextResponse.json(
        { error: 'Já existe uma parcela com este número para esta condição de pagamento' },
        { status: 400 }
      );
    }

    const novaParcela = await sql`
      INSERT INTO sistema_nfe.parcelas_contapgto (codcondpgto, parcela, dias)
      VALUES (${codcondpgto}, ${parcela}, ${dias})
      RETURNING *
    `;

    return NextResponse.json(novaParcela[0], { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao criar parcela de conta a pagar' }, { status: 500 });
  }
}

// PUT - Atualizar parcela de conta a pagar
export async function PUT(request: Request) {
  try {
    const { codcondpgto, parcela, dias } = await request.json();

    if (!codcondpgto || !parcela || !dias) {
      return NextResponse.json(
        { error: 'Código da condição de pagamento, número da parcela e dias são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se a condição de pagamento existe
    const condPagtoExiste = await sql`
      SELECT 1 FROM sistema_nfe.cond_pgto WHERE codcondpgto = ${codcondpgto}
    `;

    if (condPagtoExiste.length === 0) {
      return NextResponse.json(
        { error: 'Condição de pagamento não encontrada' },
        { status: 404 }
      );
    }

    const parcelaAtualizada = await sql`
      UPDATE sistema_nfe.parcelas_contapgto
      SET dias = ${dias}
      WHERE codcondpgto = ${codcondpgto} AND parcela = ${parcela}
      RETURNING *
    `;

    if (parcelaAtualizada.length === 0) {
      return NextResponse.json({ error: 'Parcela não encontrada' }, { status: 404 });
    }

    return NextResponse.json(parcelaAtualizada[0]);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao atualizar parcela de conta a pagar' }, { status: 500 });
  }
}

// DELETE - Excluir parcela de conta a pagar
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const codcondpgto = searchParams.get('codcondpgto');
    const parcela = searchParams.get('parcela');

    if (!codcondpgto || !parcela) {
      return NextResponse.json(
        { error: 'Código da condição de pagamento e número da parcela são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se existem contas vinculadas
    const contasVinculadas = await sql`
      SELECT 1 FROM sistema_nfe.contas 
      WHERE codcondpgto = ${codcondpgto} AND parcela = ${parcela}
    `;

    if (contasVinculadas.length > 0) {
      return NextResponse.json(
        { error: 'Não é possível excluir a parcela pois existem contas vinculadas' },
        { status: 400 }
      );
    }

    const parcelaExcluida = await sql`
      DELETE FROM sistema_nfe.parcelas_contapgto
      WHERE codcondpgto = ${codcondpgto} AND parcela = ${parcela}
      RETURNING *
    `;

    if (parcelaExcluida.length === 0) {
      return NextResponse.json({ error: 'Parcela não encontrada' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Parcela excluída com sucesso' });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao excluir parcela de conta a pagar' }, { status: 500 });
  }
} 
 
 
 