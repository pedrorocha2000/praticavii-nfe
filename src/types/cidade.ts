export interface Cidade {
  CodCid: number;
  Nome: string;
  CodEst: number;
  EstadoNome?: string;
}

export type CreateCidadeDTO = Omit<Cidade, 'CodCid' | 'EstadoNome'>;
export type UpdateCidadeDTO = Partial<CreateCidadeDTO>; 