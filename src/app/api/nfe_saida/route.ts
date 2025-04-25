import { NextResponse } from 'next/server';
import { sql } from '@/database';

// GET - Listar todas as notas fiscais de saída
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const modelo = searchParams.get('modelo');
    const serie = searchParams.get('serie');
    const numnfe = searchParams.get('numnfe');

    // Se forneceu todos os parâmetros, busca uma nota específica
    if (modelo && serie && numnfe) {
      const nota = await sql`
        SELECT 
          n.modelo,
          n.serie,
          n.numnfe,
          n.codcli,
          p.nomefantasia as nomerazao,
          p.cpfcnpj,
          n.dataemissao as data_emissao,
          n.valortotal as valor_total,
          tp.nomefantasia as nomeTransportadora,
          fp.descricao as formaPagamento,
          cp.descricao as condicaoPagamento
        FROM sistema_nfe.nfe n
        LEFT JOIN sistema_nfe.clientes c ON n.codcli = c.codcli
        LEFT JOIN sistema_nfe.pessoa p ON c.codcli = p.codigo
        LEFT JOIN sistema_nfe.transportadoras t ON n.codtrans = t.codtrans
        LEFT JOIN sistema_nfe.pessoa tp ON t.codtrans = tp.codigo
        LEFT JOIN sistema_nfe.formapgto fp ON n.codformapgto = fp.codformapgto
        LEFT JOIN sistema_nfe.cond_pgto cp ON n.codcondpgto = cp.codcondpgto
        WHERE n.modelo = ${parseInt(modelo)}
        AND n.serie = ${parseInt(serie)}
        AND n.numnfe = ${parseInt(numnfe)}
        AND n.tipo = 'S'
      `;

      if (nota.length === 0) {
        return NextResponse.json(
          { error: 'Nota fiscal não encontrada' },
          { status: 404 }
        );
      }

      return NextResponse.json(nota[0]);
    }

    // Se não forneceu parâmetros, lista todas as notas de saída
    const notas = await sql`
      SELECT 
        n.modelo,
        n.serie,
        n.numnfe,
        n.codcli,
        p.nomefantasia as nomerazao,
        p.cpfcnpj,
        n.dataemissao as data_emissao,
        n.valortotal as valor_total,
        tp.nomefantasia as nomeTransportadora,
        fp.descricao as formaPagamento,
        cp.descricao as condicaoPagamento
      FROM sistema_nfe.nfe n
      LEFT JOIN sistema_nfe.clientes c ON n.codcli = c.codcli
      LEFT JOIN sistema_nfe.pessoa p ON c.codcli = p.codigo
      LEFT JOIN sistema_nfe.transportadoras t ON n.codtrans = t.codtrans
      LEFT JOIN sistema_nfe.pessoa tp ON t.codtrans = tp.codigo
      LEFT JOIN sistema_nfe.formapgto fp ON n.codformapgto = fp.codformapgto
      LEFT JOIN sistema_nfe.cond_pgto cp ON n.codcondpgto = cp.codcondpgto
      WHERE n.tipo = 'S'
      ORDER BY n.dataemissao DESC, n.modelo, n.serie, n.numnfe
    `;

    return NextResponse.json(notas);
  } catch (error) {
    console.error('Erro ao buscar notas fiscais:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar notas fiscais' },
      { status: 500 }
    );
  }
}

