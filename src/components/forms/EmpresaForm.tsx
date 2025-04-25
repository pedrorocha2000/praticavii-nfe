'use client';

import { useState, useEffect } from 'react';

interface Empresa {
  codempresa: number;
  nomerazao: string;
  nomefantasia: string;
  cnpj: string;
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

export default function EmpresaForm() {
  const [empresa, setEmpresa] = useState<Empresa | null>(null);

  useEffect(() => {
    fetchEmpresa();
  }, []);

  const fetchEmpresa = async () => {
    try {
      const response = await fetch('/api/empresa');
      const data = await response.json();
      setEmpresa(data);
    } catch (error) {
      console.error('Erro ao carregar dados da empresa:', error);
      alert('Erro ao carregar dados da empresa');
    }
  };

  if (!empresa) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="text-gray-500">Carregando dados da empresa...</div>
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
          value={empresa.nomerazao}
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
          value={empresa.nomefantasia}
          className="w-full rounded border p-2 bg-gray-100"
          disabled
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          CNPJ
        </label>
        <input
          type="text"
          value={empresa.cnpj}
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
          value={empresa.inscricao_estadual}
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
          value={empresa.inscricao_municipal}
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
          value={empresa.cep}
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
          value={empresa.endereco}
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
          value={empresa.numero}
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
          value={empresa.complemento}
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
          value={empresa.bairro}
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
          value={`${empresa.cidade}/${empresa.uf}`}
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
          value={empresa.telefone}
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
          value={empresa.email}
          className="w-full rounded border p-2 bg-gray-100"
          disabled
        />
      </div>
    </div>
  );
} 