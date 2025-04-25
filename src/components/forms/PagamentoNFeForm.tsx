'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { CondicaoPagamentoSelect } from './CondicaoPagamentoSelect';

interface FormaPagamento {
  codforma: number;
  descricao: string;
}

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

export interface DadosPagamento {
  codforma?: number;
  forma_pagamento?: string;
  codcond?: number;
  condicao_pagamento?: string;
  num_parcelas?: number;
  prazo_medio?: number;
}

interface PagamentoNFeFormProps {
  dados: DadosPagamento;
  onChange: (dados: DadosPagamento) => void;
}

export default function PagamentoNFeForm({ dados, onChange }: PagamentoNFeFormProps) {
  const [formasPagamento, setFormasPagamento] = useState<FormaPagamento[]>([]);
  const [selectedCondicao, setSelectedCondicao] = useState<CondicaoPagamento | null>(null);

  useEffect(() => {
    fetchFormasPagamento();
    if (dados.codcond) {
      fetchCondicao(dados.codcond);
    }
  }, [dados.codcond]);

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

  const fetchCondicao = async (codcond: number) => {
    try {
      const response = await fetch(`/api/cond_pgto/${codcond}`);
      if (!response.ok) throw new Error('Erro ao carregar condição de pagamento');
      const data = await response.json();
      setSelectedCondicao(data);
    } catch (error) {
      console.error('Erro ao carregar condição de pagamento:', error);
      toast.error('Erro ao carregar condição de pagamento');
    }
  };

  const handleFormaPagamentoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const codforma = parseInt(e.target.value);
    const forma = formasPagamento.find(f => f.codforma === codforma);
    
    onChange({
      ...dados,
      codforma: codforma || undefined,
      forma_pagamento: forma?.descricao
    });
  };

  const handleCondicaoChange = (condicao: CondicaoPagamento | null) => {
    setSelectedCondicao(condicao);
    onChange({
      ...dados,
      codcond: condicao?.codcondpgto,
      condicao_pagamento: condicao?.descricao,
      num_parcelas: condicao?.parcelas.length,
      prazo_medio: condicao ? Math.max(...condicao.parcelas.map(p => p.dias)) : undefined
    });
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Forma de Pagamento
        </label>
        <select
          value={dados.codforma || ''}
          onChange={handleFormaPagamentoChange}
          className="w-full rounded border p-2"
          required
        >
          <option value="">Selecione uma forma de pagamento</option>
          {formasPagamento.map((forma) => (
            <option key={forma.codforma} value={forma.codforma}>
              {forma.descricao}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Condição de Pagamento
        </label>
        <CondicaoPagamentoSelect
          value={selectedCondicao}
          onChange={handleCondicaoChange}
          required
        />
      </div>

      {selectedCondicao && (
        <div className="col-span-2">
          <div className="mt-2 text-sm text-gray-600">
            <p>Parcelas: {selectedCondicao.parcelas.map(p => 
              `${p.percentual}% em ${p.dias} dias`
            ).join(' + ')}</p>
            <p>Juros: {selectedCondicao.juros_perc}%</p>
            <p>Multa: {selectedCondicao.multa_perc}%</p>
            <p>Desconto: {selectedCondicao.desconto_perc}%</p>
          </div>
        </div>
      )}
    </div>
  );
} 