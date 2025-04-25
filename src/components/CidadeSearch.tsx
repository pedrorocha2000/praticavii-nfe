'use client';

import { useState, useEffect } from 'react';

interface Cidade {
  codcid: number;
  nomecidade: string;
  nomeestado: string;
}

interface CidadeSearchProps {
  onSelect: (cidade: Cidade) => void;
  defaultValue?: string;
}

export function CidadeSearch({ onSelect, defaultValue = '' }: CidadeSearchProps) {
  const [searchTerm, setSearchTerm] = useState(defaultValue);
  const [suggestions, setSuggestions] = useState<Cidade[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (searchTerm.length >= 3) {
      fetchCidades();
    } else {
      setSuggestions([]);
    }
  }, [searchTerm]);

  const fetchCidades = async () => {
    try {
      const response = await fetch(`/api/cidades/search?q=${encodeURIComponent(searchTerm)}`);
      if (!response.ok) throw new Error('Erro ao buscar cidades');
      const data = await response.json();
      setSuggestions(data);
    } catch (error) {
      console.error('Erro ao buscar cidades:', error);
      setSuggestions([]);
    }
  };

  const handleSelect = (cidade: Cidade) => {
    setSearchTerm(`${cidade.nomecidade} - ${cidade.nomeestado}`);
    setShowSuggestions(false);
    onSelect(cidade);
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setShowSuggestions(true);
        }}
        onFocus={() => setShowSuggestions(true)}
        placeholder="Digite o nome da cidade..."
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
      />
      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-60 overflow-auto">
          {suggestions.map((cidade) => (
            <li
              key={cidade.codcid}
              onClick={() => handleSelect(cidade)}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
            >
              {cidade.nomecidade} - {cidade.nomeestado}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
} 
 
 
 