import { useState, useEffect } from 'react';
import { Produto } from '@/types/produto';

interface ProdutoComFornecedor extends Produto {
  fornecedores?: {
    codforn: number;
    nomerazao: string;
    cnpj: string;
    valor_custo?: number;
  }[];
}

interface Fornecedor {
  codforn: number;
  nomerazao: string;
  cnpj: string;
}

interface ProdutoFornecedorFormProps {
  modo: 'produto' | 'fornecedor';
  item: ProdutoComFornecedor | Fornecedor;
  onClose: () => void;
}

export default function ProdutoFornecedorForm({ modo, item, onClose }: ProdutoFornecedorFormProps) {
  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [vinculados, setVinculados] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [valorCusto, setValorCusto] = useState<number>(0);

  useEffect(() => {
    carregarVinculados();
  }, [item]);

  const carregarVinculados = async () => {
    try {
      setIsLoading(true);
      const params = modo === 'produto' 
        ? `codprod=${(item as Produto).codprod}`
        : `codforn=${(item as Fornecedor).codforn}`;
      
      const response = await fetch(`/api/produto-forn?${params}`);
      const data = await response.json();
      
      if (modo === 'produto') {
        const produtoId = (item as Produto).codprod;
        const fornecedoresVinculados = data
          .filter((rel: any) => rel.codprod === produtoId)
          .map((rel: any) => ({
            codforn: rel.codforn,
            nomerazao: rel.nome_fornecedor,
            valor_custo: rel.valor_custo
          }));
        setVinculados(fornecedoresVinculados);
      } else {
        const fornecedorId = (item as Fornecedor).codforn;
        const produtosVinculados = data
          .filter((rel: any) => rel.codforn === fornecedorId)
          .map((rel: any) => ({
            codprod: rel.codprod,
            nome: rel.nome_produto,
            valor_custo: rel.valor_custo
          }));
        setVinculados(produtosVinculados);
      }
    } catch (error) {
      console.error('Erro ao carregar vínculos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      setIsLoading(true);
      const endpoint = modo === 'produto' ? '/api/fornecedores' : '/api/produtos';
      const response = await fetch(endpoint);
      const data = await response.json();

      // Filtra os itens já vinculados e que correspondem à busca
      const filteredData = data.filter((d: any) => {
        const nome = modo === 'produto' ? d.nomerazao : d.nome;
        const jaVinculado = vinculados.some((v: any) => 
          modo === 'produto' ? v.codforn === d.codforn : v.codprod === d.codprod
        );
        return nome.toLowerCase().includes(query.toLowerCase()) && !jaVinculado;
      });

      setSuggestions(filteredData);
    } catch (error) {
      console.error('Erro na busca:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = async (itemToAdd: any) => {
    try {
      setIsLoading(true);
      const body = modo === 'produto' 
        ? { 
            codprod: (item as Produto).codprod, 
            codforn: itemToAdd.codforn,
            valor_custo: valorCusto
          }
        : { 
            codprod: itemToAdd.codprod, 
            codforn: (item as Fornecedor).codforn,
            valor_custo: valorCusto
          };

      const response = await fetch('/api/produto-forn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw new Error('Erro ao vincular');
      }

      await carregarVinculados();
      setSearch('');
      setSuggestions([]);
      setValorCusto(0);
    } catch (error) {
      console.error('Erro ao adicionar vínculo:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async (itemToRemove: any) => {
    try {
      setIsLoading(true);
      const params = modo === 'produto'
        ? `codprod=${(item as Produto).codprod}&codforn=${itemToRemove.codforn}`
        : `codprod=${itemToRemove.codprod}&codforn=${(item as Fornecedor).codforn}`;

      const response = await fetch(`/api/produto-forn?${params}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Erro ao desvincular');
      }

      await carregarVinculados();
    } catch (error) {
      console.error('Erro ao remover vínculo:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateValorCusto = async (itemToUpdate: any, novoValor: number) => {
    try {
      setIsLoading(true);
      const body = {
        codprod: modo === 'produto' ? (item as Produto).codprod : itemToUpdate.codprod,
        codforn: modo === 'produto' ? itemToUpdate.codforn : (item as Fornecedor).codforn,
        valor_custo: novoValor
      };

      const response = await fetch('/api/produto-forn', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar valor de custo');
      }

      await carregarVinculados();
    } catch (error) {
      console.error('Erro ao atualizar valor de custo:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            handleSearch(e.target.value);
          }}
          className="w-full border rounded-md p-2"
          placeholder={`Buscar ${modo === 'produto' ? 'fornecedor' : 'produto'}...`}
          disabled={isLoading}
        />
        
        <div className="flex items-center space-x-2">
          <input
            type="number"
            value={valorCusto}
            onChange={(e) => setValorCusto(Number(e.target.value))}
            className="w-full border rounded-md p-2"
            placeholder="Valor de custo"
            min="0"
            step="0.01"
            disabled={isLoading}
          />
        </div>
        
        {suggestions.length > 0 && (
          <div className="absolute z-10 w-full bg-white border rounded-md mt-1 shadow-lg max-h-60 overflow-auto">
            {suggestions.map((suggestion) => (
              <div
                key={modo === 'produto' ? suggestion.codforn : suggestion.codprod}
                onClick={() => handleAdd(suggestion)}
                className="p-2 hover:bg-gray-100 cursor-pointer"
              >
                {modo === 'produto' ? suggestion.nomerazao : suggestion.nome}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4">
        <h3 className="font-medium mb-2">
          {modo === 'produto' ? 'Fornecedores vinculados:' : 'Produtos vinculados:'}
        </h3>
        {isLoading ? (
          <div className="text-center py-4">Carregando...</div>
        ) : (
          <div className="space-y-2">
            {vinculados.length === 0 ? (
              <p className="text-gray-500 text-sm">
                Nenhum {modo === 'produto' ? 'fornecedor' : 'produto'} vinculado.
              </p>
            ) : (
              vinculados.map((vinculado) => (
                <div
                  key={modo === 'produto' ? vinculado.codforn : vinculado.codprod}
                  className="flex justify-between items-center p-2 bg-gray-50 rounded-md"
                >
                  <div className="flex-1">
                    <span className="block">
                      {modo === 'produto' ? vinculado.nomerazao : vinculado.nome}
                    </span>
                    <div className="flex items-center space-x-2 mt-1">
                      <input
                        type="number"
                        value={vinculado.valor_custo || 0}
                        onChange={(e) => handleUpdateValorCusto(vinculado, Number(e.target.value))}
                        className="w-32 border rounded-md p-1 text-sm"
                        min="0"
                        step="0.01"
                        disabled={isLoading}
                      />
                      <span className="text-sm text-gray-500">Valor de custo</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemove(vinculado)}
                    className="text-red-600 hover:text-red-800 ml-4"
                    disabled={isLoading}
                  >
                    Remover
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <div className="flex justify-end pt-4">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          disabled={isLoading}
        >
          Fechar
        </button>
      </div>
    </div>
  );
} 
 
 
 