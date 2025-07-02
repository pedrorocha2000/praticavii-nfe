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
import { FormaPagamentoSelect } from "@/components/forms/FormaPagamentoSelect";
import { toast } from "sonner";

interface FormaPagamento {
  codformapgto: number;
  descricao: string;
}

interface Parcela {
  numparc: number;
  codformapgto: number;
  descricao_forma?: string;
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
  data_criacao?: string;
  data_alteracao?: string;
  situacao?: string;
}

export default function CondicoesPagamentoPage() {
  const [condicoesPagamento, setCondicoesPagamento] = useState<CondicaoPagamento[]>([]);
  const [formasPagamento, setFormasPagamento] = useState<FormaPagamento[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedCondicaoPagamento, setSelectedCondicaoPagamento] = useState<CondicaoPagamento | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    descricao: '',
    juros_perc: 0,
    multa_perc: 0,
    desconto_perc: 0,
    parcelas: [{ numparc: 1, codformapgto: 0, dias: 0, percentual: 100 }] as Parcela[],
    situacao: undefined as string | undefined
  });
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

  const handleOpenModal = (condicao?: CondicaoPagamento) => {
    if (condicao) {
      setSelectedCondicaoPagamento(condicao);
      setFormData({
        descricao: condicao.descricao,
        juros_perc: condicao.juros_perc || 0,
        multa_perc: condicao.multa_perc || 0,
        desconto_perc: condicao.desconto_perc || 0,
        parcelas: condicao.parcelas || [{ numparc: 1, codformapgto: 0, dias: 0, percentual: 100 }],
        situacao: condicao.situacao
      });
    } else {
      setSelectedCondicaoPagamento(null);
      setFormData({
        descricao: '',
        juros_perc: 0,
        multa_perc: 0,
        desconto_perc: 0,
        parcelas: [{ numparc: 1, codformapgto: 0, dias: 0, percentual: 100 }],
        situacao: undefined
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCondicaoPagamento(null);
    setFormData({
      descricao: '',
      juros_perc: 0,
      multa_perc: 0,
      desconto_perc: 0,
      parcelas: [{ numparc: 1, codformapgto: 0, dias: 0, percentual: 100 }],
      situacao: undefined
    });
  };

  const handleOpenDeleteModal = (condicao: CondicaoPagamento) => {
    setSelectedCondicaoPagamento(condicao);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedCondicaoPagamento(null);
  };

  const handleOpenDetailsModal = (condicao: CondicaoPagamento) => {
    setSelectedCondicaoPagamento(condicao);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedCondicaoPagamento(null);
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
      style: 'percent',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value / 100);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.descricao.trim()) {
      toast.error('Descrição é obrigatória');
      return;
    }

    if (formData.parcelas.length === 0) {
      toast.error('Pelo menos uma parcela é obrigatória');
      return;
    }

    // Validar se todas as parcelas têm forma de pagamento
    const parcelasIncompletas = formData.parcelas.some(p => !p.codformapgto || p.dias < 0 || p.percentual <= 0);
    if (parcelasIncompletas) {
      toast.error('Todas as parcelas devem ter forma de pagamento, dias e percentual válidos');
      return;
    }

    // Validar soma dos percentuais = 100%
    const totalPercentual = formData.parcelas.reduce((total, parcela) => total + parcela.percentual, 0);
    if (Math.abs(totalPercentual - 100) > 0.01) {
      toast.error('A soma dos percentuais das parcelas deve ser 100%');
      return;
    }

    try {
      const url = '/api/cond_pgto';
      const method = selectedCondicaoPagamento ? 'PUT' : 'POST';

      const body = selectedCondicaoPagamento 
        ? {
            codcondpgto: selectedCondicaoPagamento.codcondpgto,
            descricao: formData.descricao.trim(),
            juros_perc: formData.juros_perc,
            multa_perc: formData.multa_perc,
            desconto_perc: formData.desconto_perc,
            parcelas: formData.parcelas,
            situacao: formData.situacao
          }
        : {
            descricao: formData.descricao.trim(),
            juros_perc: formData.juros_perc,
            multa_perc: formData.multa_perc,
            desconto_perc: formData.desconto_perc,
            parcelas: formData.parcelas,
            situacao: formData.situacao
          };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao salvar condição de pagamento');
      }

      handleCloseModal();
      fetchCondicoesPagamento();
      toast.success(selectedCondicaoPagamento ? 'Condição de pagamento atualizada com sucesso!' : 'Condição de pagamento criada com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar condição de pagamento:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao salvar condição de pagamento');
    }
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

      handleCloseDeleteModal();
      fetchCondicoesPagamento();
      toast.success('Condição de pagamento excluída com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir condição de pagamento:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao excluir condição de pagamento');
    }
  };

  const handleSort = (key: keyof CondicaoPagamento) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleAddParcela = () => {
    const newParcela: Parcela = {
      numparc: formData.parcelas.length + 1,
      codformapgto: 0,
      dias: 0,
      percentual: 0
    };
    setFormData(prev => ({
      ...prev,
      parcelas: [...prev.parcelas, newParcela]
    }));
  };

  const handleRemoveParcela = (index: number) => {
    if (formData.parcelas.length <= 1) {
      toast.error('Pelo menos uma parcela é obrigatória');
      return;
    }
    setFormData(prev => ({
      ...prev,
      parcelas: prev.parcelas.filter((_, i) => i !== index).map((parcela, i) => ({
        ...parcela,
        numparc: i + 1
      }))
    }));
  };

  const handleParcelaChange = (index: number, field: keyof Parcela, value: any) => {
    setFormData(prev => ({
      ...prev,
      parcelas: prev.parcelas.map((parcela, i) => 
        i === index ? { ...parcela, [field]: value } : parcela
      )
    }));
  };

  const handleFormaPagamentoChange = (index: number, formaPagamento: FormaPagamento | null) => {
    if (formaPagamento) {
      handleParcelaChange(index, 'codformapgto', formaPagamento.codformapgto);
    }
  };

  const getFormaPagamentoDescricao = (codformapgto: number) => {
    return formasPagamento.find(forma => forma.codformapgto === codformapgto)?.descricao || '';
  };

  const formatParcelasInfo = (parcelas: Parcela[]) => {
    if (!parcelas || parcelas.length === 0) return '';
    return parcelas.map(parcela => 
      `${parcela.percentual}% em ${parcela.dias} dias (${parcela.descricao_forma || getFormaPagamentoDescricao(parcela.codformapgto)})`
    ).join(' + ');
  };

  const formatPercentuais = (condicao: CondicaoPagamento) => {
    const parts = [];
    if (condicao.juros_perc > 0) parts.push(`J: ${condicao.juros_perc}%`);
    if (condicao.multa_perc > 0) parts.push(`M: ${condicao.multa_perc}%`);
    if (condicao.desconto_perc > 0) parts.push(`D: ${condicao.desconto_perc}%`);
    return parts.length > 0 ? parts.join(' | ') : '-';
  };

  const sortedCondicoesPagamento = [...condicoesPagamento]
    .filter(condicao => 
      condicao.codcondpgto.toString().includes(searchTerm.toLowerCase()) ||
      condicao.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      formatParcelasInfo(condicao.parcelas).toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
    if (sortConfig.direction === 'asc') {
      return a[sortConfig.key] < b[sortConfig.key] ? -1 : 1;
    }
    return a[sortConfig.key] < b[sortConfig.key] ? 1 : -1;
  });

  const tableData = sortedCondicoesPagamento.map(condicao => ({
    ...condicao,
    parcelasInfo: formatParcelasInfo(condicao.parcelas),
    percentuaisInfo: formatPercentuais(condicao)
  }));

  const columns = [
    { key: 'codcondpgto', label: 'Código' },
    { key: 'descricao', label: 'Descrição' },
    { key: 'parcelasInfo', label: 'Parcelas' },
    { key: 'percentuaisInfo', label: 'J/M/D' },
    {
      key: 'situacao',
      label: 'Status',
      render: (condicao: CondicaoPagamento) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          condicao.situacao ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
        }`}>
          {condicao.situacao ? '🔴 Inativa' : '🟢 Ativa'}
        </span>
      )
    }
  ];

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold leading-6 text-gray-900">Condições de Pagamento</h1>
          <p className="mt-2 text-sm text-gray-700">
            Lista de todas as condições de pagamento cadastradas no sistema.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none flex items-center gap-3">
          <div className="relative">
            <Input
              type="text"
              placeholder="Buscar condições..."
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
          Nova Condição de Pagamento
          </Button>
        </div>
      </div>

      <div className="mt-6">
      <DataTable
        data={tableData}
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
          sortKey={sortConfig.key}
          sortDirection={sortConfig.direction}
        onSort={handleSort}
        />
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedCondicaoPagamento ? 'Editar Condição de Pagamento' : 'Nova Condição de Pagamento'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="codigo">Código</Label>
                <Input
                  id="codigo"
                  value={selectedCondicaoPagamento ? selectedCondicaoPagamento.codcondpgto : ''}
                  disabled
                  className="bg-gray-50"
                  placeholder={selectedCondicaoPagamento ? '' : 'Auto'}
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
                  disabled={!selectedCondicaoPagamento}
                  className={`flex h-9 w-full rounded-md border border-input px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 ${
                    !selectedCondicaoPagamento ? 'bg-gray-50' : 'bg-transparent'
                  }`}
                >
                  <option value="ATIVO">🟢 Ativo</option>
                  <option value="INATIVO">🔴 Inativo</option>
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="descricao">Descrição *</Label>
              <Input
                id="descricao"
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                placeholder="Digite a descrição da condição de pagamento"
                required
                maxLength={50}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="juros_perc">Juros (%)</Label>
                <Input
                  id="juros_perc"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData.juros_perc}
                  onChange={(e) => setFormData({ ...formData, juros_perc: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="multa_perc">Multa (%)</Label>
                <Input
                  id="multa_perc"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData.multa_perc}
                  onChange={(e) => setFormData({ ...formData, multa_perc: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="desconto_perc">Desconto (%)</Label>
                <Input
                  id="desconto_perc"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData.desconto_perc}
                  onChange={(e) => setFormData({ ...formData, desconto_perc: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-3">
                <Label>Parcelas *</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddParcela}
                >
                  <PlusIcon className="h-4 w-4 mr-1" />
                  Adicionar Parcela
                </Button>
              </div>

              <div className="space-y-3">
                {formData.parcelas.map((parcela, index) => (
                  <div key={index} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium">Parcela {parcela.numparc}</h4>
                      {formData.parcelas.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveParcela(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <Label htmlFor={`forma_${index}`}>Forma de Pagamento *</Label>
                        <FormaPagamentoSelect
                          value={formasPagamento.find(f => f.codformapgto === parcela.codformapgto) || null}
                          onChange={(formaPagamento) => handleFormaPagamentoChange(index, formaPagamento)}
                          error={!parcela.codformapgto ? 'Forma de pagamento é obrigatória' : undefined}
                          onFormaPagamentoCreated={fetchFormasPagamento}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor={`dias_${index}`}>Dias *</Label>
                        <Input
                          id={`dias_${index}`}
                          type="number"
                          min="0"
                          value={parcela.dias}
                          onChange={(e) => handleParcelaChange(index, 'dias', parseInt(e.target.value) || 0)}
                          placeholder="0"
                          required
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor={`percentual_${index}`}>Percentual (%) *</Label>
                        <Input
                          id={`percentual_${index}`}
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          value={parcela.percentual}
                          onChange={(e) => handleParcelaChange(index, 'percentual', parseFloat(e.target.value) || 0)}
                          placeholder="0.00"
                          required
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                <div className="text-sm">
                  <strong>Total dos percentuais: {formData.parcelas.reduce((total, p) => total + p.percentual, 0).toFixed(2)}%</strong>
                  {Math.abs(formData.parcelas.reduce((total, p) => total + p.percentual, 0) - 100) > 0.01 && (
                    <span className="text-red-600 ml-2">(Deve somar 100%)</span>
                  )}
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
              Detalhes da Condição de Pagamento
            </DialogTitle>
          </DialogHeader>
          
          {selectedCondicaoPagamento && (
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
                    <span className="text-sm font-mono text-gray-900 bg-gray-50 px-2 py-1 rounded">{selectedCondicaoPagamento.codcondpgto}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">Status:</span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      selectedCondicaoPagamento.situacao ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {selectedCondicaoPagamento.situacao ? '🔴 Inativa' : '🟢 Ativa'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100 md:col-span-2">
                    <span className="text-sm font-medium text-gray-600">Descrição:</span>
                    <span className="text-sm font-semibold text-gray-900 text-right max-w-[400px]">{selectedCondicaoPagamento.descricao}</span>
                  </div>
                </div>
              </div>

              {/* Configurações Financeiras */}
              <div className="pt-6 border-t border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
                  <h3 className="text-lg font-semibold text-gray-900">Configurações Financeiras</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">Juros:</span>
                    <span className={`text-sm font-mono px-2 py-1 rounded ${
                      selectedCondicaoPagamento.juros_perc > 0 
                        ? 'bg-red-50 text-red-800' 
                        : 'bg-gray-50 text-gray-900'
                    }`}>
                      {formatCurrency(selectedCondicaoPagamento.juros_perc)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">Multa:</span>
                    <span className={`text-sm font-mono px-2 py-1 rounded ${
                      selectedCondicaoPagamento.multa_perc > 0 
                        ? 'bg-red-50 text-red-800' 
                        : 'bg-gray-50 text-gray-900'
                    }`}>
                      {formatCurrency(selectedCondicaoPagamento.multa_perc)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">Desconto:</span>
                    <span className={`text-sm font-mono px-2 py-1 rounded ${
                      selectedCondicaoPagamento.desconto_perc > 0 
                        ? 'bg-green-50 text-green-800' 
                        : 'bg-gray-50 text-gray-900'
                    }`}>
                      {formatCurrency(selectedCondicaoPagamento.desconto_perc)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Parcelas */}
              <div className="pt-6 border-t border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-6 bg-green-600 rounded-full"></div>
                  <h3 className="text-lg font-semibold text-gray-900">Parcelas</h3>
                </div>
                <div className="space-y-3">
                  {selectedCondicaoPagamento.parcelas?.map((parcela, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border">
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-mono text-violet-600 bg-violet-50 px-2 py-1 rounded font-bold">
                          #{parcela.numparc}
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {getFormaPagamentoDescricao(parcela.codformapgto)}
                        </span>
                      </div>
                      <div className="flex items-center gap-6 text-sm">
                        <div className="text-center">
                          <div className="text-gray-600 text-xs">Dias</div>
                          <div className="font-mono text-gray-900">{parcela.dias}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-gray-600 text-xs">Percentual</div>
                          <div className="font-mono text-green-600 font-semibold">{parcela.percentual}%</div>
                        </div>
                      </div>
                    </div>
                  )) || (
                    <div className="text-center text-gray-500 py-4">
                      Nenhuma parcela configurada
                    </div>
                  )}
                  
                  {selectedCondicaoPagamento.parcelas && selectedCondicaoPagamento.parcelas.length > 0 && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg border">
                      <div className="text-center">
                        <span className="text-sm text-blue-600 font-medium">
                          Total: {selectedCondicaoPagamento.parcelas.reduce((total, p) => total + p.percentual, 0)}%
                        </span>
                        {selectedCondicaoPagamento.parcelas.length > 1 && (
                          <span className="text-xs text-blue-500 ml-2">
                            ({selectedCondicaoPagamento.parcelas.length} parcelas)
                          </span>
                        )}
                      </div>
                    </div>
                  )}
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
                      {formatDateTime(selectedCondicaoPagamento.data_criacao || '')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">Última Atualização:</span>
                    <span className="text-sm font-mono text-gray-900 bg-gray-50 px-2 py-1 rounded">
                      {formatDateTime(selectedCondicaoPagamento.data_alteracao || '')}
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
                handleOpenModal(selectedCondicaoPagamento!);
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
            Tem certeza que deseja excluir a condição de pagamento "{selectedCondicaoPagamento?.descricao}"?
            Esta ação não pode ser desfeita.
          </p>
            {selectedCondicaoPagamento?.parcelas && selectedCondicaoPagamento.parcelas.length > 0 && (
              <div className="p-3 bg-yellow-50 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Parcelas vinculadas:</strong><br />
                  {formatParcelasInfo(selectedCondicaoPagamento.parcelas)}
                </p>
              </div>
            )}
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
 
 
 