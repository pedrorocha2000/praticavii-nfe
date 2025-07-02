'use client';

import { useState, useEffect } from 'react';
import { PlusIcon, MagnifyingGlassIcon, TruckIcon, RectangleStackIcon, UserGroupIcon, EyeIcon, PencilIcon } from '@heroicons/react/24/outline';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { DataTable } from '@/components/DataTable';
import { CidadeSelect } from '@/components/forms/CidadeSelect';
import CondicaoPagamentoSelect from '@/components/forms/CondicaoPagamentoSelect';
import VeiculosForm from '@/components/forms/VeiculosForm';
import TransportadoraFornecedorForm from '@/components/forms/TransportadoraFornecedorForm';

interface Transportadora {
  codtrans: number;
  codpessoa: number;
  codcondpgto?: number;
  descricao_condpgto?: string;
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
  data_criacao?: string;
  data_alteracao?: string;
  situacao?: string;
}

export default function TransportadorasPage() {
  const [transportadoras, setTransportadoras] = useState<Transportadora[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isVeiculosModalOpen, setIsVeiculosModalOpen] = useState(false);
  const [isFornecedorModalOpen, setIsFornecedorModalOpen] = useState(false);
  const [selectedTransportadora, setSelectedTransportadora] = useState<Transportadora | null>(null);
  const [selectedCidade, setSelectedCidade] = useState<{ codcid: number; nomecidade: string; nomeestado: string; nomepais?: string } | null>(null);
  const [selectedCondicaoPagamento, setSelectedCondicaoPagamento] = useState<{ codcondpgto: number; descricao: string } | null>(null);
  const [formData, setFormData] = useState<any>({
    codtrans: 0,
    codpessoa: 0,
    codcondpgto: null,
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
    datacadastro: '',
  });
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Transportadora;
    direction: 'asc' | 'desc';
  }>({ key: 'nomerazao', direction: 'asc' });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchingCPF, setIsSearchingCPF] = useState(false);
  const [cpfSearched, setCpfSearched] = useState(false);
  const [cpfFound, setCpfFound] = useState(false);

  useEffect(() => {
    fetchTransportadoras();
  }, []);



  const searchPersonByCPF = async (cpfcnpj: string) => {
    const cleanCPF = cpfcnpj.replace(/\D/g, '');
    if (cleanCPF.length < 11) return;

    setIsSearchingCPF(true);
    setCpfSearched(false);
    setCpfFound(false);

    try {
      const response = await fetch(`/api/transportadoras?cpfcnpj=${cleanCPF}`);
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

  const fetchTransportadoras = async () => {
    try {
      const response = await fetch('/api/transportadoras');
      const data = await response.json();
      setTransportadoras(data);
    } catch (error) {
      console.error('Erro ao carregar transportadoras:', error);
      toast.error('Erro ao carregar transportadoras');
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
        nomeestado: transportadora.nomeestado || '',
        nomepais: transportadora.nomepais || ''
      });
      setSelectedCondicaoPagamento(transportadora.codcondpgto ? {
        codcondpgto: transportadora.codcondpgto,
        descricao: transportadora.descricao_condpgto || ''
      } : null);
      setFormData({
        codtrans: transportadora.codtrans,
        codpessoa: transportadora.codpessoa,
        codcondpgto: transportadora.codcondpgto,
        tipopessoa: transportadora.tipopessoa,
        nomerazao: transportadora.nomerazao,
        nomefantasia: transportadora.nomefantasia,
        cpfcnpj: transportadora.cpfcnpj,
        rg_inscricaoestadual: transportadora.rg_inscricaoestadual,
        endereco: transportadora.endereco,
        numero: transportadora.numero,
        complemento: transportadora.complemento,
        bairro: transportadora.bairro,
        cep: transportadora.cep,
        codcid: transportadora.codcid,
        telefone: transportadora.telefone,
        email: transportadora.email
      });
    } else {
      setSelectedTransportadora(null);
      setSelectedCidade(null);
      setSelectedCondicaoPagamento(null);
      setFormData({
        codtrans: 0,
        codpessoa: 0,
        codcondpgto: null,
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
        datacadastro: '',
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

  const handleOpenVeiculosModal = (transportadora: Transportadora) => {
    setSelectedTransportadora(transportadora);
    setIsVeiculosModalOpen(true);
  };

  const handleCloseVeiculosModal = () => {
    setIsVeiculosModalOpen(false);
    setSelectedTransportadora(null);
  };

  const handleOpenFornecedorModal = (transportadora: Transportadora) => {
    setSelectedTransportadora(transportadora);
    setIsFornecedorModalOpen(true);
  };

  const handleCloseFornecedorModal = () => {
    setIsFornecedorModalOpen(false);
    setSelectedTransportadora(null);
  };

  const handleOpenDetailsModal = (transportadora: Transportadora) => {
    setSelectedTransportadora(transportadora);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedTransportadora(null);
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
    
    // Atualizar o CPF primeiro
    setFormData({ ...formData, cpfcnpj: formattedValue });
    
    // Se está editando, não buscar automaticamente
    if (selectedTransportadora) {
      return;
    }
    
    // Reset search states when CPF changes
    if (cpfSearched) {
      setCpfSearched(false);
      setCpfFound(false);
    }
    
    // Buscar automaticamente quando CPF/CNPJ estiver completo
    const numbers = formattedValue.replace(/\D/g, '');
    const isCompleto = (formData.tipopessoa === 'F' && numbers.length === 11) || 
                      (formData.tipopessoa === 'J' && numbers.length === 14);
    
    if (isCompleto) {
      // Usar setTimeout para garantir que o estado do CPF seja atualizado primeiro
      setTimeout(() => {
        searchPersonByCPF(formattedValue);
      }, 100);
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
    
    // Validações
    if (!formData.nomerazao.trim()) {
      toast.error('Nome/Razão Social é obrigatório');
      return;
    }

    if (!selectedCidade) {
      toast.error('Cidade é obrigatória');
      return;
    }

    if (!selectedCondicaoPagamento) {
      toast.error('Condição de pagamento é obrigatória');
      return;
    }

    // Validar apelido/nome fantasia
    if (!formData.nomefantasia.trim()) {
      toast.error('Apelido/Nome Fantasia é obrigatório');
      return;
    }

    // Validar RG/inscrição estadual (apenas para pessoa física)
    if (formData.tipopessoa === 'F' && !formData.rg_inscricaoestadual.trim()) {
      toast.error('RG é obrigatório para pessoa física');
      return;
    }

    // Validar endereço
    if (!formData.endereco.trim()) {
      toast.error('Endereço é obrigatório');
      return;
    }

    // Validar número
    if (!formData.numero.trim()) {
      toast.error('Número é obrigatório');
      return;
    }

    // Validar bairro
    if (!formData.bairro.trim()) {
      toast.error('Bairro é obrigatório');
      return;
    }

    // Validar CEP
    if (!formData.cep.trim()) {
      toast.error('CEP é obrigatório');
      return;
    }

    // Validar telefone
    if (!formData.telefone.trim()) {
      toast.error('Telefone é obrigatório');
      return;
    }

    // Validar CPF/CNPJ apenas se for Brasil e se tiver valor
    if (selectedCidade && selectedCidade.nomepais?.toLowerCase() === 'brasil' && formData.cpfcnpj) {
      if (!validateCPFCNPJ(formData.cpfcnpj)) {
        toast.error(formData.tipopessoa === 'F' ? 'CPF inválido' : 'CNPJ inválido');
        return;
      }
    }

    try {
      const dataToSend = {
        ...formData,
        cpfcnpj: formData.cpfcnpj.replace(/\D/g, ''), // Remove formatação
        codcid: selectedCidade.codcid,
        codcondpgto: selectedCondicaoPagamento?.codcondpgto || null,
      };

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

      toast.success(selectedTransportadora ? 'Transportadora atualizada com sucesso!' : 'Transportadora criada com sucesso!');
      await fetchTransportadoras();
      handleCloseModal();
    } catch (error: any) {
      console.error('Erro ao salvar transportadora:', error);
      toast.error(error.message || 'Erro ao salvar transportadora');
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

      toast.success('Transportadora excluída com sucesso!');
      handleCloseDeleteModal();
      fetchTransportadoras();
    } catch (error) {
      console.error('Erro ao excluir transportadora:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao excluir transportadora');
    }
  };

  const handleCidadeSelect = (cidade: { 
    codcidade: number; 
    nomecidade: string; 
    nomeestado?: string; 
    nomepais?: string; 
  }) => {
    setSelectedCidade({
      codcid: cidade.codcidade,
      nomecidade: cidade.nomecidade,
      nomeestado: cidade.nomeestado || '',
      nomepais: cidade.nomepais || ''
    });
    setFormData(prev => ({
      ...prev,
      codcid: cidade.codcidade
    }));
  };

  const handleCondicaoPagamentoSelect = (condicao: { 
    codcondpgto: number; 
    descricao: string; 
  }) => {
    setSelectedCondicaoPagamento(condicao);
    setFormData(prev => ({
      ...prev,
      codcondpgto: condicao.codcondpgto
    }));
  };

  const columns = [
    { 
      key: 'codtrans', 
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
      render: (transportadora: Transportadora) => (
        <span className="text-xs sm:text-sm text-gray-900 truncate">
          {transportadora.nomecidade && transportadora.nomeestado 
            ? `${transportadora.nomecidade}/${transportadora.nomeestado}`
            : '-'
          }
        </span>
      )
    },
    { 
      key: 'telefone', 
      label: 'Telefone',
      render: (item: Transportadora) => (
        <span className="text-xs sm:text-sm text-gray-900 font-mono">
          {item.telefone || '-'}
        </span>
      )
    },
    { 
      key: 'descricao_condpgto', 
      label: 'Condição Pagamento',
      render: (item: Transportadora) => (
        <span className="text-xs sm:text-sm text-gray-900 truncate">
          {item.descricao_condpgto || '-'}
        </span>
      )
    },
    {
      key: 'situacao',
      label: 'Status',
      render: (item: Transportadora) => (
        <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${
          item.situacao ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
        }`}>
          <span className="hidden sm:inline">{item.situacao ? '🔴 Inativa' : '🟢 Ativa'}</span>
          <span className="sm:hidden">{item.situacao ? '🔴' : '🟢'}</span>
        </span>
      )
    }
  ];

  const filteredAndSortedTransportadoras = transportadoras
    .filter(transportadora => 
      transportadora.codtrans.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      transportadora.nomerazao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transportadora.nomefantasia.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transportadora.nomecidade?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transportadora.nomeestado?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transportadora.telefone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transportadora.descricao_condpgto?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const aValue = String(a[sortConfig.key] || '');
      const bValue = String(b[sortConfig.key] || '');
      return sortConfig.direction === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
  });

  return (
    <div className="px-2 sm:px-4 lg:px-6 xl:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-sm sm:text-base font-semibold leading-6 text-gray-900">Transportadoras</h1>
          <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-700">
            Lista de todas as transportadoras cadastradas no sistema.
          </p>
        </div>
        <div className="mt-3 sm:mt-4 sm:ml-8 lg:ml-16 sm:mt-0 sm:flex-none flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          <div className="relative">
            <Input
              type="text"
              placeholder="Buscar transportadora..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-[240px] lg:w-[320px] pl-10 text-sm"
            />
            <MagnifyingGlassIcon className="h-4 w-4 sm:h-5 sm:w-5 absolute left-3 top-2.5 text-gray-400" />
          </div>
          <Button
          onClick={() => handleOpenModal()}
            className="bg-violet-600 hover:bg-violet-500 text-sm sm:text-base px-3 sm:px-4 py-2"
        >
            <PlusIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Nova Transportadora</span>
            <span className="sm:hidden">Nova</span>
          </Button>
        </div>
      </div>

      <div className="mt-8 flow-root">
      <DataTable
          data={filteredAndSortedTransportadoras}
          columns={columns}
        onEdit={handleOpenModal}
        onDelete={handleOpenDeleteModal}
        actions={[
          {
            icon: EyeIcon,
            onClick: handleOpenDetailsModal,
            label: 'Ver Detalhes'
          },
          {
            icon: RectangleStackIcon,
            onClick: handleOpenVeiculosModal,
            label: 'Gerenciar Veículos'
          },
          {
            icon: UserGroupIcon,
            onClick: handleOpenFornecedorModal,
            label: 'Gerenciar Fornecedores'
          }
        ]}
        />
      </div>

      {/* Modal de Transportadora */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedTransportadora ? 'Editar Transportadora' : 'Nova Transportadora'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Primeira linha: Código, Tipo de Pessoa e Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="codtrans">Código</Label>
                  <Input
                    id="codtrans"
                  value={selectedTransportadora ? formData.codtrans : ''}
                    disabled
                    className="bg-gray-50"
                  placeholder={selectedTransportadora ? '' : 'Auto'}
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
                    setFormData({ ...formData, situacao: isAtivo ? undefined : new Date().toISOString() });
                  }}
                  disabled={!selectedTransportadora}
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
                  <Label htmlFor="endereco">Endereço *</Label>
                  <Input
                id="endereco"
                value={formData.endereco}
                onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                    placeholder="Rua, Avenida, etc."
                required
              />
            </div>
            <div>
                  <Label htmlFor="numero">Número *</Label>
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
                  <Label htmlFor="bairro">Bairro *</Label>
                  <Input
                id="bairro"
                value={formData.bairro}
                onChange={(e) => setFormData({ ...formData, bairro: e.target.value })}
                    placeholder="Nome do bairro"
                required
              />
            </div>
            <div>
                  <Label htmlFor="cep">CEP *</Label>
                  <Input
                id="cep"
                value={formData.cep}
                onChange={(e) => setFormData({ ...formData, cep: e.target.value.slice(0, 15) })}
                    placeholder="CEP / Código Postal"
                required
                maxLength={15}
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
                    {formData.tipopessoa === 'F' ? 'Apelido *' : 'Nome Fantasia *'}
                  </Label>
                  <Input
                    id="nomefantasia"
                    value={formData.nomefantasia}
                    onChange={(e) => setFormData({ ...formData, nomefantasia: e.target.value })}
                    placeholder={formData.tipopessoa === 'F' ? 'Digite o apelido' : 'Digite o nome fantasia'}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cpfcnpj">
                    {formData.tipopessoa === 'F' ? 'CPF' : 'CNPJ'}
                    {selectedCidade?.nomepais?.toLowerCase() === 'brasil' && ' *'}
                    {isSearchingCPF && <span className="text-blue-500 text-xs ml-2">Buscando...</span>}
                    {cpfSearched && !isSearchingCPF && !selectedTransportadora && (
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
                  {!selectedTransportadora && (
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
                    {formData.tipopessoa === 'F' ? 'RG *' : 'Inscrição Estadual'}
                  </Label>
                  <Input
                    id="rg_inscricaoestadual"
                    value={formData.rg_inscricaoestadual}
                    onChange={(e) => setFormData({ ...formData, rg_inscricaoestadual: e.target.value })}
                    placeholder={formData.tipopessoa === 'F' ? 'Digite o RG' : 'Digite a inscrição estadual'}
                    required={formData.tipopessoa === 'F'}
              />
            </div>
          </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                  <Label htmlFor="telefone">Telefone *</Label>
                  <Input
                id="telefone"
                value={formData.telefone}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9\-\+\(\)\s]/g, '');
                  setFormData({ ...formData, telefone: value.slice(0, 15) });
                }}
                    placeholder="(00) 00000-0000"
                required
                maxLength={15}
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
              <div>
                <Label>Condição de Pagamento *</Label>
                <CondicaoPagamentoSelect
                  value={selectedCondicaoPagamento}
                  onChange={handleCondicaoPagamentoSelect}
                  error={!selectedCondicaoPagamento ? 'Condição de pagamento é obrigatória' : undefined}
                />
                {!selectedCondicaoPagamento && (
                  <p className="text-xs text-red-600 mt-1">
                    ⚠️ Condição de pagamento é obrigatória para transportadoras
                  </p>
                )}
            </div>
          </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseModal}>
              Cancelar
              </Button>
              <Button type="submit" className="bg-violet-600 hover:bg-violet-500">
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
              Detalhes da Transportadora
            </DialogTitle>
          </DialogHeader>
          
          {selectedTransportadora && (
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
                    <span className="text-sm font-mono text-gray-900 bg-gray-50 px-2 py-1 rounded">{selectedTransportadora.codtrans}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">Status:</span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      selectedTransportadora.situacao ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {selectedTransportadora.situacao ? '🔴 Inativa' : '🟢 Ativa'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">Tipo de Pessoa:</span>
                    <span className="text-sm text-gray-900">
                      {selectedTransportadora.tipopessoa === 'F' ? 'Pessoa Física' : 'Pessoa Jurídica'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">
                      {selectedTransportadora.tipopessoa === 'F' ? 'Nome:' : 'Razão Social:'}
                    </span>
                    <span className="text-sm font-semibold text-gray-900 text-right max-w-[200px]">{selectedTransportadora.nomerazao}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">
                      {selectedTransportadora.tipopessoa === 'F' ? 'Apelido:' : 'Nome Fantasia:'}
                    </span>
                    <span className="text-sm text-gray-900 text-right max-w-[200px]">{selectedTransportadora.nomefantasia || '-'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">
                      {selectedTransportadora.tipopessoa === 'F' ? 'CPF:' : 'CNPJ:'}
                    </span>
                    <span className="text-sm font-mono text-gray-900 bg-gray-50 px-2 py-1 rounded">{selectedTransportadora.cpfcnpj || '-'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">
                      {selectedTransportadora.tipopessoa === 'F' ? 'RG:' : 'Inscrição Estadual:'}
                    </span>
                    <span className="text-sm text-gray-900">{selectedTransportadora.rg_inscricaoestadual || '-'}</span>
                  </div>
                </div>
              </div>

              {/* Informações Adicionais */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-6 bg-purple-600 rounded-full"></div>
                  <h3 className="text-lg font-semibold text-gray-900">Informações Adicionais</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">Condição de Pagamento:</span>
                    <span className="text-sm text-gray-900 text-right max-w-[200px]">
                      {selectedTransportadora.descricao_condpgto || 'Não definida'}
                    </span>
                  </div>
                  {selectedTransportadora.situacao && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm font-medium text-gray-600">Data de Desativação:</span>
                      <span className="text-sm font-mono text-gray-900 bg-gray-50 px-2 py-1 rounded">
                        {formatDateTime(selectedTransportadora.situacao)}
                      </span>
                  </div>
                  )}
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
                      {selectedTransportadora.endereco}, {selectedTransportadora.numero}
                      {selectedTransportadora.complemento && `, ${selectedTransportadora.complemento}`}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">Bairro:</span>
                    <span className="text-sm text-gray-900">{selectedTransportadora.bairro}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">CEP:</span>
                    <span className="text-sm font-mono text-gray-900 bg-gray-50 px-2 py-1 rounded">{selectedTransportadora.cep}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">Cidade/Estado:</span>
                    <span className="text-sm text-gray-900 text-right">
                      {selectedTransportadora.nomecidade}/{selectedTransportadora.nomeestado}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">País:</span>
                    <span className="text-sm text-gray-900">{selectedTransportadora.nomepais}</span>
                  </div>
                </div>
              </div>

              {/* Contato e Dados Comerciais */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-gray-200">
              {/* Contato */}
                <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-6 bg-green-600 rounded-full"></div>
                  <h3 className="text-lg font-semibold text-gray-900">Contato</h3>
                </div>
                  <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">Telefone:</span>
                      <span className="text-sm font-mono text-gray-900">{selectedTransportadora.telefone || '-'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">E-mail:</span>
                      <span className="text-sm text-gray-900 text-right max-w-[200px]">{selectedTransportadora.email || '-'}</span>
                  </div>
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
                      {formatDateTime(selectedTransportadora.data_criacao || '')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">Última Atualização:</span>
                    <span className="text-sm font-mono text-gray-900 bg-gray-50 px-2 py-1 rounded">
                      {formatDateTime(selectedTransportadora.data_alteracao || '')}
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
                handleOpenModal(selectedTransportadora!);
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
            Tem certeza que deseja excluir a transportadora "{selectedTransportadora?.nomerazao}"?
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

      {/* Modal de Veículos */}
      <Dialog open={isVeiculosModalOpen} onOpenChange={setIsVeiculosModalOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {`Gerenciar Veículos - ${selectedTransportadora?.nomerazao || ''}`}
            </DialogTitle>
          </DialogHeader>
      {selectedTransportadora && (
        <VeiculosForm
          transportadora={selectedTransportadora}
          onClose={handleCloseVeiculosModal}
        />
      )}
        </DialogContent>
      </Dialog>

      {/* Modal de Fornecedores */}
      <Dialog open={isFornecedorModalOpen} onOpenChange={setIsFornecedorModalOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {`Gerenciar Fornecedores - ${selectedTransportadora?.nomerazao || ''}`}
            </DialogTitle>
          </DialogHeader>
          {selectedTransportadora && (
            <TransportadoraFornecedorForm
              modo="transportadora"
              item={selectedTransportadora}
              onClose={handleCloseFornecedorModal}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 