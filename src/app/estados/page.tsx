'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import { PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { DataTable } from '@/components/DataTable';
import { PaisSelect } from '@/components/forms/PaisSelect';
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
  codpais: string;
  nomepais: string;
}

interface Estado {
  codest: string;
  nomeestado: string;
  codpais: string;
  nomepais: string;
}

const EstadosPage: React.FC = () => {
  const [estados, setEstados] = useState<Estado[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedEstado, setSelectedEstado] = useState<Estado | null>(null);
  const [formData, setFormData] = useState<Omit<Estado, 'nomepais'>>({
    codest: '',
    nomeestado: '',
    codpais: '',
  });
  const [selectedPais, setSelectedPais] = useState<Pais | null>(null);
  const [sortKey, setSortKey] = useState<keyof Estado>('nomeestado');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [searchTerm, setSearchTerm] = useState('');

  // Carregar dados
  useEffect(() => {
    fetchEstados();
  }, []);

  useEffect(() => {
    if (selectedEstado) {
      setSelectedPais({
        codpais: selectedEstado.codpais,
        nomepais: selectedEstado.nomepais
      });
    }
  }, [selectedEstado]);

  const fetchEstados = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/estados');
      if (!response.ok) {
        throw new Error('Erro ao carregar estados');
      }
      const data = await response.json();
      setEstados(data);
    } catch (error) {
      console.error('Erro ao carregar estados:', error);
      toast.error('Erro ao carregar estados');
    } finally {
      setIsLoading(false);
    }
  };

  // Ordenação
  const handleSort = (key: keyof Estado) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  // Modal de formulário
  const handleOpenModal = (estado?: Estado) => {
    if (estado) {
      setFormData({
        codest: estado.codest,
        nomeestado: estado.nomeestado,
        codpais: estado.codpais,
      });
      setSelectedEstado(estado);
    } else {
      setFormData({
        codest: '',
        nomeestado: '',
        codpais: '',
      });
      setSelectedPais(null);
      setSelectedEstado(null);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEstado(null);
    setSelectedPais(null);
  };

  // Modal de confirmação de exclusão
  const handleOpenDeleteModal = (estado: Estado) => {
    setSelectedEstado(estado);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedEstado(null);
  };

  // Manipulação do formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPais) {
      toast.error('Selecione um país');
      return;
    }

    try {
      const url = '/api/estados';
      const method = selectedEstado ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          codpais: selectedPais.codpais
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao salvar estado');
      }

      await fetchEstados();
      handleCloseModal();
      toast.success(selectedEstado ? 'Estado atualizado com sucesso!' : 'Estado cadastrado com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar estado:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao salvar estado');
    }
  };

  // Exclusão
  const handleDelete = async () => {
    if (!selectedEstado) return;

    try {
      const response = await fetch(`/api/estados?codest=${selectedEstado.codest}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao excluir estado');
      }

      await fetchEstados();
      handleCloseDeleteModal();
      toast.success('Estado excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir estado:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao excluir estado');
    }
  };

  // Ordenar dados
  const sortedEstados = estados ? [...estados]
    .filter(estado => 
      estado.codest.toLowerCase().includes(searchTerm.toLowerCase()) ||
      estado.nomeestado.toLowerCase().includes(searchTerm.toLowerCase()) ||
      estado.nomepais.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }) : [];

  const columns = [
    { key: 'codest', label: 'Código' },
    { key: 'nomeestado', label: 'Nome' },
    { key: 'nomepais', label: 'País' },
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
            onClick={() => handleOpenModal()}
            className="bg-violet-600 hover:bg-violet-500"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Novo Estado
          </Button>
        </div>
      </div>

      <div className="mt-6">
        <DataTable
          data={sortedEstados}
          columns={columns}
          onEdit={handleOpenModal}
          onDelete={handleOpenDeleteModal}
          sortKey={sortKey}
          sortDirection={sortDirection}
          onSort={handleSort}
          isLoading={isLoading}
        />
      </div>

      {/* Dialog de Formulário */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedEstado ? 'Editar Estado' : 'Novo Estado'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="codest">Código</Label>
              <Input
                id="codest"
                value={formData.codest}
                onChange={(e) => setFormData({ ...formData, codest: e.target.value })}
                required
                disabled={!!selectedEstado}
              />
            </div>
            <div>
              <Label htmlFor="nomeestado">Nome</Label>
              <Input
                id="nomeestado"
                value={formData.nomeestado}
                onChange={(e) => setFormData({ ...formData, nomeestado: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>País</Label>
              <PaisSelect
                value={selectedPais}
                onChange={setSelectedPais}
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
              <Button
                type="submit"
                className="bg-violet-600 hover:bg-violet-500"
              >
                {selectedEstado ? 'Atualizar' : 'Cadastrar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmação de Exclusão */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Tem certeza que deseja excluir o estado {selectedEstado?.nomeestado}?</p>
          </div>
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
};

export default EstadosPage; 