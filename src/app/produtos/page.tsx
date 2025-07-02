'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { PlusIcon, MagnifyingGlassIcon, UsersIcon, EyeIcon, PencilIcon } from '@heroicons/react/24/outline';
import { toast } from "sonner";
import { DataTable } from '@/components/DataTable';

import { UnidadeSelect } from '@/components/forms/UnidadeSelect';
import { CategoriaSelect } from '@/components/forms/CategoriaSelect';
import { MarcaSelect } from '@/components/forms/MarcaSelect';
import ProdutoFornecedorForm from '@/components/forms/ProdutoFornecedorForm';

interface Produto {
  codprod: number;
  nome: string;
  valorunitario: number;
  datacadastro: string;
  custo_compra: number;
  preco_venda: number;
  lucro_percentual: number;
  codigo_barras: string;
  codigo_referencia: string;
  quantidade_estoque: number;
  quantidade_minima_estoque: number;
  codunidade: number;
  codcategoria: number;
  codmarca: number;
  data_alteracao?: string;
  situacao?: string;
  // Campos relacionados
  nome_unidade?: string;
  sigla_unidade?: string;
  nome_categoria?: string;
  nome_marca?: string;
}

interface Unidade {
  codunidade: number;
  nome_unidade: string;
  sigla_unidade: string;
}

interface Categoria {
  codcategoria: number;
  nome_categoria: string;
}

interface Marca {
  codmarca: number;
  nome_marca: string;
}

