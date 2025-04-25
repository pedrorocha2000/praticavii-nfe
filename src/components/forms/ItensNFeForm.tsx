'use client';

import { useState, useEffect } from 'react';

export interface ItemNFe {
  codprod: number;
  descricao: string;
  quantidade: number;
  valorunitario: number;
  valortotal: number;
  cfop: string;
  unidade: string;
}

interface Produto {
  codprod: number;
  nome: string;
  ncm: string;
  cfop: string;
  unidade: string;
  valorunitario: number;
}

interface ItensNFeFormProps {
  tipo: 'entrada' | 'saida';
  items: ItemNFe[];
  onAddItem: (produto: Produto, quantidade: number) => void;
  onRemoveItem: (codprod: number) => void;
  onUpdateItem: (codprod: number, quantidade: number, valorunitario: number) => void;
}

export default function ItensNFeForm({ tipo, items, onAddItem, onRemoveItem, onUpdateItem }: ItensNFeFormProps) {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [selectedProduto, setSelectedProduto] = useState<number>(0);
  const [quantidade, setQuantidade] = useState<number>(1);

  useEffect(() => {
    fetchProdutos();
  }, []);

  const fetchProdutos = async () => {
    try {
      const response = await fetch('/api/produtos');
      const data = await response.json();
      setProdutos(data);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    }
  };

  const handleAddItem = () => {
    const produto = produtos.find(p => p.codprod === selectedProduto);
    if (produto && quantidade > 0) {
      onAddItem(produto, quantidade);
      setSelectedProduto(0);
      setQuantidade(1);
    }
  };

  return (
    <div className="space-y-4">
      {/* Lista de itens */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Produto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quantidade
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Valor Unit.
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Valor Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.map((item, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap">{item.descricao}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="number"
                    value={item.quantidade}
                    onChange={(e) => onUpdateItem(item.codprod, Number(e.target.value), item.valorunitario)}
                    min="1"
                    className="w-20 rounded border-gray-300"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="number"
                    value={item.valorunitario}
                    onChange={(e) => onUpdateItem(item.codprod, item.quantidade, Number(e.target.value))}
                    min="0"
                    step="0.01"
                    className="w-32 rounded border-gray-300"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {item.valortotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => onRemoveItem(item.codprod)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Remover
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Adicionar novo item */}
      <div className="grid grid-cols-3 gap-4 items-end">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Produto
          </label>
          <select
            value={selectedProduto}
            onChange={(e) => setSelectedProduto(Number(e.target.value))}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value={0}>Selecione um produto</option>
            {produtos.map(produto => (
              <option key={produto.codprod} value={produto.codprod}>
                {produto.nome} - {produto.valorunitario.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Quantidade
          </label>
          <input
            type="number"
            value={quantidade}
            onChange={(e) => setQuantidade(Number(e.target.value))}
            min="1"
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <button
          onClick={handleAddItem}
          disabled={!selectedProduto || quantidade <= 0}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Adicionar Item
        </button>
      </div>
    </div>
  );
} 