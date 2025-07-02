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
}

interface FormaPagamentoSelectProps {
  value?: FormaPagamento | null;
  onChange: (formaPagamento: FormaPagamento | null) => void;
  error?: string;
  onFormaPagamentoCreated?: () => void;
}

export function FormaPagamentoSelect({ value, onChange, error, onFormaPagamentoCreated }: FormaPagamentoSelectProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formasPagamento, setFormasPagamento] = useState<FormaPagamento[]>([]);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formData, setFormData] = useState<FormaPagamento>({
    codformapgto: 0,
    descricao: ''
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
    setSearchTerm(''); // Limpar busca
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Impede que o evento suba para o formulário pai
    try {
      const response = await fetch('/api/formas-pagamento', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ descricao: formData.descricao }),
      });

      const data = await response.json();

      if (response.ok) {
        // Atualizar a lista de formas de pagamento
        await fetchFormasPagamento();
        // Notificar o componente pai para atualizar sua lista também
        if (onFormaPagamentoCreated) {
          onFormaPagamentoCreated();
        }
        // Fechar o modal de criação
        setIsFormModalOpen(false);
        // Limpar o formulário
        setFormData({ codformapgto: 0, descricao: '' });
        // Mostrar mensagem de sucesso
        toast.success('Forma de pagamento cadastrada com sucesso! Agora selecione na lista.');
        // NÃO auto-selecionar - deixar o usuário escolher da lista manualmente
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
    formaPagamento.descricao.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { key: 'codformapgto', label: 'Código', className: 'w-20' },
    { key: 'descricao', label: 'Descrição', className: 'flex-1' },
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

          <div className="max-h-[400px] overflow-y-auto">
          <DataTable
            data={filteredFormasPagamento}
            columns={columns}
            onRowClick={handleSelect}
          />
          </div>
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
              <Label htmlFor="descricao">Descrição *</Label>
              <Input
                id="descricao"
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                placeholder="Digite a descrição da forma de pagamento"
                required
                maxLength={50}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsFormModalOpen(false);
                  setFormData({ codformapgto: 0, descricao: '' });
                }}
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