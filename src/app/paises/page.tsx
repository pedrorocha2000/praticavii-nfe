'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import { PlusIcon, MagnifyingGlassIcon, EyeIcon, PencilIcon } from '@heroicons/react/24/outline';
import { DataTable } from '@/components/DataTable';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface Pais {
  codpais: number;
  siglapais: string;
  nomepais: string;
  data_criacao?: string;
  data_alteracao?: string;
  situacao?: string;
}

const PaisesPage: React.FC = () => {
  const [paises, setPaises] = useState<Pais[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedPais, setSelectedPais] = useState<Pais | null>(null);
  const [formData, setFormData] = useState<Pais>({ 
    codpais: 0, 
    siglapais: '', 
    nomepais: '',
    situacao: undefined
  });
  const [sortKey, setSortKey] = useState<keyof Pais>('nomepais');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPaises();
  }, []);

  const fetchPaises = async () => {
    try {
      const response = await fetch('/api/paises');
      const data = await response.json();
      setPaises(data);
    } catch (error) {
      console.error('Erro ao carregar países:', error);
    }
  };

  const handleSort = (key: keyof Pais) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const handleOpenModal = (pais?: Pais) => {
    if (pais) {
      setFormData(pais);
      setSelectedPais(pais);
    } else {
      setFormData({ 
        codpais: 0, 
        siglapais: '', 
        nomepais: '',
        situacao: undefined
      });
      setSelectedPais(null);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPais(null);
  };

  const handleOpenDeleteModal = (pais: Pais) => {
    setSelectedPais(pais);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedPais(null);
  };

  const handleOpenDetailsModal = (pais: Pais) => {
    setSelectedPais(pais);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedPais(null);
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
    try {
      const url = '/api/paises';
      const method = selectedPais ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        fetchPaises();
        handleCloseModal();
        toast.success(selectedPais ? 'País atualizado com sucesso!' : 'País cadastrado com sucesso!');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Erro ao salvar país');
      }
    } catch (error) {
      console.error('Erro ao salvar país:', error);
      toast.error('Erro ao salvar país');
    }
  };

  const handleDelete = async () => {
    if (!selectedPais) return;

    try {
      const response = await fetch(`/api/paises?codpais=${selectedPais.codpais}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchPaises();
        handleCloseDeleteModal();
        toast.success('País excluído com sucesso!');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Erro ao excluir país');
      }
    } catch (error) {
      console.error('Erro ao excluir país:', error);
      toast.error('Erro ao excluir país');
    }
  };

  const sortedPaises = [...paises]
    .filter(pais => 
      pais.codpais.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      pais.siglapais.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pais.nomepais.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }
      return sortDirection === 'asc' 
        ? String(aValue).localeCompare(String(bValue))
        : String(bValue).localeCompare(String(aValue));
    });

  const columns = [
    { key: 'codpais', label: 'Código' },
    { key: 'siglapais', label: 'Sigla' },
    { key: 'nomepais', label: 'Nome' },
    {
      key: 'situacao',
      label: 'Status',
      render: (pais: Pais) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          pais.situacao ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
        }`}>
          {pais.situacao ? '🔴 Inativo' : '🟢 Ativo'}
        </span>
      )
    }
  ];

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold leading-6 text-gray-900">Países</h1>
          <p className="mt-2 text-sm text-gray-700">
            Lista de todos os países cadastrados no sistema.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none flex items-center gap-3">
          <div className="relative">
            <Input
              type="text"
              placeholder="Buscar país..."
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
            Novo País
          </Button>
        </div>
      </div>

      <div className="mt-6">
        <DataTable
          data={sortedPaises}
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
          sortKey={sortKey}
          sortDirection={sortDirection}
          onSort={handleSort}
        />
      </div>

      {/* Dialog de Formulário */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedPais ? 'Editar País' : 'Novo País'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="codpais">Código</Label>
                <Input
                  id="codpais"
                  value={selectedPais ? formData.codpais : ''}
                  disabled
                  className="bg-gray-50"
                  placeholder={selectedPais ? '' : 'Auto'}
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
                  disabled={!selectedPais}
                  className={`flex h-9 w-full rounded-md border border-input px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 ${
                    !selectedPais ? 'bg-gray-50' : 'bg-transparent'
                  }`}
                >
                  <option value="ATIVO">🟢 Ativo</option>
                  <option value="INATIVO">🔴 Inativo</option>
                </select>
              </div>
            </div>
            <div>
              <Label htmlFor="siglapais">Sigla (2 caracteres)</Label>
              <Input
                id="siglapais"
                value={formData.siglapais}
                onChange={(e) => setFormData({ ...formData, siglapais: e.target.value.toUpperCase() })}
                required
                maxLength={2}
                placeholder="Ex: BR, US, AR"
              />
            </div>
            <div>
              <Label htmlFor="nomepais">Nome</Label>
              <Input
                id="nomepais"
                value={formData.nomepais}
                onChange={(e) => setFormData({ ...formData, nomepais: e.target.value })}
                required
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseModal}
              >
                Cancelar
              </Button>
              <Button type="submit" className="bg-violet-600 hover:bg-violet-500">
                {selectedPais ? 'Atualizar' : 'Cadastrar'}
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
              Detalhes do País
            </DialogTitle>
          </DialogHeader>
          
          {selectedPais && (
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
                    <span className="text-sm font-mono text-gray-900 bg-gray-50 px-2 py-1 rounded">{selectedPais.codpais}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">Status:</span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      selectedPais.situacao ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {selectedPais.situacao ? '🔴 Inativo' : '🟢 Ativo'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">Sigla:</span>
                    <span className="text-sm font-mono text-gray-900 bg-blue-50 px-3 py-2 rounded font-bold text-blue-800">
                      {selectedPais.siglapais}
                    </span>
                  </div>
                  <div className="md:col-span-2">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm font-medium text-gray-600">Nome do País:</span>
                      <span className="text-sm font-semibold text-gray-900 text-right max-w-[250px]">{selectedPais.nomepais}</span>
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
                      {formatDateTime(selectedPais.data_criacao || '')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">Última Atualização:</span>
                    <span className="text-sm font-mono text-gray-900 bg-gray-50 px-2 py-1 rounded">
                      {formatDateTime(selectedPais.data_alteracao || '')}
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
                handleOpenModal(selectedPais!);
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
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir País</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>Tem certeza que deseja excluir este país?</p>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDeleteModal}
              >
                Cancelar
              </Button>
              <Button 
                type="button"
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-500"
              >
                Excluir
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default PaisesPage; 