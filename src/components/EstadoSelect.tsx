'use client';

import { useState, useEffect } from 'react';
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
import { PaisSelect } from '@/components/forms/PaisSelect';

interface Estado {
  codest: string;
  nomeestado: string;
  codpais: string;
  nomepais: string;
}

interface Pais {
  codpais: string;
  nomepais: string;
}

interface EstadoSelectProps {
  value: string;
  onChange: (value: string) => void;
  codpais?: string;
  required?: boolean;
}

export default function EstadoSelect({ value, onChange, codpais: defaultCodPais, required = false }: EstadoSelectProps) {
  const [estados, setEstados] = useState<Estado[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPais, setSelectedPais] = useState<Pais | null>(null);
  const [formData, setFormData] = useState<Omit<Estado, 'nomepais'>>({
    codest: '',
    nomeestado: '',
    codpais: defaultCodPais || '',
  });

  useEffect(() => {
    if (defaultCodPais) {
      fetchEstados(defaultCodPais);
    }
  }, [defaultCodPais]);

  useEffect(() => {
    if (selectedPais) {
      setFormData(prev => ({ ...prev, codpais: selectedPais.codpais }));
      fetchEstados(selectedPais.codpais);
    }
  }, [selectedPais]);

  const fetchEstados = async (codpais?: string) => {
    try {
      const url = codpais 
        ? `/api/estados?codpais=${codpais}`
        : '/api/estados';
      const response = await fetch(url);
      const data = await response.json();
      setEstados(data);
    } catch (error) {
      console.error('Erro ao carregar estados:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.codpais) {
      alert('Selecione um país');
      return;
    }
    try {
      const response = await fetch('/api/estados', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const novoEstado = await response.json();
        fetchEstados(formData.codpais);
        setIsModalOpen(false);
        onChange(novoEstado.codest);
        setFormData({
          codest: '',
          nomeestado: '',
          codpais: defaultCodPais || '',
        });
        setSelectedPais(null);
      } else {
        const error = await response.json();
        alert(error.error || 'Erro ao cadastrar estado');
      }
    } catch (error) {
      console.error('Erro ao cadastrar estado:', error);
      alert('Erro ao cadastrar estado');
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          required={required}
        >
          <option value="">Selecione um estado</option>
          {estados.map((estado) => (
            <option key={estado.codest} value={estado.codest}>
              {estado.nomeestado} - {estado.nomepais}
            </option>
          ))}
        </select>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => setIsModalOpen(true)}
          className="shrink-0"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
          >
            <path d="M5 12h14" />
            <path d="M12 5v14" />
          </svg>
        </Button>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
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
                error={formData.codpais ? undefined : 'Selecione um país'}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" className="bg-violet-600 hover:bg-violet-500">
                Cadastrar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 