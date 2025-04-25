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

interface FormaPagamento {
  codformapgto: number;
  descricao: string;
  tipo: 'D' | 'C' | 'B' | 'P'; // Dinheiro, Cartão, Boleto, Pix
}

interface FormaPagamentoSelectProps {
  value?: FormaPagamento | null;
  onChange: (formaPagamento: FormaPagamento | null) => void;
  error?: string;
}

export function FormaPagamentoSelect({ value, onChange, error }: FormaPagamentoSelectProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formasPagamento, setFormasPagamento] = useState<FormaPagamento[]>([]);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formData, setFormData] = useState<FormaPagamento>({
    codformapgto: 0,
    descricao: '',
    tipo: 'D'
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isModalOpen) {
      fetchFormasPagamento();
    }
  }, [isModalOpen]);

  const fetchFormasPagamento = async () => {
    try {
      const response = await fetch('/api/formas-pagamento');
      const data = await response.json();
      setFormasPagamento(data);
    } catch (error) {
      console.error('Erro ao carregar formas de pagamento:', error);
      toast.error('Erro ao carregar formas de pagamento');
    }
  };

  const handleSelect = (formaPagamento: FormaPagamento) => {
    onChange(formaPagamento);
    setIsModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/formas-pagamento', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        await fetchFormasPagamento();
        setIsFormModalOpen(false);
        handleSelect(data);
        toast.success('Forma de pagamento cadastrada com sucesso!');
      } else {
        toast.error(data.error || 'Erro ao salvar forma de pagamento');
      }
    } catch (error) {
      console.error('Erro ao salvar forma de pagamento:', error);
      toast.error('Erro ao salvar forma de pagamento. Tente novamente.');
    }
  };

  const filteredFormasPagamento = formasPagamento.filter(formaPagamento => 
    formaPagamento.codformapgto.toString().includes(searchTerm.toLowerCase()) ||
    formaPagamento.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getTipoLabel(formaPagamento.tipo).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTipoLabel = (tipo: 'D' | 'C' | 'B' | 'P') => {
    switch (tipo) {
      case 'D': return 'Dinheiro';
      case 'C': return 'Cartão';
      case 'B': return 'Boleto';
      case 'P': return 'PIX';
      default: return '';
    }
  };

  const columns = [
    { key: 'codformapgto', label: 'Código' },
    { key: 'descricao', label: 'Descrição' },
    { 
      key: 'tipo', 
      label: 'Tipo', 
      render: (formaPagamento: FormaPagamento) => getTipoLabel(formaPagamento.tipo)
    },
  ];

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          value={value?.descricao || ''}
          readOnly
          placeholder="Selecione uma forma de pagamento"
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
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Selecionar Forma de Pagamento</DialogTitle>
          </DialogHeader>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 relative">
              <Input
                type="text"
                placeholder="Buscar forma de pagamento..."
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
              Nova Forma de Pagamento
            </Button>
          </div>

          <DataTable
            data={filteredFormasPagamento}
            columns={columns}
            onRowClick={handleSelect}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog de Formulário */}
      <Dialog open={isFormModalOpen} onOpenChange={setIsFormModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Forma de Pagamento</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="codformapgto">Código</Label>
              <Input
                id="codformapgto"
                type="number"
                value={formData.codformapgto || ''}
                onChange={(e) => setFormData({ ...formData, codformapgto: parseInt(e.target.value) || 0 })}
                required
              />
            </div>
            <div>
              <Label htmlFor="descricao">Descrição</Label>
              <Input
                id="descricao"
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="tipo">Tipo</Label>
              <select
                id="tipo"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                value={formData.tipo}
                onChange={(e) => setFormData({ ...formData, tipo: e.target.value as 'D' | 'C' | 'B' | 'P' })}
                required
              >
                <option value="D">Dinheiro</option>
                <option value="C">Cartão</option>
                <option value="B">Boleto</option>
                <option value="P">PIX</option>
              </select>
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