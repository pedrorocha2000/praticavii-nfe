'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DataTable } from '@/components/DataTable';
import { PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
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

interface PaisSelectProps {
  value?: Pais | null;
  onChange: (pais: Pais | null) => void;
  error?: string;
}

export function PaisSelect({ value, onChange, error }: PaisSelectProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [paises, setPaises] = useState<Pais[]>([]);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formData, setFormData] = useState<Pais>({ codpais: '', nomepais: '' });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isModalOpen) {
      fetchPaises();
    }
  }, [isModalOpen]);

  const fetchPaises = async () => {
    try {
      const response = await fetch('/api/paises');
      const data = await response.json();
      setPaises(data);
    } catch (error) {
      console.error('Erro ao carregar países:', error);
      toast.error('Erro ao carregar países');
    }
  };

  const handleSelect = (pais: Pais) => {
    onChange(pais);
    setIsModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.codpais.length !== 2) {
      toast.error('O código do país deve ter exatamente 2 caracteres');
      return;
    }

    try {
      const response = await fetch('/api/paises', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        await fetchPaises();
        setIsFormModalOpen(false);
        handleSelect(data);
        toast.success('País cadastrado com sucesso!');
      } else {
        toast.error(data.error || 'Erro ao salvar país');
      }
    } catch (error) {
      console.error('Erro ao salvar país:', error);
      toast.error('Erro ao salvar país. Tente novamente.');
    }
  };

  const filteredPaises = paises.filter(pais => 
    pais.codpais.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pais.nomepais.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { key: 'codpais', label: 'Código' },
    { key: 'nomepais', label: 'Nome' },
  ];

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          value={value?.nomepais || ''}
          readOnly
          placeholder="Selecione um país"
          className={error && !isFormModalOpen ? 'border-red-500' : ''}
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsModalOpen(true)}
        >
          Selecionar
        </Button>
      </div>
      {error && !isFormModalOpen && <p className="text-sm text-red-500">{error}</p>}

      {/* Dialog de Seleção */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Selecionar País</DialogTitle>
          </DialogHeader>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 relative">
              <Input
                type="text"
                placeholder="Buscar país..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-2.5 text-gray-400" />
            </div>
            <Button
              type="button"
              onClick={() => setIsFormModalOpen(true)}
              className="bg-violet-600 hover:bg-violet-500 shrink-0"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Novo País
            </Button>
          </div>

          <DataTable
            data={filteredPaises}
            columns={columns}
            onRowClick={handleSelect}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog de Formulário */}
      <Dialog open={isFormModalOpen} onOpenChange={setIsFormModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Novo País</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="codpais">Código</Label>
              <Input
                id="codpais"
                value={formData.codpais}
                onChange={(e) => {
                  const value = e.target.value.toUpperCase();
                  setFormData({ ...formData, codpais: value });
                  if (value && value.length !== 2) {
                    toast.error('O código do país deve ter exatamente 2 caracteres');
                  }
                }}
                maxLength={2}
                required
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
                onClick={() => setIsFormModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" className="bg-violet-600 hover:bg-violet-500">
                Salvar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 