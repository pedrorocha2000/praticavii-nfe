'use client';

import { useState, useEffect } from 'react';

interface Participante {
  codparticipante: number;
  nomerazao: string;
  nomefantasia: string;
  cpfcnpj: string;
  inscricao_estadual: string;
  inscricao_municipal: string;
  cep: string;
  endereco: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  uf: string;
  telefone: string;
  email: string;
}

interface ParticipanteFormProps {
  tipo: 'entrada' | 'saida';
  codparticipante: number;
}

export default function ParticipanteForm({ tipo, codparticipante }: ParticipanteFormProps) {
  const [participante, setParticipante] = useState<Participante | null>(null);

  useEffect(() => {
    fetchParticipante();
  }, [codparticipante]);

  const fetchParticipante = async () => {
    try {
      const url = tipo === 'entrada' 
        ? `/api/fornecedores/${codparticipante}`
        : `/api/clientes/${codparticipante}`;
      
      const response = await fetch(url);
      const data = await response.json();
      setParticipante(data);
    } catch (error) {
      console.error('Erro ao carregar dados do participante:', error);
      alert('Erro ao carregar dados do participante');
    }
  };

  if (!participante) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="text-gray-500">Carregando dados do participante...</div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Razão Social
        </label>
        <input
          type="text"
          value={participante.nomerazao}
          className="w-full rounded border p-2 bg-gray-100"
          disabled
        />
      </div>

      <div className="col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nome Fantasia
        </label>
        <input
          type="text"
          value={participante.nomefantasia}
          className="w-full rounded border p-2 bg-gray-100"
          disabled
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          CPF/CNPJ
        </label>
        <input
          type="text"
          value={participante.cpfcnpj}
          className="w-full rounded border p-2 bg-gray-100"
          disabled
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Inscrição Estadual
        </label>
        <input
          type="text"
          value={participante.inscricao_estadual}
          className="w-full rounded border p-2 bg-gray-100"
          disabled
        />
      </div>

      <div className="col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Inscrição Municipal
        </label>
        <input
          type="text"
          value={participante.inscricao_municipal}
          className="w-full rounded border p-2 bg-gray-100"
          disabled
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          CEP
        </label>
        <input
          type="text"
          value={participante.cep}
          className="w-full rounded border p-2 bg-gray-100"
          disabled
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Endereço
        </label>
        <input
          type="text"
          value={participante.endereco}
          className="w-full rounded border p-2 bg-gray-100"
          disabled
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Número
        </label>
        <input
          type="text"
          value={participante.numero}
          className="w-full rounded border p-2 bg-gray-100"
          disabled
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Complemento
        </label>
        <input
          type="text"
          value={participante.complemento}
          className="w-full rounded border p-2 bg-gray-100"
          disabled
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Bairro
        </label>
        <input
          type="text"
          value={participante.bairro}
          className="w-full rounded border p-2 bg-gray-100"
          disabled
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Cidade/UF
        </label>
        <input
          type="text"
          value={`${participante.cidade}/${participante.uf}`}
          className="w-full rounded border p-2 bg-gray-100"
          disabled
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Telefone
        </label>
        <input
          type="text"
          value={participante.telefone}
          className="w-full rounded border p-2 bg-gray-100"
          disabled
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          E-mail
        </label>
        <input
          type="text"
          value={participante.email}
          className="w-full rounded border p-2 bg-gray-100"
          disabled
        />
      </div>
    </div>
  );
} 