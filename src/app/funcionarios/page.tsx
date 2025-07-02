'use client';

import { useState, useEffect } from 'react';
import { PlusIcon, MagnifyingGlassIcon, EyeIcon, PencilIcon } from '@heroicons/react/24/outline';
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
import { FuncaoSelect } from '@/components/forms/FuncaoSelect';

interface Funcionario {
  codfunc: number;
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
  departamento: string;
  data_admissao: string;
  salario: number;
  status: 'Ativo' | 'Inativo' | 'Afastado' | 'Demitido';
  codfuncao_fk: number;
  numero_cnh?: string;
  datavalidadecnh?: string;
  nome_funcao?: string;
  exige_cnh?: boolean;
  data_criacao?: string;
  data_alteracao?: string;
  situacao?: string;
}

export default function FuncionariosPage() {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [funcionarioToDelete, setFuncionarioToDelete] = useState<Funcionario | null>(null);
  const [selectedFuncionario, setSelectedFuncionario] = useState<Funcionario | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [funcionarioEditando, setFuncionarioEditando] = useState<Funcionario | null>(null);
  const [selectedCidade, setSelectedCidade] = useState<{ codcid: number; nomecidade: string; nomeestado: string; nomepais?: string } | null>(null);
  const [selectedFuncao, setSelectedFuncao] = useState<{ codfuncao: number; nome_funcao: string; exige_cnh: boolean } | null>(null);
  const [formData, setFormData] = useState<Omit<Funcionario, 'datacadastro' | 'codfunc' | 'codpessoa' | 'nome_funcao' | 'exige_cnh'>>({
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
    departamento: '',
    data_admissao: '',
    salario: 0,
    status: 'Ativo',
    codfuncao_fk: 0,
    numero_cnh: '',
    datavalidadecnh: '',
    situacao: undefined
  });
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Funcionario;
    direction: 'asc' | 'desc';
  }>({ key: 'nomerazao', direction: 'asc' });
  const [searchTerm, setSearchTerm] = useState('');
  const [showAlert, setShowAlert] = useState({ show: false, type: '', message: '' });
  const [isSearchingCPF, setIsSearchingCPF] = useState(false);
  const [cpfSearched, setCpfSearched] = useState(false);
  const [cpfFound, setCpfFound] = useState(false);

  useEffect(() => {
    fetchFuncionarios();
  }, []);

  const fetchFuncionarios = async () => {
    try {
      const response = await fetch('/api/funcionarios');
      const data = await response.json();
      setFuncionarios(data);
    } catch (error) {
      console.error('Erro ao carregar funcionários:', error);
      toast.error('Erro ao carregar funcionários');
    }
  };

  const handleSort = (key: keyof Funcionario) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleOpenDetailsModal = (funcionario: Funcionario) => {
    setSelectedFuncionario(funcionario);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedFuncionario(null);
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const handleEdit = (funcionario: Funcionario) => {
    setIsEditing(true);
    setFuncionarioEditando(funcionario);
      setSelectedCidade({
        codcid: funcionario.codcid,
        nomecidade: funcionario.nomecidade || '',
        nomeestado: funcionario.nomeestado || '',
        nomepais: funcionario.nomepais || ''
      });
      setSelectedFuncao({
        codfuncao: funcionario.codfuncao_fk,
        nome_funcao: funcionario.nome_funcao || '',
        exige_cnh: funcionario.exige_cnh || false
      });
      setFormData({
        tipopessoa: funcionario.tipopessoa,
        nomerazao: funcionario.nomerazao,
        nomefantasia: funcionario.nomefantasia,
        cpfcnpj: funcionario.cpfcnpj,
        rg_inscricaoestadual: funcionario.rg_inscricaoestadual,
        endereco: funcionario.endereco,
        numero: funcionario.numero,
        complemento: funcionario.complemento || '',
        bairro: funcionario.bairro,
        cep: funcionario.cep,
        codcid: funcionario.codcid,
        telefone: funcionario.telefone,
        email: funcionario.email,
        departamento: funcionario.departamento,
        data_admissao: funcionario.data_admissao ? funcionario.data_admissao.split('T')[0] : '',
        salario: funcionario.salario,
        status: funcionario.status,
        codfuncao_fk: funcionario.codfuncao_fk,
      numero_cnh: funcionario.numero_cnh || '',
      datavalidadecnh: funcionario.datavalidadecnh ? funcionario.datavalidadecnh.split('T')[0] : '',
      situacao: funcionario.situacao
      });
    setIsFormOpen(true);
  };

  const handleNewFuncionario = () => {
    setIsEditing(false);
    setFuncionarioEditando(null);
    setSelectedCidade(null);
    setSelectedFuncao(null);
    setIsSearchingCPF(false);
    setCpfSearched(false);
    setCpfFound(false);
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
      departamento: '',
      data_admissao: '',
      salario: 0,
      status: 'Ativo',
      codfuncao_fk: 0,
      numero_cnh: '',
      datavalidadecnh: '',
      situacao: undefined
    });
    setIsFormOpen(true);
  };

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    
    // Funcionários sempre usam CPF (Pessoa Física)
    return numbers
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
      .slice(0, 14);
  };

  const validateCPF = (cpf: string) => {
    const numbers = cpf.replace(/\D/g, '');
    
    if (selectedCidade?.nomepais && selectedCidade.nomepais.toLowerCase() !== 'brasil') {
      return true;
    }
    
    if (numbers.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(numbers)) return false;
    
    let soma = 0;
    for (let i = 0; i < 9; i++) {
      soma += parseInt(numbers.charAt(i)) * (10 - i);
    }
    let resto = 11 - (soma % 11);
    let digito1 = resto > 9 ? 0 : resto;
    
    soma = 0;
    for (let i = 0; i < 10; i++) {
      soma += parseInt(numbers.charAt(i)) * (11 - i);
    }
    resto = 11 - (soma % 11);
    let digito2 = resto > 9 ? 0 : resto;
    
    return digito1 === parseInt(numbers.charAt(9)) && digito2 === parseInt(numbers.charAt(10));
  };

  const validateCNPJ = (cnpj: string) => {
    const numbers = cnpj.replace(/\D/g, '');
    
    if (selectedCidade?.nomepais && selectedCidade.nomepais.toLowerCase() !== 'brasil') {
      return true;
    }

      if (numbers.length !== 14) return false;
      if (/^(\d)\1{13}$/.test(numbers)) return false;

      let soma = 0;
      let peso = 5;
      for (let i = 0; i < 12; i++) {
        soma += parseInt(numbers.charAt(i)) * peso;
        peso = peso === 2 ? 9 : peso - 1;
      }
      let resto = soma % 11;
      let digito1 = resto < 2 ? 0 : 11 - resto;

      soma = 0;
      peso = 6;
      for (let i = 0; i < 13; i++) {
        soma += parseInt(numbers.charAt(i)) * peso;
        peso = peso === 2 ? 9 : peso - 1;
      }
      resto = soma % 11;
      let digito2 = resto < 2 ? 0 : 11 - resto;

      return digito1 === parseInt(numbers.charAt(12)) && digito2 === parseInt(numbers.charAt(13));
  };

  const validateCPFOnly = (cpf: string) => {
    if (!cpf) return true;
    // Funcionários sempre usam CPF (Pessoa Física)
    return validateCPF(cpf);
  };

  // Função para buscar pessoa por CPF/CNPJ
  const searchPersonByCPF = async (cpfcnpj: string) => {
    if (!cpfcnpj || cpfcnpj.length < 11) return;
    
    console.log('🔍 Iniciando busca por CPF/CNPJ:', cpfcnpj);
    setIsSearchingCPF(true);
    try {
      const url = `/api/funcionarios?cpfcnpj=${cpfcnpj}`;
      console.log('📡 URL da requisição:', url);
      
      const response = await fetch(url);
      console.log('📨 Response status:', response.status);
      
      const result = await response.json();
      console.log('📋 Resultado da API:', result);
      
      if (result.exists) {
        console.log('✅ Pessoa encontrada! Preenchendo formulário...');
        // Preencher formulário com dados existentes
        const pessoa = result.data;
        console.log('👤 Dados da pessoa:', pessoa);
        
        setFormData(prevData => {
          // Preservar o CPF atual que foi digitado
          const cpfAtual = prevData.cpfcnpj;
          console.log('🔄 Preservando CPF atual:', cpfAtual);
          
          return {
            ...prevData,
            tipopessoa: pessoa.tipopessoa,
            nomerazao: pessoa.nomerazao,
            nomefantasia: pessoa.nomefantasia || '',
            rg_inscricaoestadual: pessoa.rg_inscricaoestadual || '',
            endereco: pessoa.endereco || '',
            numero: pessoa.numero || '',
            complemento: pessoa.complemento || '',
            bairro: pessoa.bairro || '',
            cep: pessoa.cep || '',
            codcid: pessoa.codcid,
            telefone: pessoa.telefone || '',
            email: pessoa.email || '',
            cpfcnpj: cpfAtual // Manter o CPF formatado que foi digitado
          };
        });
        
        if (pessoa.codcid) {
          console.log('🏙️ Definindo cidade:', {
            codcid: pessoa.codcid,
            nomecidade: pessoa.nomecidade,
            nomeestado: pessoa.nomeestado,
            nomepais: pessoa.nomepais
          });
          setSelectedCidade({
            codcid: pessoa.codcid,
            nomecidade: pessoa.nomecidade || '',
            nomeestado: pessoa.nomeestado || '',
            nomepais: pessoa.nomepais || ''
          });
        }
        
        toast.success('Dados encontrados! Verifique e atualize se necessário.');
        console.log('🎉 Formulário preenchido com sucesso!');
        setCpfFound(true);
      } else {
        console.log('❌ Pessoa não encontrada');
        setCpfFound(false);
      }
      setCpfSearched(true);
    } catch (error) {
      console.error('💥 Erro ao buscar CPF/CNPJ:', error);
      toast.error('Erro ao buscar dados por CPF/CNPJ');
    } finally {
      setIsSearchingCPF(false);
      console.log('🏁 Busca finalizada');
    }
  };

  // Função para verificar se deve buscar automaticamente
  const handleCPFChange = (value: string) => {
    const formatted = formatCPF(value);
    
    console.log('CPF Changed:', {
      formatted,
      isEditing: !!isEditing
    });
    
    // Atualizar o CPF primeiro
    setFormData(prev => ({ ...prev, cpfcnpj: formatted }));
    
    // Se está editando, não buscar automaticamente
    if (isEditing) {
      console.log('Não buscando - está editando');
      return;
    }
    
    // Reset do estado de busca quando CPF muda
    if (cpfSearched) {
      setCpfSearched(false);
      setCpfFound(false);
    }
    
    // Buscar automaticamente quando CPF estiver completo (11 dígitos)
    const numbers = formatted.replace(/\D/g, '');
    console.log('Numbers:', numbers, 'Length:', numbers.length);
    
    if (numbers.length === 11) {
      console.log('Disparando busca para CPF:', numbers);
      // Usar setTimeout para garantir que o estado do CPF seja atualizado primeiro
      setTimeout(() => {
        searchPersonByCPF(numbers);
      }, 100);
    } else {
      console.log('Não buscando - CPF incompleto');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nomerazao.trim()) {
      toast.error('Nome/Razão Social é obrigatório');
      return;
    }

    if (!selectedCidade || !selectedCidade.codcid) {
      toast.error('Por favor, selecione uma cidade válida.');
      return;
    }

    if (!selectedFuncao || !selectedFuncao.codfuncao) {
      toast.error('Por favor, selecione uma função válida.');
      return;
    }

    if (!formData.departamento.trim()) {
      toast.error('Departamento é obrigatório');
      return;
    }

    if (!formData.data_admissao) {
      toast.error('Data de admissão é obrigatória');
      return;
    }

    if (formData.salario <= 0) {
      toast.error('Salário deve ser maior que zero');
      return;
    }

    // Validação de CPF para funcionários (sempre Pessoa Física)
    if (formData.cpfcnpj) {
      const cpfNumbers = formData.cpfcnpj.replace(/\D/g, '');
      if (cpfNumbers.length !== 11 || !validateCPF(cpfNumbers)) {
        toast.error('CPF inválido. Verifique o número digitado.');
        return;
      }
    }

    if (selectedFuncao.exige_cnh && !formData.numero_cnh?.trim()) {
      toast.error('Esta função exige CNH. Por favor, informe o número da CNH');
      return;
    }

    if (selectedFuncao.exige_cnh && !formData.datavalidadecnh?.trim()) {
      toast.error('Esta função exige CNH. Por favor, informe a data de validade da CNH');
      return;
    }

    // Validar se a CNH não está vencida (se a função exige CNH)
    if (selectedFuncao.exige_cnh && formData.datavalidadecnh) {
      const hoje = new Date();
      const validadeCnh = new Date(formData.datavalidadecnh);
      if (validadeCnh < hoje) {
        toast.error('A CNH está vencida. Por favor, renove antes de prosseguir');
        return;
      }
    }

      const dataToSend = {
        ...formData,
      codcid: selectedCidade.codcid,
      codfuncao_fk: selectedFuncao.codfuncao,
      cpfcnpj: formData.cpfcnpj ? formData.cpfcnpj.replace(/\D/g, '') : '',
      cep: formData.cep,
      cidade_id: selectedCidade,
      numero_cnh: formData.numero_cnh ? formData.numero_cnh.replace(/\D/g, '') : '',
      datavalidadecnh: formData.datavalidadecnh || null
    };

      if (isEditing && funcionarioEditando) {
      dataToSend.codfunc = funcionarioEditando.codfunc;
      dataToSend.codpessoa = funcionarioEditando.codpessoa;
    }

    try {
      const response = await fetch('/api/funcionarios', {
        method: isEditing ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(dataToSend),
        });

      const data = await response.json();

      if (response.ok) {
        toast.success(isEditing ? 'Funcionário atualizado com sucesso!' : 'Funcionário cadastrado com sucesso!');
        fetchFuncionarios();
        setIsFormOpen(false);
        setIsEditing(false);
        setFuncionarioEditando(null);
      } else {
        toast.error(data.error || 'Erro ao salvar funcionário');
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao salvar funcionário');
    }
  };

  const handleDelete = async () => {
    if (!funcionarioToDelete) return;
    try {
      const response = await fetch(`/api/funcionarios?codfunc=${funcionarioToDelete.codfunc}&force=true`, {
          method: 'DELETE',
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao excluir funcionário');
      }
      setIsDeleteDialogOpen(false);
      fetchFuncionarios();
      toast.success('Funcionário excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir funcionário:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao excluir funcionário');
    }
  };

  const handleCidadeSelect = (cidade: any) => {
    setSelectedCidade(cidade);
    setFormData(prev => ({ ...prev, codcid: cidade.codcid }));
  };

  const handleFuncaoSelect = (funcao: any) => {
    setSelectedFuncao(funcao);
    setFormData(prev => ({
      ...prev,
      codfuncao_fk: funcao.codfuncao,
      numero_cnh: funcao.exige_cnh ? prev.numero_cnh : '' 
    }));
  };

  const filteredAndSortedFuncionarios = funcionarios
    .filter(funcionario => 
      funcionario.codfunc.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      funcionario.nomerazao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      funcionario.departamento.toLowerCase().includes(searchTerm.toLowerCase()) ||
      funcionario.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (funcionario.nome_funcao || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (funcionario.nomecidade || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (funcionario.nomeestado || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (funcionario.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const aValue = String(a[sortConfig.key] || '');
      const bValue = String(b[sortConfig.key] || '');
      return sortConfig.direction === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
  });

  const columns = [
    { key: 'codfunc', label: 'Código' },
    { key: 'nomerazao', label: 'Nome/Razão Social' },
    { 
      key: 'nomefantasia', 
      label: 'Apelido/Nome Fantasia',
      render: (item: Funcionario) => (
        <span className="text-xs sm:text-sm truncate">{item.nomefantasia || '-'}</span>
      )
    },
    { key: 'departamento', label: 'Departamento' },
    { key: 'data_admissao', label: 'Admissão', render: (item: Funcionario) => formatDate(item.data_admissao) },
    {
      key: 'nomecidade', 
      label: 'Cidade',
      render: (funcionario: Funcionario) => (
        <span className="text-sm text-gray-900">
          {funcionario.nomecidade && funcionario.nomeestado 
            ? `${funcionario.nomecidade}/${funcionario.nomeestado}`
            : '-'
          }
        </span>
      )
    },
    { key: 'nome_funcao', label: 'Função' },
    { 
      key: 'situacao',
      label: 'Status',
      render: (item: Funcionario) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          item.situacao ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
        }`}>
          {item.situacao ? '🔴 Inativo' : '🟢 Ativo'}
        </span>
      )
    }
  ];

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold leading-6 text-gray-900">Funcionários</h1>
          <p className="mt-2 text-sm text-gray-700">
            Lista de todos os funcionários cadastrados no sistema.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none flex items-center gap-3">
          <div className="relative">
            <Input
              type="text"
              placeholder="Buscar funcionário..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-[320px] pl-10"
            />
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-2.5 text-gray-400" />
          </div>
          <Button
            onClick={handleNewFuncionario}
            className="bg-violet-600 hover:bg-violet-500"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Novo Funcionário
          </Button>
        </div>
      </div>

      <div className="mt-6">
        <DataTable
          data={filteredAndSortedFuncionarios}
          columns={columns}
          actions={[
            {
              icon: EyeIcon,
              onClick: handleOpenDetailsModal,
              label: 'Ver Detalhes'
            }
          ]}
          onEdit={handleEdit}
          onDelete={(funcionario) => {
            setFuncionarioToDelete(funcionario);
            setIsDeleteDialogOpen(true);
          }}
        />
      </div>

      {/* Modal de Cadastro/Edição */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Editar Funcionário' : 'Novo Funcionário'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Primeira linha: Código, Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="codfunc">Código</Label>
                  <Input
                    id="codfunc"
                  value={funcionarioEditando ? funcionarioEditando.codfunc : ''}
                    disabled
                    className="bg-gray-50"
                  placeholder={funcionarioEditando ? '' : 'Auto'}
                  />
                </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  value={formData.situacao ? 'INATIVO' : 'ATIVO'}
                  onChange={(e) => {
                    const isInativo = e.target.value === 'INATIVO';
                    setFormData(prev => ({
                      ...prev,
                      situacao: isInativo ? new Date().toISOString() : undefined
                    }));
                  }}
                  disabled={!funcionarioEditando}
                  className={`flex h-9 w-full rounded-md border border-input px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 ${!funcionarioEditando ? 'bg-gray-50' : 'bg-transparent'}`}
                >
                  <option value="ATIVO">🟢 Ativo</option>
                  <option value="INATIVO">🔴 Inativo</option>
                </select>
              </div>
            </div>

            {/* Endereço */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Endereço</h3>
              <div>
                <Label>Cidade *</Label>
              <CidadeSelect
                value={selectedCidade}
                  onChange={handleCidadeSelect}
                />
                {selectedCidade?.nomepais?.toLowerCase() === 'brasil' && (
                  <p className="text-xs text-amber-600 mt-1">
                    ⚠️ CPF obrigatório para funcionários no Brasil
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
                />
              </div>
              <div>
                <Label htmlFor="numero">Número</Label>
                <Input
                  id="numero"
                  value={formData.numero}
                  onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                    placeholder="123"
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
                />
              </div>
              <div>
                <Label htmlFor="cep">CEP</Label>
                <Input
                  id="cep"
                  value={formData.cep}
                  onChange={(e) => setFormData({ ...formData, cep: e.target.value })}
                    placeholder="CEP / Código Postal"
                    maxLength={9}
                  />
                </div>
              </div>
            </div>

            {/* Dados Pessoais */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Dados Pessoais</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nomerazao">Nome *</Label>
                  <Input
                    id="nomerazao"
                    value={formData.nomerazao}
                    onChange={(e) => setFormData({ ...formData, nomerazao: e.target.value })}
                    placeholder="Digite o nome completo"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="nomefantasia">Apelido</Label>
                  <Input
                    id="nomefantasia"
                    value={formData.nomefantasia}
                    onChange={(e) => setFormData({ ...formData, nomefantasia: e.target.value })}
                    placeholder="Digite o apelido"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cpfcnpj">
                    CPF
                    {selectedCidade?.nomepais?.toLowerCase() === 'brasil' && ' *'}
                    {isSearchingCPF && <span className="text-blue-500 text-xs ml-2">Buscando...</span>}
                    {cpfSearched && !isSearchingCPF && !isEditing && (
                      <span className="text-green-500 text-xs ml-2">✓ Verificado</span>
                    )}
                  </Label>
                  <div className="relative">
                    <Input
                      id="cpfcnpj"
                      value={formData.cpfcnpj}
                      onChange={(e) => handleCPFChange(e.target.value)}
                      placeholder="000.000.000-00"
                      maxLength={14}
                      className={isSearchingCPF ? 'pr-8' : ''}
                      required={selectedCidade?.nomepais?.toLowerCase() === 'brasil'}
                    />
                    {isSearchingCPF && (
                      <div className="absolute right-2 top-2">
                        <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                      </div>
                    )}
                  </div>
                  {!isEditing && (
                    <p className="text-xs text-gray-500 mt-1">
                      {isSearchingCPF ? (
                        <span className="text-blue-600">🔍 Buscando CPF...</span>
                      ) : cpfSearched && cpfFound ? (
                        <span className="text-green-600">✅ CPF encontrado! Dados preenchidos automaticamente</span>
                      ) : cpfSearched && !cpfFound ? (
                        <span className="text-orange-600">ℹ️ CPF não encontrado. Dados serão criados como novo</span>
                      ) : (
                        <span>💡 Se o CPF já estiver cadastrado, seus dados serão preenchidos automaticamente</span>
                      )}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="rg_inscricaoestadual">RG</Label>
                  <Input
                    id="rg_inscricaoestadual"
                    value={formData.rg_inscricaoestadual}
                    onChange={(e) => setFormData({ ...formData, rg_inscricaoestadual: e.target.value })}
                    placeholder="Digite o RG"
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

            {/* Dados Profissionais */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Dados Profissionais</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                  <Label htmlFor="departamento">Departamento *</Label>
                <Input
                  id="departamento"
                  value={formData.departamento}
                  onChange={(e) => setFormData({ ...formData, departamento: e.target.value })}
                    placeholder="Digite o departamento"
                    maxLength={50}
                  required
                />
              </div>
                <div>
                  <Label>Função *</Label>
                  <FuncaoSelect
                    value={selectedFuncao}
                    onSelect={handleFuncaoSelect}
                    placeholder="Selecione uma função"
                  />
                </div>
            </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                  <Label htmlFor="data_admissao">Data de Admissão *</Label>
                <Input
                  id="data_admissao"
                  type="date"
                  value={formData.data_admissao}
                  onChange={(e) => setFormData({ ...formData, data_admissao: e.target.value })}
                  required
                />
              </div>
              <div>
                  <Label htmlFor="salario">Salário *</Label>
                <Input
                  id="salario"
                  type="number"
                    min="0"
                    step="0.01"
                  value={formData.salario}
                    onChange={(e) => setFormData({ ...formData, salario: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                  required
                />
                </div>
              </div>

              {selectedFuncao?.exige_cnh && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="numero_cnh">Número da CNH *</Label>
                  <Input
                    id="numero_cnh"
                    value={formData.numero_cnh}
                    onChange={(e) => setFormData({ ...formData, numero_cnh: e.target.value })}
                    placeholder="Digite o número da CNH"
                    required={selectedFuncao?.exige_cnh}
                  />
                  </div>
                  <div>
                    <Label htmlFor="datavalidadecnh">Data de Validade da CNH *</Label>
                    <Input
                      id="datavalidadecnh"
                      type="date"
                      value={formData.datavalidadecnh}
                      onChange={(e) => setFormData({ ...formData, datavalidadecnh: e.target.value })}
                      required={selectedFuncao?.exige_cnh}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm text-blue-600">
                    Esta função exige CNH
                  </p>
                  </div>
            </div>
              )}
          </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
              Cancelar
            </Button>
              <Button type="submit" className="bg-violet-600 hover:bg-violet-500">
                {isEditing ? 'Atualizar' : 'Salvar'}
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
              Detalhes do Funcionário
            </DialogTitle>
          </DialogHeader>
          
          {selectedFuncionario && (
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
                    <span className="text-sm font-mono text-gray-900 bg-gray-50 px-2 py-1 rounded">{selectedFuncionario.codfunc}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">Status:</span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      selectedFuncionario?.situacao ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {selectedFuncionario?.situacao ? '🔴 Inativo' : '🟢 Ativo'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">Nome:</span>
                    <span className="text-sm font-semibold text-gray-900 text-right max-w-[200px]">{selectedFuncionario.nomerazao}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">Apelido:</span>
                    <span className="text-sm text-gray-900 text-right max-w-[200px]">{selectedFuncionario.nomefantasia || '-'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">CPF:</span>
                    <span className="text-sm font-mono text-gray-900 bg-gray-50 px-2 py-1 rounded">{selectedFuncionario.cpfcnpj}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">RG:</span>
                    <span className="text-sm text-gray-900">{selectedFuncionario.rg_inscricaoestadual || '-'}</span>
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
                      {selectedFuncionario.endereco}, {selectedFuncionario.numero}
                      {selectedFuncionario.complemento && `, ${selectedFuncionario.complemento}`}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">Bairro:</span>
                    <span className="text-sm text-gray-900">{selectedFuncionario.bairro}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">CEP:</span>
                    <span className="text-sm font-mono text-gray-900 bg-gray-50 px-2 py-1 rounded">{selectedFuncionario.cep}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">Cidade/Estado:</span>
                    <span className="text-sm text-gray-900 text-right">
                      {selectedFuncionario.nomecidade}/{selectedFuncionario.nomeestado}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">País:</span>
                    <span className="text-sm text-gray-900">{selectedFuncionario.nomepais}</span>
                  </div>
                </div>
              </div>

              {/* Contato e Dados Profissionais */}
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
                      <span className="text-sm font-mono text-gray-900">{selectedFuncionario.telefone}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm font-medium text-gray-600">E-mail:</span>
                      <span className="text-sm text-gray-900 text-right max-w-[200px]">{selectedFuncionario.email || '-'}</span>
                    </div>
                  </div>
                </div>

                {/* Dados Profissionais */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1 h-6 bg-amber-600 rounded-full"></div>
                    <h3 className="text-lg font-semibold text-gray-900">Dados Profissionais</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm font-medium text-gray-600">Departamento:</span>
                      <span className="text-sm text-gray-900 text-right max-w-[200px]">{selectedFuncionario.departamento}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm font-medium text-gray-600">Função:</span>
                      <span className="text-sm text-gray-900 text-right max-w-[200px]">{selectedFuncionario.nome_funcao}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm font-medium text-gray-600">Data de Admissão:</span>
                      <span className="text-sm font-mono text-gray-900 bg-gray-50 px-2 py-1 rounded">
                        {formatDate(selectedFuncionario.data_admissao)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm font-medium text-gray-600">Salário:</span>
                      <span className="text-sm font-mono text-gray-900 bg-gray-50 px-2 py-1 rounded">
                        {formatCurrency(selectedFuncionario.salario)}
                      </span>
                    </div>
                    {selectedFuncionario.numero_cnh && (
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm font-medium text-gray-600">CNH:</span>
                        <span className="text-sm font-mono text-gray-900 bg-gray-50 px-2 py-1 rounded">
                          {selectedFuncionario.numero_cnh}
                        </span>
                      </div>
                    )}
                    {selectedFuncionario.datavalidadecnh && (
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm font-medium text-gray-600">Validade da CNH:</span>
                        <span className="text-sm font-mono text-gray-900 bg-gray-50 px-2 py-1 rounded">
                          {formatDate(selectedFuncionario.datavalidadecnh)}
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
                      {formatDateTime(selectedFuncionario.data_criacao || selectedFuncionario.datacadastro)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">Última Atualização:</span>
                    <span className="text-sm font-mono text-gray-900 bg-gray-50 px-2 py-1 rounded">
                      {formatDateTime(selectedFuncionario.data_alteracao || '')}
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
                handleEdit(selectedFuncionario!);
              }}
              className="bg-violet-600 hover:bg-violet-500"
            >
              <PencilIcon className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Confirmação de Exclusão */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Tem certeza que deseja excluir o funcionário <strong>{funcionarioToDelete?.nomerazao}</strong>?</p>
            <p className="text-sm text-gray-600 mt-2">
              Esta ação não poderá ser desfeita.
            </p>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
            >
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