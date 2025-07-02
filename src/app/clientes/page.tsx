'use client';

import { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, MagnifyingGlassIcon, EyeIcon } from '@heroicons/react/24/outline';

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
  codpessoa: number;
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
  data_criacao?: string;
  data_alteracao?: string;
  situacao?: boolean;
}

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [selectedCidade, setSelectedCidade] = useState<{ codcid: number; nomecidade: string; nomeestado: string; nomepais?: string } | null>(null);
  const [selectedCondicaoPagamento, setSelectedCondicaoPagamento] = useState<{ codcondpgto: number; descricao: string } | null>(null);
  const [formData, setFormData] = useState<Omit<Cliente, 'datacadastro' | 'codcli' | 'codpessoa'>>({
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
    situacao: undefined,
  });
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Cliente;
    direction: 'asc' | 'desc';
  }>({ key: 'nomerazao', direction: 'asc' });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchingCPF, setIsSearchingCPF] = useState(false);
  const [cpfSearched, setCpfSearched] = useState(false);
  const [cpfFound, setCpfFound] = useState(false);

  useEffect(() => {
    fetchClientes();
  }, []);

  // useEffect para buscar pessoa por CPF/CNPJ
  useEffect(() => {
    if (formData.cpfcnpj && formData.cpfcnpj.replace(/\D/g, '').length >= 11 && !selectedCliente) {
      const timer = setTimeout(() => {
        searchPersonByCPF(formData.cpfcnpj);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      // Reset states when CPF is cleared or too short
      setIsSearchingCPF(false);
      setCpfSearched(false);
      setCpfFound(false);
    }
  }, [formData.cpfcnpj, selectedCliente]);

  const searchPersonByCPF = async (cpfcnpj: string) => {
    const cleanCPF = cpfcnpj.replace(/\D/g, '');
    if (cleanCPF.length < 11) return;

    setIsSearchingCPF(true);
    setCpfSearched(false);
    setCpfFound(false);

    try {
      const response = await fetch(`/api/clientes?cpfcnpj=${cleanCPF}`);
      const data = await response.json();

      if (data.exists && data.data) {
        console.log('Pessoa encontrada:', data.data);
        const pessoa = data.data;
        
        // Preencher automaticamente os dados
        setFormData(prev => ({
          ...prev,
          codpessoa: pessoa.codigo,
          tipopessoa: pessoa.tipopessoa,
          nomerazao: pessoa.nomerazao || '',
          nomefantasia: pessoa.nomefantasia || '',
          cpfcnpj: formatCPFCNPJ(pessoa.cpfcnpj || ''),
          rg_inscricaoestadual: pessoa.rg_inscricaoestadual || '',
          endereco: pessoa.endereco || '',
          numero: pessoa.numero || '',
          complemento: pessoa.complemento || '',
          bairro: pessoa.bairro || '',
          cep: pessoa.cep || '',
          codcid: pessoa.codcid || 0,
          telefone: pessoa.telefone || '',
          email: pessoa.email || ''
        }));

        // Configurar cidade se existir
        if (pessoa.codcid) {
          setSelectedCidade({
            codcid: pessoa.codcid,
            nomecidade: pessoa.nomecidade || '',
            nomeestado: pessoa.nomeestado || '',
            nomepais: pessoa.nomepais || ''
          });
        }

        setCpfFound(true);
        toast.success('Dados encontrados e preenchidos automaticamente!');
      } else {
        console.log('Pessoa não encontrada');
        setCpfFound(false);
      }
    } catch (error) {
      console.error('Erro ao buscar pessoa:', error);
      setCpfFound(false);
    } finally {
      setIsSearchingCPF(false);
      setCpfSearched(true);
    }
  };

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
        codcli: cliente.codcli,
        codpessoa: cliente.codpessoa,
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
        situacao: cliente.situacao,
      });
    } else {
      setSelectedCliente(null);
      setSelectedCidade(null);
      setSelectedCondicaoPagamento(null);
      setFormData({
        codcli: 0,
        codpessoa: 0,
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
        situacao: undefined,
      });
    }
    
    // Reset search states when opening modal
    setIsSearchingCPF(false);
    setCpfSearched(false);
    setCpfFound(false);
    
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

  const handleOpenDetailsModal = (cliente: Cliente) => {
    setSelectedCliente(cliente);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedCliente(null);
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return '-';
    
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  const handleCPFChange = (value: string) => {
    const formattedValue = formatCPFCNPJ(value);
    setFormData({ ...formData, cpfcnpj: formattedValue });
    
    // Reset search states when CPF changes
    if (cpfSearched) {
      setCpfSearched(false);
      setCpfFound(false);
    }
  };

  const validateCPFCNPJ = (cpfcnpj: string) => {
    const numbers = cpfcnpj.replace(/\D/g, '');
    
    // Se o cliente não for do Brasil, CPF/CNPJ é opcional
    if (selectedCidade?.nomepais && selectedCidade.nomepais.toLowerCase() !== 'brasil') {
      return true;
    }
    
    if (formData.tipopessoa === 'F') {
      // Validação de CPF
      if (numbers.length !== 11) return false;
      
      // Verifica se todos os dígitos são iguais
      if (/^(\d)\1{10}$/.test(numbers)) return false;
      
      // Validação do primeiro dígito verificador
      let soma = 0;
      for (let i = 0; i < 9; i++) {
        soma += parseInt(numbers.charAt(i)) * (10 - i);
      }
      let resto = 11 - (soma % 11);
      let digito1 = resto > 9 ? 0 : resto;
      
      // Validação do segundo dígito verificador
      soma = 0;
      for (let i = 0; i < 10; i++) {
        soma += parseInt(numbers.charAt(i)) * (11 - i);
      }
      resto = 11 - (soma % 11);
      let digito2 = resto > 9 ? 0 : resto;
      
      // Verifica se os dígitos verificadores estão corretos
      return digito1 === parseInt(numbers.charAt(9)) && digito2 === parseInt(numbers.charAt(10));
    } else {
      // Validação de CNPJ
      if (numbers.length !== 14) return false;
      
      // Verifica se todos os dígitos são iguais
      if (/^(\d)\1{13}$/.test(numbers)) return false;
      
      // Validação do primeiro dígito verificador
      let soma = 0;
      let peso = 5;
      for (let i = 0; i < 12; i++) {
        soma += parseInt(numbers.charAt(i)) * peso;
        peso = peso === 2 ? 9 : peso - 1;
      }
      let resto = soma % 11;
      let digito1 = resto < 2 ? 0 : 11 - resto;
      
      // Validação do segundo dígito verificador
      soma = 0;
      peso = 6;
      for (let i = 0; i < 13; i++) {
        soma += parseInt(numbers.charAt(i)) * peso;
        peso = peso === 2 ? 9 : peso - 1;
      }
      resto = soma % 11;
      let digito2 = resto < 2 ? 0 : 11 - resto;
      
      // Verifica se os dígitos verificadores estão corretos
      return digito1 === parseInt(numbers.charAt(12)) && digito2 === parseInt(numbers.charAt(13));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Se não selecionou cidade, mostra erro
    if (!selectedCidade) {
      toast.error('Por favor, selecione uma cidade');
      return;
    }

    // Validar condição de pagamento
    if (!selectedCondicaoPagamento) {
      toast.error('Por favor, selecione uma condição de pagamento');
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
        // Se estiver editando, inclui o codcli e codpessoa
        response = await fetch('/api/clientes', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...dataToSend,
            codcli: selectedCliente.codcli,
            codpessoa: selectedCliente.codpessoa
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
      const response = await fetch(`/api/clientes?codcli=${selectedCliente.codcli}&codpessoa=${selectedCliente.codpessoa}`, {
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

  const columns = [
    { 
      key: 'codcli', 
      label: 'Código'
    },
    { 
      key: 'nomerazao', 
      label: 'Nome/Razão Social'
    },
    { 
      key: 'nomefantasia', 
      label: 'Apelido/Nome Fantasia'
    },
    { 
      key: 'nomecidade', 
      label: 'Cidade',
      render: (cliente: Cliente) => (
        <span className="text-xs sm:text-sm text-gray-900 truncate">
          {cliente.nomecidade && cliente.nomeestado 
            ? `${cliente.nomecidade}/${cliente.nomeestado}`
            : '-'
          }
        </span>
      )
    },
    { 
      key: 'telefone', 
      label: 'Telefone',
      render: (item: Cliente) => (
        <span className="text-xs sm:text-sm text-gray-900 font-mono">
          {item.telefone || '-'}
        </span>
      )
    },
    { 
      key: 'condicao_pagamento', 
      label: 'Condição Pagamento',
      render: (item: Cliente) => (
        <span className="text-xs sm:text-sm text-gray-900 truncate">
          {item.condicao_pagamento || '-'}
        </span>
      )
    },
    {
      key: 'situacao',
      label: 'Status',
      render: (item: Cliente) => (
        <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${
          item.situacao ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
        }`}>
          <span className="hidden sm:inline">{item.situacao ? '🔴 Inativo' : '🟢 Ativo'}</span>
          <span className="sm:hidden">{item.situacao ? '🔴' : '🟢'}</span>
        </span>
      )
    }
  ];

  const filteredAndSortedClientes = clientes
    .filter(cliente => 
      cliente.codcli.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.nomerazao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.nomefantasia.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.nomecidade?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.nomeestado?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.telefone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.condicao_pagamento.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const aValue = String(a[sortConfig.key] || '');
      const bValue = String(b[sortConfig.key] || '');
      return sortConfig.direction === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    });

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold leading-6 text-gray-900">Clientes</h1>
          <p className="mt-2 text-sm text-gray-700">
            Lista de todos os clientes cadastrados no sistema.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none flex items-center gap-3">
          <div className="relative">
            <Input
              type="text"
              placeholder="Buscar cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-[320px] pl-10"
            />
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-2.5 text-gray-400" />
          </div>
          <Button
            onClick={() => handleOpenModal()}
            className="bg-violet-600 hover:bg-violet-500"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Novo Cliente
          </Button>
        </div>
      </div>

      <div className="mt-6">
        <DataTable
          data={filteredAndSortedClientes}
          columns={columns}
          actions={[
            {
              icon: EyeIcon,
              onClick: handleOpenDetailsModal,
              label: 'Ver Detalhes'
            }
          ]}
          onEdit={handleOpenModal}
          onDelete={handleOpenDeleteModal}
        />
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedCliente ? 'Editar Cliente' : 'Novo Cliente'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Primeira linha: Código, Tipo de Pessoa e Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="codcli">Código</Label>
                  <Input
                    id="codcli"
                  value={selectedCliente ? formData.codcli : ''}
                    disabled
                    className="bg-gray-50"
                  placeholder={selectedCliente ? '' : 'Auto'}
                  />
                </div>
              <div>
                <Label htmlFor="tipopessoa">Tipo de Pessoa</Label>
                <select
                  id="tipopessoa"
                  value={formData.tipopessoa}
                  onChange={(e) => setFormData({ ...formData, tipopessoa: e.target.value as 'F' | 'J' })}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  required
                >
                  <option value="F">Física</option>
                  <option value="J">Jurídica</option>
                </select>
              </div>
              <div>
                <Label htmlFor="situacao">Status</Label>
                <select
                  id="situacao"
                  value={formData.situacao ? 'inativo' : 'ativo'}
                  onChange={(e) => {
                    const isAtivo = e.target.value === 'ativo';
                    setFormData({ ...formData, situacao: isAtivo ? undefined : true });
                  }}
                  disabled={!selectedCliente}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="ativo">🟢 Ativo</option>
                  <option value="inativo">🔴 Inativo</option>
                </select>
              </div>
            </div>

            {/* Endereço */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Endereço</h3>
              <div>
                <Label>Cidade *</Label>
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
                {selectedCidade?.nomepais?.toLowerCase() === 'brasil' && (
                  <p className="text-xs text-amber-600 mt-1">
                    ⚠️ {formData.tipopessoa === 'F' ? 'CPF' : 'CNPJ'} obrigatório para pessoas no Brasil
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="endereco">Endereço</Label>
                  <Input
                    id="endereco"
                    value={formData.endereco}
                    onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                    placeholder="Rua, Avenida, etc."
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="numero">Número</Label>
                  <Input
                    id="numero"
                    value={formData.numero}
                    onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                    placeholder="123"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="complemento">Complemento</Label>
                  <Input
                    id="complemento"
                    value={formData.complemento}
                    onChange={(e) => setFormData({ ...formData, complemento: e.target.value })}
                    placeholder="Apto, Sala, etc."
                  />
                </div>
                <div>
                  <Label htmlFor="bairro">Bairro</Label>
                  <Input
                    id="bairro"
                    value={formData.bairro}
                    onChange={(e) => setFormData({ ...formData, bairro: e.target.value })}
                    placeholder="Nome do bairro"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="cep">CEP</Label>
                  <Input
                    id="cep"
                    value={formData.cep}
                    onChange={(e) => setFormData({ ...formData, cep: e.target.value })}
                    placeholder="CEP / Código Postal"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Dados Pessoais */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Dados Pessoais</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nomerazao">
                    {formData.tipopessoa === 'F' ? 'Nome' : 'Razão Social'} *
                  </Label>
                  <Input
                    id="nomerazao"
                    value={formData.nomerazao}
                    onChange={(e) => setFormData({ ...formData, nomerazao: e.target.value })}
                    placeholder={formData.tipopessoa === 'F' ? 'Digite o nome' : 'Digite a razão social'}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="nomefantasia">
                    {formData.tipopessoa === 'F' ? 'Apelido' : 'Nome Fantasia'}
                  </Label>
                  <Input
                    id="nomefantasia"
                    value={formData.nomefantasia}
                    onChange={(e) => setFormData({ ...formData, nomefantasia: e.target.value })}
                    placeholder={formData.tipopessoa === 'F' ? 'Digite o apelido' : 'Digite o nome fantasia'}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cpfcnpj">
                    {formData.tipopessoa === 'F' ? 'CPF' : 'CNPJ'}
                    {selectedCidade?.nomepais?.toLowerCase() === 'brasil' && ' *'}
                    {isSearchingCPF && <span className="text-blue-500 text-xs ml-2">Buscando...</span>}
                    {cpfSearched && !isSearchingCPF && !selectedCliente && (
                      <span className="text-green-500 text-xs ml-2">✓ Verificado</span>
                    )}
                  </Label>
                  <div className="relative">
                    <Input
                      id="cpfcnpj"
                      value={formData.cpfcnpj}
                      onChange={(e) => handleCPFChange(e.target.value)}
                      placeholder={formData.tipopessoa === 'F' ? '000.000.000-00' : '00.000.000/0000-00'}
                      maxLength={formData.tipopessoa === 'F' ? 14 : 18}
                      className={isSearchingCPF ? 'pr-8' : ''}
                      required={selectedCidade?.nomepais?.toLowerCase() === 'brasil'}
                    />
                    {isSearchingCPF && (
                      <div className="absolute right-2 top-2">
                        <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                      </div>
                    )}
                  </div>
                  {!selectedCliente && (
                    <p className="text-xs text-gray-500 mt-1">
                      {isSearchingCPF ? (
                        <span className="text-blue-600">🔍 Buscando {formData.tipopessoa === 'F' ? 'CPF' : 'CNPJ'}...</span>
                      ) : cpfSearched && cpfFound ? (
                        <span className="text-green-600">✅ {formData.tipopessoa === 'F' ? 'CPF' : 'CNPJ'} encontrado! Dados preenchidos automaticamente</span>
                      ) : cpfSearched && !cpfFound ? (
                        <span className="text-orange-600">ℹ️ {formData.tipopessoa === 'F' ? 'CPF' : 'CNPJ'} não encontrado. Novos dados serão criados</span>
                      ) : (
                        <span>💡 Se o {formData.tipopessoa === 'F' ? 'CPF' : 'CNPJ'} já estiver cadastrado, seus dados serão preenchidos automaticamente</span>
                      )}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="rg_inscricaoestadual">
                    {formData.tipopessoa === 'F' ? 'RG' : 'Inscrição Estadual'}
                  </Label>
                  <Input
                    id="rg_inscricaoestadual"
                    value={formData.rg_inscricaoestadual}
                    onChange={(e) => setFormData({ ...formData, rg_inscricaoestadual: e.target.value })}
                    placeholder={formData.tipopessoa === 'F' ? 'Digite o RG' : 'Digite a inscrição estadual'}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    value={formData.telefone}
                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                    placeholder="(00) 00000-0000"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="email@exemplo.com"
                  />
                </div>
              </div>
            </div>

            {/* Dados Comerciais */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Dados Comerciais</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Condição de Pagamento *</Label>
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
                    error={!selectedCondicaoPagamento ? 'Condição de pagamento é obrigatória' : undefined}
                    onCondicaoCreated={() => {
                      // Callback para quando uma nova condição for criada
                      // O componente interno já atualiza sua própria lista
                    }}
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseModal}>
                Cancelar
              </Button>
              <Button type="submit">
                Salvar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de Detalhes */}
      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <EyeIcon className="h-5 w-5 text-violet-600" />
              Detalhes do Cliente
            </DialogTitle>
          </DialogHeader>
          
          {selectedCliente && (
            <div className="space-y-8">
              {/* Identificação */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-6 bg-violet-600 rounded-full"></div>
                  <h3 className="text-lg font-semibold text-gray-900">Identificação</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">Código:</span>
                    <span className="text-sm font-mono text-gray-900 bg-gray-50 px-2 py-1 rounded">{selectedCliente.codcli}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">Status:</span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      selectedCliente.situacao ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {selectedCliente.situacao ? '🔴 Inativo' : '🟢 Ativo'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">Tipo de Pessoa:</span>
                    <span className="text-sm text-gray-900">
                      {selectedCliente.tipopessoa === 'F' ? 'Pessoa Física' : 'Pessoa Jurídica'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">
                      {selectedCliente.tipopessoa === 'F' ? 'Nome:' : 'Razão Social:'}
                    </span>
                    <span className="text-sm font-semibold text-gray-900 text-right max-w-[200px]">{selectedCliente.nomerazao}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">
                      {selectedCliente.tipopessoa === 'F' ? 'Apelido:' : 'Nome Fantasia:'}
                    </span>
                    <span className="text-sm text-gray-900 text-right max-w-[200px]">{selectedCliente.nomefantasia || '-'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">
                      {selectedCliente.tipopessoa === 'F' ? 'CPF:' : 'CNPJ:'}
                    </span>
                    <span className="text-sm font-mono text-gray-900 bg-gray-50 px-2 py-1 rounded">{selectedCliente.cpfcnpj}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">
                      {selectedCliente.tipopessoa === 'F' ? 'RG:' : 'Inscrição Estadual:'}
                    </span>
                    <span className="text-sm text-gray-900">{selectedCliente.rg_inscricaoestadual || '-'}</span>
                  </div>
                </div>
              </div>

              {/* Endereço */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
                  <h3 className="text-lg font-semibold text-gray-900">Endereço</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                  <div className="md:col-span-2 flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">Endereço Completo:</span>
                    <span className="text-sm text-gray-900 text-right max-w-[300px]">
                      {selectedCliente.endereco}, {selectedCliente.numero}
                      {selectedCliente.complemento && `, ${selectedCliente.complemento}`}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">Bairro:</span>
                    <span className="text-sm text-gray-900">{selectedCliente.bairro}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">CEP:</span>
                    <span className="text-sm font-mono text-gray-900 bg-gray-50 px-2 py-1 rounded">{selectedCliente.cep}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">Cidade/Estado:</span>
                    <span className="text-sm text-gray-900 text-right">
                      {selectedCliente.nomecidade}/{selectedCliente.nomeestado}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">País:</span>
                    <span className="text-sm text-gray-900">{selectedCliente.nomepais}</span>
                  </div>
                </div>
              </div>

              {/* Contato e Dados Comerciais */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Contato */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1 h-6 bg-green-600 rounded-full"></div>
                    <h3 className="text-lg font-semibold text-gray-900">Contato</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm font-medium text-gray-600">Telefone:</span>
                      <span className="text-sm font-mono text-gray-900">{selectedCliente.telefone}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm font-medium text-gray-600">E-mail:</span>
                      <span className="text-sm text-gray-900 text-right max-w-[200px]">{selectedCliente.email || '-'}</span>
                    </div>
                  </div>
                </div>

                {/* Dados Comerciais */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1 h-6 bg-amber-600 rounded-full"></div>
                    <h3 className="text-lg font-semibold text-gray-900">Dados Comerciais</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm font-medium text-gray-600">Condição de Pagamento:</span>
                      <span className="text-sm text-gray-900 text-right max-w-[200px]">{selectedCliente.condicao_pagamento}</span>
                    </div>
                    {selectedCliente.situacao && (
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm font-medium text-gray-600">Data de Desativação:</span>
                        <span className="text-sm font-mono text-gray-900 bg-gray-50 px-2 py-1 rounded">
                          {formatDateTime(selectedCliente.situacao.toString())}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Informações de Auditoria */}
              <div className="pt-6 border-t border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-6 bg-gray-500 rounded-full"></div>
                  <h3 className="text-lg font-semibold text-gray-900">Informações de Auditoria</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">Data de Criação:</span>
                    <span className="text-sm font-mono text-gray-900 bg-gray-50 px-2 py-1 rounded">
                      {formatDateTime(selectedCliente.data_criacao || selectedCliente.datacadastro)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">Última Atualização:</span>
                    <span className="text-sm font-mono text-gray-900 bg-gray-50 px-2 py-1 rounded">
                      {formatDateTime(selectedCliente.data_alteracao || '')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDetailsModal}>
              Fechar
            </Button>
            <Button 
              onClick={() => {
                handleCloseDetailsModal();
                handleOpenModal(selectedCliente!);
              }}
              className="bg-violet-600 hover:bg-violet-500"
            >
              <PencilIcon className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              Tem certeza que deseja excluir o cliente "{selectedCliente?.nomerazao}"?
              Esta ação não pode ser desfeita.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDeleteModal}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 
 
 
 