'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Fornecedor {
  codforn: number;
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

interface Transportadora {
  codtrans: number;
  nomerazao: string;
  cpfcnpj: string;
}

interface Veiculo {
  placa: string;
  descricao: string;
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

interface DadosTransporte {
  codtrans: number;
  codveic: number;
  volumes: number;
  peso_bruto: number;
  peso_liquido: number;
}

interface DadosPagamento {
  codforma: number;
  codcond: number;
}

interface CondicaoPagamento {
  codcondpgto: number;
  descricao: string;
  parcelas: Array<{
    numparc: number;
    codformapgto: number;
    descricao_forma: string;
  }>;
}

interface FormaPagamento {
  codformapgto: number;
  descricao: string;
}

export default function NovaNFeEntradaPage() {
  const router = useRouter();
  const [etapaAtual, setEtapaAtual] = useState(1);
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [transportadoras, setTransportadoras] = useState<Transportadora[]>([]);
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [condicoesPagamento, setCondicoesPagamento] = useState<CondicaoPagamento[]>([]);
  const [formasPagamento, setFormasPagamento] = useState<FormaPagamento[]>([]);
  
  const [nfe, setNfe] = useState({
    fornecedor: null as Fornecedor | null,
    itens: [] as ItemNFe[],
    transportadora: null as Transportadora | null,
    veiculo: null as Veiculo | null,
    natureza_operacao: 'Compra de Mercadorias',
    volumes: 0,
    peso_bruto: 0,
    peso_liquido: 0,
    valor_total: 0,
    valor_frete: 0,
    valor_desconto: 0,
    codcondpgto: 0,
    codformapgto: 0
  });

  const [codforn, setCodForn] = useState<number>(0);
  const [natureza_operacao, setNaturezaOperacao] = useState('Compra de Mercadorias');
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

  useEffect(() => {
    fetchFornecedores();
    fetchProdutos();
    fetchTransportadoras();
    fetchCondicoesPagamento();
    fetchFormasPagamento();
  }, []);

  const fetchFornecedores = async () => {
    try {
      const response = await fetch('/api/fornecedores');
      const data = await response.json();
      setFornecedores(data);
    } catch (error) {
      console.error('Erro ao carregar fornecedores:', error);
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

  const fetchTransportadoras = async () => {
    try {
      const response = await fetch('/api/transportadoras');
      const data = await response.json();
      setTransportadoras(data);
    } catch (error) {
      console.error('Erro ao carregar transportadoras:', error);
    }
  };

  const fetchVeiculos = async (codtrans: number) => {
    try {
      const response = await fetch(`/api/veiculos?codtrans=${codtrans}`);
      const data = await response.json();
      setVeiculos(data);
    } catch (error) {
      console.error('Erro ao carregar veículos:', error);
    }
  };

  const fetchCondicoesPagamento = async () => {
    try {
      const response = await fetch('/api/cond_pgto');
      const data = await response.json();
      setCondicoesPagamento(data);
    } catch (error) {
      console.error('Erro ao carregar condições de pagamento:', error);
    }
  };

  const fetchFormasPagamento = async () => {
    try {
      const response = await fetch('/api/formas-pagamento');
      const data = await response.json();
      setFormasPagamento(data);
    } catch (error) {
      console.error('Erro ao carregar formas de pagamento:', error);
    }
  };

  const handleFornecedorSelect = (fornecedor: Fornecedor) => {
    setNfe(prev => ({ ...prev, fornecedor }));
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

    setNfe(prev => ({
      ...prev,
      itens: [...prev.itens, item],
      valor_total: prev.valor_total + item.valortotal
    }));
  };

  const handleTransportadoraSelect = (transportadora: Transportadora) => {
    setNfe(prev => ({ ...prev, transportadora }));
    fetchVeiculos(transportadora.codtrans);
  };

  const handleSubmit = async () => {
    try {
      // Validações detalhadas com mensagens específicas
      const camposFaltantes = [];

      if (!nfe.fornecedor?.codforn) {
        camposFaltantes.push('Fornecedor');
      }

      if (!nfe.natureza_operacao) {
        camposFaltantes.push('Natureza da Operação');
      }

      if (!nfe.codcondpgto) {
        camposFaltantes.push('Condição de Pagamento');
      }

      if (!nfe.codformapgto) {
        camposFaltantes.push('Forma de Pagamento');
      }

      if (nfe.itens.length === 0) {
        camposFaltantes.push('Itens da Nota');
      } else {
        // Valida campos obrigatórios dos itens
        nfe.itens.forEach((item, index) => {
          if (!item.codprod) camposFaltantes.push(`Item ${index + 1}: Código do Produto`);
          if (!item.quantidade) camposFaltantes.push(`Item ${index + 1}: Quantidade`);
          if (!item.valorunitario) camposFaltantes.push(`Item ${index + 1}: Valor Unitário`);
          if (!item.cfop) camposFaltantes.push(`Item ${index + 1}: CFOP`);
          if (!item.unidade) camposFaltantes.push(`Item ${index + 1}: Unidade`);
        });
      }

      // Se tiver transportadora, valida campos obrigatórios do transporte
      if (nfe.transportadora) {
        if (!nfe.transportadora.codtrans) camposFaltantes.push('Código da Transportadora');
        if (!nfe.veiculo?.placa) camposFaltantes.push('Placa do Veículo');
        if (!nfe.volumes) camposFaltantes.push('Volumes');
        if (!nfe.peso_bruto) camposFaltantes.push('Peso Bruto');
      }

      if (camposFaltantes.length > 0) {
        console.log('Campos obrigatórios faltantes:', camposFaltantes);
        throw new Error(`Campos obrigatórios não preenchidos: ${camposFaltantes.join(', ')}`);
      }

      // Formata os itens para o formato esperado pela API
      const itensFormatados = nfe.itens.map(item => ({
        codprod: item.codprod,
        quantidade: Number(item.quantidade),
        valorunitario: Number(item.valorunitario),
        valortotal: Number(item.valortotal)
      }));

      // Formata os dados do transporte
      const transporteFormatado = nfe.transportadora ? {
        codtrans: nfe.transportadora.codtrans,
        placa: nfe.veiculo?.placa || '',
        volumes: Number(nfe.volumes) || 0,
        peso_bruto: Number(nfe.peso_bruto) || 0,
        peso_liquido: Number(nfe.peso_liquido) || 0
      } : null;

      // Gera um número aleatório para a nota (em produção isso viria do sistema)
      const serie = 1;
      const numnfe = Math.floor(Math.random() * 1000000) + 1;
      
      // Gera uma chave de acesso fictícia (em produção isso seria calculado corretamente)
      const chaveacesso = '35' + new Date().getFullYear().toString() +
                         new Date().getMonth().toString().padStart(2, '0') +
                         nfe.fornecedor.cpfcnpj.replace(/\D/g, '').padStart(14, '0') +
                         '55001' + serie.toString().padStart(3, '0') +
                         numnfe.toString().padStart(9, '0') + '1';

      const dadosNota = {
        modelo: 55, // NFe
        serie: serie,
        numnfe: numnfe,
        codforn: nfe.fornecedor.codforn,
        naturezaoperacao: nfe.natureza_operacao,
        dataemissao: new Date().toISOString().split('T')[0],
        datasaida: new Date().toISOString().split('T')[0],
        valortotal: Number(nfe.valor_total),
        chaveacesso: chaveacesso,
        protocoloautorizacao: null, // Será gerado pelo SEFAZ
        codtrans: transporteFormatado?.codtrans,
        frete_por_conta: '0', // 0 = Emitente
        peso_bruto: Number(nfe.peso_bruto) || 0,
        peso_liquido: Number(nfe.peso_liquido) || 0,
        especie: 'VOLUME',
        marca: '',
        numeracao: String(nfe.volumes || ''),
        dados_adicionais: '',
        codcondpgto: nfe.codcondpgto,
        codformapgto: nfe.codformapgto,
        produtos: itensFormatados
      };

      console.log('Dados enviados para API:', dadosNota);

      const response = await fetch('/api/nfe_entrada', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dadosNota)
      });

      console.log('Status da resposta:', response.status);
      const responseData = await response.json();
      console.log('Dados da resposta:', responseData);

      if (!response.ok) {
        throw new Error(responseData.error || 'Erro ao gerar nota fiscal');
      }

      // Redireciona para a página de detalhes da nota fiscal
      router.push(`/nfe/entrada/${responseData.modelo}/${responseData.serie}/${responseData.numnfe}`);
    } catch (error) {
      console.error('Erro detalhado:', error);
      alert(error instanceof Error ? error.message : 'Erro ao gerar nota fiscal');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Nova Nota Fiscal de Entrada</h1>

      {/* Etapas */}
      <div className="flex mb-8">
        <div className={`flex-1 text-center ${etapaAtual === 1 ? 'text-blue-500 font-bold' : ''}`}>
          1. Dados Básicos
        </div>
        <div className={`flex-1 text-center ${etapaAtual === 2 ? 'text-blue-500 font-bold' : ''}`}>
          2. Produtos
        </div>
        <div className={`flex-1 text-center ${etapaAtual === 3 ? 'text-blue-500 font-bold' : ''}`}>
          3. Transporte
        </div>
        <div className={`flex-1 text-center ${etapaAtual === 4 ? 'text-blue-500 font-bold' : ''}`}>
          4. Revisão
        </div>
      </div>

      {/* Conteúdo da etapa atual */}
      <div className="bg-white rounded-lg shadow p-6">
        {etapaAtual === 1 && (
          <div>
            <h2 className="text-xl mb-4">Dados Básicos</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Fornecedor</label>
              <select
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                onChange={(e) => {
                  const fornecedor = fornecedores.find(f => f.codforn === Number(e.target.value));
                  if (fornecedor) handleFornecedorSelect(fornecedor);
                }}
                value={nfe.fornecedor?.codforn || ''}
              >
                <option value="">Selecione um fornecedor</option>
                {fornecedores.map(fornecedor => (
                  <option key={fornecedor.codforn} value={fornecedor.codforn}>
                    {fornecedor.nomerazao}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Natureza da Operação
              </label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={nfe.natureza_operacao}
                onChange={(e) => setNfe(prev => ({ ...prev, natureza_operacao: e.target.value }))}
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Condição de Pagamento
              </label>
              <select
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                onChange={(e) => setNfe(prev => ({ ...prev, codcondpgto: Number(e.target.value) }))}
                value={nfe.codcondpgto || ''}
              >
                <option value="">Selecione uma condição de pagamento</option>
                {condicoesPagamento.map(condicao => (
                  <option key={condicao.codcondpgto} value={condicao.codcondpgto}>
                    {condicao.descricao}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Forma de Pagamento
              </label>
              <select
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                onChange={(e) => setNfe(prev => ({ ...prev, codformapgto: Number(e.target.value) }))}
                value={nfe.codformapgto || ''}
              >
                <option value="">Selecione uma forma de pagamento</option>
                {formasPagamento.map(forma => (
                  <option key={forma.codformapgto} value={forma.codformapgto}>
                    {forma.descricao}
                  </option>
                ))}
              </select>
            </div>

            <button
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              onClick={() => setEtapaAtual(2)}
              disabled={!nfe.fornecedor || !nfe.codcondpgto || !nfe.codformapgto}
            >
              Próximo
            </button>
          </div>
        )}

        {etapaAtual === 2 && (
          <div>
            <h2 className="text-xl mb-4">Produtos</h2>
            
            {/* Lista de produtos adicionados */}
            <div className="mb-4">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Produto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantidade
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valor Unit.
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valor Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {nfe.itens.map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">{item.descricao}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{item.quantidade}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.valorunitario.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.valortotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => {
                            setNfe(prev => ({
                              ...prev,
                              itens: prev.itens.filter((_, i) => i !== index),
                              valor_total: prev.valor_total - item.valortotal
                            }));
                          }}
                          className="text-red-600 hover:text-red-900"
                        >
                          Remover
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Adicionar novo produto */}
            <div className="mt-4">
              <h3 className="text-lg font-medium mb-2">Adicionar Produto</h3>
              <div className="grid grid-cols-2 gap-4">
                <select
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  onChange={(e) => {
                    const produto = produtos.find(p => p.codprod === Number(e.target.value));
                    if (produto) {
                      const quantidade = 1; // Você pode adicionar um input para a quantidade
                      handleAddItem(produto, quantidade);
                    }
                  }}
                  value=""
                >
                  <option value="">Selecione um produto</option>
                  {produtos.map(produto => (
                    <option key={produto.codprod} value={produto.codprod}>
                      {produto.nome} - {produto.valorunitario.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-between">
              <button
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                onClick={() => setEtapaAtual(1)}
              >
                Voltar
              </button>
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                onClick={() => setEtapaAtual(3)}
                disabled={nfe.itens.length === 0}
              >
                Próximo
              </button>
            </div>
          </div>
        )}

        {etapaAtual === 3 && (
          <div>
            <h2 className="text-xl mb-4">Transporte</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Transportadora</label>
              <select
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                onChange={(e) => {
                  const transportadora = transportadoras.find(t => t.codtrans === Number(e.target.value));
                  if (transportadora) handleTransportadoraSelect(transportadora);
                }}
                value={nfe.transportadora?.codtrans || ''}
              >
                <option value="">Selecione uma transportadora</option>
                {transportadoras.map(transportadora => (
                  <option key={transportadora.codtrans} value={transportadora.codtrans}>
                    {transportadora.nomerazao}
                  </option>
                ))}
              </select>
            </div>

            {nfe.transportadora && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Veículo</label>
                <select
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  onChange={(e) => {
                    const veiculo = veiculos.find(v => v.placa === e.target.value);
                    if (veiculo) setNfe(prev => ({ ...prev, veiculo }));
                  }}
                  value={nfe.veiculo?.placa || ''}
                >
                  <option value="">Selecione um veículo</option>
                  {veiculos.map(veiculo => (
                    <option key={veiculo.placa} value={veiculo.placa}>
                      {veiculo.descricao} - {veiculo.placa}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Volumes</label>
                <input
                  type="number"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={nfe.volumes}
                  onChange={(e) => setNfe(prev => ({ ...prev, volumes: Number(e.target.value) }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Peso Bruto</label>
                <input
                  type="number"
                  step="0.001"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={nfe.peso_bruto}
                  onChange={(e) => setNfe(prev => ({ ...prev, peso_bruto: Number(e.target.value) }))}
                />
              </div>
            </div>

            <div className="flex justify-between">
              <button
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                onClick={() => setEtapaAtual(2)}
              >
                Anterior
              </button>
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                onClick={() => setEtapaAtual(4)}
              >
                Próximo
              </button>
            </div>
          </div>
        )}

        {etapaAtual === 4 && (
          <div>
            <h2 className="text-xl mb-4">Revisão</h2>
            
            {/* Preview da NFe */}
            <div className="mb-6 p-4 border rounded">
              <h3 className="font-bold mb-2">Dados do Fornecedor</h3>
              {nfe.fornecedor && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Nome/Razão Social</p>
                    <p>{nfe.fornecedor.nomerazao}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">CPF/CNPJ</p>
                    <p>{nfe.fornecedor.cpfcnpj}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Endereço</p>
                    <p>{`${nfe.fornecedor.endereco}, ${nfe.fornecedor.numero}`}</p>
                    <p>{`${nfe.fornecedor.bairro} - ${nfe.fornecedor.nomecidade}/${nfe.fornecedor.nomeestado}`}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="mb-6 p-4 border rounded">
              <h3 className="font-bold mb-2">Dados de Pagamento</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Condição de Pagamento</p>
                  <p>{condicoesPagamento.find(c => c.codcondpgto === nfe.codcondpgto)?.descricao || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Forma de Pagamento</p>
                  <p>{formasPagamento.find(f => f.codformapgto === nfe.codformapgto)?.descricao || '-'}</p>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-bold mb-2">Produtos</h3>
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Produto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Qtd
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valor Unit.
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {nfe.itens.map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4">{item.descricao}</td>
                      <td className="px-6 py-4">{item.quantidade}</td>
                      <td className="px-6 py-4">
                        {item.valorunitario.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>
                      <td className="px-6 py-4">
                        {item.valortotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={3} className="px-6 py-4 text-right font-bold">Total:</td>
                    <td className="px-6 py-4 font-bold">
                      {nfe.valor_total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {nfe.transportadora && (
              <div className="mb-6 p-4 border rounded">
                <h3 className="font-bold mb-2">Dados do Transporte</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Transportadora</p>
                    <p>{nfe.transportadora.nomerazao}</p>
                  </div>
                  {nfe.veiculo && (
                    <div>
                      <p className="text-sm text-gray-600">Veículo</p>
                      <p>{`${nfe.veiculo.placa}`}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-600">Volumes</p>
                    <p>{nfe.volumes}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Peso Bruto</p>
                    <p>{nfe.peso_bruto} kg</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between">
              <button
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                onClick={() => setEtapaAtual(3)}
              >
                Anterior
              </button>
              <button
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                onClick={handleSubmit}
              >
                Emitir Nota Fiscal
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 