'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { PrinterIcon } from '@heroicons/react/24/outline';

interface NFe {
  numnfe: number;
  serie: number;
  natureza_operacao: string;
  data_emissao: string;
  valor_total: number;
  valor_produtos: number;
  valor_frete: number;
  valor_seguro: number;
  valor_desconto: number;
  base_calculo_icms: number;
  valor_icms: number;
  base_calculo_icms_st: number;
  valor_icms_st: number;
  quantidade_volumes: number;
  especie: string;
  peso_bruto: number;
  peso_liquido: number;
  forma_pagamento: string;
  condicao_pagamento: string;
  num_parcelas: number;
  prazo_medio: number;
  emitente: {
    nomerazao: string;
    nomefantasia: string;
    cnpj: string;
    inscricao_estadual: string;
    inscricao_municipal: string;
    endereco: string;
    numero: string;
    complemento: string;
    bairro: string;
    cidade: string;
    uf: string;
    cep: string;
    telefone: string;
    email: string;
  };
  participante: {
    nomerazao: string;
    nomefantasia: string;
    cpfcnpj: string;
    inscricao_estadual: string;
    inscricao_municipal: string;
    endereco: string;
    numero: string;
    complemento: string;
    bairro: string;
    cidade: string;
    uf: string;
    cep: string;
    telefone: string;
    email: string;
  };
  transportadora?: {
    nomerazao: string;
    cpfcnpj: string;
    inscricao_estadual: string;
    endereco: string;
    cidade: string;
    uf: string;
  };
  veiculo?: {
    placa: string;
    uf: string;
    descricao: string;
  };
  itens: {
    codprod: number;
    descricao: string;
    unidade: string;
    quantidade: number;
    valor_unitario: number;
    valor_total: number;
  }[];
}

