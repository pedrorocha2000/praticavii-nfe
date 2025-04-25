'use client';

import { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Modal } from '@/components/Modal';
import { DataTable } from '@/components/DataTable';

interface FormaPagamento {
  codformapgto: number;
  descricao: string;
}

export default function FormaPagamentoPage() {
  const [formasPagamento, setFormasPagamento] = useState<FormaPagamento[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedFormaPagamento, setSelectedFormaPagamento] = useState<FormaPagamento | null>(null);
  const [formData, setFormData] = useState({
    codformapgto: '',
    descricao: '',
  });
  const [sortConfig, setSortConfig] = useState<{
    key: keyof FormaPagamento;
    direction: 'asc' | 'desc';
  }>({ key: 'descricao', direction: 'asc' });

  useEffect(() => {
    fetchFormasPagamento();
  }, []);

  const fetchFormasPagamento = async () => {
    try {
      const response = await fetch('/api/formas-pagamento');
      const data = await response.json();
      setFormasPagamento(data);
    } catch (error) {
      console.error('Erro ao carregar formas de pagamento:', error);
      alert('Erro ao carregar formas de pagamento');
    }
  };

  const handleSort = (key: keyof FormaPagamento) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleOpenModal = (formaPagamento?: FormaPagamento) => {
    if (formaPagamento) {
      setSelectedFormaPagamento(formaPagamento);
      setFormData({
        codformapgto: formaPagamento.codformapgto.toString(),
        descricao: formaPagamento.descricao,
      });
    } else {
      setSelectedFormaPagamento(null);
      setFormData({
        codformapgto: '',
        descricao: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedFormaPagamento(null);
    setFormData({
      codformapgto: '',
      descricao: '',
    });
  };

  const handleOpenDeleteModal = (formaPagamento: FormaPagamento) => {
    setSelectedFormaPagamento(formaPagamento);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedFormaPagamento(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = '/api/formas-pagamento';
      const method = selectedFormaPagamento ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          codformapgto: parseInt(formData.codformapgto),
          descricao: formData.descricao,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao salvar forma de pagamento');
      }

      handleCloseModal();
      fetchFormasPagamento();
    } catch (error) {
      console.error('Erro ao salvar forma de pagamento:', error);
      alert(error instanceof Error ? error.message : 'Erro ao salvar forma de pagamento');
    }
  };

  const handleDelete = async () => {
    if (!selectedFormaPagamento) return;

    try {
      const response = await fetch(`/api/formas-pagamento?codformapgto=${selectedFormaPagamento.codformapgto}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao excluir forma de pagamento');
      }

      handleCloseDeleteModal();
      fetchFormasPagamento();
    } catch (error) {
      console.error('Erro ao excluir forma de pagamento:', error);
      alert(error instanceof Error ? error.message : 'Erro ao excluir forma de pagamento');
    }
  };

  const sortedFormasPagamento = [...formasPagamento].sort((a, b) => {
    if (sortConfig.direction === 'asc') {
      return a[sortConfig.key] > b[sortConfig.key] ? 1 : -1;
    }
    return a[sortConfig.key] < b[sortConfig.key] ? 1 : -1;
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Formas de Pagamento</h1>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Nova Forma de Pagamento
        </button>
      </div>

      <DataTable
        data={sortedFormasPagamento}
        columns={[
          { key: 'codformapgto', label: 'Código' },
          { key: 'descricao', label: 'Descrição' },
        ]}
        onSort={handleSort}
        actions={[
          {
            icon: PencilIcon,
            onClick: (item: FormaPagamento) => handleOpenModal(item),
            label: 'Editar',
          },
          {
            icon: (props) => <TrashIcon {...props} className="h-5 w-5 text-red-600 hover:text-red-900" />,
            onClick: (item: FormaPagamento) => handleOpenDeleteModal(item),
            label: 'Excluir',
          },
        ]}
      />

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={selectedFormaPagamento ? 'Editar Forma de Pagamento' : 'Nova Forma de Pagamento'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="codformapgto" className="block text-sm font-medium text-gray-700">
              Código
            </label>
            <input
              type="number"
              id="codformapgto"
              value={formData.codformapgto}
              onChange={(e) => setFormData({ ...formData, codformapgto: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required
              disabled={!!selectedFormaPagamento}
            />
          </div>
          <div>
            <label htmlFor="descricao" className="block text-sm font-medium text-gray-700">
              Descrição
            </label>
            <input
              type="text"
              id="descricao"
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleCloseModal}
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
      </Modal>

      <Modal isOpen={isDeleteModalOpen} onClose={handleCloseDeleteModal} title="Confirmar Exclusão">
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Tem certeza que deseja excluir a forma de pagamento "{selectedFormaPagamento?.descricao}"?
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
 
 
 