// POST - Criar nota fiscal de saída
export async function POST(request: Request) {
  try {
    const {
      modelo,
      serie,
      numnfe,
      codcli,
      naturezaoperacao,
      dataemissao,
      datasaida,
      valortotal,
      chaveacesso,
      protocoloautorizacao,
      codtrans,
      frete_por_conta,
      peso_bruto,
      peso_liquido,
      especie,
      marca,
      numeracao,
      dados_adicionais,
      codcondpgto,
      codformapgto,
      produtos
    } = await request.json();

    // Validações básicas
    if (!modelo || !serie || !numnfe || !codcli || !naturezaoperacao || 
        !dataemissao || !valortotal || !chaveacesso || !codcondpgto || 
        !codformapgto || !produtos || !Array.isArray(produtos) || produtos.length === 0) {
      return NextResponse.json(
        { error: 'Campos obrigatórios não preenchidos' },
        { status: 400 }
      );
    }

    // Validar cliente
    const cliente = await sql`
      SELECT 1 FROM sistema_nfe.clientes WHERE codcli = ${codcli}
    `;

    if (cliente.length === 0) {
      return NextResponse.json(
        { error: 'Cliente não encontrado' },
        { status: 400 }
      );
    }

    // Validar condição de pagamento
    const condPgto = await sql`
      SELECT 1 FROM sistema_nfe.cond_pgto WHERE codcondpgto = ${codcondpgto}
    `;

    if (condPgto.length === 0) {
      return NextResponse.json(
        { error: 'Condição de pagamento não encontrada' },
        { status: 400 }
      );
    }

    // Validar forma de pagamento
    const formaPgto = await sql`
      SELECT 1 FROM sistema_nfe.formapgto WHERE codformapgto = ${codformapgto}
    `;

    if (formaPgto.length === 0) {
      return NextResponse.json(
        { error: 'Forma de pagamento não encontrada' },
        { status: 400 }
      );
    }

    // Validar produtos e calcular valor total
    let valorTotalCalculado = 0;
    for (const produto of produtos) {
      if (!produto.codprod || !produto.quantidade || !produto.valorunitario) {
        return NextResponse.json(
          { error: 'Dados do produto incompletos' },
          { status: 400 }
        );
      }

      // Validar se produto existe
      const produtoExiste = await sql`
        SELECT 1 FROM sistema_nfe.produtos WHERE codprod = ${produto.codprod}
      `;

      if (produtoExiste.length === 0) {
        return NextResponse.json(
          { error: `Produto ${produto.codprod} não encontrado` },
          { status: 400 }
        );
      }

      valorTotalCalculado += produto.quantidade * produto.valorunitario;
    }

    // Validar valor total
    if (Math.abs(valorTotalCalculado - valortotal) > 0.01) {
      return NextResponse.json(
        { error: 'Valor total não confere com a soma dos produtos' },
        { status: 400 }
      );
    }

    // Verificar se a nota já existe
    const notaExiste = await sql`
      SELECT 1 
      FROM sistema_nfe.nfe 
      WHERE modelo = ${modelo}
      AND serie = ${serie}
      AND numnfe = ${numnfe}
    `;

    if (notaExiste.length > 0) {
      return NextResponse.json(
        { error: 'Nota fiscal já existe' },
        { status: 400 }
      );
    }

    // Inserir a nota fiscal
    const novaNota = await sql`
      INSERT INTO sistema_nfe.nfe (
        modelo,
        serie,
        numnfe,
        codcli,
        naturezaoperacao,
        dataemissao,
        datasaida,
        valortotal,
        chaveacesso,
        protocoloautorizacao,
        codtrans,
        tipo,
        frete_por_conta,
        peso_bruto,
        peso_liquido,
        especie,
        marca,
        numeracao,
        dados_adicionais,
        codcondpgto,
        codformapgto
      ) VALUES (
        55,
        ${serie},
        ${numnfe},
        ${codcli},
        ${naturezaoperacao},
        ${dataemissao},
        ${datasaida || dataemissao},
        ${valortotal},
        ${chaveacesso},
        ${protocoloautorizacao},
        ${codtrans},
        'S',
        ${frete_por_conta || '0'},
        ${peso_bruto || 0},
        ${peso_liquido || 0},
        ${especie},
        ${marca},
        ${numeracao},
        ${dados_adicionais},
        ${codcondpgto},
        ${codformapgto}
      )
      RETURNING *
    `;

    // Inserir os produtos da nota
    for (const produto of produtos) {
      await sql`
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
          55,
          ${serie},
          ${numnfe},
          ${produto.codprod},
          ${produto.quantidade},
          ${produto.valorunitario},
          ${produto.quantidade * produto.valorunitario},
          ${produto.baseicms || 0},
          ${produto.aliqicms || 0},
          ${produto.valoricms || 0},
          ${produto.baseipi || 0},
          ${produto.aliqipi || 0},
          ${produto.valoripi || 0},
          ${produto.basepis || 0},
          ${produto.aliqpis || 0},
          ${produto.valorpis || 0},
          ${produto.basecofins || 0},
          ${produto.aliqcofins || 0},
          ${produto.valorcofins || 0}
        )
      `;
    }

    // Se tem condição de pagamento, gerar as contas a receber
    if (codcondpgto) {
      // Buscar as parcelas da condição de pagamento
      const parcelas = await sql`
        SELECT numparc, codformapgto
        FROM sistema_nfe.parcelas_contapgto
        WHERE codcondpgto = ${codcondpgto}
        ORDER BY numparc
      `;

      if (parcelas.length > 0) {
        // Validar data de emissão
        const dataEmissao = new Date(dataemissao);
        if (isNaN(dataEmissao.getTime())) {
          return NextResponse.json(
            { error: 'Data de emissão inválida' },
            { status: 400 }
          );
        }

        // Calcular valor da parcela com 2 casas decimais
        const valorParcela = Number((valortotal / parcelas.length).toFixed(2));

        // Criar as contas
        for (const parcela of parcelas) {
          // Calcular data de vencimento: data emissão + 30 dias por parcela
          const dataVencimento = new Date(dataEmissao);
          dataVencimento.setDate(dataVencimento.getDate() + (parcela.numparc * 30));

          await sql`
            INSERT INTO sistema_nfe.contas (
              modelo,
              serie,
              numnfe,
              codparc,
              numparc,
              datavencimento,
              valorparcela,
              codformapgto,
              tipo
            ) VALUES (
              55,
              ${serie},
              ${numnfe},
              ${codcli},
              ${parcela.numparc},
              ${dataVencimento.toISOString().split('T')[0]},
              ${valorParcela},
              ${parcela.codformapgto || codformapgto},
              'R'
            )
          `;
        }
      }
    }

    return NextResponse.json(novaNota[0], { status: 201 });
  } catch (error) {
    console.error('Erro ao criar nota fiscal:', error);
    return NextResponse.json(
      { error: 'Erro ao criar nota fiscal' },
      { status: 500 }
    );
  }
}

