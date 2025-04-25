export interface Fornecedor {
    nomerazao: string;
    cnpj: string;
    inscricaoestadual: string;
    endereco: string;
    numero: string;
    complemento: string;
    bairro: string;
    cep: string;
    cidade: string;
    estado: string;
}

export interface Transportadora {
    nomerazao: string;
    cnpj: string;
    inscricaoestadual: string;
    endereco: string;
    numero: string;
    complemento: string;
    bairro: string;
    cep: string;
    cidade: string;
    estado: string;
}

export interface Produto {
    codProd: number;
    nome: string;
    ncm: string;
    unidade: string;
    preco: number;
    estoque: number;
}

export interface ProdutoNotaFiscal {
    codProd: number;
    nome: string;
    ncm: string;
    cfop: string;
    unidade: string;
    quantidade: number;
    valorUnitario: number;
    valorTotal: number;
    pesoBruto: number;
    pesoLiquido: number;
    baseICMS: number;
    aliqICMS: number;
    valorICMS: number;
    baseIPI: number;
    aliqIPI: number;
    valorIPI: number;
    basePIS: number;
    aliqPIS: number;
    valorPIS: number;
    baseCOFINS: number;
    aliqCOFINS: number;
    valorCOFINS: number;
}

export interface Parcela {
    numParcela: number;
    codFormaPgto: number;
    descricaoForma: string;
}

export interface CondicaoPagamento {
    codCondPgto: number;
    descricao: string;
    parcelas: Parcela[];
}

export interface ContaPagar {
    codParc: number;
    numParc: number;
    codFormaPgto: number;
    dataVencimento: string;
    valorParcela: number;
}

export interface NotaFiscal {
    modelo: number;
    serie: number;
    numnfe: number;
    codForn: number;
    codTrans: number;
    placa: string;
    codCondPgto: number;
    naturezaOperacao: string;
    dataEmissao: string;
    horaEmissao: string;
    dataSaida: string;
    horaSaida: string;
    valorTotal: number;
    chaveAcesso: string;
    protocoloAutorizacao: string;
    fornecedor: Fornecedor;
    transportadora: Transportadora | null;
    produtos: ProdutoNotaFiscal[];
    condicaoPagamento: CondicaoPagamento;
    contasPagar: ContaPagar[];
} 