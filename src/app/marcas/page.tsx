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

interface Marca {
  codmarca: number;
  nome_marca: string;
  data_criacao?: string;
  data_alteracao?: string;
  situacao?: string;
}

export default function MarcasPage() {
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [marcaToDelete, setMarcaToDelete] = useState<Marca | null>(null);
  const [selectedMarca, setSelectedMarca] = useState<Marca | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState<Marca>({
    codmarca: 0,
    nome_marca: '',
    situacao: undefined
  });
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<keyof Marca>('nome_marca');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    fetchMarcas();
  }, []);

  const fetchMarcas = async () => {
    try {
      const response = await fetch('/api/marcas');
      if (!response.ok) throw new Error('Erro ao carregar marcas');
      const data = await response.json();
      setMarcas(data);
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao carregar marcas');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação básica
    if (!formData.nome_marca.trim()) {
      toast.error('Nome da marca é obrigatório');
      return;
    }

    try {
      const response = await fetch('/api/marcas', {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        await fetchMarcas();
        setIsFormOpen(false);
        setFormData({
          codmarca: 0,
          nome_marca: '',
          situacao: undefined
        });
        setIsEditing(false);
        toast.success(isEditing ? 'Marca atualizada com sucesso!' : 'Marca cadastrada com sucesso!');
      } else {
        toast.error(data.error || 'Erro ao salvar marca');
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao salvar marca');
    }
  };

  const handleEdit = (marca: Marca) => {
    setFormData({
      codmarca: marca.codmarca,
      nome_marca: marca.nome_marca,
      situacao: marca.situacao
    });
    setIsEditing(true);
    setIsFormOpen(true);
  };

  const handleOpenDetailsModal = (marca: Marca) => {
    setSelectedMarca(marca);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedMarca(null);
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
    if (!marcaToDelete) return;

    try {
      const response = await fetch(`/api/marcas?codmarca=${marcaToDelete.codmarca}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao excluir marca');
      }

      toast.success('Marca excluída com sucesso!');
      fetchMarcas();
      setIsDeleteDialogOpen(false);
      setMarcaToDelete(null);
    } catch (error) {
      console.error('Erro:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao excluir marca');
    }
  };

  const handleSort = (key: keyof Marca) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const filteredAndSortedMarcas = marcas
    .filter(marca => 
      marca.codmarca.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      marca.nome_marca.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const aValue = String(a[sortKey]);
      const bValue = String(b[sortKey]);
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    });

  const columns = [
    { key: 'codmarca', label: 'Código' },
    { key: 'nome_marca', label: 'Nome da Marca' },
    {
      key: 'situacao',
      label: 'Status',
      render: (marca: Marca) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          marca.situacao ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
        }`}>
          {marca.situacao ? '🔴 Inativa' : '🟢 Ativa'}
        </span>
      )
    }
  ];

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold leading-6 text-gray-900">Marcas</h1>
          <p className="mt-2 text-sm text-gray-700">
            Lista de todas as marcas de produtos cadastradas no sistema.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none flex items-center gap-3">
          <div className="relative">
            <Input
              type="text"
              placeholder="Buscar marca..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-[320px] pl-10"
            />
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-2.5 text-gray-400" />
          </div>
          <Button
            onClick={() => {
              setFormData({
                codmarca: 0,
                nome_marca: '',
                situacao: undefined
              });
              setIsEditing(false);
              setIsFormOpen(true);
            }}
            className="bg-violet-600 hover:bg-violet-500"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Nova Marca
          </Button>
        </div>
      </div>

      <div className="mt-6">
        <DataTable
          data={filteredAndSortedMarcas}
          columns={columns}
          actions={[
            {
              icon: EyeIcon,
              onClick: handleOpenDetailsModal,
              label: 'Ver Detalhes'
            }
          ]}
          onEdit={handleEdit}
          onDelete={(marca) => {
            setMarcaToDelete(marca);
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
            <DialogTitle>{isEditing ? 'Editar Marca' : 'Nova Marca'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="codmarca">Código</Label>
                <Input
                  id="codmarca"
                  value={isEditing ? formData.codmarca : ''}
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
              <Label htmlFor="nome_marca">Nome da Marca *</Label>
              <Input
                id="nome_marca"
                value={formData.nome_marca}
                onChange={(e) => setFormData({ ...formData, nome_marca: e.target.value })}
                placeholder="Digite o nome da marca"
                required
                maxLength={100}
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
              Detalhes da Marca
            </DialogTitle>
          </DialogHeader>
          
          {selectedMarca && (
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
                    <span className="text-sm font-mono text-gray-900 bg-gray-50 px-2 py-1 rounded">{selectedMarca.codmarca}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">Status:</span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      selectedMarca.situacao ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {selectedMarca.situacao ? '🔴 Inativa' : '🟢 Ativa'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">Nome da Marca:</span>
                    <span className="text-sm font-semibold text-gray-900 text-right max-w-[200px]">{selectedMarca.nome_marca}</span>
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
                      {formatDateTime(selectedMarca.data_criacao || '')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">Última Atualização:</span>
                    <span className="text-sm font-mono text-gray-900 bg-gray-50 px-2 py-1 rounded">
                      {formatDateTime(selectedMarca.data_alteracao || '')}
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
                handleEdit(selectedMarca!);
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
            <p>Tem certeza que deseja excluir a marca <strong>{marcaToDelete?.nome_marca}</strong>?</p>
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