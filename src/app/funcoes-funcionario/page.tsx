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

interface FuncaoFuncionario {
  codfuncao: number;
  nome_funcao: string;
  exige_cnh: boolean;
  carga_horaria_semanal: number | null;
  data_criacao?: string;
  data_alteracao?: string;
  situacao?: string;
}

export default function FuncoesFuncionarioPage() {
  const [funcoes, setFuncoes] = useState<FuncaoFuncionario[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [funcaoToDelete, setFuncaoToDelete] = useState<FuncaoFuncionario | null>(null);
  const [selectedFuncao, setSelectedFuncao] = useState<FuncaoFuncionario | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState<FuncaoFuncionario>({
    codfuncao: 0,
    nome_funcao: '',
    exige_cnh: false,
    carga_horaria_semanal: null,
    situacao: undefined
  });
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<keyof FuncaoFuncionario>('nome_funcao');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    fetchFuncoes();
  }, []);

  const fetchFuncoes = async () => {
    try {
      const response = await fetch('/api/funcoes-funcionario');
      if (!response.ok) throw new Error('Erro ao carregar funções de funcionário');
      const data = await response.json();
      setFuncoes(data);
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao carregar funções de funcionário');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações básicas
    if (!formData.nome_funcao.trim()) {
      toast.error('Nome da função é obrigatório');
      return;
    }

    // Validar carga horária se fornecida
    if (formData.carga_horaria_semanal !== null && formData.carga_horaria_semanal !== undefined) {
      if (formData.carga_horaria_semanal < 0 || formData.carga_horaria_semanal > 168) {
        toast.error('Carga horária deve estar entre 0 e 168 horas');
        return;
      }
    }

    try {
      const response = await fetch('/api/funcoes-funcionario', {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        await fetchFuncoes();
        setIsFormOpen(false);
        setFormData({
          codfuncao: 0,
          nome_funcao: '',
          exige_cnh: false,
          carga_horaria_semanal: null,
          situacao: undefined
        });
        setIsEditing(false);
        toast.success(isEditing ? 'Função atualizada com sucesso!' : 'Função cadastrada com sucesso!');
      } else {
        toast.error(data.error || 'Erro ao salvar função');
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao salvar função');
    }
  };

  const handleEdit = (funcao: FuncaoFuncionario) => {
    setFormData({
      codfuncao: funcao.codfuncao,
      nome_funcao: funcao.nome_funcao,
      exige_cnh: funcao.exige_cnh,
      carga_horaria_semanal: funcao.carga_horaria_semanal,
      situacao: funcao.situacao
    });
    setIsEditing(true);
    setIsFormOpen(true);
  };

  const handleOpenDetailsModal = (funcao: FuncaoFuncionario) => {
    setSelectedFuncao(funcao);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedFuncao(null);
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
    if (!funcaoToDelete) return;

    try {
      const response = await fetch(`/api/funcoes-funcionario?codfuncao=${funcaoToDelete.codfuncao}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao excluir função');
      }

      toast.success('Função excluída com sucesso!');
      fetchFuncoes();
      setIsDeleteDialogOpen(false);
      setFuncaoToDelete(null);
    } catch (error) {
      console.error('Erro:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao excluir função');
    }
  };

  const handleSort = (key: keyof FuncaoFuncionario) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const filteredAndSortedFuncoes = funcoes
    .filter(funcao => 
      funcao.codfuncao.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      funcao.nome_funcao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (funcao.exige_cnh ? 'sim' : 'não').includes(searchTerm.toLowerCase()) ||
      (funcao.carga_horaria_semanal?.toString() || '').includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const aValue = String(a[sortKey] || '');
      const bValue = String(b[sortKey] || '');
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    });

  const columns = [
    { key: 'codfuncao', label: 'Código' },
    { key: 'nome_funcao', label: 'Nome da Função' },
    { 
      key: 'exige_cnh', 
      label: 'Exige CNH',
      render: (funcao: FuncaoFuncionario) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          funcao.exige_cnh ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {funcao.exige_cnh ? 'Sim' : 'Não'}
        </span>
      )
    },
    { 
      key: 'carga_horaria_semanal', 
      label: 'Carga Horária/Semana',
      render: (funcao: FuncaoFuncionario) => funcao.carga_horaria_semanal ? `${funcao.carga_horaria_semanal}h` : '-'
    },
    {
      key: 'situacao',
      label: 'Status',
      render: (funcao: FuncaoFuncionario) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          funcao.situacao ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
        }`}>
          {funcao.situacao ? '🔴 Inativo' : '🟢 Ativo'}
        </span>
      )
    }
  ];

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold leading-6 text-gray-900">Funções de Funcionário</h1>
          <p className="mt-2 text-sm text-gray-700">
            Lista de todas as funções de funcionário cadastradas no sistema.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none flex items-center gap-3">
          <div className="relative">
            <Input
              type="text"
              placeholder="Buscar função..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-[320px] pl-10"
            />
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-2.5 text-gray-400" />
          </div>
          <Button
            onClick={() => {
              setFormData({
                codfuncao: 0,
                nome_funcao: '',
                exige_cnh: false,
                carga_horaria_semanal: null,
                situacao: undefined
              });
              setIsEditing(false);
              setIsFormOpen(true);
            }}
            className="bg-violet-600 hover:bg-violet-500"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Nova Função
          </Button>
        </div>
      </div>

      <div className="mt-6">
        <DataTable
          data={filteredAndSortedFuncoes}
          columns={columns}
          actions={[
            {
              icon: EyeIcon,
              onClick: handleOpenDetailsModal,
              label: 'Ver Detalhes'
            }
          ]}
          onEdit={handleEdit}
          onDelete={(funcao) => {
            setFuncaoToDelete(funcao);
            setIsDeleteDialogOpen(true);
          }}
          sortKey={sortKey}
          sortDirection={sortDirection}
          onSort={handleSort}
        />
      </div>

      {/* Dialog de Formulário */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Editar Função de Funcionário' : 'Nova Função de Funcionário'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="codfuncao">Código</Label>
                <Input
                  id="codfuncao"
                  value={isEditing ? formData.codfuncao : ''}
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
              <Label htmlFor="nome_funcao">Nome da Função *</Label>
              <Input
                id="nome_funcao"
                value={formData.nome_funcao}
                onChange={(e) => setFormData({ ...formData, nome_funcao: e.target.value })}
                placeholder="Digite o nome da função (ex: Desenvolvedor, Motorista)"
                required
                maxLength={100}
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="exige_cnh"
                checked={formData.exige_cnh}
                onChange={(e) => setFormData({ ...formData, exige_cnh: e.target.checked })}
                className="h-4 w-4 text-violet-600 focus:ring-violet-500 border-gray-300 rounded"
              />
              <Label htmlFor="exige_cnh">Esta função exige CNH</Label>
            </div>

            <div>
              <Label htmlFor="carga_horaria_semanal">Carga Horária Semanal (horas)</Label>
              <Input
                id="carga_horaria_semanal"
                type="number"
                value={formData.carga_horaria_semanal || ''}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  carga_horaria_semanal: e.target.value ? parseInt(e.target.value) : null 
                })}
                placeholder="Ex: 40, 44, 48"
                min="0"
                max="168"
              />
              <p className="text-xs text-gray-500 mt-1">
                Opcional. Máximo 168 horas (24h × 7 dias)
              </p>
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
              Detalhes da Função
            </DialogTitle>
          </DialogHeader>
          
          {selectedFuncao && (
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
                    <span className="text-sm font-mono text-gray-900 bg-gray-50 px-2 py-1 rounded">{selectedFuncao.codfuncao}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">Status:</span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      selectedFuncao.situacao ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {selectedFuncao.situacao ? '🔴 Inativo' : '🟢 Ativo'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">Nome da Função:</span>
                    <span className="text-sm font-semibold text-gray-900 text-right max-w-[200px]">{selectedFuncao.nome_funcao}</span>
                  </div>
                </div>
              </div>

              {/* Dados da Função */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-6 bg-amber-600 rounded-full"></div>
                  <h3 className="text-lg font-semibold text-gray-900">Dados da Função</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">Exige CNH:</span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      selectedFuncao.exige_cnh ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedFuncao.exige_cnh ? 'Sim' : 'Não'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">Carga Horária Semanal:</span>
                    <span className="text-sm text-gray-900">
                      {selectedFuncao.carga_horaria_semanal ? `${selectedFuncao.carga_horaria_semanal}h` : '-'}
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
                      {formatDateTime(selectedFuncao.data_criacao || '')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">Última Atualização:</span>
                    <span className="text-sm font-mono text-gray-900 bg-gray-50 px-2 py-1 rounded">
                      {formatDateTime(selectedFuncao.data_alteracao || '')}
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
                handleEdit(selectedFuncao!);
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
            <p>Tem certeza que deseja excluir a função <strong>{funcaoToDelete?.nome_funcao}</strong>?</p>
            <p className="text-sm text-gray-600 mt-2">
              Esta ação não poderá ser desfeita e não será possível excluir se houver funcionários vinculados.
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