'use client';

import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface Produto {
  codprod: number;
  nome: string;
  ncm: string;
  cfop: string;
  unidade: string;
  valorunitario: number;
  datacadastro: string;
  aliq_icms: number;
  aliq_ipi: number;
  aliq_pis: number;
  aliq_cofins: number;
}

export default function Produto() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    codprod: '',
    nome: '',
    ncm: '',
    unidade: '',
    valorunitario: ''
  });

  const resetForm = () => {
    setFormData({
      codprod: '',
      nome: '',
      ncm: '',
      unidade: '',
      valorunitario: ''
    });
    setIsEditing(false);
  };

  const loadProdutos = async () => {
    try {
      const response = await fetch('/api/produtos');
      if (!response.ok) {
        throw new Error('Erro ao carregar produtos');
      }
      const data = await response.json();
      setProdutos(data);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      toast.error('Erro ao carregar produtos');
    }
  };

  useEffect(() => {
    loadProdutos();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const endpoint = isEditing ? '/api/produtos' : '/api/produtos';
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          valorunitario: Number(formData.valorunitario),
          ...(isEditing && { codprod: Number(formData.codprod) }),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao salvar produto');
      }

      toast.success(isEditing ? 'Produto atualizado!' : 'Produto cadastrado!');
      setOpen(false);
      resetForm();
      loadProdutos();
    } catch (error: any) {
      console.error('Erro:', error);
      toast.error(error.message);
    }
  };

  const handleEdit = (produto: Produto) => {
    setFormData({
      codprod: produto.codprod.toString(),
      nome: produto.nome,
      ncm: produto.ncm || '',
      unidade: produto.unidade || '',
      valorunitario: produto.valorunitario?.toString() || ''
    });
    setIsEditing(true);
    setOpen(true);
  };

  const handleDelete = async (codprod: number) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) {
      return;
    }

    try {
      const response = await fetch(`/api/produtos?codprod=${codprod}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao excluir produto');
      }

      toast.success('Produto excluído com sucesso!');
      loadProdutos();
    } catch (error: any) {
      console.error('Erro:', error);
      toast.error(error.message);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Produtos</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                resetForm();
                setOpen(true);
              }}
            >
              Novo Produto
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {isEditing ? 'Editar Produto' : 'Novo Produto'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome *</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) =>
                      setFormData({ ...formData, nome: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ncm">NCM</Label>
                  <Input
                    id="ncm"
                    value={formData.ncm}
                    onChange={(e) =>
                      setFormData({ ...formData, ncm: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unidade">Unidade</Label>
                  <Input
                    id="unidade"
                    value={formData.unidade}
                    onChange={(e) =>
                      setFormData({ ...formData, unidade: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="valorunitario">Valor Unitário</Label>
                  <Input
                    id="valorunitario"
                    type="number"
                    step="0.01"
                    value={formData.valorunitario}
                    onChange={(e) =>
                      setFormData({ ...formData, valorunitario: e.target.value })
                    }
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {isEditing ? 'Atualizar' : 'Cadastrar'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>NCM</TableHead>
              <TableHead>Unidade</TableHead>
              <TableHead>Valor Unitário</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {produtos.map((produto) => (
              <TableRow key={produto.codprod}>
                <TableCell>{produto.codprod}</TableCell>
                <TableCell>{produto.nome}</TableCell>
                <TableCell>{produto.ncm}</TableCell>
                <TableCell>{produto.unidade}</TableCell>
                <TableCell>
                  {produto.valorunitario?.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(produto)}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(produto.codprod)}
                    >
                      Excluir
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 