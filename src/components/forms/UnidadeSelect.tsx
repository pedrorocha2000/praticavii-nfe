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

export interface UnidadeMedida {
  codunidade: number;
  nome_unidade: string;
  sigla_unidade: string;
}

interface UnidadeSelectProps {
  value?: UnidadeMedida | null;
  onSelect: (unidade: UnidadeMedida) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function UnidadeSelect({ value, onSelect, placeholder = "Selecione uma unidade", disabled = false }: UnidadeSelectProps) {
  const [unidades, setUnidades] = useState<UnidadeMedida[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState<UnidadeMedida>({
    codunidade: 0,
    nome_unidade: '',
    sigla_unidade: ''
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (isModalOpen) {
      fetchUnidades();
    }
  }, [isModalOpen]);

  const fetchUnidades = async () => {
    try {
      const response = await fetch('/api/unidades-medida');
      if (!response.ok) throw new Error('Erro ao carregar unidades');
      const data = await response.json();
      setUnidades(data);
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao carregar unidades');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome_unidade.trim()) {
      toast.error('Nome da unidade é obrigatório');
      return;
    }

    if (!formData.sigla_unidade.trim()) {
      toast.error('Sigla da unidade é obrigatória');
      return;
    }

    try {
      const response = await fetch('/api/unidades-medida', {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        await fetchUnidades();
        setIsFormOpen(false);
        setFormData({
          codunidade: 0,
          nome_unidade: '',
          sigla_unidade: ''
        });
        setIsEditing(false);
        toast.success(isEditing ? 'Unidade atualizada com sucesso!' : 'Unidade cadastrada com sucesso!');
        
        // Se não estava editando, seleciona a unidade recém-criada
        if (!isEditing) {
          onSelect(data);
          setIsModalOpen(false);
        }
      } else {
        toast.error(data.error || 'Erro ao salvar unidade');
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao salvar unidade');
    }
  };

  const handleSelect = (unidade: UnidadeMedida) => {
    onSelect(unidade);
    setIsModalOpen(false);
  };

  const filteredUnidades = unidades.filter(unidade =>
    unidade.nome_unidade.toLowerCase().includes(searchTerm.toLowerCase()) ||
    unidade.sigla_unidade.toLowerCase().includes(searchTerm.toLowerCase()) ||
    unidade.codunidade.toString().includes(searchTerm)
  );

  const columns = [
    { key: 'codunidade', label: 'Código' },
    { key: 'nome_unidade', label: 'Nome da Unidade' },
    { key: 'sigla_unidade', label: 'Sigla' },
  ];

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          value={value ? `${value.sigla_unidade} - ${value.nome_unidade}` : ''}
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
            <DialogTitle>Selecionar Unidade</DialogTitle>
          </DialogHeader>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 relative">
              <Input
                type="text"
                placeholder="Buscar unidade..."
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
                  codunidade: 0,
                  nome_unidade: '',
                  sigla_unidade: ''
                });
                setIsEditing(false);
                setIsFormOpen(true);
              }}
              className="bg-violet-600 hover:bg-violet-500 shrink-0"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Nova Unidade
            </Button>
          </div>

          <DataTable
            data={filteredUnidades}
            columns={columns}
            onRowClick={handleSelect}
          />
        </DialogContent>
      </Dialog>

      {/* Modal de Formulário */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Editar Unidade' : 'Nova Unidade'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="nome_unidade">Nome da Unidade *</Label>
              <Input
                id="nome_unidade"
                value={formData.nome_unidade}
                onChange={(e) => setFormData({ ...formData, nome_unidade: e.target.value })}
                placeholder="Digite o nome da unidade"
                required
              />
            </div>
            <div>
              <Label htmlFor="sigla_unidade">Sigla *</Label>
              <Input
                id="sigla_unidade"
                value={formData.sigla_unidade}
                onChange={(e) => setFormData({ ...formData, sigla_unidade: e.target.value })}
                placeholder="Digite a sigla"
                required
                maxLength={10}
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