'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { PrinterIcon } from '@heroicons/react/24/outline';

interface Produto {
  modelo: number;
  serie: number;
  numnfe: number;
  codprod: number;
  quantidade: string;
  valorunitario: string;
  valortotal: string;
  baseicms: string;
  aliqicms: string;
  valoricms: string;
  baseipi: string;
  aliqipi: string;
  valoripi: string;
  basepis: string;
  aliqpis: string;
  valorpis: string;
  basecofins: string;
  aliqcofins: string;
  valorcofins: string;
  descricaoProduto: string;
  unidade: string;
}

interface NFe {
  modelo: number;
  serie: number;
  numnfe: number;
  codforn: number;
  nomerazao: string;
  cpfcnpj: string;
  dataEmissao: string;
  valorTotal: number;
  nometransportadora: string | null;
  formapagamento: string;
  condicaopagamento: string;
}

export default function NFePage() {
  const params = useParams();
  const [nfe, setNfe] = useState<(NFe & { produtos: Produto[] }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.modelo && params.serie && params.numnfe) {
      fetchNFeData();
    }
  }, [params.modelo, params.serie, params.numnfe]);

  const fetchNFeData = async () => {
    try {
      if (!params.modelo || !params.serie || !params.numnfe) {
        throw new Error('Parâmetros inválidos');
      }

      // Buscar dados da nota fiscal
      const nfeResponse = await fetch(`/api/nfe_entrada?modelo=${params.modelo}&serie=${params.serie}&numnfe=${params.numnfe}`);
      if (!nfeResponse.ok) {
        const errorData = await nfeResponse.json();
        throw new Error(errorData.error || 'Erro ao carregar nota fiscal');
      }
      const nfeData = await nfeResponse.json();

      // Buscar produtos da nota fiscal
      const produtosResponse = await fetch(`/api/produtos-nfe?modelo=${params.modelo}&serie=${params.serie}&numnfe=${params.numnfe}`);
      if (!produtosResponse.ok) {
        const errorData = await produtosResponse.json();
        throw new Error(errorData.error || 'Erro ao carregar produtos da nota fiscal');
      }
      const produtosData = await produtosResponse.json();

      // Combinar os dados
      setNfe({
        ...nfeData,
        produtos: produtosData
      });
      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar nota fiscal:', error);
      setError(error instanceof Error ? error.message : 'Erro ao carregar nota fiscal');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-gray-500">Carregando nota fiscal...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!nfe) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-gray-500">Nota fiscal não encontrada</div>
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
          className="flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 print:hidden"
        >
          <PrinterIcon className="h-5 w-5 mr-2" />
          Imprimir
        </button>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4 p-4 border rounded">
          <div>
            <h2 className="text-lg font-medium mb-2">Dados da Nota</h2>
            <div className="space-y-1">
              <p><span className="font-medium">Número:</span> {nfe.numnfe.toString().padStart(9, '0')}</p>
              <p><span className="font-medium">Série:</span> {nfe.serie}</p>
              <p><span className="font-medium">Data de Emissão:</span> {new Date(nfe.dataEmissao).toLocaleDateString('pt-BR')}</p>
              <p><span className="font-medium">Valor Total:</span> {new Intl.NumberFormat('pt-BR', { 
                style: 'currency', 
                currency: 'BRL' 
              }).format(nfe.valorTotal)}
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-medium mb-2">Fornecedor</h2>
            <div className="space-y-1">
              <p><span className="font-medium">Nome/Razão Social:</span> {nfe.nomerazao}</p>
              <p><span className="font-medium">CPF/CNPJ:</span> {nfe.cpfcnpj}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 p-4 border rounded">
          <div>
            <h2 className="text-lg font-medium mb-2">Pagamento</h2>
            <div className="space-y-1">
              <p><span className="font-medium">Forma de Pagamento:</span> {nfe.formapagamento}</p>
              <p><span className="font-medium">Condição de Pagamento:</span> {nfe.condicaopagamento}</p>
            </div>
          </div>

          {nfe.nometransportadora && (
            <div>
              <h2 className="text-lg font-medium mb-2">Transporte</h2>
              <div className="space-y-1">
                <p><span className="font-medium">Transportadora:</span> {nfe.nometransportadora}</p>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border rounded">
          <h2 className="text-lg font-medium mb-4">Produtos</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Código</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descrição</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Qtde</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Un</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Valor Un</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Base ICMS</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">% ICMS</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Valor ICMS</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Base IPI</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">% IPI</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Valor IPI</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {nfe.produtos?.map((produto, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2">{produto.codprod}</td>
                    <td className="px-4 py-2">{produto.descricaoProduto}</td>
                    <td className="px-4 py-2 text-right">{parseFloat(produto.quantidade).toLocaleString('pt-BR')}</td>
                    <td className="px-4 py-2 text-center">{produto.unidade}</td>
                    <td className="px-4 py-2 text-right">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(parseFloat(produto.valorunitario))}
                    </td>
                    <td className="px-4 py-2 text-right">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(parseFloat(produto.valortotal))}
                    </td>
                    <td className="px-4 py-2 text-right">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(parseFloat(produto.baseicms))}
                    </td>
                    <td className="px-4 py-2 text-right">
                      {new Intl.NumberFormat('pt-BR', { style: 'percent', minimumFractionDigits: 2 }).format(parseFloat(produto.aliqicms) / 100)}
                    </td>
                    <td className="px-4 py-2 text-right">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(parseFloat(produto.valoricms))}
                    </td>
                    <td className="px-4 py-2 text-right">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(parseFloat(produto.baseipi))}
                    </td>
                    <td className="px-4 py-2 text-right">
                      {new Intl.NumberFormat('pt-BR', { style: 'percent', minimumFractionDigits: 2 }).format(parseFloat(produto.aliqipi) / 100)}
                    </td>
                    <td className="px-4 py-2 text-right">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(parseFloat(produto.valoripi))}
                    </td>
                  </tr>
                ))}
                <tr className="bg-gray-50 font-medium">
                  <td colSpan={5} className="px-4 py-2 text-right">Total Geral:</td>
                  <td className="px-4 py-2 text-right">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                      nfe.produtos.reduce((total, produto) => total + parseFloat(produto.valortotal), 0)
                    )}
                  </td>
                  <td className="px-4 py-2 text-right">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                      nfe.produtos.reduce((total, produto) => total + parseFloat(produto.baseicms), 0)
                    )}
                  </td>
                  <td></td>
                  <td className="px-4 py-2 text-right">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                      nfe.produtos.reduce((total, produto) => total + parseFloat(produto.valoricms), 0)
                    )}
                  </td>
                  <td className="px-4 py-2 text-right">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                      nfe.produtos.reduce((total, produto) => total + parseFloat(produto.baseipi), 0)
                    )}
                  </td>
                  <td></td>
                  <td className="px-4 py-2 text-right">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                      nfe.produtos.reduce((total, produto) => total + parseFloat(produto.valoripi), 0)
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 