export type Transportadora = {
    codtrans: number;
    razaosocial: string;
    cnpj: string;
    endereco: string;
    numero: string;
    complemento: string;
    bairro: string;
    cep: string;
    codcid: number;
}

export type TransportadoraInput = Omit<Transportadora, 'codtrans'>;

// Tipo para o relacionamento transportadora-fornecedor
export type TransportadoraFornecedor = {
    codtrans: number;
    codforn: number;
}

// Tipo para transportadora com informações da cidade e estado
export type TransportadoraCompleta = Transportadora & {
    nomecidade: string;
    codest: string;
    nomeestado: string;
    fornecedores: {
        codforn: number;
        nomerazao: string;
        cnpj: string;
    }[];
    veiculos: {
        placa: string;
    }[];
} 