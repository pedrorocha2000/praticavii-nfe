'use client';

import { useState } from 'react';

export default function TesteNFe() {
  const [nfeData, setNfeData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const buscarNFe = async () => {
    try {
      const response = await fetch('/api/nfe/55/1/1234');
      if (!response.ok) {
        throw new Error('Erro ao buscar NFe');
      }
      const data = await response.json();
      setNfeData(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar NFe');
      setNfeData(null);
    }
  };

  return (
    <div className="p-4">
      <button
        onClick={buscarNFe}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Buscar NFe
      </button>

      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {nfeData && (
        <div className="mt-4">
          <h2 className="text-xl font-bold mb-4">Dados da NFe</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold">Informações Básicas</h3>
              <p>Modelo: {nfeData.modelo}</p>
              <p>Série: {nfeData.serie}</p>
              <p>Número: {nfeData.numnfe}</p>
              <p>Natureza: {nfeData.naturezaoperacao}</p>
              <p>Data Emissão: {new Date(nfeData.dataemissao).toLocaleDateString()}</p>
              <p>Valor Total: R$ {nfeData.valortotal}</p>
            </div>

            <div>
              <h3 className="font-semibold">Fornecedor</h3>
              <p>Nome: {nfeData.fornecedor}</p>
              <p>CNPJ: {nfeData.cnpj_fornecedor}</p>
              <p>Endereço: {nfeData.endereco_fornecedor}, {nfeData.numero_fornecedor}</p>
              <p>Complemento: {nfeData.complemento_fornecedor}</p>
              <p>Bairro: {nfeData.bairro_fornecedor}</p>
              <p>CEP: {nfeData.cep_fornecedor}</p>
              <p>Cidade: {nfeData.cidade_fornecedor} - {nfeData.estado_fornecedor}</p>
            </div>

            <div>
              <h3 className="font-semibold">Transportadora</h3>
              <p>Nome: {nfeData.transportadora}</p>
              <p>CNPJ: {nfeData.cnpj_transportadora}</p>
              <p>Placa: {nfeData.placa_veiculo}</p>
            </div>

            <div>
              <h3 className="font-semibold">Produtos</h3>
              <ul>
                {nfeData.produtos.map((produto: any, index: number) => (
                  <li key={index} className="mb-2">
                    {produto.nome} - Qtd: {produto.quantidade} - 
                    R$ {produto.valorunitario} - Total: R$ {produto.valortotal}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold">Parcelas</h3>
              <ul>
                {nfeData.parcelas.map((parcela: any, index: number) => (
                  <li key={index} className="mb-2">
                    Parcela {parcela.numparc} - 
                    Vencimento: {new Date(parcela.datavencimento).toLocaleDateString()} - 
                    Valor: R$ {parcela.valorparcela} - 
                    Forma: {parcela.forma_pagamento}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 