// PUT - Atualizar nota fiscal de saída
export async function PUT(request: Request) {
  try {
    const {
      modelo,
      serie,
      numnfe,
      codcli,
      naturezaoperacao,
      dataemissao,
      datasaida,
      valortotal,
      chaveacesso,
      protocoloautorizacao,
      codtrans,
      frete_por_conta,
      peso_bruto,
      peso_liquido,
      especie,
      marca,
      numeracao,
      dados_adicionais,
      codcondpgto,
      codformapgto,
      produtos
    } = await request.json();

    // Validações básicas
    if (!modelo || !serie || !numnfe || !codcli || !naturezaoperacao || 
        !dataemissao || !valortotal || !chaveacesso || !codcondpgto || 
        !codformapgto || !produtos || !Array.isArray(produtos) || produtos.length === 0) {
      return NextResponse.json(
        { error: 'Campos obrigatórios não preenchidos' },
        { status: 400 }
      );
    }

    // Validar cliente
    const cliente = await sql`
      SELECT 1 FROM sistema_nfe.clientes WHERE codcli = ${codcli}
    `;

    if (cliente.length === 0) {
      return NextResponse.json(
        { error: 'Cliente não encontrado' },
        { status: 400 }
      );
    }

    // Validar condição de pagamento
    const condPgto = await sql`
      SELECT 1 FROM sistema_nfe.cond_pgto WHERE codcondpgto = ${codcondpgto}
    `;

    if (condPgto.length === 0) {
      return NextResponse.json(
        { error: 'Condição de pagamento não encontrada' },
        { status: 400 }
      );
    }

    // Validar forma de pagamento
    const formaPgto = await sql`
      SELECT 1 FROM sistema_nfe.formapgto WHERE codformapgto = ${codformapgto}
    `;

    if (formaPgto.length === 0) {
      return NextResponse.json(
        { error: 'Forma de pagamento não encontrada' },
        { status: 400 }
      );
    }

    // Validar produtos e calcular valor total
    let valorTotalCalculado = 0;
    for (const produto of produtos) {
      if (!produto.codprod || !produto.quantidade || !produto.valorunitario) {
        return NextResponse.json(
          { error: 'Dados do produto incompletos' },
          { status: 400 }
        );
      }

      // Validar se produto existe
      const produtoExiste = await sql`
        SELECT 1 FROM sistema_nfe.produtos WHERE codprod = ${produto.codprod}
      `;

      if (produtoExiste.length === 0) {
        return NextResponse.json(
          { error: `Produto ${produto.codprod} não encontrado` },
          { status: 400 }
        );
      }

      valorTotalCalculado += produto.quantidade * produto.valorunitario;
    }

    // Validar valor total
    if (Math.abs(valorTotalCalculado - valortotal) > 0.01) {
      return NextResponse.json(
        { error: 'Valor total não confere com a soma dos produtos' },
        { status: 400 }
      );
    }

    // Verificar se a nota existe
    const notaExiste = await sql`
      SELECT 1 
      FROM sistema_nfe.nfe 
      WHERE modelo = ${modelo}
      AND serie = ${serie}
      AND numnfe = ${numnfe}
      AND tipo = 'S'
    `;

    if (notaExiste.length === 0) {
      return NextResponse.json(
        { error: 'Nota fiscal não encontrada' },
        { status: 404 }
      );
    }

    // Atualizar a nota fiscal
    const notaAtualizada = await sql`
      UPDATE sistema_nfe.nfe
      SET 
        codcli = ${codcli},
        naturezaoperacao = ${naturezaoperacao},
        dataemissao = ${dataemissao},
        datasaida = ${datasaida || dataemissao},
        valortotal = ${valortotal},
        chaveacesso = ${chaveacesso},
        protocoloautorizacao = ${protocoloautorizacao},
        codtrans = ${codtrans},
        frete_por_conta = ${frete_por_conta || '0'},
        peso_bruto = ${peso_bruto || 0},
        peso_liquido = ${peso_liquido || 0},
        especie = ${especie},
        marca = ${marca},
        numeracao = ${numeracao},
        dados_adicionais = ${dados_adicionais},
        codcondpgto = ${codcondpgto},
        codformapgto = ${codformapgto}
      WHERE modelo = ${modelo}
      AND serie = ${serie}
      AND numnfe = ${numnfe}
      AND tipo = 'S'
      RETURNING *
    `;

    // Remover produtos antigos
    await sql`
      DELETE FROM sistema_nfe.produtos_nfe
      WHERE modelo = ${modelo}
      AND serie = ${serie}
      AND numnfe = ${numnfe}
    `;

    // Inserir os novos produtos
    for (const produto of produtos) {
      await sql`
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
          55,
          ${serie},
          ${numnfe},
          ${produto.codprod},
          ${produto.quantidade},
          ${produto.valorunitario},
          ${produto.quantidade * produto.valorunitario},
          ${produto.baseicms || 0},
          ${produto.aliqicms || 0},
          ${produto.valoricms || 0},
          ${produto.baseipi || 0},
          ${produto.aliqipi || 0},
          ${produto.valoripi || 0},
          ${produto.basepis || 0},
          ${produto.aliqpis || 0},
          ${produto.valorpis || 0},
          ${produto.basecofins || 0},
          ${produto.aliqcofins || 0},
          ${produto.valorcofins || 0}
        )
      `;
    }

    return NextResponse.json(notaAtualizada[0]);
  } catch (error) {
    console.error('Erro ao atualizar nota fiscal:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar nota fiscal' },
      { status: 500 }
    );
  }
}

