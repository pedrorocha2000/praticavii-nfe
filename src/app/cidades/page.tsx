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
import { EstadoSelect } from '@/components/forms/EstadoSelect';
import { PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface Cidade {
  codcid: number;
  nomecidade: string;
  codest: string;
  nomeestado?: string;
}

export default function CidadesPage() {
  const [cidades, setCidades] = useState<Cidade[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [cidadeToDelete, setCidadeToDelete] = useState<Cidade | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState<Omit<Cidade, 'nomeestado'>>({
    codcid: 0,
    nomecidade: '',
    codest: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<keyof Cidade>('nomecidade');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

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
          codest: ''
        });
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
      codest: cidade.codest
    });
    setIsEditing(true);
    setIsFormOpen(true);
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

  const filteredAndSortedCidades = cidades
    .filter(cidade => 
      cidade.codcid.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      cidade.nomecidade.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cidade.nomeestado || '').toLowerCase().includes(searchTerm.toLowerCase())
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
    { key: 'nomecidade', label: 'Nome' },
    { key: 'nomeestado', label: 'Estado' },
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
                codest: ''
              });
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
            <div>
              <Label htmlFor="codcid">Código</Label>
              <Input
                id="codcid"
                type="number"
                value={formData.codcid || ''}
                onChange={(e) => setFormData({ ...formData, codcid: parseInt(e.target.value) || 0 })}
                required
                disabled={isEditing}
              />
            </div>
            <div>
              <Label htmlFor="nomecidade">Nome</Label>
              <Input
                id="nomecidade"
                value={formData.nomecidade}
                onChange={(e) => setFormData({ ...formData, nomecidade: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>Estado</Label>
              <EstadoSelect
                value={formData.codest ? { codest: formData.codest } as any : null}
                onChange={(estado) => estado && setFormData({ ...formData, codest: estado.codest })}
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

      {/* Dialog de Confirmação de Exclusão */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Tem certeza que deseja excluir a cidade {cidadeToDelete?.nomecidade}?</p>
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