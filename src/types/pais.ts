export interface Pais {
  CodPais: string;
  NomePais: string;
}

export type CreatePaisDTO = {
  CodPais: string;
  NomePais: string;
};

export type UpdatePaisDTO = {
  NomePais: string;
}; 