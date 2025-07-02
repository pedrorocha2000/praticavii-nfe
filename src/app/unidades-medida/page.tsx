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

interface UnidadeMedida {
  codunidade: number;
  nome_unidade: string;
  sigla_unidade: string;
  data_criacao?: string;
  data_alteracao?: string;
  situacao?: string;
}

export default function UnidadesMedidaPage() {
  const [unidades, setUnidades] = useState<UnidadeMedida[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [unidadeToDelete, setUnidadeToDelete] = useState<UnidadeMedida | null>(null);
  const [selectedUnidade, setSelectedUnidade] = useState<UnidadeMedida | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState<UnidadeMedida>({
    codunidade: 0,
    nome_unidade: '',
    sigla_unidade: '',
    situacao: undefined
  });
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<keyof UnidadeMedida>('nome_unidade');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    fetchUnidades();
  }, []);

  const fetchUnidades = async () => {
    try {
      const response = await fetch('/api/unidades-medida');
      if (!response.ok) throw new Error('Erro ao carregar unidades de medida');
      const data = await response.json();
      setUnidades(data);
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao carregar unidades de medida');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações básicas
    if (!formData.nome_unidade.trim()) {
      toast.error('Nome da unidade é obrigatório');
      return;
    }

    if (!formData.sigla_unidade.trim()) {
      toast.error('Sigla da unidade é obrigatória');
      return;
    }

    try {
      const response = await fetch('/api/unidades-medida', {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        await fetchUnidades();
        setIsFormOpen(false);
        setFormData({
          codunidade: 0,
          nome_unidade: '',
          sigla_unidade: '',
          situacao: undefined
        });
        setIsEditing(false);
        toast.success(isEditing ? 'Unidade atualizada com sucesso!' : 'Unidade cadastrada com sucesso!');
      } else {
        toast.error(data.error || 'Erro ao salvar unidade');
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao salvar unidade');
    }
  };

  const handleEdit = (unidade: UnidadeMedida) => {
    setFormData({
      codunidade: unidade.codunidade,
      nome_unidade: unidade.nome_unidade,
      sigla_unidade: unidade.sigla_unidade,
      situacao: unidade.situacao
    });
    setIsEditing(true);
    setIsFormOpen(true);
  };

  const handleOpenDetailsModal = (unidade: UnidadeMedida) => {
    setSelectedUnidade(unidade);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedUnidade(null);
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
    if (!unidadeToDelete) return;

    try {
      const response = await fetch(`/api/unidades-medida?codunidade=${unidadeToDelete.codunidade}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao excluir unidade');
      }

      toast.success('Unidade excluída com sucesso!');
      fetchUnidades();
      setIsDeleteDialogOpen(false);
      setUnidadeToDelete(null);
    } catch (error) {
      console.error('Erro:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao excluir unidade');
    }
  };

  const handleSort = (key: keyof UnidadeMedida) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const filteredAndSortedUnidades = unidades
    .filter(unidade => 
      unidade.codunidade.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      unidade.nome_unidade.toLowerCase().includes(searchTerm.toLowerCase()) ||
      unidade.sigla_unidade.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const aValue = String(a[sortKey]);
      const bValue = String(b[sortKey]);
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    });

  const columns = [
    { key: 'codunidade', label: 'Código' },
    { key: 'nome_unidade', label: 'Nome da Unidade' },
    { key: 'sigla_unidade', label: 'Sigla' },
    {
      key: 'situacao',
      label: 'Status',
      render: (unidade: UnidadeMedida) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          unidade.situacao ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
        }`}>
          {unidade.situacao ? '🔴 Inativa' : '🟢 Ativa'}
        </span>
      )
    }
  ];

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold leading-6 text-gray-900">Unidades de Medida</h1>
          <p className="mt-2 text-sm text-gray-700">
            Lista de todas as unidades de medida cadastradas no sistema.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none flex items-center gap-3">
          <div className="relative">
            <Input
              type="text"
              placeholder="Buscar unidade..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-[320px] pl-10"
            />
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-2.5 text-gray-400" />
          </div>
          <Button
            onClick={() => {
              setFormData({
                codunidade: 0,
                nome_unidade: '',
                sigla_unidade: '',
                situacao: undefined
              });
              setIsEditing(false);
              setIsFormOpen(true);
            }}
            className="bg-violet-600 hover:bg-violet-500"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Nova Unidade
          </Button>
        </div>
      </div>

      <div className="mt-6">
        <DataTable
          data={filteredAndSortedUnidades}
          columns={columns}
          actions={[
            {
              icon: EyeIcon,
              onClick: handleOpenDetailsModal,
              label: 'Ver Detalhes'
            }
          ]}
          onEdit={handleEdit}
          onDelete={(unidade) => {
            setUnidadeToDelete(unidade);
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
            <DialogTitle>{isEditing ? 'Editar Unidade de Medida' : 'Nova Unidade de Medida'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="codunidade">Código</Label>
                <Input
                  id="codunidade"
                  value={isEditing ? formData.codunidade : ''}
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
              <Label htmlFor="nome_unidade">Nome da Unidade *</Label>
              <Input
                id="nome_unidade"
                value={formData.nome_unidade}
                onChange={(e) => setFormData({ ...formData, nome_unidade: e.target.value })}
                placeholder="Digite o nome da unidade (ex: Quilograma, Metro, Litro)"
                required
                maxLength={50}
              />
            </div>
            <div>
              <Label htmlFor="sigla_unidade">Sigla da Unidade *</Label>
              <Input
                id="sigla_unidade"
                value={formData.sigla_unidade}
                onChange={(e) => setFormData({ ...formData, sigla_unidade: e.target.value.toUpperCase() })}
                placeholder="Digite a sigla (ex: KG, M, L)"
                required
                maxLength={10}
                className="uppercase"
              />
              <p className="text-xs text-gray-500 mt-1">A sigla será automaticamente convertida para maiúsculo</p>
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
              Detalhes da Unidade de Medida
            </DialogTitle>
          </DialogHeader>
          
          {selectedUnidade && (
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
                    <span className="text-sm font-mono text-gray-900 bg-gray-50 px-2 py-1 rounded">{selectedUnidade.codunidade}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">Status:</span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      selectedUnidade.situacao ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {selectedUnidade.situacao ? '🔴 Inativa' : '🟢 Ativa'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">Nome da Unidade:</span>
                    <span className="text-sm font-semibold text-gray-900 text-right max-w-[200px]">{selectedUnidade.nome_unidade}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">Sigla:</span>
                    <span className="text-sm font-mono text-gray-900 bg-blue-50 px-3 py-2 rounded font-bold text-blue-800">
                      {selectedUnidade.sigla_unidade}
                    </span>
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
                      {formatDateTime(selectedUnidade.data_criacao || '')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">Última Atualização:</span>
                    <span className="text-sm font-mono text-gray-900 bg-gray-50 px-2 py-1 rounded">
                      {formatDateTime(selectedUnidade.data_alteracao || '')}
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
                handleEdit(selectedUnidade!);
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
            <p>Tem certeza que deseja excluir a unidade <strong>{unidadeToDelete?.nome_unidade} ({unidadeToDelete?.sigla_unidade})</strong>?</p>
            <p className="text-sm text-gray-600 mt-2">
              Esta ação não poderá ser desfeita e não será possível excluir se houver produtos vinculados.
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