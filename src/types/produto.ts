export type Produto = {
    codprod: number;
    nome: string;
    ncm: string;
    unidade: string;
    valorunitario: number;
    datacadastro?: Date;
}

export type ProdutoInput = Omit<Produto, 'codprod'>;

// Tipo para o relacionamento produto-fornecedor
export type ProdutoFornecedor = {
    codprod: number;
    codforn: number;
}

// Tipo para produto com informações do fornecedor
export type ProdutoComFornecedor = Produto & {
    fornecedores: Array<{
        codforn: number;
        nome: string;
    }>;
}

export type CreateProdutoDTO = ProdutoInput;

export type UpdateProdutoDTO = Partial<ProdutoInput> & {
    codprod: number;
}; 