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

interface FormaPagamento {
  codformapgto: number;
  descricao: string;
  data_criacao?: string;
  data_alteracao?: string;
  situacao?: string;
}

export default function FormaPagamentoPage() {
  const [formasPagamento, setFormasPagamento] = useState<FormaPagamento[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedFormaPagamento, setSelectedFormaPagamento] = useState<FormaPagamento | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    descricao: '',
    situacao: undefined as string | undefined,
  });
  const [sortConfig, setSortConfig] = useState<{
    key: keyof FormaPagamento;
    direction: 'asc' | 'desc';
  }>({ key: 'descricao', direction: 'asc' });

  useEffect(() => {
    fetchFormasPagamento();
  }, []);

  const fetchFormasPagamento = async () => {
    try {
      const response = await fetch('/api/formas-pagamento');
      const data = await response.json();
      setFormasPagamento(data);
    } catch (error) {
      console.error('Erro ao carregar formas de pagamento:', error);
      toast.error('Erro ao carregar formas de pagamento');
    }
  };

  const handleSort = (key: keyof FormaPagamento) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleOpenModal = (formaPagamento?: FormaPagamento) => {
    if (formaPagamento) {
      setSelectedFormaPagamento(formaPagamento);
      setFormData({
        descricao: formaPagamento.descricao,
        situacao: formaPagamento.situacao,
      });
    } else {
      setSelectedFormaPagamento(null);
      setFormData({
        descricao: '',
        situacao: undefined,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedFormaPagamento(null);
    setFormData({
      descricao: '',
      situacao: undefined,
    });
  };

  const handleOpenDeleteModal = (formaPagamento: FormaPagamento) => {
    setSelectedFormaPagamento(formaPagamento);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedFormaPagamento(null);
  };

  const handleOpenDetailsModal = (formaPagamento: FormaPagamento) => {
    setSelectedFormaPagamento(formaPagamento);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedFormaPagamento(null);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.descricao.trim()) {
      toast.error('Descrição é obrigatória');
      return;
    }

    try {
      const url = '/api/formas-pagamento';
      const method = selectedFormaPagamento ? 'PUT' : 'POST';

      const body = selectedFormaPagamento 
        ? {
            codformapgto: selectedFormaPagamento.codformapgto,
            descricao: formData.descricao.trim(),
            situacao: formData.situacao,
          }
        : {
            descricao: formData.descricao.trim(),
            situacao: formData.situacao,
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
        throw new Error(error.error || 'Erro ao salvar forma de pagamento');
      }

      handleCloseModal();
      fetchFormasPagamento();
      toast.success(selectedFormaPagamento ? 'Forma de pagamento atualizada com sucesso!' : 'Forma de pagamento criada com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar forma de pagamento:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao salvar forma de pagamento');
    }
  };

  const handleDelete = async () => {
    if (!selectedFormaPagamento) return;

    try {
      const response = await fetch(`/api/formas-pagamento?codformapgto=${selectedFormaPagamento.codformapgto}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao excluir forma de pagamento');
      }

      handleCloseDeleteModal();
      fetchFormasPagamento();
      toast.success('Forma de pagamento excluída com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir forma de pagamento:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao excluir forma de pagamento');
    }
  };

  const columns = [
    { key: 'codformapgto', label: 'Código' },
    { key: 'descricao', label: 'Descrição' },
    {
      key: 'situacao',
      label: 'Status',
      render: (forma: FormaPagamento) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          forma.situacao ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
        }`}>
          {forma.situacao ? '🔴 Inativa' : '🟢 Ativa'}
        </span>
      )
    }
  ];

  const sortedFormasPagamento = [...formasPagamento]
    .filter(forma => 
      forma.codformapgto.toString().includes(searchTerm.toLowerCase()) ||
      forma.descricao.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
    if (sortConfig.direction === 'asc') {
      return a[sortConfig.key] > b[sortConfig.key] ? 1 : -1;
    }
    return a[sortConfig.key] < b[sortConfig.key] ? 1 : -1;
  });

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold leading-6 text-gray-900">Formas de Pagamento</h1>
          <p className="mt-2 text-sm text-gray-700">
            Lista de todas as formas de pagamento cadastradas no sistema.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none flex items-center gap-3">
          <div className="relative">
            <Input
              type="text"
              placeholder="Buscar formas..."
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
          Nova Forma de Pagamento
          </Button>
        </div>
      </div>

      <div className="mt-6">
      <DataTable
        data={sortedFormasPagamento}
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
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{selectedFormaPagamento ? 'Editar Forma de Pagamento' : 'Nova Forma de Pagamento'}</DialogTitle>
          </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="codigo">Código</Label>
              <Input
                id="codigo"
                value={selectedFormaPagamento ? selectedFormaPagamento.codformapgto : ''}
                disabled
                className="bg-gray-50"
                placeholder={selectedFormaPagamento ? '' : 'Auto'}
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
                disabled={!selectedFormaPagamento}
                className={`flex h-9 w-full rounded-md border border-input px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 ${
                  !selectedFormaPagamento ? 'bg-gray-50' : 'bg-transparent'
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
                placeholder="Digite a descrição da forma de pagamento"
              required
                maxLength={50}
            />
          </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseModal}>
              Cancelar
              </Button>
              <Button type="submit" className="bg-violet-600 hover:bg-violet-500">
                {selectedFormaPagamento ? 'Atualizar' : 'Cadastrar'}
              </Button>
            </DialogFooter>
        </form>
        </DialogContent>
      </Dialog>

      {/* Modal de Detalhes */}
      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <EyeIcon className="h-5 w-5 text-violet-600" />
              Detalhes da Forma de Pagamento
            </DialogTitle>
          </DialogHeader>
          
          {selectedFormaPagamento && (
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
                    <span className="text-sm font-mono text-gray-900 bg-gray-50 px-2 py-1 rounded">{selectedFormaPagamento.codformapgto}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">Status:</span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      selectedFormaPagamento.situacao ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {selectedFormaPagamento.situacao ? '🔴 Inativa' : '🟢 Ativa'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">Descrição:</span>
                    <span className="text-sm font-semibold text-gray-900 text-right max-w-[200px]">{selectedFormaPagamento.descricao}</span>
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
                      {formatDateTime(selectedFormaPagamento.data_criacao || '')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">Última Atualização:</span>
                    <span className="text-sm font-mono text-gray-900 bg-gray-50 px-2 py-1 rounded">
                      {formatDateTime(selectedFormaPagamento.data_alteracao || '')}
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
                handleOpenModal(selectedFormaPagamento!);
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
            Tem certeza que deseja excluir a forma de pagamento "{selectedFormaPagamento?.descricao}"?
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
 
 
 