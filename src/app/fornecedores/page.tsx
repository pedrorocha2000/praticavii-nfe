'use client';

import { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, CubeIcon } from '@heroicons/react/24/outline';
import { Modal } from '@/components/Modal';
import { DataTable } from '@/components/DataTable';
import { Label } from "@/components/ui/label";
import { CidadeSelect } from '@/components/forms/CidadeSelect';
import CondicaoPagamentoSelect from '@/components/forms/CondicaoPagamentoSelect';
import ProdutoFornecedorForm from '@/components/forms/ProdutoFornecedorForm';
import { toast } from 'sonner';

interface Fornecedor {
  codforn: number;
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
  codcondpgto: number;
  condicao_pagamento: string;
}

export default function FornecedoresPage() {
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isVinculoModalOpen, setIsVinculoModalOpen] = useState(false);
  const [selectedFornecedor, setSelectedFornecedor] = useState<Fornecedor | null>(null);
  const [selectedCidade, setSelectedCidade] = useState<{ codcid: number; nomecidade: string; nomeestado: string; nomepais?: string } | null>(null);
  const [selectedCondicaoPagamento, setSelectedCondicaoPagamento] = useState<{ codcondpgto: number; descricao: string } | null>(null);
  const [formData, setFormData] = useState<Omit<Fornecedor, 'datacadastro' | 'codforn'>>({
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
    email: '',
    codcondpgto: 0,
    condicao_pagamento: ''
  });
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Fornecedor;
    direction: 'asc' | 'desc';
  }>({ key: 'nomerazao', direction: 'asc' });

  useEffect(() => {
    fetchFornecedores();
  }, []);

  const fetchFornecedores = async () => {
    try {
      const response = await fetch('/api/fornecedores');
      const data = await response.json();
      setFornecedores(data);
    } catch (error) {
      console.error('Erro ao carregar fornecedores:', error);
      toast.error('Erro ao carregar fornecedores');
    }
  };

  const handleSort = (key: keyof Fornecedor) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleOpenModal = (fornecedor?: Fornecedor) => {
    if (fornecedor) {
      setSelectedFornecedor(fornecedor);
      setSelectedCidade({
        codcid: fornecedor.codcid,
        nomecidade: fornecedor.nomecidade || '',
        nomeestado: fornecedor.nomeestado || '',
        nomepais: fornecedor.nomepais || ''
      });
      setSelectedCondicaoPagamento({
        codcondpgto: fornecedor.codcondpgto,
        descricao: fornecedor.condicao_pagamento
      });
      setFormData({
        tipopessoa: fornecedor.tipopessoa,
        nomerazao: fornecedor.nomerazao,
        nomefantasia: fornecedor.nomefantasia,
        cpfcnpj: fornecedor.cpfcnpj,
        rg_inscricaoestadual: fornecedor.rg_inscricaoestadual,
        endereco: fornecedor.endereco,
        numero: fornecedor.numero,
        complemento: fornecedor.complemento || '',
        bairro: fornecedor.bairro,
        cep: fornecedor.cep,
        codcid: fornecedor.codcid,
        telefone: fornecedor.telefone,
        email: fornecedor.email,
        codcondpgto: fornecedor.codcondpgto,
        condicao_pagamento: fornecedor.condicao_pagamento
      });
    } else {
      setSelectedFornecedor(null);
      setSelectedCidade(null);
      setSelectedCondicaoPagamento(null);
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
        email: '',
        codcondpgto: 0,
        condicao_pagamento: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedFornecedor(null);
  };

  const handleOpenDeleteModal = (fornecedor: Fornecedor) => {
    setSelectedFornecedor(fornecedor);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedFornecedor(null);
  };

  const handleOpenVinculoModal = (fornecedor: Fornecedor) => {
    setSelectedFornecedor(fornecedor);
    setIsVinculoModalOpen(true);
  };

  const handleCloseVinculoModal = () => {
    setIsVinculoModalOpen(false);
    setSelectedFornecedor(null);
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
      toast.error(formData.tipopessoa === 'F' ? 'CPF inválido' : 'CNPJ inválido');
      return;
    }

    // Se não selecionou cidade, mostra erro
    if (!selectedCidade || !selectedCidade.codcid) {
      toast.error('Por favor, selecione uma cidade');
      return;
    }

    try {
      // Remove formatação do CPF/CNPJ antes de enviar
      const dataToSend = {
        ...formData,
        cpfcnpj: formData.cpfcnpj.replace(/\D/g, ''),
        codcid: selectedCidade.codcid
      };

      let response;
      if (selectedFornecedor) {
        // Se estiver editando, inclui o codforn
        response = await fetch('/api/fornecedores', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...dataToSend,
            codforn: selectedFornecedor.codforn
          }),
        });
      } else {
        // Se estiver criando, não inclui o codforn
        response = await fetch('/api/fornecedores', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(dataToSend),
        });
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao salvar fornecedor');
      }

      await fetchFornecedores();
      handleCloseModal();
      toast.success(selectedFornecedor ? 'Fornecedor atualizado com sucesso!' : 'Fornecedor criado com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar fornecedor:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao salvar fornecedor');
    }
  };

  const handleDelete = async () => {
    if (!selectedFornecedor) return;

    try {
      const response = await fetch(`/api/fornecedores?codforn=${selectedFornecedor.codforn}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao excluir fornecedor');
      }

      handleCloseDeleteModal();
      fetchFornecedores();
      toast.success('Fornecedor excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir fornecedor:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao excluir fornecedor');
    }
  };

  const sortedFornecedores = [...fornecedores].sort((a, b) => {
    if (sortConfig.direction === 'asc') {
      return a[sortConfig.key] > b[sortConfig.key] ? 1 : -1;
    }
    return a[sortConfig.key] < b[sortConfig.key] ? 1 : -1;
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Fornecedores</h1>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Novo Fornecedor
        </button>
      </div>

      <DataTable
        data={sortedFornecedores}
        columns={[
          { key: 'codforn', label: 'Código', className: 'w-16' },
          { key: 'nomerazao', label: 'Razão Social', className: 'max-w-[200px]' },
          { key: 'nomefantasia', label: 'Nome Fantasia', className: 'max-w-[200px]' },
          { key: 'cpfcnpj', label: 'CPF/CNPJ', className: 'w-32' },
          { key: 'telefone', label: 'Telefone', className: 'w-32' },
          { key: 'email', label: 'E-mail', className: 'max-w-[200px]' },
          { key: 'condicao_pagamento', label: 'Condição de Pagamento', className: 'max-w-[200px]' },
          { 
            key: 'endereco_completo', 
            label: 'Endereço',
            className: 'max-w-[300px]',
            render: (item: Fornecedor) => (
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
            icon: CubeIcon,
            onClick: handleOpenVinculoModal,
            label: 'Gerenciar Produtos'
          }
        ]}
        sortKey={sortConfig.key}
        sortDirection={sortConfig.direction}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={selectedFornecedor ? 'Editar Fornecedor' : 'Novo Fornecedor'}
      >
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
                {formData.tipopessoa === 'F' ? 'Fornecedor' : 'Razão Social'}
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
            <div className="col-span-2">
              <Label htmlFor="cidade">Cidade</Label>
              <CidadeSelect
                value={selectedCidade}
                onChange={setSelectedCidade}
                required
              />
            </div>

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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="rg_inscricaoestadual" className="block text-sm font-medium text-gray-700">
                {formData.tipopessoa === 'F' ? 'RG' : 'Inscrição Estadual'}
                {formData.tipopessoa === 'J' && <span className="text-gray-500 text-xs ml-1">(opcional)</span>}
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Condição de Pagamento</Label>
              <CondicaoPagamentoSelect
                value={selectedCondicaoPagamento ? {
                  codcondpgto: selectedCondicaoPagamento.codcondpgto,
                  descricao: selectedCondicaoPagamento.descricao,
                  juros_perc: 0,
                  multa_perc: 0,
                  desconto_perc: 0,
                  parcelas: []
                } : null}
                onChange={(condicao) => {
                  if (condicao) {
                    setSelectedCondicaoPagamento({
                      codcondpgto: condicao.codcondpgto,
                      descricao: condicao.descricao
                    });
                    setFormData(prev => ({
                      ...prev,
                      codcondpgto: condicao.codcondpgto,
                      condicao_pagamento: condicao.descricao
                    }));
                  }
                }}
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

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        title="Confirmar Exclusão"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Tem certeza que deseja excluir o fornecedor "{selectedFornecedor?.nomerazao}"?
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
        title={`Gerenciar Produtos - ${selectedFornecedor?.nomerazao || ''}`}
      >
        {selectedFornecedor && (
          <ProdutoFornecedorForm
            modo="fornecedor"
            item={selectedFornecedor}
            onClose={handleCloseVinculoModal}
          />
        )}
      </Modal>
    </div>
  );
} 