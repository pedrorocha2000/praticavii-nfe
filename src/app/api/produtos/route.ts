import { NextResponse } from 'next/server';
import { sql } from '@/database';

// GET - Listar todos os produtos com relacionamentos
export async function GET() {
  try {
    const result = await sql`
      SELECT 
        p.codprod,
        p.nome,
        p.valorunitario,
        p.datacadastro,
        p.codunidade,
        p.codcategoria,
        p.codmarca,
        p.custo_compra,
        p.preco_venda,
        p.lucro_percentual,
        p.codigo_barras,
        p.codigo_referencia,
        p.quantidade_estoque,
        p.quantidade_minima_estoque,
        p.data_alteracao,
        p.situacao,
        um.nome_unidade,
        um.sigla_unidade,
        c.nome_categoria,
        m.nome_marca
      FROM sistema_nfe.produtos p
      LEFT JOIN sistema_nfe.unidades_medida um ON p.codunidade = um.codunidade
      LEFT JOIN sistema_nfe.categorias c ON p.codcategoria = c.codcategoria
      LEFT JOIN sistema_nfe.marcas m ON p.codmarca = m.codmarca
      ORDER BY p.codprod
    `;
    return NextResponse.json(result);
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    return NextResponse.json({ error: 'Erro ao buscar produtos' }, { status: 500 });
  }
}

// POST - Criar novo produto
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validações obrigatórias
    if (!body.nome?.trim()) {
      return NextResponse.json({ error: 'Nome do produto é obrigatório' }, { status: 400 });
    }

    // Validar código de barras único se fornecido
    if (body.codigo_barras?.trim()) {
      const existingBarcode = await sql`
        SELECT codprod FROM sistema_nfe.produtos 
        WHERE codigo_barras = ${body.codigo_barras.trim()}
      `;
      
      if (existingBarcode.length > 0) {
        return NextResponse.json({ error: 'Código de barras já existe' }, { status: 400 });
      }
    }

    // Calcular lucro percentual se tiver custo e preço
    let lucroPercentual = null;
    if (body.custo_compra && body.preco_venda && body.custo_compra > 0) {
      lucroPercentual = ((body.preco_venda - body.custo_compra) / body.custo_compra) * 100;
    }

    const result = await sql`
      INSERT INTO sistema_nfe.produtos (
        nome, 
        valorunitario,
        codunidade, 
        codcategoria, 
        codmarca,
        custo_compra,
        preco_venda,
        lucro_percentual,
        codigo_barras,
        codigo_referencia,
        quantidade_estoque,
        quantidade_minima_estoque,
        situacao
      ) VALUES (
        ${body.nome.trim()},
        ${body.valorunitario || null},
        ${body.codunidade || null},
        ${body.codcategoria || null},
        ${body.codmarca || null},
        ${body.custo_compra || null},
        ${body.preco_venda || null},
        ${lucroPercentual},
        ${body.codigo_barras?.trim() || null},
        ${body.codigo_referencia?.trim() || null},
        ${body.quantidade_estoque || null},
        ${body.quantidade_minima_estoque || null},
        ${body.situacao || null}
      )
      RETURNING *
    `;

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('Erro ao criar produto:', error);
    return NextResponse.json({ error: 'Erro ao criar produto' }, { status: 500 });
  }
}

// PUT - Atualizar produto
export async function PUT(request: Request) {
  try {
    const body = await request.json();

    if (!body.codprod) {
      return NextResponse.json({ error: 'Código do produto é obrigatório' }, { status: 400 });
    }

    if (!body.nome?.trim()) {
      return NextResponse.json({ error: 'Nome do produto é obrigatório' }, { status: 400 });
    }

    // Validar código de barras único se fornecido
    if (body.codigo_barras?.trim()) {
      const existingBarcode = await sql`
        SELECT codprod FROM sistema_nfe.produtos 
        WHERE codigo_barras = ${body.codigo_barras.trim()}
        AND codprod != ${body.codprod}
      `;
      
      if (existingBarcode.length > 0) {
        return NextResponse.json({ error: 'Código de barras já existe' }, { status: 400 });
      }
    }

    // Calcular lucro percentual se tiver custo e preço
    let lucroPercentual = null;
    if (body.custo_compra && body.preco_venda && body.custo_compra > 0) {
      lucroPercentual = ((body.preco_venda - body.custo_compra) / body.custo_compra) * 100;
    }

    const result = await sql`
      UPDATE sistema_nfe.produtos
      SET 
        nome = ${body.nome.trim()},
        valorunitario = ${body.valorunitario || null},
        codunidade = ${body.codunidade || null},
        codcategoria = ${body.codcategoria || null},
        codmarca = ${body.codmarca || null},
        custo_compra = ${body.custo_compra || null},
        preco_venda = ${body.preco_venda || null},
        lucro_percentual = ${lucroPercentual},
        codigo_barras = ${body.codigo_barras?.trim() || null},
        codigo_referencia = ${body.codigo_referencia?.trim() || null},
        quantidade_estoque = ${body.quantidade_estoque || null},
        quantidade_minima_estoque = ${body.quantidade_minima_estoque || null},
        situacao = ${body.situacao || null}
      WHERE codprod = ${body.codprod}
      RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 });
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    return NextResponse.json({ error: 'Erro ao atualizar produto' }, { status: 500 });
  }
}

// DELETE - Excluir produto
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const codprod = searchParams.get('codprod');

    if (!codprod) {
      return NextResponse.json({ error: 'Código do produto é obrigatório' }, { status: 400 });
    }

    // Verificar se produto está vinculado a NFes
    const linkedInvoices = await sql`
      SELECT COUNT(*) as count FROM sistema_nfe.produtos_nfe
      WHERE codprod = ${codprod}
    `;

    if (linkedInvoices[0].count > 0) {
      return NextResponse.json(
        { error: 'Não é possível excluir: produto vinculado a notas fiscais' }, 
        { status: 400 }
      );
    }

    // Verificar se produto está vinculado a fornecedores
    const linkedSuppliers = await sql`
      SELECT COUNT(*) as count FROM sistema_nfe.produto_forn
      WHERE codprod = ${codprod}
    `;

    if (linkedSuppliers[0].count > 0) {
      return NextResponse.json(
        { error: 'Não é possível excluir: produto vinculado a fornecedores' }, 
        { status: 400 }
      );
    }

    const result = await sql`
      DELETE FROM sistema_nfe.produtos
      WHERE codprod = ${codprod}
      RETURNING codprod
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Produto excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir produto:', error);
    return NextResponse.json({ error: 'Erro ao excluir produto' }, { status: 500 });
  }
}