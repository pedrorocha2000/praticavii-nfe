'use client';

import { useState, useEffect } from 'react';
import { CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { Modal } from '@/components/Modal';
import { DataTable } from '@/components/DataTable';

interface Conta {
  modelo: number;
  serie: number;
  numnfe: number;
  codparc: number;
  numparc: number;
  datavencimento: string;
  valorparcela: number;
  datapagamento: string | null;
  valorpago: number | null;
  codformapgto: number;
  tipo: 'P';
  forma_pagamento: string;
  status: 'PAGO' | 'ABERTO' | 'VENCIDO';
}

export default function ContasPagarPage() {
  const [contas, setContas] = useState<Conta[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedConta, setSelectedConta] = useState<Conta | null>(null);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Conta;
    direction: 'asc' | 'desc';
  }>({ key: 'datavencimento', direction: 'asc' });
  const [formasPagamento, setFormasPagamento] = useState<Array<{ codformapgto: number; descricao: string }>>([]);
  const [formData, setFormData] = useState({
    datapagamento: new Date().toISOString().split('T')[0],
    valorpago: 0,
    codformapgto: 0
  });

  useEffect(() => {
    fetchContas();
    fetchFormasPagamento();
  }, []);

  const fetchContas = async () => {
    try {
      const response = await fetch('/api/contas?tipo=P');
      const data = await response.json();
      setContas(data);
    } catch (error) {
      console.error('Erro ao carregar contas:', error);
      alert('Erro ao carregar contas');
    }
  };

  const fetchFormasPagamento = async () => {
    try {
      const response = await fetch('/api/formas-pagamento');
      const data = await response.json();
      setFormasPagamento(data);
    } catch (error) {
      console.error('Erro ao carregar formas de pagamento:', error);
    }
  };

  const handleSort = (key: keyof Conta) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleOpenModal = (conta: Conta) => {
    setSelectedConta(conta);
    setFormData({
      datapagamento: new Date().toISOString().split('T')[0],
      valorpago: conta.valorparcela,
      codformapgto: conta.codformapgto
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedConta(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConta) return;

    try {
      const response = await fetch('/api/contas', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          modelo: selectedConta.modelo,
          serie: selectedConta.serie,
          numnfe: selectedConta.numnfe,
          codparc: selectedConta.codparc,
          numparc: selectedConta.numparc,
          datapagamento: formData.datapagamento,
          valorpago: formData.valorpago,
          codformapgto: formData.codformapgto
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao registrar pagamento');
      }

      handleCloseModal();
      fetchContas();
    } catch (error) {
      console.error('Erro ao registrar pagamento:', error);
      alert(error instanceof Error ? error.message : 'Erro ao registrar pagamento');
    }
  };

  const sortedContas = [...contas].sort((a, b) => {
    if (sortConfig.direction === 'asc') {
      return a[sortConfig.key] > b[sortConfig.key] ? 1 : -1;
    }
    return a[sortConfig.key] < b[sortConfig.key] ? 1 : -1;
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Contas a Pagar</h1>
          <p className="mt-2 text-sm text-gray-700">
            Gerencie todas as contas a pagar do sistema
          </p>
        </div>
      </div>

      <DataTable
        data={sortedContas}
        columns={[
          { 
            key: 'nota', 
            label: 'Nota Fiscal',
            render: (item: Conta) => `${item.modelo}/${item.serie}/${item.numnfe}`
          },
          { key: 'numparc', label: 'Parcela' },
          { 
            key: 'datavencimento', 
            label: 'Vencimento',
            render: (item: Conta) => new Date(item.datavencimento).toLocaleDateString()
          },
          { 
            key: 'valorparcela', 
            label: 'Valor',
            render: (item: Conta) => `R$ ${Number(item.valorparcela).toFixed(2)}`
          },
          { 
            key: 'status', 
            label: 'Status',
            render: (item: Conta) => (
              <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                item.status === 'PAGO' 
                  ? 'bg-green-100 text-green-800'
                  : item.status === 'VENCIDO'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {item.status}
              </span>
            )
          },
        ]}
        onSort={handleSort}
        actions={[
          {
            icon: CurrencyDollarIcon,
            onClick: (item: Conta) => item.status === 'PAGO' ? null : handleOpenModal(item),
            label: 'Registrar Pagamento',
          }
        ]}
      />

      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal}
        title="Registrar Pagamento"
      >
        {selectedConta && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Data do Pagamento
              </label>
              <input
                type="date"
                value={formData.datapagamento}
                onChange={(e) => setFormData(prev => ({ ...prev, datapagamento: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Valor Pago
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.valorpago}
                onChange={(e) => setFormData(prev => ({ ...prev, valorpago: parseFloat(e.target.value) }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Forma de Pagamento
              </label>
              <select
                value={formData.codformapgto}
                onChange={(e) => setFormData(prev => ({ ...prev, codformapgto: parseInt(e.target.value) }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
              >
                <option value="">Selecione uma forma de pagamento</option>
                {formasPagamento.map((forma) => (
                  <option key={forma.codformapgto} value={forma.codformapgto}>
                    {forma.descricao}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={handleCloseModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Confirmar Pagamento
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
} 
 
 
 