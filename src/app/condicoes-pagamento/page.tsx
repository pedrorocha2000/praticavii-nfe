'use client';

import { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Modal } from '@/components/Modal';
import { DataTable } from '@/components/DataTable';
import { toast } from "sonner";
import CondicoesPagamentoForm from '@/components/forms/CondicoesPagamentoForm';

interface FormaPagamento {
  codformapgto: number;
  descricao: string;
}

interface Parcela {
  numparc: number;
  codformapgto: number;
  dias: number;
  percentual: number;
}

interface CondicaoPagamento {
  codcondpgto: number;
  descricao: string;
  juros_perc: number;
  multa_perc: number;
  desconto_perc: number;
  parcelas: Parcela[];
}

export default function CondicoesPagamentoPage() {
  const [condicoesPagamento, setCondicoesPagamento] = useState<CondicaoPagamento[]>([]);
  const [formasPagamento, setFormasPagamento] = useState<FormaPagamento[]>([]);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCondicaoPagamento, setSelectedCondicaoPagamento] = useState<CondicaoPagamento | null>(null);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof CondicaoPagamento;
    direction: 'asc' | 'desc';
  }>({ key: 'descricao', direction: 'asc' });

  useEffect(() => {
    fetchCondicoesPagamento();
    fetchFormasPagamento();
  }, []);

  const fetchCondicoesPagamento = async () => {
    try {
      const response = await fetch('/api/cond_pgto');
      if (!response.ok) {
        throw new Error('Erro ao carregar condições de pagamento');
      }
      const data = await response.json();
      setCondicoesPagamento(data);
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao carregar condições de pagamento');
    }
  };

  const fetchFormasPagamento = async () => {
    try {
      const response = await fetch('/api/formas-pagamento');
      if (!response.ok) {
        throw new Error('Erro ao carregar formas de pagamento');
      }
      const data = await response.json();
      setFormasPagamento(data);
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao carregar formas de pagamento');
    }
  };

  const handleOpenFormModal = (condicao?: CondicaoPagamento) => {
    setSelectedCondicaoPagamento(condicao || null);
    setIsFormModalOpen(true);
  };

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
    setSelectedCondicaoPagamento(null);
  };

  const handleOpenDeleteModal = (condicao: CondicaoPagamento) => {
    setSelectedCondicaoPagamento(condicao);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedCondicaoPagamento(null);
  };

  const handleDelete = async () => {
    if (!selectedCondicaoPagamento) return;

    try {
      const response = await fetch(`/api/cond_pgto?codcondpgto=${selectedCondicaoPagamento.codcondpgto}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao excluir condição de pagamento');
      }

      toast.success('Condição de pagamento excluída com sucesso!');
      handleCloseDeleteModal();
      fetchCondicoesPagamento();
    } catch (error) {
      console.error('Erro:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao excluir condição de pagamento');
    }
  };

  const handleSort = (key: keyof CondicaoPagamento) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const getFormaPagamentoDescricao = (codformapgto: number) => {
    return formasPagamento.find(forma => forma.codformapgto === codformapgto)?.descricao || '';
  };

  const formatParcelasInfo = (parcelas: Parcela[]) => {
    return parcelas.map(parcela => 
      `${parcela.percentual}% em ${parcela.dias} dias (${getFormaPagamentoDescricao(parcela.codformapgto)})`
    ).join(' + ');
  };

  const sortedCondicoesPagamento = [...condicoesPagamento].sort((a, b) => {
    if (sortConfig.direction === 'asc') {
      return a[sortConfig.key] > b[sortConfig.key] ? 1 : -1;
    }
    return a[sortConfig.key] < b[sortConfig.key] ? 1 : -1;
  });

  // Formatar dados para exibir na DataTable
  const tableData = sortedCondicoesPagamento.map(condicao => ({
    ...condicao,
    parcelasInfo: formatParcelasInfo(condicao.parcelas)
  }));

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Condições de Pagamento</h1>
        <button
          onClick={() => handleOpenFormModal()}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Nova Condição de Pagamento
        </button>
      </div>

      <DataTable
        data={tableData}
        columns={[
          { key: 'codcondpgto', label: 'Código' },
          { key: 'descricao', label: 'Descrição' },
          { key: 'parcelasInfo', label: 'Parcelas' },
        ]}
        onSort={handleSort}
        actions={[
          {
            icon: PencilIcon,
            onClick: (item: CondicaoPagamento) => handleOpenFormModal(item),
            label: 'Editar',
          },
          {
            icon: (props) => <TrashIcon {...props} className="h-5 w-5 text-red-600 hover:text-red-900" />,
            onClick: (item: CondicaoPagamento) => handleOpenDeleteModal(item),
            label: 'Excluir',
          },
        ]}
      />

      {isFormModalOpen && (
        <CondicoesPagamentoForm
          isOpen={isFormModalOpen}
          onOpenChange={handleCloseFormModal}
          initialData={selectedCondicaoPagamento || undefined}
          onSuccess={() => {
            fetchCondicoesPagamento();
            handleCloseFormModal();
          }}
        />
      )}

      <Modal isOpen={isDeleteModalOpen} onClose={handleCloseDeleteModal} title="Confirmar Exclusão">
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Tem certeza que deseja excluir a condição de pagamento "{selectedCondicaoPagamento?.descricao}"?
            Esta ação não pode ser desfeita.
          </p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={handleCloseDeleteModal}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancelar
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Excluir
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
} 
 
 
 