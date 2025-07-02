import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface Transportadora {
  codtrans: number;
  nomerazao: string;
}

interface Fornecedor {
  codforn: number;
  nomerazao: string;
}

interface TransportadoraFornecedorFormProps {
  modo: 'transportadora' | 'fornecedor';
  item: Transportadora | Fornecedor;
  onClose: () => void;
}

export default function TransportadoraFornecedorForm({ modo, item, onClose }: TransportadoraFornecedorFormProps) {
  const [search, setSearch] = useState('');
  const [searchVinculados, setSearchVinculados] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [vinculados, setVinculados] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    carregarVinculados();
  }, [item]);

  useEffect(() => {
    if (search.length >= 2) {
      const timer = setTimeout(() => {
        handleSearch(search);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setSuggestions([]);
    }
  }, [search]);

  const carregarVinculados = async () => {
    try {
      setIsLoading(true);
      
      if (modo === 'transportadora') {
        const response = await fetch(`/api/transp-forn?codtrans=${(item as Transportadora).codtrans}`);
        if (response.ok) {
          const data = await response.json();
          setVinculados(data);
        }
      } else {
        const response = await fetch(`/api/transp-forn?codforn=${(item as Fornecedor).codforn}`);
        if (response.ok) {
          const data = await response.json();
          setVinculados(data);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar vínculos:', error);
      setVinculados([]);
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
      setIsSearching(true);
      const endpoint = modo === 'transportadora' ? '/api/fornecedores' : '/api/transportadoras';
      const response = await fetch(endpoint);
      
      if (!response.ok) {
        throw new Error('Erro na busca');
      }

      const data = await response.json();

      // Filtra os itens já vinculados e que correspondem à busca
      const filteredData = data.filter((d: any) => {
        const nome = d.nomerazao;
        const codigo = modo === 'transportadora' ? d.codforn : d.codtrans;
        
        const jaVinculado = vinculados.some((v: any) => 
          modo === 'transportadora' ? v.codforn === codigo : v.codtrans === codigo
        );
        
        return nome && nome.toLowerCase().includes(query.toLowerCase()) && !jaVinculado;
      });

      setSuggestions(filteredData.slice(0, 10)); // Limita a 10 resultados
    } catch (error) {
      console.error('Erro na busca:', error);
      toast.error('Erro ao buscar');
    } finally {
      setIsSearching(false);
    }
  };

  const handleAdd = async (itemToAdd: any) => {
    try {
      setIsLoading(true);
      
      const body = modo === 'transportadora' 
        ? { 
            codtrans: (item as Transportadora).codtrans, 
            codforn: itemToAdd.codforn
          }
        : { 
            codtrans: itemToAdd.codtrans, 
            codforn: (item as Fornecedor).codforn
          };

      const response = await fetch('/api/transp-forn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        toast.success('Vínculo adicionado com sucesso!');
        setSearch('');
        setSuggestions([]);
        await carregarVinculados(); // Recarregar a lista
      } else {
        const error = await response.json();
        toast.error(error.error || 'Erro ao adicionar vínculo');
      }

    } catch (error) {
      console.error('Erro ao adicionar vínculo:', error);
      toast.error('Erro ao adicionar vínculo');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async (itemToRemove: any) => {
    try {
      setIsLoading(true);
      
      const params = modo === 'transportadora'
        ? `codtrans=${(item as Transportadora).codtrans}&codforn=${itemToRemove.codforn}`
        : `codtrans=${itemToRemove.codtrans}&codforn=${(item as Fornecedor).codforn}`;

      const response = await fetch(`/api/transp-forn?${params}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Vínculo removido com sucesso!');
        await carregarVinculados(); // Recarregar a lista
      } else {
        const error = await response.json();
        toast.error(error.error || 'Erro ao remover vínculo');
      }

    } catch (error) {
      console.error('Erro ao remover vínculo:', error);
      toast.error('Erro ao remover vínculo');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectSuggestion = (suggestion: any) => {
    handleAdd(suggestion);
    // Manter o foco no campo de busca
    setTimeout(() => {
      if (searchRef.current) {
        searchRef.current.focus();
      }
    }, 100);
  };

  // Filtrar vínculos com base na busca
  const vinculadosFiltrados = vinculados.filter((vinculo) => {
    if (!searchVinculados) return true;
    
    const nome = modo === 'transportadora' 
      ? vinculo.nome_fornecedor 
      : vinculo.nome_transportadora;
    
    const codigo = modo === 'transportadora' 
      ? vinculo.codforn.toString()
      : vinculo.codtrans.toString();
    
    return nome?.toLowerCase().includes(searchVinculados.toLowerCase()) ||
           codigo.includes(searchVinculados);
  });

  return (
    <div className="space-y-6">
      {/* Campo de busca */}
      <div className="space-y-2">
        <Label htmlFor="search">
          Buscar {modo === 'transportadora' ? 'Fornecedor' : 'Transportadora'}
        </Label>
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            ref={searchRef}
            id="search"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-10"
            placeholder={`Digite o nome ${modo === 'transportadora' ? 'do fornecedor' : 'da transportadora'}...`}
            disabled={isLoading}
          />
          
          {isSearching && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin h-4 w-4 border-2 border-violet-500 border-t-transparent rounded-full"></div>
            </div>
          )}
        </div>
        
        {/* Sugestões de busca */}
        {suggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                onClick={() => handleSelectSuggestion(suggestion)}
              >
                <div className="font-medium text-gray-900">{suggestion.nomerazao}</div>
                <div className="text-sm text-gray-500">
                  Código: {modo === 'transportadora' ? suggestion.codforn : suggestion.codtrans}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lista de vínculos existentes */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-base font-medium text-gray-900">
            {modo === 'transportadora' 
              ? `Fornecedores Vinculados`
              : `Transportadoras Vinculadas`
            }
          </Label>
          <div className="flex items-center gap-2">
            {searchVinculados && vinculadosFiltrados.length !== vinculados.length && (
              <span className="text-xs text-violet-600 bg-violet-50 px-2 py-1 rounded-full">
                {vinculadosFiltrados.length} de {vinculados.length}
              </span>
            )}
            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {vinculados.length} {vinculados.length === 1 ? 'vínculo' : 'vínculos'}
            </span>
          </div>
        </div>

        {/* Campo de busca nos vínculos existentes */}
        {vinculados.length > 0 && (
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              value={searchVinculados}
              onChange={(e) => setSearchVinculados(e.target.value)}
              className="pl-10"
              placeholder={`Filtrar ${modo === 'transportadora' ? 'fornecedores' : 'transportadoras'} vinculados...`}
            />
            {searchVinculados && (
              <button
                onClick={() => setSearchVinculados('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
        
        <div className="border border-gray-200 rounded-lg overflow-hidden">
        
          <div className="max-h-80 overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin h-6 w-6 border-2 border-violet-500 border-t-transparent rounded-full mx-auto mb-3"></div>
                <p className="text-sm text-gray-500">Carregando vínculos...</p>
              </div>
            ) : vinculados.length === 0 ? (
              <div className="p-8 text-center">
                <div className="text-gray-400 mb-3">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
                <h3 className="text-sm font-medium text-gray-900 mb-1">Nenhum vínculo encontrado</h3>
                <p className="text-sm text-gray-500">
                  Use o campo de busca acima para adicionar {modo === 'transportadora' ? 'fornecedores' : 'transportadoras'}.
                </p>
              </div>
            ) : vinculadosFiltrados.length === 0 ? (
              <div className="p-8 text-center">
                <div className="text-gray-400 mb-3">
                  <MagnifyingGlassIcon className="mx-auto h-12 w-12" />
                </div>
                <h3 className="text-sm font-medium text-gray-900 mb-1">Nenhum resultado encontrado</h3>
                <p className="text-sm text-gray-500">
                  Tente ajustar os termos da busca ou{' '}
                  <button 
                    onClick={() => setSearchVinculados('')}
                    className="text-violet-600 hover:text-violet-500 underline"
                  >
                    limpar filtros
                  </button>
                  .
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {vinculadosFiltrados.map((vinculo, index) => (
                  <div key={index} className="p-4 flex justify-between items-center hover:bg-gray-50 transition-colors">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {modo === 'transportadora' ? vinculo.nome_fornecedor : vinculo.nome_transportadora}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        Código: {modo === 'transportadora' ? vinculo.codforn : vinculo.codtrans}
                      </div>
                    </div>
                    <Button
                      onClick={() => handleRemove(vinculo)}
                      disabled={isLoading}
                      variant="outline"
                      size="sm"
                      className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                    >
                      <XMarkIcon className="h-4 w-4 mr-1" />
                      Remover
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Botão de ação */}
      <div className="flex justify-end pt-4 border-t border-gray-200">
        <Button
          onClick={onClose}
          variant="outline"
          className="min-w-[100px]"
        >
          Fechar
        </Button>
      </div>
    </div>
  );
} 