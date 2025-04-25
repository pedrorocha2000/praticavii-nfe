export type Fornecedor = {
    codforn: number;
    nomerazao: string;
    cnpj: string;
    inscricaoestadual: string;
    endereco: string;
    numero: string;
    complemento: string;
    bairro: string;
    cep: string;
    codcid: number;
    telefone: string;
    email: string;
}

export type FornecedorInput = Omit<Fornecedor, 'codforn'>;

export interface CreateFornecedorDTO extends Omit<Fornecedor, 'codforn'> {
  codforn?: number;
}

export interface UpdateFornecedorDTO extends Partial<CreateFornecedorDTO> {} 