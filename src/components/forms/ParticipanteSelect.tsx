'use client';

import { useState, useEffect } from 'react';

interface Participante {
  codparticipante: number;
  nomerazao: string;
  cpfcnpj: string;
}

interface ParticipanteSelectProps {
  tipo: 'entrada' | 'saida';
  value: number;
  onChange: (codparticipante: number) => void;
}

export default function ParticipanteSelect({ tipo, value, onChange }: ParticipanteSelectProps) {
  const [participantes, setParticipantes] = useState<Participante[]>([]);
  const [search, setSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    fetchParticipantes();
  }, []);

  const fetchParticipantes = async () => {
    try {
      const url = tipo === 'entrada' 
        ? '/api/fornecedores'
        : '/api/clientes';
      
      const response = await fetch(url);
      const data = await response.json();
      setParticipantes(data);
    } catch (error) {
      console.error('Erro ao carregar participantes:', error);
      alert('Erro ao carregar participantes');
    }
  };

  const filteredParticipantes = participantes.filter(p => 
    p.nomerazao.toLowerCase().includes(search.toLowerCase()) ||
    p.cpfcnpj.includes(search)
  );

  const selectedParticipante = participantes.find(p => p.codparticipante === value);

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {tipo === 'entrada' ? 'Fornecedor' : 'Cliente'}
      </label>
      
      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
          placeholder={selectedParticipante 
            ? `${selectedParticipante.nomerazao} (${selectedParticipante.cpfcnpj})`
            : `Pesquisar ${tipo === 'entrada' ? 'fornecedor' : 'cliente'}...`
          }
          className="w-full rounded border p-2"
        />

        {showDropdown && (
          <div 
            className="absolute z-10 w-full mt-1 bg-white border rounded shadow-lg max-h-60 overflow-auto"
          >
            {filteredParticipantes.length === 0 ? (
              <div className="p-2 text-gray-500">
                Nenhum resultado encontrado
              </div>
            ) : (
              filteredParticipantes.map((participante) => (
                <div
                  key={participante.codparticipante}
                  className={`p-2 cursor-pointer hover:bg-gray-100 ${
                    participante.codparticipante === value ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => {
                    onChange(participante.codparticipante);
                    setSearch('');
                    setShowDropdown(false);
                  }}
                >
                  <div className="font-medium">
                    {participante.nomerazao}
                  </div>
                  <div className="text-sm text-gray-500">
                    {participante.cpfcnpj}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
} 