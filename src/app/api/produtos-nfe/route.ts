import { NextResponse } from 'next/server';
import { sql } from '@/database';

// GET - Listar produtos de uma nota fiscal
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const modelo = parseInt(searchParams.get('modelo') || '0');
    const serie = parseInt(searchParams.get('serie') || '0');
    const numnfe = parseInt(searchParams.get('numnfe') || '0');
    const codprod = searchParams.get('codprod') ? parseInt(searchParams.get('codprod') || '0') : null;

    // Se forneceu todos os parâmetros, busca um produto específico
    if (modelo && serie && numnfe && codprod) {
      const produto = await sql`
        SELECT 
          pn.*,
          p.nome as descricao_produto,
          p.unidade
        FROM sistema_nfe.produtos_nfe pn
        LEFT JOIN sistema_nfe.produtos p ON pn.codprod = p.codprod
        WHERE pn.modelo = ${modelo}
        AND pn.serie = ${serie}
        AND pn.numnfe = ${numnfe}
        AND pn.codprod = ${codprod}
      `;

      if (produto.length === 0) {
        return NextResponse.json(
          { error: 'Produto não encontrado na nota fiscal' },
          { status: 404 }
        );
      }

      return NextResponse.json(produto[0]);
    }

    // Se forneceu modelo, série e número da nota, lista todos os produtos dela
    if (modelo && serie && numnfe) {
      const produtos = await sql`
        SELECT 
          pn.*,
          p.nome as descricao_produto,
          p.unidade
        FROM sistema_nfe.produtos_nfe pn
        LEFT JOIN sistema_nfe.produtos p ON pn.codprod = p.codprod
        WHERE pn.modelo = ${modelo}
        AND pn.serie = ${serie}
        AND pn.numnfe = ${numnfe}
        ORDER BY pn.codprod
      `;

      return NextResponse.json(produtos);
    }

    return NextResponse.json(
      { error: 'Modelo, série e número da nota são obrigatórios' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Erro ao buscar produtos da nota fiscal:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar produtos da nota fiscal' },
      { status: 500 }
    );
  }
}

// POST - Adicionar produto à nota fiscal
export async function POST(request: Request) {
  try {
    const {
      modelo,
      serie,
      numnfe,
      codprod,
      quantidade,
      valorunitario,
      // Mantemos esses parâmetros opcionais para permitir override manual
      baseicms,
      aliqicms,
      valoricms,
      baseipi,
      aliqipi,
      valoripi,
      basepis,
      aliqpis,
      valorpis,
      basecofins,
      aliqcofins,
      valorcofins
    } = await request.json();

    // Validações básicas
    if (!modelo || !serie || !numnfe || !codprod || !quantidade || !valorunitario) {
      return NextResponse.json(
        { error: 'Campos obrigatórios não preenchidos' },
        { status: 400 }
      );
    }

    // Buscar produto e suas alíquotas
    const produtos = await sql`
      SELECT 
        p.*,
        COALESCE(p.aliq_icms, 0) as aliq_icms_padrao,
        COALESCE(p.aliq_ipi, 0) as aliq_ipi_padrao,
        COALESCE(p.aliq_pis, 0) as aliq_pis_padrao,
        COALESCE(p.aliq_cofins, 0) as aliq_cofins_padrao
      FROM sistema_nfe.produtos p 
      WHERE codprod = ${codprod}
    `;

    if (produtos.length === 0) {
      return NextResponse.json(
        { error: 'Produto não encontrado' },
        { status: 404 }
      );
    }

    const produto = produtos[0];
    const valortotal = quantidade * valorunitario;

    // Calcular impostos (usando valores informados ou calculando com alíquotas padrão)
    const calculosImpostos = {
      // ICMS
      baseicms: baseicms || valortotal,
      aliqicms: aliqicms || produto.aliq_icms_padrao,
      valoricms: valoricms || (valortotal * (produto.aliq_icms_padrao / 100)),
      
      // IPI
      baseipi: baseipi || valortotal,
      aliqipi: aliqipi || produto.aliq_ipi_padrao,
      valoripi: valoripi || (valortotal * (produto.aliq_ipi_padrao / 100)),
      
      // PIS
      basepis: basepis || valortotal,
      aliqpis: aliqpis || produto.aliq_pis_padrao,
      valorpis: valorpis || (valortotal * (produto.aliq_pis_padrao / 100)),
      
      // COFINS
      basecofins: basecofins || valortotal,
      aliqcofins: aliqcofins || produto.aliq_cofins_padrao,
      valorcofins: valorcofins || (valortotal * (produto.aliq_cofins_padrao / 100))
    };

    // Inserir o produto com os impostos calculados
    const novoProduto = await sql`
      INSERT INTO sistema_nfe.produtos_nfe (
        modelo,
        serie,
        numnfe,
        codprod,
        quantidade,
        valorunitario,
        valortotal,
        baseicms,
        aliqicms,
        valoricms,
        baseipi,
        aliqipi,
        valoripi,
        basepis,
        aliqpis,
        valorpis,
        basecofins,
        aliqcofins,
        valorcofins
      ) VALUES (
        ${modelo},
        ${serie},
        ${numnfe},
        ${codprod},
        ${quantidade},
        ${valorunitario},
        ${valortotal},
        ${calculosImpostos.baseicms},
        ${calculosImpostos.aliqicms},
        ${calculosImpostos.valoricms},
        ${calculosImpostos.baseipi},
        ${calculosImpostos.aliqipi},
        ${calculosImpostos.valoripi},
        ${calculosImpostos.basepis},
        ${calculosImpostos.aliqpis},
        ${calculosImpostos.valorpis},
        ${calculosImpostos.basecofins},
        ${calculosImpostos.aliqcofins},
        ${calculosImpostos.valorcofins}
      )
      RETURNING *
    `;

    // Atualizar o valor total da nota
    await sql`
      UPDATE sistema_nfe.nfe
      SET valortotal = (
        SELECT SUM(valortotal)
        FROM sistema_nfe.produtos_nfe
        WHERE modelo = ${modelo}
        AND serie = ${serie}
        AND numnfe = ${numnfe}
      )
      WHERE modelo = ${modelo}
      AND serie = ${serie}
      AND numnfe = ${numnfe}
    `;

    return NextResponse.json(novoProduto[0], { status: 201 });
  } catch (error) {
    console.error('Erro ao adicionar produto à nota fiscal:', error);
    return NextResponse.json(
      { error: 'Erro ao adicionar produto à nota fiscal' },
      { status: 500 }
    );
  }
}

