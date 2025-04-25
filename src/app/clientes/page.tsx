'use client';

import { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { Modal } from '@/components/Modal';
import { DataTable } from '@/components/DataTable';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { CidadeSelect } from '@/components/forms/CidadeSelect';
import CidadeForm from '@/components/forms/CidadeForm';
import CondicaoPagamentoSelect from '@/components/forms/CondicaoPagamentoSelect';

interface Cliente {
  codcli: number;
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

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [expandedRows, setExpandedRows] = useState<number[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [selectedCidade, setSelectedCidade] = useState<{ codcid: number; nomecidade: string; nomeestado: string; nomepais?: string } | null>(null);
  const [selectedCondicaoPagamento, setSelectedCondicaoPagamento] = useState<{ codcondpgto: number; descricao: string } | null>(null);
  const [formData, setFormData] = useState<Omit<Cliente, 'datacadastro' | 'codcli'>>({
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
    key: keyof Cliente;
    direction: 'asc' | 'desc';
  }>({ key: 'nomerazao', direction: 'asc' });

  useEffect(() => {
    fetchClientes();
  }, []);

  const fetchClientes = async () => {
    try {
      const response = await fetch('/api/clientes');
      const data = await response.json();
      setClientes(data);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      toast.error('Erro ao carregar clientes');
    }
  };

  const handleSort = (key: keyof Cliente) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleOpenModal = (cliente?: Cliente) => {
    if (cliente) {
      setSelectedCliente(cliente);
      setSelectedCidade({
        codcid: cliente.codcid,
        nomecidade: cliente.nomecidade || '',
        nomeestado: cliente.nomeestado || '',
        nomepais: cliente.nomepais || ''
      });
      setSelectedCondicaoPagamento({
        codcondpgto: cliente.codcondpgto,
        descricao: cliente.condicao_pagamento
      });
      setFormData({
        tipopessoa: cliente.tipopessoa,
        nomerazao: cliente.nomerazao,
        nomefantasia: cliente.nomefantasia,
        cpfcnpj: cliente.cpfcnpj,
        rg_inscricaoestadual: cliente.rg_inscricaoestadual,
        endereco: cliente.endereco,
        numero: cliente.numero,
        complemento: cliente.complemento || '',
        bairro: cliente.bairro,
        cep: cliente.cep,
        codcid: cliente.codcid,
        telefone: cliente.telefone,
        email: cliente.email,
        codcondpgto: cliente.codcondpgto,
        condicao_pagamento: cliente.condicao_pagamento,
      });
    } else {
      setSelectedCliente(null);
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
        condicao_pagamento: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCliente(null);
  };

  const handleOpenDeleteModal = (cliente: Cliente) => {
    setSelectedCliente(cliente);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedCliente(null);
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
    
    // Se o cliente não for do Brasil, CPF/CNPJ é opcional
    if (selectedCidade?.nomepais && selectedCidade.nomepais.toLowerCase() !== 'brasil') {
      return true;
    }
    
    if (formData.tipopessoa === 'F') {
      return numbers.length === 11;
    } else {
      return numbers.length === 14;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Se não selecionou cidade, mostra erro
    if (!selectedCidade) {
      toast.error('Por favor, selecione uma cidade');
      return;
    }

    // Validar CPF/CNPJ apenas para clientes do Brasil ou se foi preenchido
    if (selectedCidade.nomepais?.toLowerCase() === 'brasil') {
      if (!validateCPFCNPJ(formData.cpfcnpj)) {
        toast.error(formData.tipopessoa === 'F' ? 'CPF inválido' : 'CNPJ inválido');
        return;
      }
    } else if (formData.cpfcnpj && !validateCPFCNPJ(formData.cpfcnpj)) {
      // Se não for do Brasil mas preencheu o CPF/CNPJ, valida o formato
      toast.error(formData.tipopessoa === 'F' ? 'CPF inválido' : 'CNPJ inválido');
      return;
    }

    try {
      // Remove formatação do CPF/CNPJ antes de enviar
      const dataToSend = {
        ...formData,
        cpfcnpj: formData.cpfcnpj.replace(/\D/g, ''),
      };

      let response;
      if (selectedCliente) {
        // Se estiver editando, inclui o codcli
        response = await fetch('/api/clientes', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...dataToSend,
            codcli: selectedCliente.codcli
          }),
        });
      } else {
        // Se estiver criando, não inclui o codcli
        response = await fetch('/api/clientes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(dataToSend),
        });
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao salvar cliente');
      }

      await fetchClientes();
      handleCloseModal();
      toast.success(selectedCliente ? 'Cliente atualizado com sucesso!' : 'Cliente criado com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao salvar cliente');
    }
  };

  const handleDelete = async () => {
    if (!selectedCliente) return;

    try {
      const response = await fetch(`/api/clientes?codcli=${selectedCliente.codcli}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao excluir cliente');
      }

      handleCloseDeleteModal();
      fetchClientes();
      toast.success('Cliente excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir cliente:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao excluir cliente');
    }
  };

  const handleCidadeSelect = (cidade: any) => {
    setSelectedCidade({
      codcid: cidade.codcidade,
      nomecidade: cidade.nomecidade,
      nomeestado: cidade.nomeestado,
      nomepais: cidade.nomepais
    });
    setFormData(prev => ({
      ...prev,
      codcid: cidade.codcidade
    }));
  };

  const toggleRowExpansion = (codcli: number, e: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setExpandedRows(prev => 
      prev.includes(codcli) 
        ? prev.filter(id => id !== codcli) 
        : [...prev, codcli]
    );
    console.log("Toggling row:", codcli, "Current expanded rows:", expandedRows);
  };

  const columns = [
    { key: 'codcli', label: 'Código', className: 'w-16' },
    { key: 'nomerazao', label: 'Nome/Razão Social', className: 'max-w-[200px]' },
    { key: 'nomefantasia', label: 'Apelido/Nome Fantasia', className: 'max-w-[200px]' },
    { key: 'cpfcnpj', label: 'CPF/CNPJ', className: 'w-32' },
    { key: 'telefone', label: 'Telefone', className: 'w-32' },
    { key: 'email', label: 'E-mail', className: 'max-w-[200px]' },
    { key: 'condicao_pagamento', label: 'Condição de Pagamento', className: 'max-w-[200px]' }
  ];

  const sortedClientes = [...clientes].sort((a, b) => {
    if (sortConfig.key === 'nomerazao') {
      return sortConfig.direction === 'asc'
        ? a.nomerazao.localeCompare(b.nomerazao)
        : b.nomerazao.localeCompare(a.nomerazao);
    }
    return 0;
  });

  return (
    <div className="container mx-auto py-6 max-w-[1200px]">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Clientes</h1>
        <Button
          onClick={() => handleOpenModal()}
          className="bg-violet-600 hover:bg-violet-500"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Novo Cliente
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <DataTable
          data={sortedClientes}
          columns={columns}
          onSort={handleSort}
          expandedRows={expandedRows}
          expandedContent={(item: Cliente) => (
            <div className="p-4 bg-gray-50">
              <div className="text-sm">
                <p><span className="font-medium">Endereço:</span> {item.endereco}, {item.numero}</p>
                <p><span className="font-medium">Complemento:</span> {item.complemento || '-'}</p>
                <p><span className="font-medium">Bairro:</span> {item.bairro}</p>
                <p><span className="font-medium">Cidade:</span> {item.nomecidade} - {item.nomeestado}</p>
                <p><span className="font-medium">País:</span> {item.nomepais}</p>
                <p><span className="font-medium">CEP:</span> {item.cep}</p>
              </div>
            </div>
          )}
          sortKey={sortConfig.key}
          sortDirection={sortConfig.direction}
          actions={[
            {
              icon: (item) => {
                const isExpanded = expandedRows.includes(item.codcli);
                return isExpanded ? 
                  <ChevronUpIcon className="h-5 w-5" /> : 
                  <ChevronDownIcon className="h-5 w-5" />;
              },
              onClick: (item: Cliente, e: React.MouseEvent) => toggleRowExpansion(item.codcli, e as any),
              label: 'Expandir',
            },
            {
              icon: PencilIcon,
              onClick: (item: Cliente) => handleOpenModal(item),
              label: 'Editar',
            },
            {
              icon: (props) => <TrashIcon {...props} className="h-5 w-5 text-red-600 hover:text-red-900" />,
              onClick: (item: Cliente) => handleOpenDeleteModal(item),
              label: 'Excluir',
            },
          ]}
        />
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={selectedCliente ? 'Editar Cliente' : 'Novo Cliente'}>
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
                {formData.tipopessoa === 'F' ? 'Cliente' : 'Razão Social'}
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
              <Label>Cidade</Label>
              <CidadeSelect
                value={selectedCidade ? {
                  codcid: selectedCidade.codcid,
                  nomecidade: selectedCidade.nomecidade,
                  nomeestado: selectedCidade.nomeestado,
                  codest: ''
                } : null}
                onChange={(cidade) => {
                  if (cidade) {
                    handleCidadeSelect({
                      codcidade: cidade.codcid,
                      nomecidade: cidade.nomecidade,
                      nomeestado: cidade.nomeestado || '',
                      nomepais: cidade.nomepais || ''
                    });
                  }
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="cpfcnpj" className="block text-sm font-medium text-gray-700">
                {formData.tipopessoa === 'F' ? 'CPF' : 'CNPJ'}
                {selectedCidade?.nomepais?.toLowerCase() !== 'brasil' && (
                  <span className="text-gray-500 text-xs ml-1">(opcional)</span>
                )}
              </label>
              <input
                type="text"
                id="cpfcnpj"
                value={formData.cpfcnpj}
                onChange={(e) => setFormData({ ...formData, cpfcnpj: formatCPFCNPJ(e.target.value) })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required={selectedCidade?.nomepais?.toLowerCase() === 'brasil'}
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
                Email
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
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
            Tem certeza que deseja excluir o cliente "{selectedCliente?.nomerazao}"?
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
 
 
 