'use client';

import { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, TruckIcon } from '@heroicons/react/24/outline';
import { Modal } from '@/components/Modal';
import { DataTable } from '@/components/DataTable';
import { CidadeSearch } from '@/components/CidadeSearch';
import VeiculosForm from '@/components/forms/VeiculosForm';

interface Transportadora {
  codtrans: number;
  tipopessoa: 'F' | 'J';
  nomerazao: string;
  nomefantasia: string;
  cpfcnpj: string;
  rg_inscricaoestadual: string;
  endereco: string;
  numero: string;
  complemento: string;
  bairro: string;
  cep: string;
  codcid: number;
  telefone: string;
  email: string;
  datacadastro: string;
  nomecidade?: string;
  nomeestado?: string;
  nomepais?: string;
}

export default function TransportadorasPage() {
  const [transportadoras, setTransportadoras] = useState<Transportadora[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTransportadora, setSelectedTransportadora] = useState<Transportadora | null>(null);
  const [selectedCidade, setSelectedCidade] = useState<{ codcid: number; nomecidade: string; nomeestado: string } | null>(null);
  const [formData, setFormData] = useState<Omit<Transportadora, 'datacadastro' | 'codtrans'>>({
    tipopessoa: 'F',
    nomerazao: '',
    nomefantasia: '',
    cpfcnpj: '',
    rg_inscricaoestadual: '',
    endereco: '',
    numero: '',
    complemento: '',
    bairro: '',
    cep: '',
    codcid: 0,
    telefone: '',
    email: ''
  });
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Transportadora;
    direction: 'asc' | 'desc';
  }>({ key: 'nomerazao', direction: 'asc' });
  const [isVeiculosModalOpen, setIsVeiculosModalOpen] = useState(false);

  useEffect(() => {
    fetchTransportadoras();
  }, []);

  const fetchTransportadoras = async () => {
    try {
      const response = await fetch('/api/transportadoras');
      const data = await response.json();
      setTransportadoras(data);
    } catch (error) {
      console.error('Erro ao carregar transportadoras:', error);
      alert('Erro ao carregar transportadoras');
    }
  };

  const handleSort = (key: keyof Transportadora) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleOpenModal = (transportadora?: Transportadora) => {
    if (transportadora) {
      setSelectedTransportadora(transportadora);
      setSelectedCidade({
        codcid: transportadora.codcid,
        nomecidade: transportadora.nomecidade || '',
        nomeestado: transportadora.nomeestado || ''
      });
      setFormData({
        tipopessoa: transportadora.tipopessoa,
        nomerazao: transportadora.nomerazao,
        nomefantasia: transportadora.nomefantasia,
        cpfcnpj: transportadora.cpfcnpj,
        rg_inscricaoestadual: transportadora.rg_inscricaoestadual,
        endereco: transportadora.endereco,
        numero: transportadora.numero,
        complemento: transportadora.complemento || '',
        bairro: transportadora.bairro,
        cep: transportadora.cep,
        codcid: transportadora.codcid,
        telefone: transportadora.telefone,
        email: transportadora.email
      });
    } else {
      setSelectedTransportadora(null);
      setSelectedCidade(null);
      setFormData({
        tipopessoa: 'F',
        nomerazao: '',
        nomefantasia: '',
        cpfcnpj: '',
        rg_inscricaoestadual: '',
        endereco: '',
        numero: '',
        complemento: '',
        bairro: '',
        cep: '',
        codcid: 0,
        telefone: '',
        email: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTransportadora(null);
  };

  const handleOpenDeleteModal = (transportadora: Transportadora) => {
    setSelectedTransportadora(transportadora);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedTransportadora(null);
  };

  const formatCPFCNPJ = (value: string) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '');
    
    if (formData.tipopessoa === 'F') {
      // CPF: 000.000.000-00
      return numbers
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
        .slice(0, 14);
    } else {
      // CNPJ: 00.000.000/0000-00
      return numbers
        .replace(/(\d{2})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1/$2')
        .replace(/(\d{4})(\d{1,2})$/, '$1-$2')
        .slice(0, 18);
    }
  };

  const validateCPFCNPJ = (cpfcnpj: string) => {
    const numbers = cpfcnpj.replace(/\D/g, '');
    
    if (formData.tipopessoa === 'F') {
      return numbers.length === 11;
    } else {
      return numbers.length === 14;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar CPF/CNPJ
    if (!validateCPFCNPJ(formData.cpfcnpj)) {
      alert(formData.tipopessoa === 'F' ? 'CPF inválido' : 'CNPJ inválido');
      return;
    }

    try {
      // Remove formatação do CPF/CNPJ antes de enviar
      const dataToSend = {
        ...formData,
        cpfcnpj: formData.cpfcnpj.replace(/\D/g, ''),
      };

      // Adiciona o codtrans se estiver editando
      if (selectedTransportadora) {
        dataToSend.codtrans = selectedTransportadora.codtrans;
      }

      const url = '/api/transportadoras';
      const method = selectedTransportadora ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao salvar transportadora');
      }

      await fetchTransportadoras();
      handleCloseModal();
    } catch (error: any) {
      console.error('Erro ao salvar transportadora:', error);
      alert(error.message || 'Erro ao salvar transportadora');
    }
  };

  const handleDelete = async () => {
    if (!selectedTransportadora) return;

    try {
      const response = await fetch(`/api/transportadoras?codtrans=${selectedTransportadora.codtrans}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao excluir transportadora');
      }

      handleCloseDeleteModal();
      fetchTransportadoras();
    } catch (error) {
      console.error('Erro ao excluir transportadora:', error);
      alert(error instanceof Error ? error.message : 'Erro ao excluir transportadora');
    }
  };

  const handleOpenVeiculosModal = (transportadora: Transportadora) => {
    setSelectedTransportadora(transportadora);
    setIsVeiculosModalOpen(true);
  };

  const handleCloseVeiculosModal = () => {
    setIsVeiculosModalOpen(false);
    setSelectedTransportadora(null);
  };

  const sortedTransportadoras = [...transportadoras].sort((a, b) => {
    if (sortConfig.direction === 'asc') {
      return a[sortConfig.key] > b[sortConfig.key] ? 1 : -1;
    }
    return a[sortConfig.key] < b[sortConfig.key] ? 1 : -1;
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Transportadoras</h1>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Nova Transportadora
        </button>
      </div>

      <DataTable
        data={sortedTransportadoras}
        columns={[
          { key: 'codtrans', label: 'Código', className: 'w-16' },
          { key: 'nomerazao', label: 'Razão Social', className: 'max-w-[200px]' },
          { key: 'nomefantasia', label: 'Nome Fantasia', className: 'max-w-[200px]' },
          { key: 'cpfcnpj', label: 'CPF/CNPJ', className: 'w-32' },
          { key: 'telefone', label: 'Telefone', className: 'w-32' },
          { key: 'email', label: 'E-mail', className: 'max-w-[200px]' },
          { 
            key: 'endereco_completo', 
            label: 'Endereço',
            className: 'max-w-[300px]',
            render: (item: Transportadora) => (
              <div className="whitespace-normal">
                <div>{`${item.endereco}, ${item.numero}`}</div>
                <div>{`${item.bairro}`}</div>
                <div>{`${item.nomecidade || ''} - ${item.nomeestado || ''}`}</div>
              </div>
            )
          },
        ]}
        onSort={handleSort}
        onEdit={handleOpenModal}
        onDelete={handleOpenDeleteModal}
        actions={[
          {
            icon: TruckIcon,
            onClick: handleOpenVeiculosModal,
            label: 'Gerenciar Veículos'
          }
        ]}
        sortKey={sortConfig.key}
        sortDirection={sortConfig.direction}
      />

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={selectedTransportadora ? 'Editar Transportadora' : 'Nova Transportadora'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="tipopessoa" className="block text-sm font-medium text-gray-700">
                Tipo de Pessoa
              </label>
              <select
                id="tipopessoa"
                value={formData.tipopessoa}
                onChange={(e) => setFormData({ ...formData, tipopessoa: e.target.value as 'F' | 'J' })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
              >
                <option value="F">Física</option>
                <option value="J">Jurídica</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="nomerazao" className="block text-sm font-medium text-gray-700">
                {formData.tipopessoa === 'F' ? 'Nome' : 'Razão Social'}
              </label>
              <input
                type="text"
                id="nomerazao"
                value={formData.nomerazao}
                onChange={(e) => setFormData({ ...formData, nomerazao: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
              />
            </div>
            <div>
              <label htmlFor="nomefantasia" className="block text-sm font-medium text-gray-700">
                {formData.tipopessoa === 'F' ? 'Apelido' : 'Nome Fantasia'}
              </label>
              <input
                type="text"
                id="nomefantasia"
                value={formData.nomefantasia}
                onChange={(e) => setFormData({ ...formData, nomefantasia: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="cpfcnpj" className="block text-sm font-medium text-gray-700">
                {formData.tipopessoa === 'F' ? 'CPF' : 'CNPJ'}
              </label>
              <input
                type="text"
                id="cpfcnpj"
                value={formData.cpfcnpj}
                onChange={(e) => setFormData({ ...formData, cpfcnpj: formatCPFCNPJ(e.target.value) })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
                maxLength={formData.tipopessoa === 'F' ? 14 : 18}
              />
            </div>
            <div>
              <label htmlFor="rg_inscricaoestadual" className="block text-sm font-medium text-gray-700">
                {formData.tipopessoa === 'F' ? 'RG' : 'Inscrição Estadual'}
              </label>
              <input
                type="text"
                id="rg_inscricaoestadual"
                value={formData.rg_inscricaoestadual}
                onChange={(e) => setFormData({ ...formData, rg_inscricaoestadual: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <label htmlFor="endereco" className="block text-sm font-medium text-gray-700">
                Endereço
              </label>
              <input
                type="text"
                id="endereco"
                value={formData.endereco}
                onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
              />
            </div>
            <div>
              <label htmlFor="numero" className="block text-sm font-medium text-gray-700">
                Número
              </label>
              <input
                type="text"
                id="numero"
                value={formData.numero}
                onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="complemento" className="block text-sm font-medium text-gray-700">
                Complemento
              </label>
              <input
                type="text"
                id="complemento"
                value={formData.complemento}
                onChange={(e) => setFormData({ ...formData, complemento: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="bairro" className="block text-sm font-medium text-gray-700">
                Bairro
              </label>
              <input
                type="text"
                id="bairro"
                value={formData.bairro}
                onChange={(e) => setFormData({ ...formData, bairro: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="cep" className="block text-sm font-medium text-gray-700">
                CEP
              </label>
              <input
                type="text"
                id="cep"
                value={formData.cep}
                onChange={(e) => setFormData({ ...formData, cep: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Cidade
              </label>
              <CidadeSearch
                onSelect={(cidade) => {
                  setSelectedCidade(cidade);
                  setFormData(prev => ({ ...prev, codcid: cidade.codcid }));
                }}
                defaultValue={selectedCidade ? `${selectedCidade.nomecidade} - ${selectedCidade.nomeestado}` : ''}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="telefone" className="block text-sm font-medium text-gray-700">
                Telefone
              </label>
              <input
                type="tel"
                id="telefone"
                value={formData.telefone}
                onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                E-mail
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
              />
            </div>
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
            Tem certeza que deseja excluir a transportadora "{selectedTransportadora?.nomerazao}"?
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

      {selectedTransportadora && (
        <VeiculosForm
          transportadora={selectedTransportadora}
          isOpen={isVeiculosModalOpen}
          onClose={handleCloseVeiculosModal}
        />
      )}
    </div>
  );
} 