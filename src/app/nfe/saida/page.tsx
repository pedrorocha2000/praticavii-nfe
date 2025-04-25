'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PlusIcon } from '@heroicons/react/24/outline';
import { DataTable } from '@/components/DataTable';

interface NFeSaida {
  numnfe: number;
  serie: number;
  codcli: number;
  nomerazao: string;
  cpfcnpj: string;
  dataEmissao: string;
  valorTotal: string;
  modelo: number;
  formapagamento: string;
  condicaopagamento: string;
  nometransportadora: string | null;
}

export default function NFeSaidaPage() {
  const [notas, setNotas] = useState<NFeSaida[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof NFeSaida;
    direction: 'asc' | 'desc';
  }>({ key: 'numnfe', direction: 'desc' });

  useEffect(() => {
    fetchNotas();
  }, []);

  const fetchNotas = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/nfe_saida');
      const data = await response.json();
      
      // Validar e transformar os dados
      const notasValidadas = data.map((nota: any) => ({
        numnfe: nota.numnfe,
        serie: nota.serie,
        codcli: nota.codcli,
        nomerazao: nota.nomerazao,
        cpfcnpj: nota.cpfcnpj,
        dataEmissao: nota.dataEmissao,
        valorTotal: nota.valorTotal,
        modelo: nota.modelo,
        formapagamento: nota.formapagamento,
        condicaopagamento: nota.condicaopagamento,
        nometransportadora: nota.nometransportadora
      }));
      
      setNotas(notasValidadas);
    } catch (error) {
      console.error('Erro ao carregar notas fiscais:', error);
      setError('Erro ao carregar notas fiscais');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (key: keyof NFeSaida) => {
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
        <h1 className="text-2xl font-bold">Notas Fiscais de Saída</h1>
        <Link
          href="/nfe/saida/nova"
          className="flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Nova NFe
        </Link>
      </div>

      <DataTable
        data={sortedNotas}
        columns={[
          { key: 'numnfe', label: 'Número' },
          { key: 'serie', label: 'Série' },
          { key: 'nomerazao', label: 'Cliente' },
          { key: 'cpfcnpj', label: 'CPF/CNPJ' },
          { 
            key: 'dataEmissao', 
            label: 'Data Emissão',
            render: (item: NFeSaida) => {
              const data = new Date(item.dataEmissao);
              return isNaN(data.getTime()) ? 'Data inválida' : data.toLocaleDateString('pt-BR');
            }
          },
          { 
            key: 'valorTotal', 
            label: 'Valor Total',
            render: (item: NFeSaida) => {
              const valor = parseFloat(item.valorTotal.replace('.', '').replace(',', '.'));
              return new Intl.NumberFormat('pt-BR', { 
                style: 'currency', 
                currency: 'BRL' 
              }).format(valor);
            }
          },
        ]}
        onSort={handleSort}
        sortConfig={sortConfig}
      />
    </div>
  );
} 