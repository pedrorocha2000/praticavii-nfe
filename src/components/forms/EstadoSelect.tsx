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
import { PaisSelect } from './PaisSelect';

interface Estado {
  codest: string;
  nomeestado: string;
  codpais: string;
  nomepais?: string;
}

interface EstadoSelectProps {
  value?: Estado | null;
  onChange: (estado: Estado | null) => void;
  error?: string;
}

export function EstadoSelect({ value, onChange, error }: EstadoSelectProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [estados, setEstados] = useState<Estado[]>([]);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formData, setFormData] = useState<Omit<Estado, 'nomepais'>>({
    codest: '',
    nomeestado: '',
    codpais: ''
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isModalOpen) {
      fetchEstados();
    }
  }, [isModalOpen]);

  const fetchEstados = async () => {
    try {
      const response = await fetch('/api/estados');
      const data = await response.json();
      setEstados(data);
    } catch (error) {
      console.error('Erro ao carregar estados:', error);
      toast.error('Erro ao carregar estados');
    }
  };

  const handleSelect = (estado: Estado) => {
    onChange(estado);
    setIsModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/estados', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        await fetchEstados();
        setIsFormModalOpen(false);
        handleSelect(data);
        toast.success('Estado cadastrado com sucesso!');
      } else {
        toast.error(data.error || 'Erro ao salvar estado');
      }
    } catch (error) {
      console.error('Erro ao salvar estado:', error);
      toast.error('Erro ao salvar estado. Tente novamente.');
    }
  };

  const filteredEstados = estados.filter(estado => 
    estado.codest.toLowerCase().includes(searchTerm.toLowerCase()) ||
    estado.nomeestado.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (estado.nomepais || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { key: 'codest', label: 'Código' },
    { key: 'nomeestado', label: 'Nome' },
    { key: 'nomepais', label: 'País' },
  ];

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          value={value?.nomeestado || ''}
          readOnly
          placeholder="Selecione um estado"
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
            <DialogTitle>Selecionar Estado</DialogTitle>
          </DialogHeader>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 relative">
              <Input
                type="text"
                placeholder="Buscar estado..."
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
              Novo Estado
            </Button>
          </div>

          <DataTable
            data={filteredEstados}
            columns={columns}
            onRowClick={handleSelect}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog de Formulário */}
      <Dialog open={isFormModalOpen} onOpenChange={setIsFormModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Novo Estado</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="codest">Código</Label>
              <Input
                id="codest"
                value={formData.codest}
                onChange={(e) => setFormData({ ...formData, codest: e.target.value })}
                required
                maxLength={2}
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
                value={formData.codpais ? { codpais: formData.codpais } as any : null}
                onChange={(pais) => pais && setFormData({ ...formData, codpais: pais.codpais })}
                error={error}
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