// DELETE - Excluir nota fiscal de saída
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const modelo = searchParams.get('modelo');
    const serie = searchParams.get('serie');
    const numnfe = searchParams.get('numnfe');

    if (!modelo || !serie || !numnfe) {
      return NextResponse.json(
        { error: 'Modelo, série e número da nota são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se a nota existe
    const notaExiste = await sql`
      SELECT 1 
      FROM sistema_nfe.nfe 
      WHERE modelo = ${parseInt(modelo)}
      AND serie = ${parseInt(serie)}
      AND numnfe = ${parseInt(numnfe)}
      AND tipo = 'S'
    `;

    if (notaExiste.length === 0) {
      return NextResponse.json(
        { error: 'Nota fiscal não encontrada' },
        { status: 404 }
      );
    }

    // Remover produtos da nota
    await sql`
      DELETE FROM sistema_nfe.produtos_nfe
      WHERE modelo = ${parseInt(modelo)}
      AND serie = ${parseInt(serie)}
      AND numnfe = ${parseInt(numnfe)}
    `;

    // Remover a nota
    await sql`
      DELETE FROM sistema_nfe.nfe
      WHERE modelo = ${parseInt(modelo)}
      AND serie = ${parseInt(serie)}
      AND numnfe = ${parseInt(numnfe)}
      AND tipo = 'S'
    `;

    return NextResponse.json({ message: 'Nota fiscal excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir nota fiscal:', error);
    return NextResponse.json(
      { error: 'Erro ao excluir nota fiscal' },
      { status: 500 }
    );
  }
} 