export default function ProdutosPage() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isVinculoModalOpen, setIsVinculoModalOpen] = useState(false);
  const [selectedProduto, setSelectedProduto] = useState<Produto | null>(null);
  const [formData, setFormData] = useState<Produto>({
    codprod: 0,
    nome: '',
    valorunitario: 0,
    datacadastro: '',
    custo_compra: 0,
    preco_venda: 0,
    lucro_percentual: 0,
    codigo_barras: '',
    codigo_referencia: '',
    quantidade_estoque: 0,
    quantidade_minima_estoque: 0,
    codunidade: 0,
    codcategoria: 0,
    codmarca: 0,
    situacao: undefined
  });
  const [isEditing, setIsEditing] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: keyof Produto; direction: 'asc' | 'desc' } | null>(null);
  
  // Estados para os objetos relacionados
  const [selectedUnidade, setSelectedUnidade] = useState<Unidade | null>(null);
  const [selectedCategoria, setSelectedCategoria] = useState<Categoria | null>(null);
  const [selectedMarca, setSelectedMarca] = useState<Marca | null>(null);

  useEffect(() => {
    fetchProdutos();
  }, []);

  const fetchProdutos = async () => {
    try {
      const response = await fetch('/api/produtos');
      if (!response.ok) throw new Error('Erro ao carregar produtos');
      const data = await response.json();
      setProdutos(data);
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao carregar produtos');
    }
  };

  const openModal = (produto?: Produto) => {
    if (produto) {
      setFormData(produto);
      setIsEditing(true);
      
      // Definir os objetos relacionados para edição
      if (produto.codunidade) {
        setSelectedUnidade({
          codunidade: produto.codunidade,
          nome_unidade: produto.nome_unidade || '',
          sigla_unidade: produto.sigla_unidade || ''
        });
      }
      
      if (produto.nome_categoria) {
        setSelectedCategoria({
          codcategoria: produto.codcategoria,
          nome_categoria: produto.nome_categoria
        });
      }
      
      if (produto.nome_marca) {
        setSelectedMarca({
          codmarca: produto.codmarca,
          nome_marca: produto.nome_marca
        });
      }
    } else {
      setFormData({
        codprod: 0,
        nome: '',
        valorunitario: 0,
        datacadastro: '',
        custo_compra: 0,
        preco_venda: 0,
        lucro_percentual: 0,
        codigo_barras: '',
        codigo_referencia: '',
        quantidade_estoque: 0,
        quantidade_minima_estoque: 0,
        codunidade: 0,
        codcategoria: 0,
        codmarca: 0,
        situacao: undefined
      });
      setSelectedUnidade(null);
      setSelectedCategoria(null);
      setSelectedMarca(null);
      setIsEditing(false);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações
    if (!formData.nome.trim()) {
      toast.error('Nome do produto é obrigatório');
      return;
    }

    if (!selectedUnidade) {
      toast.error('Unidade é obrigatória');
      return;
    }

    if (!selectedCategoria) {
      toast.error('Categoria é obrigatória');
      return;
    }

    if (!selectedMarca) {
      toast.error('Marca é obrigatória');
      return;
    }

    if (formData.custo_compra <= 0) {
      toast.error('Custo de compra deve ser maior que zero');
      return;
    }

    if (formData.preco_venda <= 0) {
      toast.error('Preço de venda deve ser maior que zero');
      return;
    }

    if (formData.quantidade_estoque < 0) {
      toast.error('Quantidade em estoque não pode ser negativa');
      return;
    }

    if (formData.quantidade_minima_estoque < 0) {
      toast.error('Quantidade mínima não pode ser negativa');
      return;
    }

    try {
      const dataToSend = {
        codprod: formData.codprod,
        nome: formData.nome,
        valorunitario: formData.preco_venda,
        codunidade: selectedUnidade?.codunidade || null,
        codcategoria: selectedCategoria?.codcategoria || null,
        codmarca: selectedMarca?.codmarca || null,
        custo_compra: formData.custo_compra,
        preco_venda: formData.preco_venda,
        codigo_barras: formData.codigo_barras || null,
        codigo_referencia: formData.codigo_referencia || null,
        quantidade_estoque: formData.quantidade_estoque,
        quantidade_minima_estoque: formData.quantidade_minima_estoque,
        situacao: formData.situacao
      };

      const response = await fetch('/api/produtos', {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });

      const data = await response.json();

      if (response.ok) {
        await fetchProdutos();
        setIsModalOpen(false);
        toast.success(isEditing ? 'Produto atualizado com sucesso!' : 'Produto cadastrado com sucesso!');
      } else {
        toast.error(data.error || 'Erro ao salvar produto');
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao salvar produto');
    }
  };

  const handleDelete = async () => {
    if (!selectedProduto) return;

    try {
      const response = await fetch(`/api/produtos?codprod=${selectedProduto.codprod}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        await fetchProdutos();
        setIsDeleteModalOpen(false);
        setSelectedProduto(null);
        toast.success('Produto excluído com sucesso!');
      } else {
        toast.error(data.error || 'Erro ao excluir produto');
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao excluir produto');
    }
  };

  const openDeleteModal = (produto: Produto) => {
    setSelectedProduto(produto);
    setIsDeleteModalOpen(true);
  };

  const handleOpenVinculoModal = (produto: Produto) => {
    setSelectedProduto(produto);
    setIsVinculoModalOpen(true);
  };

  const handleCloseVinculoModal = () => {
    setSelectedProduto(null);
    setIsVinculoModalOpen(false);
  };

  const handleOpenDetailsModal = (produto: Produto) => {
    setSelectedProduto(produto);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedProduto(null);
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return '-';
    
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  const filteredProdutos = produtos.filter(produto =>
    produto.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    produto.codigo_barras?.includes(searchTerm) ||
    produto.codigo_referencia?.includes(searchTerm) ||
    produto.nome_categoria?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    produto.nome_marca?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    produto.codprod.toString().includes(searchTerm)
  );

  const sortedProdutos = [...filteredProdutos].sort((a, b) => {
    if (!sortConfig) return 0;
    
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    
    if (aValue == null && bValue == null) return 0;
    if (aValue == null) return 1;
    if (bValue == null) return -1;
    
    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (key: keyof Produto) => {
    setSortConfig(current => ({
      key,
      direction: current?.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const columns = [
    { key: 'codprod', label: 'Código' },
    { key: 'nome', label: 'Nome do Produto' },
    { key: 'nome_categoria', label: 'Categoria' },
    { key: 'nome_marca', label: 'Marca' },
    { key: 'sigla_unidade', label: 'Unidade' },
    {
      key: 'preco_venda', 
      label: 'Preço', 
      render: (item: Produto) => {
        const price = item.preco_venda || item.valorunitario || 0;
        return `R$ ${Number(price).toFixed(2)}`;
      }
    },
    {
      key: 'quantidade_estoque', 
      label: 'Estoque',
      render: (item: Produto) => Number(item.quantidade_estoque || 0).toLocaleString('pt-BR', { maximumFractionDigits: 0 })
    },
    { key: 'codigo_barras', label: 'Código de Barras' },
    { key: 'codigo_referencia', label: 'Código de Referência' },
    {
      key: 'situacao',
      label: 'Status',
      render: (produto: Produto) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          produto.situacao ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
        }`}>
          {produto.situacao ? '🔴 Inativo' : '🟢 Ativo'}
        </span>
      )
    }
  ];

  // Calcular percentual de lucro quando preço ou custo mudarem
  useEffect(() => {
    if (formData.custo_compra > 0 && formData.preco_venda > 0) {
      const lucro = ((formData.preco_venda - formData.custo_compra) / formData.custo_compra) * 100;
      setFormData(prev => ({ ...prev, lucro_percentual: Number(lucro.toFixed(2)) }));
    }
  }, [formData.custo_compra, formData.preco_venda]);

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold leading-6 text-gray-900">Produtos</h1>
          <p className="mt-2 text-sm text-gray-700">
            Lista de todos os produtos cadastrados no sistema.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none flex items-center gap-3">
          <div className="relative">
            <Input
              type="text"
              placeholder="Buscar produtos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-[320px] pl-10"
            />
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-2.5 text-gray-400" />
          </div>
          <Button
            onClick={() => openModal()}
            className="bg-violet-600 hover:bg-violet-500"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Novo Produto
          </Button>
        </div>
      </div>

      <div className="mt-6">
      <DataTable
        data={sortedProdutos}
          columns={columns}
          onEdit={openModal}
          onDelete={openDeleteModal}
          sortKey={sortConfig?.key}
          sortDirection={sortConfig?.direction}
        onSort={handleSort}
          actions={[
            {
              icon: EyeIcon,
              onClick: handleOpenDetailsModal,
              label: 'Ver Detalhes'
            },
            {
              icon: UsersIcon,
              onClick: handleOpenVinculoModal,
              label: 'Gerenciar Fornecedores'
            }
          ]}
        />
      </div>

      {/* Modal de Produto */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Editar Produto' : 'Novo Produto'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="codprod">Código</Label>
                <Input
                  id="codprod"
                  value={isEditing ? formData.codprod : ''}
                  disabled
                  className="bg-gray-50"
                  placeholder={isEditing ? '' : 'Auto'}
                />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  value={formData.situacao ? 'INATIVO' : 'ATIVO'}
                  onChange={(e) => {
                    const isInativo = e.target.value === 'INATIVO';
                    setFormData(prev => ({
                      ...prev,
                      situacao: isInativo ? new Date().toISOString() : undefined
                    }));
                  }}
                  disabled={!isEditing}
                  className={`flex h-9 w-full rounded-md border border-input px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 ${
                    !isEditing ? 'bg-gray-50' : 'bg-transparent'
                  }`}
                >
                  <option value="ATIVO">🟢 Ativo</option>
                  <option value="INATIVO">🔴 Inativo</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nome">Nome do Produto *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Digite o nome do produto"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="codigo_barras">Código de Barras</Label>
                <Input
                  id="codigo_barras"
                  value={formData.codigo_barras}
                  onChange={(e) => setFormData({ ...formData, codigo_barras: e.target.value })}
                  placeholder="Digite o código de barras"
                />
              </div>

              <div>
                <Label htmlFor="codigo_referencia">Código de Referência</Label>
                <Input
                  id="codigo_referencia"
                  value={formData.codigo_referencia}
                  onChange={(e) => setFormData({ ...formData, codigo_referencia: e.target.value })}
                  placeholder="Digite o código de referência"
                />
              </div>

              <div>
                <Label htmlFor="unidade">Unidade *</Label>
                <UnidadeSelect
                  value={selectedUnidade}
                  onSelect={(unidade) => setSelectedUnidade(unidade)}
                />
              </div>

              <div>
                <Label>Categoria *</Label>
                <CategoriaSelect
                  value={selectedCategoria}
                  onSelect={(categoria) => setSelectedCategoria(categoria)}
                />
              </div>

              <div>
                <Label>Marca *</Label>
                <MarcaSelect
                  value={selectedMarca}
                  onSelect={(marca) => setSelectedMarca(marca)}
                />
              </div>

              <div>
                <Label htmlFor="custo_compra">Custo de Compra *</Label>
                <Input
                  id="custo_compra"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.custo_compra}
                  onChange={(e) => setFormData({ ...formData, custo_compra: Number(e.target.value) })}
                  placeholder="0,00"
                  required
        />
              </div>

              <div>
                <Label htmlFor="preco_venda">Preço de Venda *</Label>
                <Input
                  id="preco_venda"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.preco_venda}
                  onChange={(e) => setFormData({ ...formData, preco_venda: Number(e.target.value) })}
                  placeholder="0,00"
                  required
                />
              </div>

              <div>
                <Label htmlFor="lucro_percentual">Percentual de Lucro (%)</Label>
                <Input
                  id="lucro_percentual"
                  type="number"
                  step="0.01"
                  value={formData.lucro_percentual}
                  readOnly
                  className="bg-gray-100"
                />
              </div>

              <div>
                <Label htmlFor="quantidade_estoque">Quantidade em Estoque</Label>
                <Input
                  id="quantidade_estoque"
                  type="number"
                  min="0"
                  value={formData.quantidade_estoque}
                  onChange={(e) => setFormData({ ...formData, quantidade_estoque: Number(e.target.value) })}
                  placeholder="0"
                />
              </div>

              <div>
                <Label htmlFor="quantidade_minima_estoque">Quantidade Mínima</Label>
                <Input
                  id="quantidade_minima_estoque"
                  type="number"
                  min="0"
                  value={formData.quantidade_minima_estoque}
                  onChange={(e) => setFormData({ ...formData, quantidade_minima_estoque: Number(e.target.value) })}
                  placeholder="0"
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-violet-600 hover:bg-violet-500">
                {isEditing ? 'Atualizar' : 'Salvar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de Detalhes */}
      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <EyeIcon className="h-5 w-5 text-violet-600" />
              Detalhes do Produto
            </DialogTitle>
          </DialogHeader>
          
          {selectedProduto && (
            <div className="space-y-8">
              {/* Identificação */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-6 bg-violet-600 rounded-full"></div>
                  <h3 className="text-lg font-semibold text-gray-900">Identificação</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">Código:</span>
                    <span className="text-sm font-mono text-gray-900 bg-gray-50 px-2 py-1 rounded">{selectedProduto.codprod}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">Status:</span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      selectedProduto.situacao ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {selectedProduto.situacao ? '🔴 Inativo' : '🟢 Ativo'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">Nome do Produto:</span>
                    <span className="text-sm font-semibold text-gray-900 text-right max-w-[200px]">{selectedProduto.nome}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">Código de Barras:</span>
                    <span className="text-sm font-mono text-gray-900 bg-gray-50 px-2 py-1 rounded">{selectedProduto.codigo_barras || '-'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">Código de Referência:</span>
                    <span className="text-sm font-mono text-gray-900 bg-gray-50 px-2 py-1 rounded">{selectedProduto.codigo_referencia || '-'}</span>
                  </div>
                </div>
              </div>

              {/* Categorização */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
                  <h3 className="text-lg font-semibold text-gray-900">Categorização</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">Categoria:</span>
                    <span className="text-sm text-gray-900">{selectedProduto.nome_categoria || '-'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">Marca:</span>
                    <span className="text-sm text-gray-900">{selectedProduto.nome_marca || '-'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">Unidade:</span>
                    <span className="text-sm text-gray-900">
                      {selectedProduto.nome_unidade ? `${selectedProduto.nome_unidade} (${selectedProduto.sigla_unidade})` : '-'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Preços e Estoque */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Preços */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1 h-6 bg-green-600 rounded-full"></div>
                    <h3 className="text-lg font-semibold text-gray-900">Preços</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm font-medium text-gray-600">Custo de Compra:</span>
                      <span className="text-sm font-mono text-gray-900 bg-red-50 px-2 py-1 rounded">
                        {formatCurrency(selectedProduto.custo_compra)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm font-medium text-gray-600">Preço de Venda:</span>
                      <span className="text-sm font-mono text-gray-900 bg-green-50 px-2 py-1 rounded">
                        {formatCurrency(selectedProduto.preco_venda || selectedProduto.valorunitario)}
                      </span>
                    </div>
                                         <div className="flex justify-between items-center py-2 border-b border-gray-100">
                       <span className="text-sm font-medium text-gray-600">Lucro (%):</span>
                       <span className={`text-sm font-mono px-2 py-1 rounded ${
                         (selectedProduto.lucro_percentual || 0) >= 0 ? 'text-green-800 bg-green-50' : 'text-red-800 bg-red-50'
                       }`}>
                         {selectedProduto.lucro_percentual !== null && selectedProduto.lucro_percentual !== undefined 
                           ? `${Number(selectedProduto.lucro_percentual).toFixed(2)}%` 
                           : '-'}
                       </span>
                     </div>
                  </div>
                </div>

                {/* Estoque */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1 h-6 bg-amber-600 rounded-full"></div>
                    <h3 className="text-lg font-semibold text-gray-900">Estoque</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm font-medium text-gray-600">Quantidade Atual:</span>
                      <span className={`text-sm font-mono px-2 py-1 rounded ${
                        (selectedProduto.quantidade_estoque || 0) > (selectedProduto.quantidade_minima_estoque || 0) 
                          ? 'text-green-800 bg-green-50' 
                          : 'text-red-800 bg-red-50'
                      }`}>
                        {Number(selectedProduto.quantidade_estoque || 0).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm font-medium text-gray-600">Quantidade Mínima:</span>
                      <span className="text-sm font-mono text-gray-900 bg-gray-50 px-2 py-1 rounded">
                        {Number(selectedProduto.quantidade_minima_estoque || 0).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Informações de Auditoria */}
              <div className="pt-6 border-t border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-6 bg-gray-500 rounded-full"></div>
                  <h3 className="text-lg font-semibold text-gray-900">Informações de Auditoria</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">Data de Criação:</span>
                    <span className="text-sm font-mono text-gray-900 bg-gray-50 px-2 py-1 rounded">
                      {formatDateTime(selectedProduto.datacadastro)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">Última Atualização:</span>
                    <span className="text-sm font-mono text-gray-900 bg-gray-50 px-2 py-1 rounded">
                      {formatDateTime(selectedProduto.data_alteracao || '')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDetailsModal}>
              Fechar
            </Button>
            <Button 
              onClick={() => {
                handleCloseDetailsModal();
                openModal(selectedProduto!);
              }}
              className="bg-violet-600 hover:bg-violet-500"
            >
              <PencilIcon className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Confirmação de Exclusão */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
          </DialogHeader>
          <p>Tem certeza que deseja excluir o produto "{selectedProduto?.nome}"?</p>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button 
              type="button" 
              variant="destructive" 
              onClick={handleDelete}
            >
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Vínculos Produto-Fornecedor */}
      <Dialog open={isVinculoModalOpen} onOpenChange={setIsVinculoModalOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedProduto ? `Gerenciar Fornecedores - ${selectedProduto.nome}` : 'Gerenciar Fornecedores'}
            </DialogTitle>
          </DialogHeader>
          {selectedProduto && (
            <ProdutoFornecedorForm
              modo="produto"
              item={{
                codprod: selectedProduto.codprod,
                nome: selectedProduto.nome
              }}
              onClose={handleCloseVinculoModal}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 