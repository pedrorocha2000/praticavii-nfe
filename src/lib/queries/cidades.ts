import { sql } from '@/database';
import { Cidade, CreateCidadeDTO, UpdateCidadeDTO } from '@/types/cidade';

export const cidadeQueries = {
  async getAll(): Promise<Cidade[]> {
    return await sql<Cidade[]>`
      SELECT c.CodCid, c.Nome, c.CodEst, e.Nome as EstadoNome
      FROM Cidade c
      LEFT JOIN Estado e ON c.CodEst = e.CodEst
      ORDER BY c.Nome
    `;
  },

  async getById(id: number): Promise<Cidade | null> {
    const result = await sql<Cidade[]>`
      SELECT c.CodCid, c.Nome, c.CodEst, e.Nome as EstadoNome
      FROM Cidade c
      LEFT JOIN Estado e ON c.CodEst = e.CodEst
      WHERE c.CodCid = ${id}
    `;
    return result[0] || null;
  },

  async getByEstado(codEst: number): Promise<Cidade[]> {
    return await sql<Cidade[]>`
      SELECT c.CodCid, c.Nome, c.CodEst, e.Nome as EstadoNome
      FROM Cidade c
      LEFT JOIN Estado e ON c.CodEst = e.CodEst
      WHERE c.CodEst = ${codEst}
      ORDER BY c.Nome
    `;
  },

  async create(data: CreateCidadeDTO): Promise<Cidade> {
    const result = await sql<Cidade[]>`
      INSERT INTO Cidade (Nome, CodEst)
      VALUES (${data.Nome}, ${data.CodEst})
      RETURNING CodCid, Nome, CodEst
    `;
    return result[0];
  },

  async update(id: number, data: UpdateCidadeDTO): Promise<Cidade | null> {
    const result = await sql<Cidade[]>`
      UPDATE Cidade
      SET Nome = COALESCE(${data.Nome}, Nome),
          CodEst = COALESCE(${data.CodEst}, CodEst)
      WHERE CodCid = ${id}
      RETURNING CodCid, Nome, CodEst
    `;
    return result[0] || null;
  },

  async delete(id: number): Promise<Cidade | null> {
    const result = await sql<Cidade[]>`
      DELETE FROM Cidade
      WHERE CodCid = ${id}
      RETURNING CodCid, Nome, CodEst
    `;
    return result[0] || null;
  }
}; 