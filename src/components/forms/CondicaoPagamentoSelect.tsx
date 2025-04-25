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
}

export default function CondicaoPagamentoSelect({ value, onChange, required = false }: CondicaoPagamentoSelectProps) {
  const [condicoes, setCondicoes] = useState<CondicaoPagamento[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    fetchCondicoes();
  }, []);

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

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSearchTerm('');
  };

  const handleSelect = (condicao: CondicaoPagamento) => {
    onChange(condicao);
    handleCloseModal();
  };

  const filteredCondicoes = condicoes.filter(condicao =>
    condicao.descricao.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatParcelasInfo = (parcelas: CondicaoPagamento['parcelas']) => {
    return parcelas.map(parcela => 
      `${parcela.percentual}% em ${parcela.dias} dias`
    ).join(' + ');
  };

  return (
    <div>
      <Button
        type="button"
        variant="outline"
        className="w-full justify-between"
        onClick={handleOpenModal}
      >
        {value ? value.descricao : "Selecione uma condição de pagamento"}
      </Button>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Selecionar Condição de Pagamento</DialogTitle>
          </DialogHeader>

          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-2 flex-1">
              <Input
                placeholder="Pesquisar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <CondicoesPagamentoForm
              isOpen={isFormOpen}
              onOpenChange={setIsFormOpen}
              onSuccess={() => {
                fetchCondicoes();
                setIsFormOpen(false);
              }}
              trigger={
                <Button>
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Nova Condição
                </Button>
              }
            />
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            <DataTable
              data={filteredCondicoes}
              columns={[
                { key: 'codcondpgto', label: 'Código' },
                { key: 'descricao', label: 'Descrição' },
                { 
                  key: 'parcelas', 
                  label: 'Parcelas',
                  render: (item: CondicaoPagamento) => formatParcelasInfo(item.parcelas)
                },
              ]}
              onRowClick={handleSelect}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseModal}>
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 