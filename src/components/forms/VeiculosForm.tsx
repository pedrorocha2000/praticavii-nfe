'use client';

import { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Modal } from '@/components/Modal';
import { DataTable } from '@/components/DataTable';

interface Veiculo {
  placa: string;
  codtrans: number;
  nome_transportadora?: string;
}

interface VeiculosFormProps {
  transportadora: {
    codtrans: number;
    nomerazao: string;
  };
  isOpen: boolean;
  onClose: () => void;
}

export default function VeiculosForm({ transportadora, isOpen, onClose }: VeiculosFormProps) {
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedVeiculo, setSelectedVeiculo] = useState<Veiculo | null>(null);
  const [formData, setFormData] = useState<Omit<Veiculo, 'nome_transportadora'>>({
    placa: '',
    codtrans: transportadora.codtrans
  });

  useEffect(() => {
    if (isOpen) {
      fetchVeiculos();
    }
  }, [isOpen, transportadora.codtrans]);

  const fetchVeiculos = async () => {
    try {
      const response = await fetch('/api/veiculos');
      const data = await response.json();
      // Filtra apenas os veículos da transportadora atual
      setVeiculos(data.filter((v: Veiculo) => v.codtrans === transportadora.codtrans));
    } catch (error) {
      console.error('Erro ao carregar veículos:', error);
      alert('Erro ao carregar veículos');
    }
  };

  const handleOpenModal = (veiculo?: Veiculo) => {
    if (veiculo) {
      setSelectedVeiculo(veiculo);
      setFormData({
        placa: veiculo.placa,
        codtrans: veiculo.codtrans
      });
    } else {
      setSelectedVeiculo(null);
      setFormData({
        placa: '',
        codtrans: transportadora.codtrans
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedVeiculo(null);
  };

  const handleOpenDeleteModal = (veiculo: Veiculo) => {
    setSelectedVeiculo(veiculo);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedVeiculo(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const method = selectedVeiculo ? 'PUT' : 'POST';
      const response = await fetch('/api/veiculos', {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao salvar veículo');
      }

      await fetchVeiculos();
      handleCloseModal();
    } catch (error) {
      console.error('Erro ao salvar veículo:', error);
      alert(error instanceof Error ? error.message : 'Erro ao salvar veículo');
    }
  };

  const handleDelete = async () => {
    if (!selectedVeiculo) return;

    try {
      const response = await fetch(`/api/veiculos?placa=${selectedVeiculo.placa}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao excluir veículo');
      }

      await fetchVeiculos();
      handleCloseDeleteModal();
    } catch (error) {
      console.error('Erro ao excluir veículo:', error);
      alert(error instanceof Error ? error.message : 'Erro ao excluir veículo');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Veículos - ${transportadora.nomerazao}`}>
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Novo Veículo
          </button>
        </div>

        <DataTable
          data={veiculos}
          columns={[
            { key: 'placa', label: 'Placa' }
          ]}
          onEdit={handleOpenModal}
          onDelete={handleOpenDeleteModal}
        />

        {/* Modal de Criar/Editar Veículo */}
        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={selectedVeiculo ? 'Editar Veículo' : 'Novo Veículo'}
        >
          <form onSubmit={handleSubmit} className="p-4">
            <div className="mb-4">
              <label htmlFor="placa" className="block text-sm font-medium text-gray-700">
                Placa
              </label>
              <input
                type="text"
                id="placa"
                value={formData.placa}
                onChange={(e) => setFormData({ ...formData, placa: e.target.value.toUpperCase() })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
                maxLength={7}
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={handleCloseModal}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Salvar
              </button>
            </div>
          </form>
        </Modal>

        {/* Modal de Confirmação de Exclusão */}
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={handleCloseDeleteModal}
          title="Confirmar Exclusão"
        >
          <div className="p-4">
            <p>Tem certeza que deseja excluir este veículo?</p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={handleCloseDeleteModal}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Excluir
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </Modal>
  );
} 