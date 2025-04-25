import { NextResponse } from 'next/server';
import { sql } from '@/database';
import { CreateProdutoDTO, UpdateProdutoDTO } from '@/types/produto';

// GET - Listar todos os produtos
export async function GET() {
  try {
    const result = await sql`
      SELECT codprod, nome, ncm, unidade, valorunitario, datacadastro
      FROM sistema_nfe.produtos
      ORDER BY codprod
    `;
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

// POST - Criar novo produto
export async function POST(request: Request) {
  try {
    const body: CreateProdutoDTO = await request.json();

    if (!body.nome) {
      return NextResponse.json(
        { error: 'Product name is required' },
        { status: 400 }
      );
    }

    const result = await sql`
      INSERT INTO sistema_nfe.produtos (
        nome, ncm, unidade, valorunitario, datacadastro
      ) VALUES (
        ${body.nome},
        ${body.ncm},
        ${body.unidade},
        ${body.valorunitario},
        ${body.datacadastro || sql`CURRENT_DATE`}
      )
      RETURNING codprod, nome, ncm, unidade, valorunitario, datacadastro
    `;

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}

// PUT - Atualizar produto
export async function PUT(request: Request) {
  try {
    const body: UpdateProdutoDTO = await request.json();

    if (!body.codprod) {
      return NextResponse.json(
        { error: 'Product code is required' },
        { status: 400 }
      );
    }

    const result = await sql`
      UPDATE sistema_nfe.produtos
      SET 
        nome = ${body.nome || null},
        ncm = ${body.ncm || null},
        unidade = ${body.unidade || null},
        valorunitario = ${body.valorunitario || 0}
      WHERE codprod = ${body.codprod}
      RETURNING codprod, nome, ncm, unidade, valorunitario, datacadastro
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

// DELETE - Excluir produto
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const codprod = searchParams.get('codprod');

    if (!codprod) {
      return NextResponse.json(
        { error: 'Product code is required' },
        { status: 400 }
      );
    }

    // Check if product is linked to any invoices
    const linkedInvoices = await sql`
      SELECT COUNT(*) FROM sistema_nfe.produtos_nfe
      WHERE codprod = ${codprod}
    `;

    if (linkedInvoices[0].count > 0) {
      return NextResponse.json(
        { error: 'Cannot delete product: linked to invoices' },
        { status: 400 }
      );
    }

    // Check if product is linked to any suppliers
    const linkedSuppliers = await sql`
      SELECT COUNT(*) FROM sistema_nfe.produto_forn
      WHERE codprod = ${codprod}
    `;

    if (linkedSuppliers[0].count > 0) {
      return NextResponse.json(
        { error: 'Cannot delete product: linked to suppliers' },
        { status: 400 }
      );
    }

    const result = await sql`
      DELETE FROM sistema_nfe.produtos
      WHERE codprod = ${codprod}
      RETURNING codprod
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}