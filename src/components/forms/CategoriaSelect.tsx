'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { toast } from "sonner";
import { DataTable } from '@/components/DataTable';

interface Categoria {
  codcategoria: number;
  nome_categoria: string;
}

interface CategoriaSelectProps {
  value?: Categoria | null;
  onSelect: (categoria: Categoria) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function CategoriaSelect({ value, onSelect, placeholder = "Selecione uma categoria", disabled = false }: CategoriaSelectProps) {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState<Categoria>({
    codcategoria: 0,
    nome_categoria: ''
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (isModalOpen) {
      fetchCategorias();
    }
  }, [isModalOpen]);

  const fetchCategorias = async () => {
    try {
      const response = await fetch('/api/categorias');
      if (!response.ok) throw new Error('Erro ao carregar categorias');
      const data = await response.json();
      setCategorias(data);
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao carregar categorias');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome_categoria.trim()) {
      toast.error('Nome da categoria é obrigatório');
      return;
    }

    try {
      const response = await fetch('/api/categorias', {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        await fetchCategorias();
        setIsFormOpen(false);
        setFormData({
          codcategoria: 0,
          nome_categoria: ''
        });
        setIsEditing(false);
        toast.success(isEditing ? 'Categoria atualizada com sucesso!' : 'Categoria cadastrada com sucesso!');
        
        // Se não estava editando, seleciona a categoria recém-criada
        if (!isEditing) {
          onSelect(data);
          setIsModalOpen(false);
        }
      } else {
        toast.error(data.error || 'Erro ao salvar categoria');
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao salvar categoria');
    }
  };

  const handleSelect = (categoria: Categoria) => {
    onSelect(categoria);
    setIsModalOpen(false);
  };

  const filteredCategorias = categorias.filter(categoria =>
    categoria.nome_categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
    categoria.codcategoria.toString().includes(searchTerm)
  );

  const columns = [
    { key: 'codcategoria', label: 'Código' },
    { key: 'nome_categoria', label: 'Nome da Categoria' },
  ];

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          value={value?.nome_categoria || ''}
          readOnly
          placeholder={placeholder}
          disabled={disabled}
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsModalOpen(true)}
          disabled={disabled}
        >
          Selecionar
        </Button>
      </div>

      {/* Modal de Seleção */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Selecionar Categoria</DialogTitle>
          </DialogHeader>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 relative">
              <Input
                type="text"
                placeholder="Buscar categoria..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-2.5 text-gray-400" />
            </div>
            <Button
              type="button"
              onClick={() => {
                setFormData({
                  codcategoria: 0,
                  nome_categoria: ''
                });
                setIsEditing(false);
                setIsFormOpen(true);
              }}
              className="bg-violet-600 hover:bg-violet-500 shrink-0"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Nova Categoria
            </Button>
          </div>

          <DataTable
            data={filteredCategorias}
            columns={columns}
            onRowClick={handleSelect}
          />
        </DialogContent>
      </Dialog>

      {/* Modal de Formulário */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Editar Categoria' : 'Nova Categoria'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="nome_categoria">Nome da Categoria *</Label>
              <Input
                id="nome_categoria"
                value={formData.nome_categoria}
                onChange={(e) => setFormData({ ...formData, nome_categoria: e.target.value })}
                placeholder="Digite o nome da categoria"
                required
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-violet-600 hover:bg-violet-500">
                {isEditing ? 'Atualizar' : 'Salvar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 