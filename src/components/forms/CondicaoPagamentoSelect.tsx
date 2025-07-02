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
} from "@/components/ui/dialog";
import { toast } from "sonner";
import CondicoesPagamentoForm from './CondicoesPagamentoForm';

interface CondicaoPagamento {
  codcondpgto: number;
  descricao: string;
  juros_perc: number;
  multa_perc: number;
  desconto_perc: number;
  parcelas: Array<{
    numparc: number;
    codformapgto: number;
    dias: number;
    percentual: number;
  }>;
}

interface CondicaoPagamentoSelectProps {
  value: CondicaoPagamento | null;
  onChange: (condicao: CondicaoPagamento | null) => void;
  required?: boolean;
  error?: string;
  onCondicaoCreated?: () => void;
}

export default function CondicaoPagamentoSelect({ value, onChange, required = false, error, onCondicaoCreated }: CondicaoPagamentoSelectProps) {
  const [condicoes, setCondicoes] = useState<CondicaoPagamento[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    if (isModalOpen) {
      fetchCondicoes();
    }
  }, [isModalOpen]);

  const fetchCondicoes = async () => {
    try {
      const response = await fetch('/api/cond_pgto');
      if (!response.ok) throw new Error('Erro ao carregar condições de pagamento');
      const data = await response.json();
      setCondicoes(data);
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao carregar condições de pagamento');
    }
  };

  const handleSelect = (condicao: CondicaoPagamento) => {
    onChange(condicao);
    setIsModalOpen(false);
    setSearchTerm(''); // Limpar busca
  };

  const filteredCondicoes = condicoes.filter(condicao =>
    condicao.codcondpgto.toString().includes(searchTerm.toLowerCase()) ||
    condicao.descricao.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatParcelasInfo = (parcelas: CondicaoPagamento['parcelas']) => {
    if (!parcelas || parcelas.length === 0) return '-';
    return parcelas.map(parcela => 
      `${parcela.percentual}% em ${parcela.dias} dias`
    ).join(' + ');
  };

  const columns = [
    { key: 'descricao', label: 'Descrição', className: 'flex-1' },
    { 
      key: 'parcelas', 
      label: 'Parcelas',
      className: 'w-96',
      render: (item: CondicaoPagamento) => formatParcelasInfo(item.parcelas)
    },
  ];

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          value={value?.descricao || ''}
          readOnly
          placeholder="Selecione uma condição de pagamento"
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
            <DialogTitle>Selecionar Condição de Pagamento</DialogTitle>
          </DialogHeader>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 relative">
              <Input
                type="text"
                placeholder="Buscar condição de pagamento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-2.5 text-gray-400" />
            </div>
            <CondicoesPagamentoForm
              isOpen={isFormOpen}
              onOpenChange={setIsFormOpen}
              onSuccess={() => {
                fetchCondicoes();
                setIsFormOpen(false);
                if (onCondicaoCreated) {
                  onCondicaoCreated();
                }
                toast.success('Condição de pagamento cadastrada com sucesso! Agora selecione na lista.');
              }}
              trigger={
                <Button className="bg-violet-600 hover:bg-violet-500 shrink-0">
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Nova Condição de Pagamento
                </Button>
              }
            />
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            <DataTable
              data={filteredCondicoes}
              columns={columns}
              onRowClick={handleSelect}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 