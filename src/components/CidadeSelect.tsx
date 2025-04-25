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
import EstadoSelect from './EstadoSelect';
import PaisSelect from './PaisSelect';

interface Cidade {
  codcid: string;
  nomecidade: string;
  codest: string;
  nomeestado: string;
  nomepais: string;
}

interface CidadeSelectProps {
  value: string;
  onChange: (value: string) => void;
  codest?: string;
  required?: boolean;
}

export default function CidadeSelect({ value, onChange, codest, required = false }: CidadeSelectProps) {
  const [cidades, setCidades] = useState<Cidade[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPais, setSelectedPais] = useState('');
  const [formData, setFormData] = useState<Omit<Cidade, 'nomeestado' | 'nomepais'>>({
    codcid: '',
    nomecidade: '',
    codest: codest || '',
  });

  useEffect(() => {
    fetchCidades();
  }, [codest, selectedPais]);

  const fetchCidades = async () => {
    try {
      let url = '/api/cidades';
      if (codest) {
        url += `?codest=${codest}`;
      } else if (selectedPais) {
        url += `?codpais=${selectedPais}`;
      }
      const response = await fetch(url);
      const data = await response.json();
      setCidades(data);
    } catch (error) {
      console.error('Erro ao carregar cidades:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/cidades', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        fetchCidades();
        setIsModalOpen(false);
        setFormData({
          codcid: '',
          nomecidade: '',
          codest: codest || '',
        });
        setSelectedPais('');
      } else {
        const error = await response.json();
        alert(error.error || 'Erro ao cadastrar cidade');
      }
    } catch (error) {
      console.error('Erro ao cadastrar cidade:', error);
      alert('Erro ao cadastrar cidade');
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
          <option value="">Selecione uma cidade</option>
          {cidades.map((cidade) => (
            <option key={cidade.codcid} value={cidade.codcid}>
              {cidade.nomecidade} - {cidade.nomeestado} - {cidade.nomepais}
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
            <DialogTitle>Nova Cidade</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="codcid">Código</Label>
              <Input
                id="codcid"
                value={formData.codcid}
                onChange={(e) => setFormData({ ...formData, codcid: e.target.value })}
                required
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
              <Label>País</Label>
              <PaisSelect
                value={selectedPais}
                onChange={setSelectedPais}
                required
              />
            </div>
            <div>
              <Label>Estado</Label>
              <EstadoSelect
                value={formData.codest}
                onChange={(value) => setFormData({ ...formData, codest: value })}
                codpais={selectedPais}
                required
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