// PUT - Atualizar produto da nota fiscal
export async function PUT(request: Request) {
  try {
    const {
      modelo,
      serie,
      numnfe,
      codprod,
      quantidade,
      valorunitario,
      valortotal,
      baseicms,
      aliqicms,
      valoricms,
      baseipi,
      aliqipi,
      valoripi,
      basepis,
      aliqpis,
      valorpis,
      basecofins,
      aliqcofins,
      valorcofins
    } = await request.json();

    // Validações básicas
    if (!modelo || !serie || !numnfe || !codprod) {
      return NextResponse.json(
        { error: 'Modelo, série, número da nota e código do produto são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se o produto existe na nota
    const produtoExiste = await sql`
      SELECT 1 
      FROM sistema_nfe.produtos_nfe 
      WHERE modelo = ${modelo}
      AND serie = ${serie}
      AND numnfe = ${numnfe}
      AND codprod = ${codprod}
    `;

    if (produtoExiste.length === 0) {
      return NextResponse.json(
        { error: 'Produto não encontrado na nota fiscal' },
        { status: 404 }
      );
    }

    // Atualizar o produto
    const produtoAtualizado = await sql`
      UPDATE sistema_nfe.produtos_nfe
      SET
        quantidade = COALESCE(${quantidade}, quantidade),
        valorunitario = COALESCE(${valorunitario}, valorunitario),
        valortotal = COALESCE(${valortotal}, quantidade * valorunitario),
        baseicms = ${baseicms},
        aliqicms = ${aliqicms},
        valoricms = ${valoricms},
        baseipi = ${baseipi},
        aliqipi = ${aliqipi},
        valoripi = ${valoripi},
        basepis = ${basepis},
        aliqpis = ${aliqpis},
        valorpis = ${valorpis},
        basecofins = ${basecofins},
        aliqcofins = ${aliqcofins},
        valorcofins = ${valorcofins}
      WHERE modelo = ${modelo}
      AND serie = ${serie}
      AND numnfe = ${numnfe}
      AND codprod = ${codprod}
      RETURNING *
    `;

    // Atualizar o valor total da nota
    await sql`
      UPDATE sistema_nfe.nfe
      SET valortotal = (
        SELECT SUM(valortotal)
        FROM sistema_nfe.produtos_nfe
        WHERE modelo = ${modelo}
        AND serie = ${serie}
        AND numnfe = ${numnfe}
      )
      WHERE modelo = ${modelo}
      AND serie = ${serie}
      AND numnfe = ${numnfe}
    `;

    return NextResponse.json(produtoAtualizado[0]);
  } catch (error) {
    console.error('Erro ao atualizar produto da nota fiscal:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar produto da nota fiscal' },
      { status: 500 }
    );
  }
}

// DELETE - Remover produto da nota fiscal
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const modelo = searchParams.get('modelo');
    const serie = searchParams.get('serie');
    const numnfe = searchParams.get('numnfe');
    const codprod = searchParams.get('codprod');

    if (!modelo || !serie || !numnfe || !codprod) {
      return NextResponse.json(
        { error: 'Modelo, série, número da nota e código do produto são obrigatórios' },
        { status: 400 }
      );
    }

    // Excluir o produto
    const produtoExcluido = await sql`
      DELETE FROM sistema_nfe.produtos_nfe
      WHERE modelo = ${modelo}
      AND serie = ${serie}
      AND numnfe = ${numnfe}
      AND codprod = ${codprod}
      RETURNING *
    `;

    if (produtoExcluido.length === 0) {
      return NextResponse.json(
        { error: 'Produto não encontrado na nota fiscal' },
        { status: 404 }
      );
    }

    // Atualizar o valor total da nota
    await sql`
      UPDATE sistema_nfe.nfe
      SET valortotal = (
        SELECT COALESCE(SUM(valortotal), 0)
        FROM sistema_nfe.produtos_nfe
        WHERE modelo = ${modelo}
        AND serie = ${serie}
        AND numnfe = ${numnfe}
      )
      WHERE modelo = ${modelo}
      AND serie = ${serie}
      AND numnfe = ${numnfe}
    `;

    return NextResponse.json(
      { message: 'Produto removido da nota fiscal com sucesso' }
    );
  } catch (error) {
    console.error('Erro ao remover produto da nota fiscal:', error);
    return NextResponse.json(
      { error: 'Erro ao remover produto da nota fiscal' },
      { status: 500 }
    );
  }
} 