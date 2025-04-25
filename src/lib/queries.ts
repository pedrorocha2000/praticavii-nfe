import pool from './db';
import { sql } from '@/database';
import { NotaFiscal, ProdutoNotaFiscal, ContaPagar } from '@/types/nota-fiscal';

export const queries = {
  // Fornecedores
  getAllFornecedores: async () => {
    const query = 'SELECT * FROM sistema_nfe.FORNECEDORES';
    const result = await pool.query(query);
    return result.rows;
  },

  getFornecedorById: async (id: number) => {
    const query = 'SELECT * FROM sistema_nfe.FORNECEDORES WHERE CodForn = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  },

  createFornecedor: async (fornecedor: any) => {
    const query = `
      INSERT INTO sistema_nfe.FORNECEDORES 
      (CodForn, NomeRazao, CNPJ, InscricaoEstadual, Endereco, CodCid, Telefone, Email)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    const values = [
      fornecedor.codForn,
      fornecedor.nomeRazao,
      fornecedor.cnpj,
      fornecedor.inscricaoEstadual,
      fornecedor.endereco,
      fornecedor.codCid,
      fornecedor.telefone,
      fornecedor.email
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  // Produtos
  getAllProdutos: async () => {
    const query = 'SELECT * FROM sistema_nfe.PRODUTOS';
    const result = await pool.query(query);
    return result.rows;
  },

  getProdutoById: async (id: number) => {
    const query = 'SELECT * FROM sistema_nfe.PRODUTOS WHERE CodProd = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  },

  createProduto: async (produto: any) => {
    const query = `
      INSERT INTO sistema_nfe.PRODUTOS 
      (CodProd, Nome, NCM, CFOP, Unidade, ValorUnitario)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const values = [
      produto.codProd,
      produto.nome,
      produto.ncm,
      produto.cfop,
      produto.unidade,
      produto.valorUnitario
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  // Notas Fiscais
  createNotaFiscal: async (nota: any) => {
    const query = `
      INSERT INTO sistema_nfe.NFe_Compra 
      (Modelo, Serie, Numero, CodForn, NaturezaOperacao, DataEmissao, HoraEmissao, 
       DataSaida, HoraSaida, ValorTotal, ChaveAcesso, ProtocoloAutorizacao)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `;
    const values = [
      nota.modelo,
      nota.serie,
      nota.numero,
      nota.codForn,
      nota.naturezaOperacao,
      nota.dataEmissao,
      nota.horaEmissao,
      nota.dataSaida,
      nota.horaSaida,
      nota.valorTotal,
      nota.chaveAcesso,
      nota.protocoloAutorizacao
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  getNotaFiscalById: async (modelo: number, serie: number, numnfe: number) => {
    const query = `
      SELECT nf.*, f.NomeRazao as fornecedor_nome
      FROM sistema_nfe.NFe_Compra nf
      JOIN sistema_nfe.FORNECEDORES f ON nf.CodForn = f.CodForn
      WHERE nf.Modelo = $1 AND nf.Serie = $2 AND nf.Numero = $3
    `;
    const result = await pool.query(query, [modelo, serie, numnfe]);
    return result.rows[0];
  },

  // Produtos da Nota Fiscal
  addProdutoNota: async (produtoNota: any) => {
    const query = `
      INSERT INTO sistema_nfe.Produtos_NFe 
      (Modelo, Serie, Numero, CodProd, Quantidade, ValorUnitario, ValorTotal, PesoBruto, PesoLiquido)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    const values = [
      produtoNota.modelo,
      produtoNota.serie,
      produtoNota.numero,
      produtoNota.codProd,
      produtoNota.quantidade,
      produtoNota.valorUnitario,
      produtoNota.valorTotal,
      produtoNota.pesoBruto,
      produtoNota.pesoLiquido
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  // Contas a Pagar
  createContaPagar: async (conta: any) => {
    const query = `
      INSERT INTO sistema_nfe.Conta_a_pagar 
      (Modelo, Serie, Numero, CodParc, NumParc, DataVencimento, ValorParcela)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const values = [
      conta.modelo,
      conta.serie,
      conta.numero,
      conta.codParc,
      conta.numParc,
      conta.dataVencimento,
      conta.valorParcela
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
  }
};

export async function insertNotaFiscal(nota: NotaFiscal) {
    const [notaFiscal] = await sql`
        INSERT INTO sistema_nfe.NFe_Compra (
            Modelo, Serie, NumNFE, CodForn, CodTrans,
            Placa, CodCondPgto, NaturezaOperacao,
            DataEmissao, HoraEmissao, DataSaida,
            HoraSaida, ValorTotal, ChaveAcesso,
            ProtocoloAutorizacao
        ) VALUES (
            ${nota.modelo}, ${nota.serie}, ${nota.numnfe},
            ${nota.codForn}, ${nota.codTrans}, ${nota.placa},
            ${nota.codCondPgto}, ${nota.naturezaOperacao},
            ${nota.dataEmissao}, ${nota.horaEmissao},
            ${nota.dataSaida}, ${nota.horaSaida},
            ${nota.valorTotal}, ${nota.chaveAcesso},
            ${nota.protocoloAutorizacao}
        ) RETURNING *
    `;

    return notaFiscal;
}

export async function getNotaFiscalById(modelo: number, serie: number, numnfe: number) {
    const [notaFiscal] = await sql`
        SELECT 
            nf.Modelo as modelo,
            nf.Serie as serie,
            nf.NumNFE as numnfe,
            nf.CodForn as codForn,
            nf.CodTrans as codTrans,
            nf.Placa as placa,
            nf.CodCondPgto as codCondPgto,
            nf.NaturezaOperacao as naturezaOperacao,
            nf.DataEmissao as dataEmissao,
            nf.HoraEmissao as horaEmissao,
            nf.DataSaida as dataSaida,
            nf.HoraSaida as horaSaida,
            nf.ValorTotal as valorTotal,
            nf.ChaveAcesso as chaveAcesso,
            nf.ProtocoloAutorizacao as protocoloAutorizacao,
            json_build_object(
                'nomerazao', f.NomeRazao,
                'cnpj', f.CNPJ,
                'inscricaoestadual', f.InscricaoEstadual,
                'endereco', f.Endereco,
                'numero', f.Numero,
                'complemento', f.Complemento,
                'bairro', f.Bairro,
                'cep', f.CEP,
                'cidade', c.Nome,
                'estado', e.Nome
            ) as fornecedor,
            CASE 
                WHEN nf.CodTrans IS NOT NULL THEN
                    json_build_object(
                        'nomerazao', t.NomeRazao,
                        'cnpj', t.CNPJ,
                        'inscricaoestadual', t.InscricaoEstadual,
                        'endereco', t.Endereco,
                        'numero', t.Numero,
                        'complemento', t.Complemento,
                        'bairro', t.Bairro,
                        'cep', t.CEP,
                        'cidade', ct.Nome,
                        'estado', et.Nome
                    )
                ELSE NULL
            END as transportadora,
            json_agg(
                json_build_object(
                    'codProd', pn.CodProd,
                    'nome', p.Nome,
                    'ncm', pn.NCM,
                    'cfop', pn.CFOP,
                    'unidade', p.Unidade,
                    'quantidade', pn.Quantidade,
                    'valorUnitario', pn.ValorUnitario,
                    'valorTotal', pn.ValorTotal,
                    'pesoBruto', pn.PesoBruto,
                    'pesoLiquido', pn.PesoLiquido,
                    'baseICMS', pn.BaseICMS,
                    'aliqICMS', pn.AliqICMS,
                    'valorICMS', pn.ValorICMS,
                    'baseIPI', pn.BaseIPI,
                    'aliqIPI', pn.AliqIPI,
                    'valorIPI', pn.ValorIPI,
                    'basePIS', pn.BasePIS,
                    'aliqPIS', pn.AliqPIS,
                    'valorPIS', pn.ValorPIS,
                    'baseCOFINS', pn.BaseCOFINS,
                    'aliqCOFINS', pn.AliqCOFINS,
                    'valorCOFINS', pn.ValorCOFINS
                )
            ) as produtos,
            json_build_object(
                'descricao', cp.Descricao,
                'parcelas', (
                    SELECT json_agg(
                        json_build_object(
                            'numParcela', pcp.NumParc,
                            'codFormaPgto', pcp.CodFormaPgto,
                            'descricaoForma', fp.Descricao
                        )
                    )
                    FROM sistema_nfe.Parcelas_ContaPgto pcp
                    JOIN sistema_nfe.FormaPgto fp ON pcp.CodFormaPgto = fp.CodFormaPgto
                    WHERE pcp.CodCondPgto = cp.CodCondPgto
                )
            ) as condicaoPagamento
        FROM sistema_nfe.NFe_Compra nf
        JOIN sistema_nfe.FORNECEDORES f ON nf.CodForn = f.CodForn
        JOIN sistema_nfe.CIDADES c ON f.CodCid = c.CodCid
        JOIN sistema_nfe.ESTADOS e ON c.CodEst = e.CodEst
        LEFT JOIN sistema_nfe.TRANSPORTADORAS t ON nf.CodTrans = t.CodTrans
        LEFT JOIN sistema_nfe.CIDADES ct ON t.CodCid = ct.CodCid
        LEFT JOIN sistema_nfe.ESTADOS et ON ct.CodEst = et.CodEst
        JOIN sistema_nfe.Produtos_NFe pn ON nf.Modelo = pn.Modelo AND nf.Serie = pn.Serie AND nf.NumNFE = pn.NumNFE
        JOIN sistema_nfe.PRODUTOS p ON pn.CodProd = p.CodProd
        JOIN sistema_nfe.COND_PGTO cp ON nf.CodCondPgto = cp.CodCondPgto
        WHERE nf.Modelo = ${modelo}::integer
        AND nf.Serie = ${serie}::integer
        AND nf.NumNFE = ${numnfe}::integer
        GROUP BY 
            nf.Modelo, nf.Serie, nf.NumNFE,
            nf.CodForn, nf.CodTrans, nf.Placa, nf.CodCondPgto,
            nf.NaturezaOperacao, nf.DataEmissao, nf.HoraEmissao,
            nf.DataSaida, nf.HoraSaida, nf.ValorTotal,
            nf.ChaveAcesso, nf.ProtocoloAutorizacao,
            f.NomeRazao, f.CNPJ, f.InscricaoEstadual,
            f.Endereco, f.Numero, f.Complemento,
            f.Bairro, f.CEP, c.Nome, e.Nome,
            t.NomeRazao, t.CNPJ, t.InscricaoEstadual,
            t.Endereco, t.Numero, t.Complemento,
            t.Bairro, t.CEP, ct.Nome, et.Nome,
            cp.CodCondPgto, cp.Descricao
    `;

    return notaFiscal;
}

export async function insertProdutoNota(modelo: number, serie: number, numnfe: number, produto: any) {
    const [produtoNota] = await sql`
        INSERT INTO sistema_nfe.Produtos_NFe (
            Modelo, Serie, NumNFE, CodProd, Quantidade,
            ValorUnitario, ValorTotal, PesoBruto, PesoLiquido,
            BaseICMS, AliqICMS, ValorICMS, BaseIPI, AliqIPI,
            ValorIPI, BasePIS, AliqPIS, ValorPIS,
            BaseCOFINS, AliqCOFINS, ValorCOFINS
        ) VALUES (
            ${modelo}, ${serie}, ${numnfe},
            ${produto.codProd}, ${produto.quantidade},
            ${produto.valorUnitario}, ${produto.valorTotal},
            ${produto.pesoBruto}, ${produto.pesoLiquido},
            ${produto.baseICMS}, ${produto.aliqICMS},
            ${produto.valorICMS}, ${produto.baseIPI},
            ${produto.aliqIPI}, ${produto.valorIPI},
            ${produto.basePIS}, ${produto.aliqPIS},
            ${produto.valorPIS}, ${produto.baseCOFINS},
            ${produto.aliqCOFINS}, ${produto.valorCOFINS}
        ) RETURNING *
    `;

    return produtoNota;
}

export async function insertContaPagar(modelo: number, serie: number, numnfe: number, conta: any) {
    const [contaPagar] = await sql`
        INSERT INTO sistema_nfe.Contas_Pagar (
            Modelo, Serie, NumNFE, CodParc, NumParc,
            DataVencimento, ValorParcela
        ) VALUES (
            ${modelo}, ${serie}, ${numnfe},
            ${conta.codParc}, ${conta.numParc},
            ${conta.dataVencimento}, ${conta.valorParcela}
        ) RETURNING *
    `;

    return contaPagar;
}

export async function deleteNotaFiscal(modelo: number, serie: number, numnfe: number) {
    // Primeiro, remover produtos da nota
    await sql`
        DELETE FROM sistema_nfe.Produtos_NFe
        WHERE Modelo = ${modelo}::integer
        AND Serie = ${serie}::integer
        AND NumNFE = ${numnfe}::integer
    `;

    // Depois, remover contas a pagar
    await sql`
        DELETE FROM sistema_nfe.Contas_Pagar
        WHERE Modelo = ${modelo}::integer
        AND Serie = ${serie}::integer
        AND NumNFE = ${numnfe}::integer
    `;

    // Por fim, remover a nota fiscal
    const [notaFiscal] = await sql`
        DELETE FROM sistema_nfe.NFe_Compra
        WHERE Modelo = ${modelo}::integer
        AND Serie = ${serie}::integer
        AND NumNFE = ${numnfe}::integer
        RETURNING *
    `;

    return notaFiscal;
} 