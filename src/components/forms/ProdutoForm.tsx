'use client';

import React, { useState, useEffect } from 'react';
import { Produto } from '@/types/produto';

interface ProdutoFormProps {
  initialData?: Produto;
  onSubmit: (data: Produto) => void;
  onCancel: () => void;
}

export default function ProdutoForm({ initialData, onSubmit, onCancel }: ProdutoFormProps) {
  const [produto, setProduto] = useState<Produto>({
    codprod: initialData?.codprod || 0,
    nome: initialData?.nome || '',
    ncm: initialData?.ncm || '',
    unidade: initialData?.unidade || '',
    valorunitario: initialData?.valorunitario || 0,
    datacadastro: initialData?.datacadastro
  });

  useEffect(() => {
    if (initialData) {
      setProduto({
        codprod: initialData.codprod,
        nome: initialData.nome,
        ncm: initialData.ncm || '',
        unidade: initialData.unidade || '',
        valorunitario: Number(initialData.valorunitario) || 0,
        datacadastro: initialData.datacadastro
      });
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dadosParaEnviar = {
      ...produto,
      valorunitario: Number(produto.valorunitario)
    };
    onSubmit(dadosParaEnviar);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="nome" className="block text-sm font-medium text-gray-700">
          Nome
        </label>
        <input
          type="text"
          id="nome"
          required
          value={produto.nome}
          onChange={(e) => setProduto({ ...produto, nome: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="ncm" className="block text-sm font-medium text-gray-700">
          NCM
        </label>
        <input
          type="text"
          id="ncm"
          value={produto.ncm}
          onChange={(e) => setProduto({ ...produto, ncm: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="unidade" className="block text-sm font-medium text-gray-700">
          Unidade
        </label>
        <input
          type="text"
          id="unidade"
          value={produto.unidade}
          onChange={(e) => setProduto({ ...produto, unidade: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="valorunitario" className="block text-sm font-medium text-gray-700">
          Valor Unitário
        </label>
        <input
          type="number"
          id="valorunitario"
          required
          min="0"
          step="0.01"
          value={produto.valorunitario}
          onChange={(e) => setProduto({ ...produto, valorunitario: Number(e.target.value) })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Salvar
        </button>
      </div>
    </form>
  );
} 