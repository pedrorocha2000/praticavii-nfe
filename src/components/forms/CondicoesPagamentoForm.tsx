'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { PlusIcon, TrashIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { DataTable } from '@/components/DataTable';

interface FormaPagamento {
  codformapgto: number;
  descricao: string;
}

interface Parcela {
  numparc: number;
  codformapgto: number;
  dias: number;
  percentual: number;
}

interface CondicaoPagamento {
  codcondpgto: number;
  descricao: string;
  juros_perc: number;
  multa_perc: number;
  desconto_perc: number;
  parcelas: Parcela[];
}

interface CondicoesPagamentoFormProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: (condicao: CondicaoPagamento) => void;
  initialData?: CondicaoPagamento;
  trigger?: React.ReactNode;
}

export default function CondicoesPagamentoForm({
  isOpen,
  onOpenChange,
  onSuccess,
  initialData,
  trigger
}: CondicoesPagamentoFormProps) {
  const [open, setOpen] = useState(false);
  const [formasPagamento, setFormasPagamento] = useState<FormaPagamento[]>([]);
  const [formData, setFormData] = useState({
    codcondpgto: initialData?.codcondpgto ? String(initialData.codcondpgto) : '',
    descricao: initialData?.descricao || '',
    juros_perc: initialData?.juros_perc || 0,
    multa_perc: initialData?.multa_perc || 0,
    desconto_perc: initialData?.desconto_perc || 0,
    parcelas: initialData?.parcelas || [{ numparc: 1, codformapgto: 0, dias: 0, percentual: 100 }]
  });
  const [formaPagamentoModalOpen, setFormaPagamentoModalOpen] = useState(false);
  const [selectedParcelaIndex, setSelectedParcelaIndex] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormaPagamentoFormOpen, setIsFormaPagamentoFormOpen] = useState(false);
  const [novaFormaPagamento, setNovaFormaPagamento] = useState<FormaPagamento>({
    codformapgto: 0,
    descricao: ''
  });

  const isEditing = !!initialData;
  const controlledOpen = isOpen !== undefined ? isOpen : open;
  const handleOpenChange = onOpenChange || setOpen;

  useEffect(() => {
    fetchFormasPagamento();
  }, []);

  const fetchFormasPagamento = async () => {
    try {
      const response = await fetch('/api/formas-pagamento');
      if (!response.ok) {
        throw new Error('Erro ao carregar formas de pagamento');
      }
      const data = await response.json();
      setFormasPagamento(data);
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao carregar formas de pagamento');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar se o total de percentuais é 100%
    const totalPercentual = formData.parcelas.reduce((total, parcela) => total + parcela.percentual, 0);
    if (totalPercentual !== 100) {
      toast.error('O total dos percentuais deve ser 100%');
      return;
    }

    try {
      const url = '/api/cond_pgto';
      const method = isEditing ? 'PUT' : 'POST';
      
      const payload = {
        codcondpgto: parseInt(formData.codcondpgto),
        descricao: formData.descricao,
        juros_perc: formData.juros_perc,
        multa_perc: formData.multa_perc,
        desconto_perc: formData.desconto_perc,
        parcelas: formData.parcelas
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao salvar condição de pagamento');
      }

      const savedData = await response.json();
      toast.success(isEditing ? 'Condição de pagamento atualizada!' : 'Condição de pagamento cadastrada!');
      handleOpenChange(false);
      onSuccess?.(savedData);
      
      if (!isEditing) {
        setFormData({
          codcondpgto: '',
          descricao: '',
          juros_perc: 0,
          multa_perc: 0,
          desconto_perc: 0,
          parcelas: [{ numparc: 1, codformapgto: 0, dias: 0, percentual: 100 }]
        });
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao salvar condição de pagamento');
    }
  };

  const handleAddParcela = () => {
    setFormData(prev => ({
      ...prev,
      parcelas: [
        ...prev.parcelas,
        {
          numparc: prev.parcelas.length + 1,
          codformapgto: 0,
          dias: prev.parcelas[prev.parcelas.length - 1]?.dias + 30 || 30,
          percentual: 0
        }
      ]
    }));
  };

  const handleRemoveParcela = (index: number) => {
    setFormData(prev => ({
      ...prev,
      parcelas: prev.parcelas.filter((_, i) => i !== index).map((parcela, i) => ({
        ...parcela,
        numparc: i + 1
      }))
    }));
  };

  const handleParcelaChange = (index: number, field: keyof Parcela, value: number) => {
    setFormData(prev => ({
      ...prev,
      parcelas: prev.parcelas.map((parcela, i) => 
        i === index ? { ...parcela, [field]: value } : parcela
      )
    }));
  };

  const filteredFormasPagamento = formasPagamento.filter(formaPagamento => 
    formaPagamento.codformapgto.toString().includes(searchTerm.toLowerCase()) ||
    formaPagamento.descricao.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFormaPagamentoSelect = (formaPagamento: FormaPagamento) => {
    if (selectedParcelaIndex !== null) {
      handleParcelaChange(selectedParcelaIndex, 'codformapgto', formaPagamento.codformapgto);
      setFormaPagamentoModalOpen(false);
      setSelectedParcelaIndex(null);
    }
  };

  const handleFormaPagamentoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/formas-pagamento', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(novaFormaPagamento),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao salvar forma de pagamento');
      }

      const savedData = await response.json();
      toast.success('Forma de pagamento cadastrada com sucesso!');
      setIsFormaPagamentoFormOpen(false);
      
      // Atualiza a lista de formas de pagamento
      fetchFormasPagamento();
      
      // Seleciona automaticamente a forma de pagamento recém-criada
      handleFormaPagamentoSelect(savedData);
    } catch (error) {
      console.error('Erro:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao salvar forma de pagamento');
    }
  };

  const columns = [
    { key: 'codformapgto', label: 'Código' },
    { key: 'descricao', label: 'Descrição' }
  ];

  const content = (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="codcondpgto">Código</Label>
          <Input
            id="codcondpgto"
            type="number"
            value={formData.codcondpgto}
            onChange={(e) => setFormData({ ...formData, codcondpgto: e.target.value })}
            required
            disabled={isEditing}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="descricao">Descrição</Label>
          <Input
            id="descricao"
            value={formData.descricao}
            onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="juros_perc">Juros (%)</Label>
          <Input
            id="juros_perc"
            type="number"
            step="0.01"
            min="0"
            max="100"
            value={formData.juros_perc}
            onChange={(e) => setFormData({ ...formData, juros_perc: parseFloat(e.target.value) || 0 })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="multa_perc">Multa (%)</Label>
          <Input
            id="multa_perc"
            type="number"
            step="0.01"
            min="0"
            max="100"
            value={formData.multa_perc}
            onChange={(e) => setFormData({ ...formData, multa_perc: parseFloat(e.target.value) || 0 })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="desconto_perc">Desconto (%)</Label>
          <Input
            id="desconto_perc"
            type="number"
            step="0.01"
            min="0"
            max="100"
            value={formData.desconto_perc}
            onChange={(e) => setFormData({ ...formData, desconto_perc: parseFloat(e.target.value) || 0 })}
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Label>Parcelas</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddParcela}
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Adicionar Parcela
          </Button>
        </div>

        {formData.parcelas.map((parcela, index) => (
          <div key={parcela.numparc} className="grid grid-cols-12 gap-4 items-end border rounded-lg p-4">
            <div className="col-span-1">
              <Label>Nº</Label>
              <div className="h-9 flex items-center">{parcela.numparc}</div>
            </div>
            <div className="col-span-3">
              <Label htmlFor={`dias-${index}`}>Dias</Label>
              <Input
                id={`dias-${index}`}
                type="number"
                min="0"
                value={parcela.dias}
                onChange={(e) => handleParcelaChange(index, 'dias', parseInt(e.target.value))}
                required
              />
            </div>
            <div className="col-span-3">
              <Label htmlFor={`percentual-${index}`}>Percentual (%)</Label>
              <Input
                id={`percentual-${index}`}
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={parcela.percentual}
                onChange={(e) => handleParcelaChange(index, 'percentual', parseFloat(e.target.value))}
                required
              />
            </div>
            <div className="col-span-4">
              <Label htmlFor={`formapgto-${index}`}>Forma de Pagamento</Label>
              <div className="flex gap-2">
                <Input
                  id={`formapgto-${index}`}
                  value={formasPagamento.find(f => f.codformapgto === parcela.codformapgto)?.descricao || ''}
                  readOnly
                  placeholder="Selecione uma forma de pagamento"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setSelectedParcelaIndex(index);
                    setFormaPagamentoModalOpen(true);
                  }}
                >
                  Selecionar
                </Button>
              </div>
            </div>
            {formData.parcelas.length > 1 && (
              <div className="col-span-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveParcela(index)}
                  className="text-destructive hover:text-destructive/90"
                >
                  <TrashIcon className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        ))}

        <div className="text-sm text-muted-foreground">
          Total: {formData.parcelas.reduce((total, parcela) => total + parcela.percentual, 0)}%
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={() => handleOpenChange(false)} type="button">
          Cancelar
        </Button>
        <Button type="submit">
          {isEditing ? 'Atualizar' : 'Cadastrar'}
        </Button>
      </DialogFooter>
    </form>
  );

  // Se não houver trigger, retorna apenas o formulário
  if (!trigger) {
    return (
      <>
        {content}
        {formaPagamentoModalOpen && selectedParcelaIndex !== null && (
          <Dialog open={formaPagamentoModalOpen} onOpenChange={setFormaPagamentoModalOpen}>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Selecionar Forma de Pagamento</DialogTitle>
              </DialogHeader>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-1 relative">
                  <Input
                    type="text"
                    placeholder="Buscar forma de pagamento..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                  <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-2.5 text-gray-400" />
                </div>
                <Button
                  type="button"
                  onClick={() => setIsFormaPagamentoFormOpen(true)}
                  className="bg-violet-600 hover:bg-violet-500 shrink-0"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Nova Forma de Pagamento
                </Button>
              </div>
              <DataTable
                data={filteredFormasPagamento}
                columns={columns}
                onRowClick={handleFormaPagamentoSelect}
              />
            </DialogContent>
          </Dialog>
        )}

        {isFormaPagamentoFormOpen && (
          <Dialog open={isFormaPagamentoFormOpen} onOpenChange={setIsFormaPagamentoFormOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nova Forma de Pagamento</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleFormaPagamentoSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="codformapgto">Código</Label>
                  <Input
                    id="codformapgto"
                    type="number"
                    value={novaFormaPagamento.codformapgto || ''}
                    onChange={(e) => setNovaFormaPagamento({ ...novaFormaPagamento, codformapgto: parseInt(e.target.value) || 0 })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="descricao">Descrição</Label>
                  <Input
                    id="descricao"
                    value={novaFormaPagamento.descricao}
                    onChange={(e) => setNovaFormaPagamento({ ...novaFormaPagamento, descricao: e.target.value })}
                    required
                  />
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsFormaPagamentoFormOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" className="bg-violet-600 hover:bg-violet-500">
                    Salvar
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </>
    );
  }

  // Se houver trigger, retorna o Dialog completo
  return (
    <>
      <Dialog open={controlledOpen} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Editar Condição de Pagamento' : 'Nova Condição de Pagamento'}
            </DialogTitle>
          </DialogHeader>
          {content}
        </DialogContent>
      </Dialog>

      {formaPagamentoModalOpen && selectedParcelaIndex !== null && (
        <Dialog open={formaPagamentoModalOpen} onOpenChange={setFormaPagamentoModalOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Selecionar Forma de Pagamento</DialogTitle>
            </DialogHeader>
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-1 relative">
                <Input
                  type="text"
                  placeholder="Buscar forma de pagamento..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-2.5 text-gray-400" />
              </div>
              <Button
                type="button"
                onClick={() => setIsFormaPagamentoFormOpen(true)}
                className="bg-violet-600 hover:bg-violet-500 shrink-0"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Nova Forma de Pagamento
              </Button>
            </div>
            <DataTable
              data={filteredFormasPagamento}
              columns={columns}
              onRowClick={handleFormaPagamentoSelect}
            />
          </DialogContent>
        </Dialog>
      )}

      {isFormaPagamentoFormOpen && (
        <Dialog open={isFormaPagamentoFormOpen} onOpenChange={setIsFormaPagamentoFormOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova Forma de Pagamento</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleFormaPagamentoSubmit} className="space-y-4">
              <div>
                <Label htmlFor="codformapgto">Código</Label>
                <Input
                  id="codformapgto"
                  type="number"
                  value={novaFormaPagamento.codformapgto || ''}
                  onChange={(e) => setNovaFormaPagamento({ ...novaFormaPagamento, codformapgto: parseInt(e.target.value) || 0 })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="descricao">Descrição</Label>
                <Input
                  id="descricao"
                  value={novaFormaPagamento.descricao}
                  onChange={(e) => setNovaFormaPagamento({ ...novaFormaPagamento, descricao: e.target.value })}
                  required
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsFormaPagamentoFormOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" className="bg-violet-600 hover:bg-violet-500">
                  Salvar
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}