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

interface Marca {
  codmarca: number;
  nome_marca: string;
}

interface MarcaSelectProps {
  value?: Marca | null;
  onSelect: (marca: Marca) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function MarcaSelect({ value, onSelect, placeholder = "Selecione uma marca", disabled = false }: MarcaSelectProps) {
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState<Marca>({
    codmarca: 0,
    nome_marca: ''
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (isModalOpen) {
      fetchMarcas();
    }
  }, [isModalOpen]);

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
          nome_marca: ''
        });
        setIsEditing(false);
        toast.success(isEditing ? 'Marca atualizada com sucesso!' : 'Marca cadastrada com sucesso!');
        
        // Se não estava editando, seleciona a marca recém-criada
        if (!isEditing) {
          onSelect(data);
          setIsModalOpen(false);
        }
      } else {
        toast.error(data.error || 'Erro ao salvar marca');
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao salvar marca');
    }
  };

  const handleSelect = (marca: Marca) => {
    onSelect(marca);
    setIsModalOpen(false);
  };

  const filteredMarcas = marcas.filter(marca =>
    marca.nome_marca.toLowerCase().includes(searchTerm.toLowerCase()) ||
    marca.codmarca.toString().includes(searchTerm)
  );

  const columns = [
    { key: 'codmarca', label: 'Código' },
    { key: 'nome_marca', label: 'Nome da Marca' },
  ];

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          value={value?.nome_marca || ''}
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
            <DialogTitle>Selecionar Marca</DialogTitle>
          </DialogHeader>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 relative">
              <Input
                type="text"
                placeholder="Buscar marca..."
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
                  codmarca: 0,
                  nome_marca: ''
                });
                setIsEditing(false);
                setIsFormOpen(true);
              }}
              className="bg-violet-600 hover:bg-violet-500 shrink-0"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Nova Marca
            </Button>
          </div>

          <DataTable
            data={filteredMarcas}
            columns={columns}
            onRowClick={handleSelect}
          />
        </DialogContent>
      </Dialog>

      {/* Modal de Formulário */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Editar Marca' : 'Nova Marca'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="nome_marca">Nome da Marca *</Label>
              <Input
                id="nome_marca"
                value={formData.nome_marca}
                onChange={(e) => setFormData({ ...formData, nome_marca: e.target.value })}
                placeholder="Digite o nome da marca"
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