export default function NFePage() {
  const params = useParams();
  const [nfe, setNfe] = useState<NFe | null>(null);

  useEffect(() => {
    fetchNFe();
  }, []);

  const fetchNFe = async () => {
    try {
      const response = await fetch(`/api/nfe_${params.tipo}/${params.numnfe}`);
      const data = await response.json();
      setNfe(data);
    } catch (error) {
      console.error('Erro ao carregar nota fiscal:', error);
      alert('Erro ao carregar nota fiscal');
    }
  };

  if (!nfe) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-gray-500">Carregando nota fiscal...</div>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          Nota Fiscal Eletrônica - {nfe.numnfe.toString().padStart(9, '0')}
        </h1>
        <button
          onClick={handlePrint}
          className="flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          <PrinterIcon className="h-5 w-5 mr-2" />
          Imprimir
        </button>
      </div>

      <div className="space-y-6 print:space-y-4">
        <div className="grid grid-cols-2 gap-8 print:gap-4">
          <div>
            <h2 className="text-lg font-medium mb-4">Emitente</h2>
            <div className="space-y-2">
              <p className="font-medium">{nfe.emitente.nomerazao}</p>
              <p>{nfe.emitente.nomefantasia}</p>
              <p>CNPJ: {nfe.emitente.cnpj}</p>
              <p>IE: {nfe.emitente.inscricao_estadual}</p>
              <p>IM: {nfe.emitente.inscricao_municipal}</p>
              <p>{`${nfe.emitente.endereco}, ${nfe.emitente.numero}`}</p>
              {nfe.emitente.complemento && <p>{nfe.emitente.complemento}</p>}
              <p>{`${nfe.emitente.bairro} - ${nfe.emitente.cidade}/${nfe.emitente.uf}`}</p>
              <p>CEP: {nfe.emitente.cep}</p>
              <p>Telefone: {nfe.emitente.telefone}</p>
              <p>E-mail: {nfe.emitente.email}</p>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-medium mb-4">
              {params.tipo === 'entrada' ? 'Fornecedor' : 'Cliente'}
            </h2>
            <div className="space-y-2">
              <p className="font-medium">{nfe.participante.nomerazao}</p>
              <p>{nfe.participante.nomefantasia}</p>
              <p>CPF/CNPJ: {nfe.participante.cpfcnpj}</p>
              <p>IE: {nfe.participante.inscricao_estadual}</p>
              <p>IM: {nfe.participante.inscricao_municipal}</p>
              <p>{`${nfe.participante.endereco}, ${nfe.participante.numero}`}</p>
              {nfe.participante.complemento && <p>{nfe.participante.complemento}</p>}
              <p>{`${nfe.participante.bairro} - ${nfe.participante.cidade}/${nfe.participante.uf}`}</p>
              <p>CEP: {nfe.participante.cep}</p>
              <p>Telefone: {nfe.participante.telefone}</p>
              <p>E-mail: {nfe.participante.email}</p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-medium mb-4">Dados da Nota</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p><span className="font-medium">Número:</span> {nfe.numnfe.toString().padStart(9, '0')}</p>
              <p><span className="font-medium">Série:</span> {nfe.serie}</p>
              <p><span className="font-medium">Data de Emissão:</span> {new Date(nfe.data_emissao).toLocaleDateString('pt-BR')}</p>
              <p><span className="font-medium">Natureza da Operação:</span> {nfe.natureza_operacao}</p>
            </div>
            <div>
              <p><span className="font-medium">Forma de Pagamento:</span> {nfe.forma_pagamento}</p>
              <p><span className="font-medium">Condição de Pagamento:</span> {nfe.condicao_pagamento}</p>
              <p><span className="font-medium">Número de Parcelas:</span> {nfe.num_parcelas}</p>
              <p><span className="font-medium">Prazo Médio:</span> {nfe.prazo_medio} dias</p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-medium mb-4">Produtos</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Produto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Un
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Qtde
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor Unit.
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {nfe.itens.map((item, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.descricao}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.unidade}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {item.quantidade}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {item.valor_unitario.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {item.valor_total.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {nfe.transportadora && (
          <div>
            <h2 className="text-lg font-medium mb-4">Dados do Transporte</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p><span className="font-medium">Transportadora:</span> {nfe.transportadora.nomerazao}</p>
                <p><span className="font-medium">CPF/CNPJ:</span> {nfe.transportadora.cpfcnpj}</p>
                <p><span className="font-medium">IE:</span> {nfe.transportadora.inscricao_estadual}</p>
                <p><span className="font-medium">Endereço:</span> {nfe.transportadora.endereco}</p>
                <p><span className="font-medium">Cidade/UF:</span> {nfe.transportadora.cidade}/{nfe.transportadora.uf}</p>
              </div>
              <div>
                {nfe.veiculo && (
                  <>
                    <p><span className="font-medium">Veículo:</span> {nfe.veiculo.descricao}</p>
                    <p><span className="font-medium">Placa:</span> {nfe.veiculo.placa}/{nfe.veiculo.uf}</p>
                  </>
                )}
                <p><span className="font-medium">Volumes:</span> {nfe.quantidade_volumes}</p>
                <p><span className="font-medium">Espécie:</span> {nfe.especie}</p>
                <p><span className="font-medium">Peso Bruto:</span> {nfe.peso_bruto} kg</p>
                <p><span className="font-medium">Peso Líquido:</span> {nfe.peso_liquido} kg</p>
              </div>
            </div>
          </div>
        )}

        <div>
          <h2 className="text-lg font-medium mb-4">Totais</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p><span className="font-medium">Base de Cálculo do ICMS:</span> {nfe.base_calculo_icms.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
              <p><span className="font-medium">Valor do ICMS:</span> {nfe.valor_icms.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
              <p><span className="font-medium">Base de Cálculo do ICMS ST:</span> {nfe.base_calculo_icms_st.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
              <p><span className="font-medium">Valor do ICMS ST:</span> {nfe.valor_icms_st.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
            </div>
            <div>
              <p><span className="font-medium">Valor dos Produtos:</span> {nfe.valor_produtos.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
              <p><span className="font-medium">Valor do Frete:</span> {nfe.valor_frete.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
              <p><span className="font-medium">Valor do Seguro:</span> {nfe.valor_seguro.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
              <p><span className="font-medium">Valor do Desconto:</span> {nfe.valor_desconto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
              <p className="text-lg font-bold mt-2">
                <span className="font-medium">Valor Total da Nota:</span> {nfe.valor_total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 