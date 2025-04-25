export type MetodoPagamento = 'DINHEIRO' | 'CARTAO' | 'BOLETO' | 'PIX' | 'TRANSFERENCIA';

export interface CondicaoPagamento {
    codcondpgto: number;
    descricao: string;
    juros_perc: number;
    multa_perc: number;
    desconto_perc: number;
    parcelas: Parcela[];
}

export interface Parcela {
    numparc: number;
    codformapgto: number;
    descricao_forma?: string;
    dias: number;
    percentual: number;
}

export interface ContaPagar {
    modelo: number;
    serie: number;
    numnfe: number;
    codparc: number;
    numparc: number;
    datavencimento: Date;
    valorparcela: number;
    datapagamento?: Date;
    valorpago?: number;
    codformapgto?: number;
    tipo: 'P' | 'R';
    juros_valor: number;
    multa_valor: number;
    desconto_valor: number;
} 