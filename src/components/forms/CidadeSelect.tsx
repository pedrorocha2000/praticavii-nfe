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
import { EstadoSelect } from './EstadoSelect';

interface Cidade {
  codcid: number;
  nomecidade: string;
  codest: number;
  nomeestado?: string;
  siglaest?: string;
  nomepais?: string;
}

interface Estado {
  codest: number;
  siglaest: string;
  nomeestado: string;
  codpais: number;
  nomepais?: string;
}

interface CidadeSelectProps {
  value?: Cidade | null;
  onChange: (cidade: Cidade | null) => void;
  error?: string;
}

export function CidadeSelect({ value, onChange, error }: CidadeSelectProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cidades, setCidades] = useState<Cidade[]>([]);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formData, setFormData] = useState<{ nomecidade: string; codest: number }>({
    nomecidade: '',
    codest: 0
  });
  const [selectedEstado, setSelectedEstado] = useState<Estado | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isModalOpen) {
      fetchCidades();
    }
  }, [isModalOpen]);

  const fetchCidades = async () => {
    try {
      const response = await fetch('/api/cidades');
      const data = await response.json();
      setCidades(data);
    } catch (error) {
      console.error('Erro ao carregar cidades:', error);
      toast.error('Erro ao carregar cidades');
    }
  };

  const handleSelect = (cidade: Cidade) => {
    onChange(cidade);
    setIsModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nomecidade.trim()) {
      toast.error('Nome da cidade é obrigatório');
      return;
    }

    if (!formData.codest) {
      toast.error('Estado é obrigatório');
      return;
    }

    try {
      const response = await fetch('/api/cidades', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        await fetchCidades();
        setIsFormModalOpen(false);
        setFormData({ nomecidade: '', codest: 0 });
        setSelectedEstado(null);
        handleSelect(data);
        toast.success('Cidade cadastrada com sucesso!');
      } else {
        toast.error(data.error || 'Erro ao salvar cidade');
      }
    } catch (error) {
      console.error('Erro ao salvar cidade:', error);
      toast.error('Erro ao salvar cidade. Tente novamente.');
    }
  };

  const handleEstadoSelect = (estado: Estado | null) => {
    setSelectedEstado(estado);
    setFormData({ ...formData, codest: estado?.codest || 0 });
  };

  const filteredCidades = cidades.filter(cidade => 
    cidade.codcid.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
    cidade.nomecidade.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (cidade.nomeestado || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (cidade.siglaest || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (cidade.nomepais || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { key: 'codcid', label: 'Código' },
    { key: 'nomecidade', label: 'Nome' },
    { key: 'siglaest', label: 'UF' },
    { key: 'nomeestado', label: 'Estado' },
  ];

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          value={value?.nomecidade || ''}
          readOnly
          placeholder="Selecione uma cidade"
          className={error ? 'border-red-500' : ''}
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsModalOpen(true)}
        >
          Selecionar
        </Button>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}

      {/* Dialog de Seleção */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Selecionar Cidade</DialogTitle>
          </DialogHeader>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 relative">
              <Input
                type="text"
                placeholder="Buscar cidade..."
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
              Nova Cidade
            </Button>
          </div>

          <DataTable
            data={filteredCidades}
            columns={columns}
            onRowClick={handleSelect}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog de Formulário */}
      <Dialog open={isFormModalOpen} onOpenChange={setIsFormModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nova Cidade</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="nomecidade">Nome da Cidade *</Label>
              <Input
                id="nomecidade"
                value={formData.nomecidade}
                onChange={(e) => setFormData({ ...formData, nomecidade: e.target.value })}
                placeholder="Digite o nome da cidade"
                required
                maxLength={100}
              />
            </div>
            <div>
              <Label>Estado *</Label>
              <EstadoSelect
                value={selectedEstado}
                onChange={handleEstadoSelect}
                error={!formData.codest ? 'Estado é obrigatório' : undefined}
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