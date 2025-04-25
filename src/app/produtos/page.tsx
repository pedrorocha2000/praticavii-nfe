'use client';

import { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { Modal } from '@/components/Modal';
import { DataTable } from '@/components/DataTable';
import ProdutoForm from '@/components/forms/ProdutoForm';
import { Produto } from '@/types/produto';
import ProdutoFornecedorForm from '@/components/forms/ProdutoFornecedorForm';

export default function ProdutosPage() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isVinculoModalOpen, setIsVinculoModalOpen] = useState(false);
  const [selectedProduto, setSelectedProduto] = useState<Produto | undefined>(undefined);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Produto;
    direction: 'asc' | 'desc';
  }>({ key: 'nome', direction: 'asc' });

  useEffect(() => {
    fetchProdutos();
  }, []);

  const fetchProdutos = async () => {
    try {
      const response = await fetch('/api/produtos');
      if (!response.ok) throw new Error('Erro ao carregar produtos');
      const data = await response.json();
      console.log('Dados recebidos do backend:', data);
      setProdutos(data);
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao carregar produtos');
    }
  };

  const handleSort = (key: keyof Produto) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleOpenModal = (produto?: Produto) => {
    setSelectedProduto(produto);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduto(undefined);
  };

  const handleOpenDeleteModal = (produto: Produto) => {
    setSelectedProduto(produto);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedProduto(undefined);
  };

  const handleOpenVinculoModal = (produto: Produto) => {
    setSelectedProduto(produto);
    setIsVinculoModalOpen(true);
  };

  const handleCloseVinculoModal = () => {
    setIsVinculoModalOpen(false);
    setSelectedProduto(undefined);
  };

  const handleSubmit = async (data: Produto) => {
    try {
      console.log('Dados recebidos do formulário:', data);
      const url = '/api/produtos';
      const method = selectedProduto ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao salvar produto');
      }

      const savedData = await response.json();
      console.log('Dados salvos:', savedData);

      handleCloseModal();
      fetchProdutos();
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      alert(error instanceof Error ? error.message : 'Erro ao salvar produto');
    }
  };

  const handleDelete = async () => {
    if (!selectedProduto) return;

    try {
      const response = await fetch(`/api/produtos?codprod=${selectedProduto.codprod}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao excluir produto');
      }

      handleCloseDeleteModal();
      fetchProdutos();
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
      alert(error instanceof Error ? error.message : 'Erro ao excluir produto');
    }
  };

  const sortedProdutos = [...produtos].sort((a, b) => {
    if (sortConfig.direction === 'asc') {
      return a[sortConfig.key] > b[sortConfig.key] ? 1 : -1;
    }
    return a[sortConfig.key] < b[sortConfig.key] ? 1 : -1;
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Produtos</h1>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Novo Produto
        </button>
      </div>

      <DataTable
        data={sortedProdutos}
        columns={[
          { key: 'codprod', label: 'Código' },
          { key: 'nome', label: 'Nome' },
          { key: 'ncm', label: 'NCM' },
          { key: 'unidade', label: 'Unidade' },
          { 
            key: 'valorunitario', 
            label: 'Valor Unitário',
            render: (item: Produto) => `R$ ${Number(item.valorunitario).toFixed(2)}`
          }
        ]}
        onSort={handleSort}
        onEdit={handleOpenModal}
        onDelete={handleOpenDeleteModal}
        actions={[
          {
            icon: UserGroupIcon,
            onClick: handleOpenVinculoModal,
            label: 'Gerenciar Fornecedores'
          }
        ]}
        sortKey={sortConfig.key}
        sortDirection={sortConfig.direction}
      />

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={selectedProduto ? 'Editar Produto' : 'Novo Produto'}>
        <ProdutoForm
          initialData={selectedProduto}
          onSubmit={handleSubmit}
          onCancel={handleCloseModal}
        />
      </Modal>

      <Modal isOpen={isDeleteModalOpen} onClose={handleCloseDeleteModal} title="Confirmar Exclusão">
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Tem certeza que deseja excluir o produto "{selectedProduto?.nome}"?
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

      <Modal 
        isOpen={isVinculoModalOpen} 
        onClose={handleCloseVinculoModal}
        title={`Gerenciar Fornecedores - ${selectedProduto?.nome || ''}`}
      >
        {selectedProduto && (
          <ProdutoFornecedorForm
            modo="produto"
            item={selectedProduto}
            onClose={handleCloseVinculoModal}
          />
        )}
      </Modal>
    </div>
  );
} 