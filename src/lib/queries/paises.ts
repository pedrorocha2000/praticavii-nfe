import { sql } from '@/database';
import { Pais, CreatePaisDTO, UpdatePaisDTO } from '@/types/pais';

export const paisQueries = {
  async getAll(): Promise<Pais[]> {
    return await sql<Pais[]>`
      SELECT CodPais, Nome, Sigla
      FROM Pais
      ORDER BY Nome
    `;
  },

  async getById(id: number): Promise<Pais | null> {
    const result = await sql<Pais[]>`
      SELECT CodPais, Nome, Sigla
      FROM Pais
      WHERE CodPais = ${id}
    `;
    return result[0] || null;
  },

  async create(data: CreatePaisDTO): Promise<Pais> {
    const result = await sql<Pais[]>`
      INSERT INTO Pais (Nome, Sigla)
      VALUES (${data.Nome}, ${data.Sigla})
      RETURNING CodPais, Nome, Sigla
    `;
    return result[0];
  },

  async update(id: number, data: UpdatePaisDTO): Promise<Pais | null> {
    const result = await sql<Pais[]>`
      UPDATE Pais
      SET Nome = COALESCE(${data.Nome}, Nome),
          Sigla = COALESCE(${data.Sigla}, Sigla)
      WHERE CodPais = ${id}
      RETURNING CodPais, Nome, Sigla
    `;
    return result[0] || null;
  },

  async delete(id: number): Promise<Pais | null> {
    const result = await sql<Pais[]>`
      DELETE FROM Pais
      WHERE CodPais = ${id}
      RETURNING CodPais, Nome, Sigla
    `;
    return result[0] || null;
  }
}; 