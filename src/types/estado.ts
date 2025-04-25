export interface Estado {
  CodEst: number;
  Nome: string;
  UF: string;
  CodPais: number;
  PaisNome?: string;
}

export type CreateEstadoDTO = Omit<Estado, 'CodEst' | 'PaisNome'>;
export type UpdateEstadoDTO = Partial<CreateEstadoDTO>; 