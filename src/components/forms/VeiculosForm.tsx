'use client';

import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MagnifyingGlassIcon, XMarkIcon, PlusIcon } from '@heroicons/react/24/outline';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface Transportadora {
  codtrans: number;
  nomerazao: string;
}

interface VeiculosFormProps {
  transportadora: Transportadora;
  onClose: () => void;
}

interface Veiculo {
  codveiculo: number;
  placa: string;
  modelo?: string;
  descricao?: string;
}

export default function VeiculosForm({ transportadora, onClose }: VeiculosFormProps) {
  const [search, setSearch] = useState('');
  const [searchVinculados, setSearchVinculados] = useState('');
  const [suggestions, setSuggestions] = useState<Veiculo[]>([]);
  const [vinculados, setVinculados] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isNovoVeiculoModalOpen, setIsNovoVeiculoModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    placa: '',
    modelo: '',
    descricao: ''
  });
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    carregarVinculados();
  }, [transportadora]);

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
      const response = await fetch(`/api/veiculo-transportadora?codtrans=${transportadora.codtrans}`);
      if (response.ok) {
        const data = await response.json();
        setVinculados(data);
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
      
      // Buscar todos os veículos
      const responseVeiculos = await fetch('/api/veiculos');
      const todosVeiculos = await responseVeiculos.json();
      
      // Buscar todos os relacionamentos
      const responseRelacionamentos = await fetch('/api/veiculo-transportadora');
      const todosRelacionamentos = await responseRelacionamentos.json();
      
      // Filtrar veículos que NÃO estão vinculados a nenhuma transportadora
      const veiculosVinculadosIds = todosRelacionamentos.map((rel: any) => rel.codveiculo);
      const veiculosDisponiveis = todosVeiculos.filter((veiculo: any) => 
        !veiculosVinculadosIds.includes(veiculo.codveiculo)
      );

      // Filtrar por busca
      const filteredData = veiculosDisponiveis.filter((v: Veiculo) => {
        return v.placa.toLowerCase().includes(query.toLowerCase()) ||
               (v.modelo && v.modelo.toLowerCase().includes(query.toLowerCase())) ||
               (v.descricao && v.descricao.toLowerCase().includes(query.toLowerCase()));
      });

      setSuggestions(filteredData.slice(0, 10));
    } catch (error) {
      console.error('Erro na busca:', error);
      toast.error('Erro ao buscar veículos');
    } finally {
      setIsSearching(false);
    }
  };

  const handleAdd = async (veiculo: Veiculo) => {
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/veiculo-transportadora', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          codveiculo: veiculo.codveiculo,
          codtrans: transportadora.codtrans
        })
      });

      if (response.ok) {
        toast.success('Veículo vinculado com sucesso!');
        setSearch('');
        setSuggestions([]);
        await carregarVinculados();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Erro ao vincular veículo');
      }
    } catch (error) {
      console.error('Erro ao vincular veículo:', error);
      toast.error('Erro ao vincular veículo');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async (vinculo: any) => {
    try {
      setIsLoading(true);
      
      const response = await fetch(
        `/api/veiculo-transportadora?codveiculo=${vinculo.codveiculo}&codtrans=${vinculo.codtrans}`,
        { method: 'DELETE' }
      );

      if (response.ok) {
        toast.success('Veículo desvinculado com sucesso!');
        await carregarVinculados();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Erro ao desvincular veículo');
      }
    } catch (error) {
      console.error('Erro ao desvincular veículo:', error);
      toast.error('Erro ao desvincular veículo');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectSuggestion = (suggestion: Veiculo) => {
    handleAdd(suggestion);
    setTimeout(() => {
      if (searchRef.current) {
        searchRef.current.focus();
      }
    }, 100);
  };

  const handleCreateVeiculo = async () => {
    if (!formData.placa.trim()) {
      toast.error('Placa é obrigatória');
      return;
    }

    try {
      setIsLoading(true);
      
      // Criar veículo
      const responseVeiculo = await fetch('/api/veiculos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          placa: formData.placa.toUpperCase(),
          modelo: formData.modelo || null,
          descricao: formData.descricao || null
        })
      });

      if (!responseVeiculo.ok) {
        const error = await responseVeiculo.json();
        throw new Error(error.error || 'Erro ao criar veículo');
      }

      const novoVeiculo = await responseVeiculo.json();

      // Vincular automaticamente à transportadora
      const responseVinculo = await fetch('/api/veiculo-transportadora', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          codveiculo: novoVeiculo.codveiculo,
          codtrans: transportadora.codtrans
        })
      });

      if (!responseVinculo.ok) {
        // Se falhar no vínculo, excluir o veículo criado
        await fetch(`/api/veiculos?codveiculo=${novoVeiculo.codveiculo}`, {
          method: 'DELETE'
        });
        const error = await responseVinculo.json();
        throw new Error(error.error || 'Erro ao vincular veículo');
      }

      toast.success('Veículo criado e vinculado com sucesso!');
      setFormData({ placa: '', modelo: '', descricao: '' });
      setIsNovoVeiculoModalOpen(false);
      await carregarVinculados();
    } catch (error) {
      console.error('Erro ao criar veículo:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao criar veículo');
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrar vínculos com base na busca
  const vinculadosFiltrados = vinculados.filter((vinculo) => {
    if (!searchVinculados) return true;
    
    return vinculo.placa?.toLowerCase().includes(searchVinculados.toLowerCase()) ||
           vinculo.modelo?.toLowerCase().includes(searchVinculados.toLowerCase()) ||
           vinculo.descricao_veiculo?.toLowerCase().includes(searchVinculados.toLowerCase());
  });

  return (
    <>
      <div className="space-y-6">
        {/* Campo de busca */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="search">Buscar Veículo</Label>
            <Button
              onClick={() => setIsNovoVeiculoModalOpen(true)}
              size="sm"
              className="bg-green-600 hover:bg-green-500"
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              Novo Veículo
            </Button>
          </div>
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              ref={searchRef}
              id="search"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-10"
              placeholder="Digite a placa, modelo ou descrição..."
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
                  <div className="font-medium text-gray-900 font-mono">{suggestion.placa}</div>
                  <div className="text-sm text-gray-500">
                    {suggestion.modelo && `${suggestion.modelo} - `}
                    Código: {suggestion.codveiculo}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-base font-medium text-gray-900">
              Veículos Vinculados
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
                placeholder="Filtrar veículos vinculados..."
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
          
          <div className="max-h-80 overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin h-6 w-6 border-2 border-violet-500 border-t-transparent rounded-full mx-auto mb-3"></div>
                <p className="text-sm text-gray-500">Carregando veículos...</p>
              </div>
            ) : vinculados.length === 0 ? (
              <div className="p-8 text-center">
                <div className="text-gray-400 mb-3">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0M15 17a2 2 0 104 0M9 17h6" />
                  </svg>
                </div>
                <h3 className="text-sm font-medium text-gray-900 mb-1">Nenhum veículo vinculado</h3>
                <p className="text-sm text-gray-500">
                  Use o campo de busca acima para vincular veículos existentes ou crie um novo.
                </p>
              </div>
            ) : (
              <div className="border border-gray-200 rounded-lg">
                {vinculadosFiltrados.map((vinculo, index) => (
                  <div key={index} className="p-4 flex justify-between items-center hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 font-mono">
                        {vinculo.placa}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {vinculo.modelo && `${vinculo.modelo} - `}
                        Código: {vinculo.codveiculo}
                        {vinculo.descricao_veiculo && ` - ${vinculo.descricao_veiculo}`}
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

      {/* Modal de Novo Veículo */}
      <Dialog open={isNovoVeiculoModalOpen} onOpenChange={setIsNovoVeiculoModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Novo Veículo</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="placa">Placa *</Label>
              <Input
                id="placa"
                value={formData.placa}
                onChange={(e) => setFormData({ ...formData, placa: e.target.value.toUpperCase() })}
                placeholder="ABC1234"
                maxLength={10}
                className="uppercase"
              />
            </div>
            
            <div>
              <Label htmlFor="modelo">Modelo</Label>
              <Input
                id="modelo"
                value={formData.modelo}
                onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                placeholder="Ex: Volvo FH 540, Scania R450"
                maxLength={50}
              />
            </div>
            
            <div>
              <Label htmlFor="descricao">Descrição</Label>
              <textarea
                id="descricao"
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                rows={3}
                placeholder="Informações adicionais sobre o veículo..."
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsNovoVeiculoModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleCreateVeiculo}
              disabled={isLoading || !formData.placa.trim()}
              className="bg-green-600 hover:bg-green-500"
            >
              Criar e Vincular
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
} 