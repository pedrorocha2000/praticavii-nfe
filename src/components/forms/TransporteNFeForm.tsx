'use client';

import { useState, useEffect } from 'react';

interface Transportadora {
  codtrans: number;
  nomerazao: string;
  cpfcnpj: string;
}

interface Veiculo {
  placa: string;
  uf: string;
  descricao: string;
}

export interface DadosTransporte {
  codtrans?: number;
  nomerazao?: string;
  cpfcnpj?: string;
  placa?: string;
  uf?: string;
  quantidade_volumes?: number;
  especie?: string;
  peso_bruto?: number;
  peso_liquido?: number;
}

interface TransporteNFeFormProps {
  dados: DadosTransporte;
  onChange: (dados: DadosTransporte) => void;
}

export default function TransporteNFeForm({ dados, onChange }: TransporteNFeFormProps) {
  const [transportadoras, setTransportadoras] = useState<Transportadora[]>([]);
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);

  useEffect(() => {
    fetchTransportadoras();
  }, []);

  useEffect(() => {
    if (dados.codtrans) {
      fetchVeiculos(dados.codtrans);
    } else {
      setVeiculos([]);
    }
  }, [dados.codtrans]);

  const fetchTransportadoras = async () => {
    try {
      const response = await fetch('/api/transportadoras');
      const data = await response.json();
      setTransportadoras(data);
    } catch (error) {
      console.error('Erro ao carregar transportadoras:', error);
      alert('Erro ao carregar transportadoras');
    }
  };

  const fetchVeiculos = async (codtrans: number) => {
    try {
      const response = await fetch(`/api/veiculos?codtrans=${codtrans}`);
      const data = await response.json();
      setVeiculos(data);
    } catch (error) {
      console.error('Erro ao carregar veículos:', error);
      alert('Erro ao carregar veículos');
    }
  };

  const handleTransportadoraChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const codtrans = parseInt(e.target.value);
    const transportadora = transportadoras.find(t => t.codtrans === codtrans);
    
    onChange({
      ...dados,
      codtrans: codtrans || undefined,
      nomerazao: transportadora?.nomerazao,
      cpfcnpj: transportadora?.cpfcnpj,
      placa: undefined,
      uf: undefined
    });
  };

  const handleVeiculoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const placa = e.target.value;
    const veiculo = veiculos.find(v => v.placa === placa);
    
    onChange({
      ...dados,
      placa: placa || undefined,
      uf: veiculo?.uf
    });
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Transportadora
        </label>
        <select
          value={dados.codtrans || ''}
          onChange={handleTransportadoraChange}
          className="w-full rounded border p-2"
        >
          <option value="">Selecione uma transportadora</option>
          {transportadoras.map((transportadora) => (
            <option key={transportadora.codtrans} value={transportadora.codtrans}>
              {transportadora.nomerazao}
            </option>
          ))}
        </select>
      </div>

      {dados.codtrans && (
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Veículo
          </label>
          <select
            value={dados.placa || ''}
            onChange={handleVeiculoChange}
            className="w-full rounded border p-2"
          >
            <option value="">Selecione um veículo</option>
            {veiculos.map((veiculo) => (
              <option key={veiculo.placa} value={veiculo.placa}>
                {veiculo.descricao} - {veiculo.placa}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Quantidade de Volumes
        </label>
        <input
          type="number"
          value={dados.quantidade_volumes || ''}
          onChange={(e) => onChange({
            ...dados,
            quantidade_volumes: parseInt(e.target.value) || undefined
          })}
          className="w-full rounded border p-2"
          min="1"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Espécie
        </label>
        <input
          type="text"
          value={dados.especie || ''}
          onChange={(e) => onChange({
            ...dados,
            especie: e.target.value || undefined
          })}
          className="w-full rounded border p-2"
          placeholder="Ex: Caixa, Pacote, etc"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Peso Bruto
        </label>
        <input
          type="number"
          value={dados.peso_bruto || ''}
          onChange={(e) => onChange({
            ...dados,
            peso_bruto: parseFloat(e.target.value) || undefined
          })}
          className="w-full rounded border p-2"
          min="0.01"
          step="0.01"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Peso Líquido
        </label>
        <input
          type="number"
          value={dados.peso_liquido || ''}
          onChange={(e) => onChange({
            ...dados,
            peso_liquido: parseFloat(e.target.value) || undefined
          })}
          className="w-full rounded border p-2"
          min="0.01"
          step="0.01"
        />
      </div>
    </div>
  );
} 