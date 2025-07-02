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
import { PaisSelect } from '@/components/forms/PaisSelect';

interface Estado {
  codest: number;
  siglaest: string;
  nomeestado: string;
  codpais: number;
  nomepais?: string;
  data_criacao?: string;
  data_alteracao?: string;
  situacao?: string;
}

interface Pais {
  codpais: number;
  siglapais: string;
  nomepais: string;
}

export default function EstadosPage() {
  const [estados, setEstados] = useState<Estado[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [estadoToDelete, setEstadoToDelete] = useState<Estado | null>(null);
  const [selectedEstado, setSelectedEstado] = useState<Estado | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState<Estado>({
    codest: 0,
    siglaest: '',
    nomeestado: '',
    codpais: 0,
    situacao: undefined
  });
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<keyof Estado>('nomeestado');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedPais, setSelectedPais] = useState<Pais | null>(null);

  useEffect(() => {
    fetchEstados();
  }, []);

  const fetchEstados = async () => {
    try {
      const response = await fetch('/api/estados');
      if (!response.ok) throw new Error('Erro ao carregar estados');
      const data = await response.json();
      setEstados(data);
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao carregar estados');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação básica
    if (!formData.siglaest.trim()) {
      toast.error('Sigla do estado é obrigatória');
      return;
    }

    if (!formData.nomeestado.trim()) {
      toast.error('Nome do estado é obrigatório');
      return;
    }

    if (formData.siglaest.length < 1 || formData.siglaest.length > 4) {
      toast.error('A sigla do estado deve ter entre 1 e 4 caracteres');
      return;
    }

    if (!formData.codpais) {
      toast.error('País é obrigatório');
      return;
    }

    try {
      const response = await fetch('/api/estados', {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        await fetchEstados();
        setIsFormOpen(false);
        setFormData({
          codest: 0,
          siglaest: '',
          nomeestado: '',
          codpais: 0,
          situacao: undefined
        });
        setSelectedPais(null);
        setIsEditing(false);
        toast.success(isEditing ? 'Estado atualizado com sucesso!' : 'Estado cadastrado com sucesso!');
      } else {
        toast.error(data.error || 'Erro ao salvar estado');
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao salvar estado');
    }
  };

  const handleEdit = (estado: Estado) => {
    setFormData({
      codest: estado.codest,
      siglaest: estado.siglaest,
      nomeestado: estado.nomeestado,
      codpais: estado.codpais,
      situacao: estado.situacao
    });
    
    // Configurar país selecionado para o PaisSelect
    if (estado.codpais && estado.nomepais) {
      setSelectedPais({
        codpais: estado.codpais,
        siglapais: '', // Será carregado pelo componente
        nomepais: estado.nomepais
      });
    }
    
    setIsEditing(true);
    setIsFormOpen(true);
  };

  const handleOpenDetailsModal = (estado: Estado) => {
    setSelectedEstado(estado);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedEstado(null);
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
    if (!estadoToDelete) return;

    try {
      const response = await fetch(`/api/estados?codest=${estadoToDelete.codest}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao excluir estado');
      }

      toast.success('Estado excluído com sucesso!');
      fetchEstados();
      setIsDeleteDialogOpen(false);
      setEstadoToDelete(null);
    } catch (error) {
      console.error('Erro:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao excluir estado');
    }
  };

  const handleSort = (key: keyof Estado) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const handlePaisSelect = (pais: Pais | null) => {
    setSelectedPais(pais);
    setFormData({ ...formData, codpais: pais?.codpais || 0 });
  };

  const filteredAndSortedEstados = estados
    .filter(estado => 
      estado.codest.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      estado.siglaest.toLowerCase().includes(searchTerm.toLowerCase()) ||
      estado.nomeestado.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (estado.nomepais || '').toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const aValue = String(a[sortKey]);
      const bValue = String(b[sortKey]);
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    });

  const columns = [
    { key: 'codest', label: 'Código' },
    { key: 'siglaest', label: 'Sigla' },
    { key: 'nomeestado', label: 'Nome do Estado' },
    { key: 'nomepais', label: 'País' },
    {
      key: 'situacao',
      label: 'Status',
      render: (estado: Estado) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          estado.situacao ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
        }`}>
          {estado.situacao ? '🔴 Inativo' : '🟢 Ativo'}
        </span>
      )
    }
  ];

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold leading-6 text-gray-900">Estados</h1>
          <p className="mt-2 text-sm text-gray-700">
            Lista de todos os estados cadastrados no sistema.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none flex items-center gap-3">
          <div className="relative">
            <Input
              type="text"
              placeholder="Buscar estado..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-[320px] pl-10"
            />
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-2.5 text-gray-400" />
          </div>
          <Button
            onClick={() => {
              setFormData({
                codest: 0,
                siglaest: '',
                nomeestado: '',
                codpais: 0,
                situacao: undefined
              });
              setSelectedPais(null);
              setIsEditing(false);
              setIsFormOpen(true);
            }}
            className="bg-violet-600 hover:bg-violet-500"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Novo Estado
          </Button>
        </div>
      </div>

      <div className="mt-6">
        <DataTable
          data={filteredAndSortedEstados}
          columns={columns}
          actions={[
            {
              icon: EyeIcon,
              onClick: handleOpenDetailsModal,
              label: 'Ver Detalhes'
            }
          ]}
          onEdit={handleEdit}
          onDelete={(estado) => {
            setEstadoToDelete(estado);
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
            <DialogTitle>{isEditing ? 'Editar Estado' : 'Novo Estado'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="codest">Código</Label>
                <Input
                  id="codest"
                  value={isEditing ? formData.codest : ''}
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
              <Label htmlFor="siglaest">Sigla do Estado *</Label>
              <Input
                id="siglaest"
                value={formData.siglaest}
                onChange={(e) => setFormData({ ...formData, siglaest: e.target.value.toUpperCase() })}
                placeholder="Ex: PR, 10, APY"
                required
                maxLength={4}
                style={{ textTransform: 'uppercase' }}
              />
            </div>
            <div>
              <Label htmlFor="nomeestado">Nome do Estado *</Label>
              <Input
                id="nomeestado"
                value={formData.nomeestado}
                onChange={(e) => setFormData({ ...formData, nomeestado: e.target.value })}
                placeholder="Digite o nome do estado"
                required
                maxLength={50}
              />
            </div>
            <div>
              <Label>País *</Label>
              <PaisSelect
                value={selectedPais}
                onChange={handlePaisSelect}
                error={!formData.codpais ? 'País é obrigatório' : undefined}
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
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <EyeIcon className="h-5 w-5 text-violet-600" />
              Detalhes do Estado
            </DialogTitle>
          </DialogHeader>
          
          {selectedEstado && (
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
                    <span className="text-sm font-mono text-gray-900 bg-gray-50 px-2 py-1 rounded">{selectedEstado.codest}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">Status:</span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      selectedEstado.situacao ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {selectedEstado.situacao ? '🔴 Inativo' : '🟢 Ativo'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">Sigla:</span>
                    <span className="text-sm font-mono text-gray-900 bg-blue-50 px-3 py-2 rounded font-bold text-blue-800">
                      {selectedEstado.siglaest}
                    </span>
                  </div>
                  <div className="md:col-span-2">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm font-medium text-gray-600">Nome do Estado:</span>
                      <span className="text-sm font-semibold text-gray-900 text-right max-w-[250px]">{selectedEstado.nomeestado}</span>
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
                    <span className="text-sm font-medium text-gray-600">País:</span>
                    <span className="text-sm font-semibold text-gray-900 text-right max-w-[200px]">{selectedEstado.nomepais || '-'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">Código do País:</span>
                    <span className="text-sm font-mono text-gray-900 bg-gray-50 px-2 py-1 rounded">{selectedEstado.codpais}</span>
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
                      {formatDateTime(selectedEstado.data_criacao || '')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">Última Atualização:</span>
                    <span className="text-sm font-mono text-gray-900 bg-gray-50 px-2 py-1 rounded">
                      {formatDateTime(selectedEstado.data_alteracao || '')}
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
                handleEdit(selectedEstado!);
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
            <p>Tem certeza que deseja excluir o estado <strong>{estadoToDelete?.nomeestado}</strong>?</p>
            <p className="text-sm text-gray-600 mt-2">
              Esta ação não poderá ser desfeita e não será possível excluir se houver cidades vinculadas.
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