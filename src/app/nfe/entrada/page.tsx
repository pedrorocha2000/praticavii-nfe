'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PlusIcon } from '@heroicons/react/24/outline';
import { DataTable } from '@/components/DataTable';

interface NFeEntrada {
  numnfe: number;
  serie: number;
  codforn: number;
  nomerazao: string;
  cpfcnpj: string;
  dataEmissao: string;
  valorTotal: string;
  modelo: number;
  formapagamento: string;
  condicaopagamento: string;
  nometransportadora: string | null;
}

export default function NFeEntradaPage() {
  const [notas, setNotas] = useState<NFeEntrada[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof NFeEntrada;
    direction: 'asc' | 'desc';
  }>({ key: 'numnfe', direction: 'desc' });

  useEffect(() => {
    fetchNotas();
  }, []);

  const fetchNotas = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/nfe_entrada');
      const data = await response.json();
      console.log('Valor total da primeira nota:', data[0]?.valor_total);
      console.log('Tipo do valor total:', typeof data[0]?.valor_total);

      // Validar e transformar os dados
      const notasValidadas = data.map((nota: any) => ({
        numnfe: nota.numnfe,
        serie: nota.serie,
        codforn: nota.codforn,
        nomerazao: nota.nomerazao,
        cpfcnpj: nota.cpfcnpj,
        dataEmissao: nota.dataEmissao,
        valorTotal: nota.valorTotal,
        modelo: nota.modelo,
        formapagamento: nota.formapagamento,
        condicaopagamento: nota.condicaopagamento,
        nometransportadora: nota.nometransportadora
      }));
      
      console.log('Notas validadas:', notasValidadas); // Debug
      setNotas(notasValidadas);
    } catch (error) {
      console.error('Erro ao carregar notas fiscais:', error);
      setError('Erro ao carregar notas fiscais');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (key: keyof NFeEntrada) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const sortedNotas = [...notas].sort((a, b) => {
    if (sortConfig.direction === 'asc') {
      return a[sortConfig.key] > b[sortConfig.key] ? 1 : -1;
    }
    return a[sortConfig.key] < b[sortConfig.key] ? 1 : -1;
  });

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">Carregando notas fiscais...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex justify-center items-center h-64">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Notas Fiscais de Entrada</h1>
        <Link
          href="/nfe/entrada/nova"
          className="flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Nova NFe
        </Link>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Número
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Série
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fornecedor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                CPF/CNPJ
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Data Emissão
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Valor Total
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedNotas.map((nota) => (
              <tr key={`${nota.modelo}-${nota.serie}-${nota.numnfe}`}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {nota.numnfe.toString().padStart(9, '0')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {nota.serie}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {nota.nomerazao}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {nota.cpfcnpj}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {new Date(nota.dataEmissao).toLocaleDateString('pt-BR')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  {new Intl.NumberFormat('pt-BR', { 
                    style: 'currency', 
                    currency: 'BRL' 
                  }).format(parseFloat(nota.valorTotal))}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <Link
                    href={`/nfe/entrada/${nota.modelo}/${nota.serie}/${nota.numnfe}`}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    Ver Detalhes
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 