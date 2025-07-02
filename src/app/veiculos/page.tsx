'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { DataTable } from '@/components/DataTable';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusIcon, MagnifyingGlassIcon, EyeIcon, PencilIcon } from '@heroicons/react/24/outline';

interface Veiculo {
  codveiculo: number;
  placa: string;
  modelo?: string;
  descricao?: string;
  data_criacao?: string;
  data_alteracao?: string;
  situacao?: string;
}

export default function VeiculosPage() {
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [veiculoToDelete, setVeiculoToDelete] = useState<Veiculo | null>(null);
  const [selectedVeiculo, setSelectedVeiculo] = useState<Veiculo | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState<Veiculo>({
    codveiculo: 0,
    placa: '',
    modelo: '',
    descricao: '',
    situacao: undefined
  });
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<keyof Veiculo>('placa');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    fetchVeiculos();
  }, []);

  const fetchVeiculos = async () => {
    try {
      const response = await fetch('/api/veiculos');
      if (!response.ok) throw new Error('Erro ao carregar veículos');
      const data = await response.json();
      setVeiculos(data);
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao carregar veículos');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação básica
    if (!formData.placa.trim()) {
      toast.error('Placa é obrigatória');
      return;
    }

    try {
      const dataToSend = {
        ...formData,
        placa: formData.placa.toUpperCase().trim()
      };

      const response = await fetch('/api/veiculos', {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });

      const data = await response.json();

      if (response.ok) {
        await fetchVeiculos();
        setIsFormOpen(false);
        setFormData({
          codveiculo: 0,
          placa: '',
          modelo: '',
          descricao: '',
          situacao: undefined
        });
        setIsEditing(false);
        toast.success(isEditing ? 'Veículo atualizado com sucesso!' : 'Veículo cadastrado com sucesso!');
      } else {
        toast.error(data.error || 'Erro ao salvar veículo');
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao salvar veículo');
    }
  };

  const handleEdit = (veiculo: Veiculo) => {
    setFormData({
      codveiculo: veiculo.codveiculo,
      placa: veiculo.placa,
      modelo: veiculo.modelo || '',
      descricao: veiculo.descricao || '',
      situacao: veiculo.situacao
    });
    setIsEditing(true);
    setIsFormOpen(true);
  };

  const handleOpenDetailsModal = (veiculo: Veiculo) => {
    setSelectedVeiculo(veiculo);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedVeiculo(null);
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

  const handleDelete = async () => {
    if (!veiculoToDelete) return;

    try {
      const response = await fetch(`/api/veiculos?codveiculo=${veiculoToDelete.codveiculo}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao excluir veículo');
      }

      toast.success('Veículo excluído com sucesso!');
      fetchVeiculos();
      setIsDeleteDialogOpen(false);
      setVeiculoToDelete(null);
    } catch (error) {
      console.error('Erro:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao excluir veículo');
    }
  };

  const handleSort = (key: keyof Veiculo) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const formatPlaca = (placa: string) => {
    // Remove tudo que não é letra ou número
    const cleaned = placa.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    
    // Formato antigo: ABC-1234 ou novo: ABC1D23
    if (cleaned.length <= 3) {
      return cleaned;
    } else if (cleaned.length <= 7) {
      return cleaned.slice(0, 3) + '-' + cleaned.slice(3);
    } else {
      return cleaned.slice(0, 7);
    }
  };

  const filteredAndSortedVeiculos = veiculos
    .filter(veiculo => 
      veiculo.placa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      veiculo.modelo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      veiculo.descricao?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const aValue = String(a[sortKey] || '');
      const bValue = String(b[sortKey] || '');
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    });

  const columns = [
    { 
      key: 'codveiculo', 
      label: 'Código',
      render: (veiculo: Veiculo) => (
        <span className="text-xs sm:text-sm font-medium">{veiculo.codveiculo}</span>
      )
    },
    { 
      key: 'placa', 
      label: 'Placa',
      render: (veiculo: Veiculo) => (
        <span className="text-xs sm:text-sm font-mono font-medium">{veiculo.placa}</span>
      )
    },
    { 
      key: 'modelo', 
      label: 'Modelo',
      render: (veiculo: Veiculo) => (
        <span className="text-xs sm:text-sm truncate">{veiculo.modelo || '-'}</span>
      )
    },
    { 
      key: 'descricao', 
      label: 'Descrição',
      render: (veiculo: Veiculo) => (
        <span className="text-xs sm:text-sm truncate" title={veiculo.descricao}>
          {veiculo.descricao || '-'}
        </span>
      )
    },
    {
      key: 'situacao',
      label: 'Status',
      render: (veiculo: Veiculo) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          veiculo.situacao ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
        }`}>
          {veiculo.situacao ? '🔴 Inativo' : '🟢 Ativo'}
        </span>
      )
    }
  ];

  return (
    <div className="px-2 sm:px-4 lg:px-6 xl:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-sm sm:text-base font-semibold leading-6 text-gray-900">Veículos</h1>
          <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-700">
            Lista de todos os veículos cadastrados no sistema.
          </p>
        </div>
        <div className="mt-3 sm:mt-4 sm:ml-8 lg:ml-16 sm:mt-0 sm:flex-none flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          <div className="relative">
            <Input
              type="text"
              placeholder="Buscar veículo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-[240px] lg:w-[320px] pl-10 text-sm"
            />
            <MagnifyingGlassIcon className="h-4 w-4 sm:h-5 sm:w-5 absolute left-3 top-2.5 text-gray-400" />
          </div>
          <Button
            onClick={() => {
              setFormData({
                codveiculo: 0,
                placa: '',
                modelo: '',
                descricao: '',
                situacao: undefined
              });
              setIsEditing(false);
              setIsFormOpen(true);
            }}
            className="bg-violet-600 hover:bg-violet-500 text-sm sm:text-base px-3 sm:px-4 py-2"
          >
            <PlusIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Novo Veículo</span>
            <span className="sm:hidden">Novo</span>
          </Button>
        </div>
      </div>

      <div className="mt-8 flow-root">
        <DataTable
          data={filteredAndSortedVeiculos}
          columns={columns}
          actions={[
            {
              icon: EyeIcon,
              onClick: handleOpenDetailsModal,
              label: 'Ver Detalhes'
            }
          ]}
          onEdit={handleEdit}
          onDelete={(veiculo) => {
            setVeiculoToDelete(veiculo);
            setIsDeleteDialogOpen(true);
          }}
          sortKey={sortKey}
          sortDirection={sortDirection}
          onSort={handleSort}
        />
      </div>

      {/* Dialog de Formulário */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Editar Veículo' : 'Novo Veículo'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="codveiculo">Código</Label>
                <Input
                  id="codveiculo"
                  value={isEditing ? formData.codveiculo : ''}
                  disabled
                  className="bg-gray-50"
                  placeholder={isEditing ? '' : 'Auto'}
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
                  disabled={!isEditing}
                  className={`flex h-9 w-full rounded-md border border-input px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 ${
                    !isEditing ? 'bg-gray-50' : 'bg-transparent'
                  }`}
                >
                  <option value="ATIVO">🟢 Ativo</option>
                  <option value="INATIVO">🔴 Inativo</option>
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="placa">Placa *</Label>
              <Input
                id="placa"
                value={formData.placa}
                onChange={(e) => setFormData({ ...formData, placa: formatPlaca(e.target.value) })}
                placeholder="ABC-1234 ou ABC1D23"
                required
                maxLength={8}
              />
              <p className="text-xs text-gray-500 mt-1">
                Formato: ABC-1234 (Mercosul) ou ABC1D23 (novo padrão)
              </p>
            </div>

            <div>
              <Label htmlFor="modelo">Modelo</Label>
              <Input
                id="modelo"
                value={formData.modelo}
                onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                placeholder="Ex: Scania R440, Volvo FH"
                maxLength={100}
              />
            </div>

            <div>
              <Label htmlFor="descricao">Descrição</Label>
              <Input
                id="descricao"
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                placeholder="Informações adicionais sobre o veículo"
                maxLength={255}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsFormOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" className="bg-violet-600 hover:bg-violet-500">
                {isEditing ? 'Atualizar' : 'Cadastrar'}
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
              Detalhes do Veículo
            </DialogTitle>
          </DialogHeader>
          
          {selectedVeiculo && (
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
                    <span className="text-sm font-mono text-gray-900 bg-gray-50 px-2 py-1 rounded">{selectedVeiculo.codveiculo}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">Status:</span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      selectedVeiculo.situacao ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {selectedVeiculo.situacao ? '🔴 Inativo' : '🟢 Ativo'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">Placa:</span>
                    <span className="text-sm font-mono font-semibold text-gray-900 bg-gray-50 px-2 py-1 rounded">{selectedVeiculo.placa}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">Modelo:</span>
                    <span className="text-sm text-gray-900 text-right max-w-[200px]">{selectedVeiculo.modelo || '-'}</span>
                  </div>
                  <div className="md:col-span-2 flex justify-between items-start py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">Descrição:</span>
                    <span className="text-sm text-gray-900 text-right max-w-[400px]">{selectedVeiculo.descricao || '-'}</span>
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
                      {formatDateTime(selectedVeiculo.data_criacao || '')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">Última Atualização:</span>
                    <span className="text-sm font-mono text-gray-900 bg-gray-50 px-2 py-1 rounded">
                      {formatDateTime(selectedVeiculo.data_alteracao || '')}
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
                handleEdit(selectedVeiculo!);
              }}
              className="bg-violet-600 hover:bg-violet-500"
            >
              <PencilIcon className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmação de Exclusão */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Tem certeza que deseja excluir o veículo <strong>{veiculoToDelete?.placa}</strong>?</p>
            <p className="text-sm text-gray-600 mt-2">
              Esta ação não poderá ser desfeita.
            </p>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancelar
            </Button>
                          <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
              >
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 