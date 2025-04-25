'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import { PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
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
  codpais: string;
  nomepais: string;
}

const PaisesPage: React.FC = () => {
  const [paises, setPaises] = useState<Pais[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedPais, setSelectedPais] = useState<Pais | null>(null);
  const [formData, setFormData] = useState<Pais>({ codpais: '', nomepais: '' });
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
      setFormData({ codpais: '', nomepais: '' });
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
      pais.codpais.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pais.nomepais.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    });

  const columns = [
    { key: 'codpais', label: 'Código' },
    { key: 'nomepais', label: 'Nome' },
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
            <div>
              <Label htmlFor="codpais">Código</Label>
              <Input
                id="codpais"
                value={formData.codpais}
                onChange={(e) => setFormData({ ...formData, codpais: e.target.value })}
                required
                disabled={!!selectedPais}
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