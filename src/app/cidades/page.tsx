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
import { EstadoSelect } from '@/components/forms/EstadoSelect';

interface Cidade {
  codcid: number;
  nomecidade: string;
  codest: number;
  nomeestado?: string;
  siglaest?: string;
  nomepais?: string;
  data_criacao?: string;
  data_alteracao?: string;
  situacao?: string;
}

interface Estado {
  codest: number;
  siglaest: string;
  nomeestado: string;
  codpais: number;
  nomepais?: string;
}

export default function CidadesPage() {
  const [cidades, setCidades] = useState<Cidade[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [cidadeToDelete, setCidadeToDelete] = useState<Cidade | null>(null);
  const [selectedCidade, setSelectedCidade] = useState<Cidade | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState<Cidade>({
    codcid: 0,
    nomecidade: '',
    codest: 0,
    situacao: undefined
  });
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<keyof Cidade>('nomecidade');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedEstado, setSelectedEstado] = useState<Estado | null>(null);

  useEffect(() => {
    fetchCidades();
  }, []);

  const fetchCidades = async () => {
    try {
      const response = await fetch('/api/cidades');
      if (!response.ok) throw new Error('Erro ao carregar cidades');
      const data = await response.json();
      setCidades(data);
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao carregar cidades');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação básica
    if (!formData.nomecidade.trim()) {
      toast.error('Nome da cidade é obrigatório');
      return;
    }

    if (!selectedEstado || !formData.codest) {
      toast.error('Estado é obrigatório');
      return;
    }

    try {
      const response = await fetch('/api/cidades', {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        await fetchCidades();
        setIsFormOpen(false);
        setFormData({
          codcid: 0,
          nomecidade: '',
          codest: 0,
          situacao: undefined
        });
        setSelectedEstado(null);
        setIsEditing(false);
        toast.success(isEditing ? 'Cidade atualizada com sucesso!' : 'Cidade cadastrada com sucesso!');
      } else {
        toast.error(data.error || 'Erro ao salvar cidade');
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao salvar cidade');
    }
  };

  const handleEdit = (cidade: Cidade) => {
    setFormData({
      codcid: cidade.codcid,
      nomecidade: cidade.nomecidade,
      codest: cidade.codest,
      situacao: cidade.situacao
    });
    
    // Configurar estado selecionado para o EstadoSelect
    if (cidade.codest && cidade.nomeestado) {
      setSelectedEstado({
        codest: cidade.codest,
        siglaest: cidade.siglaest || '',
        nomeestado: cidade.nomeestado,
        codpais: 0, // Será carregado pelo componente
        nomepais: cidade.nomepais
      });
    }
    
    setIsEditing(true);
    setIsFormOpen(true);
  };

  const handleOpenDetailsModal = (cidade: Cidade) => {
    setSelectedCidade(cidade);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedCidade(null);
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
    if (!cidadeToDelete) return;

    try {
      const response = await fetch(`/api/cidades?codcid=${cidadeToDelete.codcid}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao excluir cidade');
      }

      toast.success('Cidade excluída com sucesso!');
      fetchCidades();
      setIsDeleteDialogOpen(false);
      setCidadeToDelete(null);
    } catch (error) {
      console.error('Erro:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao excluir cidade');
    }
  };

  const handleSort = (key: keyof Cidade) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const handleEstadoSelect = (estado: Estado | null) => {
    setSelectedEstado(estado);
    setFormData({ ...formData, codest: estado?.codest || 0 });
  };

  const filteredAndSortedCidades = cidades
    .filter(cidade => 
      cidade.codcid.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      cidade.nomecidade.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cidade.nomeestado || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cidade.siglaest || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cidade.nomepais || '').toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const aValue = String(a[sortKey]);
      const bValue = String(b[sortKey]);
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    });

  const columns = [
    { key: 'codcid', label: 'Código' },
    { key: 'nomecidade', label: 'Nome da Cidade' },
    { key: 'siglaest', label: 'UF' },
    { key: 'nomeestado', label: 'Estado' },
    { key: 'nomepais', label: 'País' },
    {
      key: 'situacao',
      label: 'Status',
      render: (cidade: Cidade) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          cidade.situacao ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
        }`}>
          {cidade.situacao ? '🔴 Inativa' : '🟢 Ativa'}
        </span>
      )
    }
  ];

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold leading-6 text-gray-900">Cidades</h1>
          <p className="mt-2 text-sm text-gray-700">
            Lista de todas as cidades cadastradas no sistema.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none flex items-center gap-3">
          <div className="relative">
            <Input
              type="text"
              placeholder="Buscar cidade..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-[320px] pl-10"
            />
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-2.5 text-gray-400" />
          </div>
          <Button
            onClick={() => {
              setFormData({
                codcid: 0,
                nomecidade: '',
                codest: 0,
                situacao: undefined
              });
              setSelectedEstado(null);
              setIsEditing(false);
              setIsFormOpen(true);
            }}
            className="bg-violet-600 hover:bg-violet-500"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Nova Cidade
          </Button>
        </div>
      </div>

      <div className="mt-6">
        <DataTable
          data={filteredAndSortedCidades}
          columns={columns}
          actions={[
            {
              icon: EyeIcon,
              onClick: handleOpenDetailsModal,
              label: 'Ver Detalhes'
            }
          ]}
          onEdit={handleEdit}
          onDelete={(cidade) => {
            setCidadeToDelete(cidade);
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
            <DialogTitle>{isEditing ? 'Editar Cidade' : 'Nova Cidade'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="codcid">Código</Label>
                <Input
                  id="codcid"
                  value={isEditing ? formData.codcid : ''}
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
              <Label htmlFor="nomecidade">Nome da Cidade *</Label>
              <Input
                id="nomecidade"
                value={formData.nomecidade}
                onChange={(e) => setFormData({ ...formData, nomecidade: e.target.value })}
                placeholder="Digite o nome da cidade"
                required
                maxLength={100}
              />
            </div>
            <div>
              <Label>Estado *</Label>
              <EstadoSelect
                value={selectedEstado}
                onChange={handleEstadoSelect}
                error={(!selectedEstado || !formData.codest) ? 'Estado é obrigatório' : undefined}
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
              Detalhes da Cidade
            </DialogTitle>
          </DialogHeader>
          
          {selectedCidade && (
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
                    <span className="text-sm font-mono text-gray-900 bg-gray-50 px-2 py-1 rounded">{selectedCidade.codcid}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">Status:</span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      selectedCidade.situacao ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {selectedCidade.situacao ? '🔴 Inativa' : '🟢 Ativa'}
                    </span>
                  </div>
                  <div className="md:col-span-2">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm font-medium text-gray-600">Nome da Cidade:</span>
                      <span className="text-sm font-semibold text-gray-900 text-right max-w-[300px]">{selectedCidade.nomecidade}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Localização */}
              <div className="pt-6 border-t border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
                  <h3 className="text-lg font-semibold text-gray-900">Localização</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">Estado:</span>
                    <span className="text-sm font-semibold text-gray-900 text-right max-w-[200px]">{selectedCidade.nomeestado || '-'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">UF:</span>
                    <span className="text-sm font-mono text-gray-900 bg-blue-50 px-3 py-2 rounded font-bold text-blue-800">
                      {selectedCidade.siglaest || '-'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">País:</span>
                    <span className="text-sm font-semibold text-gray-900 text-right max-w-[200px]">{selectedCidade.nomepais || '-'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">Código do Estado:</span>
                    <span className="text-sm font-mono text-gray-900 bg-gray-50 px-2 py-1 rounded">{selectedCidade.codest}</span>
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
                      {formatDateTime(selectedCidade.data_criacao || '')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">Última Atualização:</span>
                    <span className="text-sm font-mono text-gray-900 bg-gray-50 px-2 py-1 rounded">
                      {formatDateTime(selectedCidade.data_alteracao || '')}
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
                handleEdit(selectedCidade!);
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
            <p>Tem certeza que deseja excluir a cidade <strong>{cidadeToDelete?.nomecidade}</strong>?</p>
            <p className="text-sm text-gray-600 mt-2">
              Esta ação não poderá ser desfeita e não será possível excluir se houver empresas ou pessoas vinculadas.
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