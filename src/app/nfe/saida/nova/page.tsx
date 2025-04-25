'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import ParticipanteSelect from '@/components/forms/ParticipanteSelect';
import ParticipanteForm from '@/components/forms/ParticipanteForm';
import EmpresaForm from '@/components/forms/EmpresaForm';
import ItensNFeForm, { ItemNFe } from '@/components/forms/ItensNFeForm';
import TransporteNFeForm, { DadosTransporte } from '@/components/forms/TransporteNFeForm';
import PagamentoNFeForm, { DadosPagamento } from '@/components/forms/PagamentoNFeForm';
import TotaisNFeForm from '@/components/forms/TotaisNFeForm';

interface Step {
  title: string;
  description: string;
}

const steps: Step[] = [
  {
    title: 'Dados Básicos',
    description: 'Informações do emitente e destinatário'
  },
  {
    title: 'Produtos',
    description: 'Itens da nota fiscal'
  },
  {
    title: 'Transporte',
    description: 'Dados do transporte'
  },
  {
    title: 'Pagamento',
    description: 'Forma e condição de pagamento'
  },
  {
    title: 'Revisão',
    description: 'Conferência dos dados'
  }
];

interface Cliente {
  codcli: number;
  nomerazao: string;
  cpfcnpj: string;
  endereco: string;
  numero: string;
  bairro: string;
  cep: string;
  nomecidade: string;
  nomeestado: string;
}

interface Produto {
  codprod: number;
  nome: string;
  ncm: string;
  cfop: string;
  unidade: string;
  valorunitario: number;
}

interface ItemNFe {
  codprod: number;
  descricao: string;
  quantidade: number;
  valorunitario: number;
  valortotal: number;
  cfop: string;
  unidade: string;
}

