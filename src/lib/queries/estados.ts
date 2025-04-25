import { sql } from '@/database';
import { Estado, CreateEstadoDTO, UpdateEstadoDTO } from '@/types/estado';

export const estadoQueries = {
  async getAll(): Promise<Estado[]> {
    return await sql<Estado[]>`
      SELECT e.CodEst, e.Nome, e.UF, e.CodPais, p.Nome as PaisNome
      FROM Estado e
      LEFT JOIN Pais p ON e.CodPais = p.CodPais
      ORDER BY e.Nome
    `;
  },

  async getById(id: number): Promise<Estado | null> {
    const result = await sql<Estado[]>`
      SELECT e.CodEst, e.Nome, e.UF, e.CodPais, p.Nome as PaisNome
      FROM Estado e
      LEFT JOIN Pais p ON e.CodPais = p.CodPais
      WHERE e.CodEst = ${id}
    `;
    return result[0] || null;
  },

  async getByPais(codPais: number): Promise<Estado[]> {
    return await sql<Estado[]>`
      SELECT e.CodEst, e.Nome, e.UF, e.CodPais, p.Nome as PaisNome
      FROM Estado e
      LEFT JOIN Pais p ON e.CodPais = p.CodPais
      WHERE e.CodPais = ${codPais}
      ORDER BY e.Nome
    `;
  },

  async create(data: CreateEstadoDTO): Promise<Estado> {
    const result = await sql<Estado[]>`
      INSERT INTO Estado (Nome, UF, CodPais)
      VALUES (${data.Nome}, ${data.UF}, ${data.CodPais})
      RETURNING CodEst, Nome, UF, CodPais
    `;
    return result[0];
  },

  async update(id: number, data: UpdateEstadoDTO): Promise<Estado | null> {
    const result = await sql<Estado[]>`
      UPDATE Estado
      SET Nome = COALESCE(${data.Nome}, Nome),
          UF = COALESCE(${data.UF}, UF),
          CodPais = COALESCE(${data.CodPais}, CodPais)
      WHERE CodEst = ${id}
      RETURNING CodEst, Nome, UF, CodPais
    `;
    return result[0] || null;
  },

  async delete(id: number): Promise<Estado | null> {
    const result = await sql<Estado[]>`
      DELETE FROM Estado
      WHERE CodEst = ${id}
      RETURNING CodEst, Nome, UF, CodPais
    `;
    return result[0] || null;
  }
}; 