export default function NovaNFeSaidaPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [codcliente, setCodCliente] = useState<number>(0);
  const [natureza_operacao, setNaturezaOperacao] = useState('Venda de Mercadorias');
  const [items, setItems] = useState<ItemNFe[]>([]);
  const [dadosTransporte, setDadosTransporte] = useState<DadosTransporte>({});
  const [dadosPagamento, setDadosPagamento] = useState<DadosPagamento>({});
  const [totais, setTotais] = useState({
    base_calculo_icms: 0,
    valor_icms: 0,
    base_calculo_icms_st: 0,
    valor_icms_st: 0,
    valor_produtos: 0,
    valor_frete: 0,
    valor_seguro: 0,
    valor_desconto: 0,
    valor_total: 0
  });

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [transportadoras, setTransportadoras] = useState<Transportadora[]>([]);
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  
  const [nfe, setNfe] = useState({
    cliente: null as Cliente | null,
    itens: [] as ItemNFe[],
    transportadora: null as Transportadora | null,
    veiculo: null as Veiculo | null,
    natureza_operacao: 'Venda de Mercadorias',
    volumes: 0,
    peso_bruto: 0,
    peso_liquido: 0,
    valor_total: 0,
    valor_frete: 0,
    valor_desconto: 0
  });

  useEffect(() => {
    fetchClientes();
    fetchProdutos();
    fetchTransportadoras();
  }, []);

  const fetchClientes = async () => {
    try {
      const response = await fetch('/api/clientes');
      const data = await response.json();
      setClientes(data);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
    }
  };

  const fetchProdutos = async () => {
    try {
      const response = await fetch('/api/produtos');
      const data = await response.json();
      setProdutos(data);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    }
  };

  const handleAddItem = (produto: Produto, quantidade: number) => {
    const item: ItemNFe = {
      codprod: produto.codprod,
      descricao: produto.nome,
      quantidade,
      valorunitario: produto.valorunitario,
      valortotal: quantidade * produto.valorunitario,
      cfop: produto.cfop,
      unidade: produto.unidade
    };

    setItems(prevItems => {
      const newItems = [...prevItems, item];
      updateTotais(newItems);
      return newItems;
    });
  };

  const handleRemoveItem = (codprod: number) => {
    setItems(prevItems => {
      const newItems = prevItems.filter(item => item.codprod !== codprod);
      updateTotais(newItems);
      return newItems;
    });
  };

  const handleUpdateItem = (codprod: number, quantidade: number, valorunitario: number) => {
    setItems(prevItems => {
      const newItems = prevItems.map(item => {
        if (item.codprod === codprod) {
          return {
            ...item,
            quantidade,
            valorunitario,
            valortotal: quantidade * valorunitario
          };
        }
        return item;
      });
      updateTotais(newItems);
      return newItems;
    });
  };

  const updateTotais = (items: ItemNFe[]) => {
    const valor_produtos = items.reduce((total, item) => total + item.valortotal, 0);
    
    setTotais(prev => ({
      ...prev,
      valor_produtos,
      valor_total: valor_produtos + prev.valor_frete + prev.valor_seguro - prev.valor_desconto
    }));
  };

  const handleFreteChange = (valor: number) => {
    setTotais(prev => ({
      ...prev,
      valor_frete: valor,
      valor_total: prev.valor_produtos + valor + prev.valor_seguro - prev.valor_desconto
    }));
  };

  const handleSeguroChange = (valor: number) => {
    setTotais(prev => ({
      ...prev,
      valor_seguro: valor,
      valor_total: prev.valor_produtos + prev.valor_frete + valor - prev.valor_desconto
    }));
  };

  const handleDescontoChange = (valor: number) => {
    setTotais(prev => ({
      ...prev,
      valor_desconto: valor,
      valor_total: prev.valor_produtos + prev.valor_frete + prev.valor_seguro - valor
    }));
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch('/api/nfe_saida', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          codcliente,
          natureza_operacao,
          items,
          transporte: dadosTransporte,
          pagamento: dadosPagamento,
          totais
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao gerar nota fiscal');
      }

      const data = await response.json();
      router.push(`/nfe/saida/${data.numnfe}`);
    } catch (error) {
      console.error('Erro ao gerar nota fiscal:', error);
      alert('Erro ao gerar nota fiscal');
    }
  };

  const canAdvance = () => {
    switch (currentStep) {
      case 0:
        return codcliente > 0 && natureza_operacao.trim() !== '';
      case 1:
        return items.length > 0;
      case 2:
        return true; // Transporte é opcional
      case 3:
        return dadosPagamento.codforma && dadosPagamento.codcond;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const handleClienteSelect = (cliente: Cliente) => {
    setCodCliente(cliente.codcli);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Nova Nota Fiscal de Saída</h1>

      <div className="mb-8">
        <nav aria-label="Progress">
          <ol className="flex items-center">
            {steps.map((step, index) => (
              <li
                key={step.title}
                className={`${
                  index !== steps.length - 1 ? 'pr-8 sm:pr-20' : ''
                } relative`}
              >
                <div className="flex items-center">
                  <div
                    className={`${
                      index <= currentStep
                        ? 'border-blue-600'
                        : 'border-gray-300'
                    } flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                      index === currentStep ? 'bg-blue-600 text-white' : ''
                    }`}
                  >
                    {index + 1}
                  </div>
                  <div className="ml-4 hidden sm:block">
                    <p className="text-sm font-medium">{step.title}</p>
                    <p className="text-sm text-gray-500">{step.description}</p>
                  </div>
                </div>
                {index !== steps.length - 1 && (
                  <div className="absolute left-0 top-4 hidden w-full sm:block">
                    <div className="h-0.5 w-full bg-gray-200" />
                  </div>
                )}
              </li>
            ))}
          </ol>
        </nav>
      </div>

      <div className="mb-8">
        {currentStep === 0 && (
          <div className="space-y-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Natureza da Operação
              </label>
              <input
                type="text"
                value={natureza_operacao}
                onChange={(e) => setNaturezaOperacao(e.target.value)}
                placeholder="Ex: Venda de mercadorias"
                className="w-full rounded border p-2"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div>
                <h2 className="text-lg font-medium mb-4">Emitente</h2>
                <EmpresaForm />
              </div>

              <div>
                <h2 className="text-lg font-medium mb-4">Destinatário</h2>
                <div className="mb-4">
                  <ParticipanteSelect
                    tipo="saida"
                    value={codcliente}
                    onChange={setCodCliente}
                  />
                </div>
                {codcliente > 0 && (
                  <ParticipanteForm
                    tipo="saida"
                    codparticipante={codcliente}
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {currentStep === 1 && (
          <div>
            <h2 className="text-lg font-medium mb-4">Produtos</h2>
            <ItensNFeForm
              tipo="saida"
              items={items}
              onAddItem={handleAddItem}
              onRemoveItem={handleRemoveItem}
              onUpdateItem={handleUpdateItem}
            />
          </div>
        )}

        {currentStep === 2 && (
          <div>
            <h2 className="text-lg font-medium mb-4">Dados do Transporte</h2>
            <TransporteNFeForm
              dados={dadosTransporte}
              onChange={setDadosTransporte}
            />
          </div>
        )}

        {currentStep === 3 && (
          <div>
            <h2 className="text-lg font-medium mb-4">Dados do Pagamento</h2>
            <PagamentoNFeForm
              dados={dadosPagamento}
              onChange={setDadosPagamento}
            />
          </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-8">
            <div>
              <h2 className="text-lg font-medium mb-4">Totais da Nota</h2>
              <TotaisNFeForm
                totais={totais}
                onFreteChange={handleFreteChange}
                onSeguroChange={handleSeguroChange}
                onDescontoChange={handleDescontoChange}
              />
            </div>

            <div>
              <h2 className="text-lg font-medium mb-4">Dados do Pagamento</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Forma de Pagamento
                  </label>
                  <input
                    type="text"
                    value={dadosPagamento.forma_pagamento || ''}
                    className="w-full rounded border p-2 bg-gray-100"
                    disabled
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Condição de Pagamento
                  </label>
                  <input
                    type="text"
                    value={dadosPagamento.condicao_pagamento || ''}
                    className="w-full rounded border p-2 bg-gray-100"
                    disabled
                  />
                </div>
              </div>
            </div>

            {dadosTransporte.codtrans && (
              <div>
                <h2 className="text-lg font-medium mb-4">Dados do Transporte</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Transportadora
                    </label>
                    <input
                      type="text"
                      value={dadosTransporte.nomerazao || ''}
                      className="w-full rounded border p-2 bg-gray-100"
                      disabled
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Veículo
                    </label>
                    <input
                      type="text"
                      value={dadosTransporte.placa ? `${dadosTransporte.placa}/${dadosTransporte.uf}` : ''}
                      className="w-full rounded border p-2 bg-gray-100"
                      disabled
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <button
          type="button"
          onClick={() => setCurrentStep(currentStep - 1)}
          disabled={currentStep === 0}
          className={`flex items-center px-4 py-2 ${
            currentStep === 0
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-gray-500 hover:bg-gray-600'
          } text-white rounded`}
        >
          <ChevronLeftIcon className="h-5 w-5 mr-2" />
          Anterior
        </button>

        {currentStep === steps.length - 1 ? (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canAdvance()}
            className={`px-4 py-2 ${
              canAdvance()
                ? 'bg-green-500 hover:bg-green-600'
                : 'bg-gray-300 cursor-not-allowed'
            } text-white rounded`}
          >
            Gerar Nota Fiscal
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setCurrentStep(currentStep + 1)}
            disabled={!canAdvance()}
            className={`flex items-center px-4 py-2 ${
              canAdvance()
                ? 'bg-blue-500 hover:bg-blue-600'
                : 'bg-gray-300 cursor-not-allowed'
            } text-white rounded`}
          >
            Próximo
            <ChevronRightIcon className="h-5 w-5 ml-2" />
          </button>
        )}
      </div>
    </div>
  );
} 