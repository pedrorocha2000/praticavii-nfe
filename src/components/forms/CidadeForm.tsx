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
import EstadoForm from './EstadoForm';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface Estado {
  codestado: string;
  nomeestado: string;
  uf: string;
  codpais: string;
  nomepais: string;
}

interface Cidade {
  codcidade: string;
  nomecidade: string;
  codestado: string;
}

interface CidadeFormProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: (cidade: Cidade) => void;
  initialData?: Cidade;
  trigger?: React.ReactNode;
  defaultCodEstado?: string;
}

export default function CidadeForm({
  isOpen,
  onOpenChange,
  onSuccess,
  initialData,
  trigger,
  defaultCodEstado
}: CidadeFormProps) {
  const [open, setOpen] = useState(false);
  const [estados, setEstados] = useState<Estado[]>([]);
  const [formData, setFormData] = useState<Cidade>({
    codcidade: initialData?.codcidade || '',
    nomecidade: initialData?.nomecidade || '',
    codestado: initialData?.codestado || defaultCodEstado || ''
  });
  const [comboboxOpen, setComboboxOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const isEditing = !!initialData;
  const controlledOpen = isOpen !== undefined ? isOpen : open;
  const handleOpenChange = onOpenChange || setOpen;

  useEffect(() => {
    fetchEstados();
  }, []);

  useEffect(() => {
    if (defaultCodEstado && !isEditing) {
      setFormData(prev => ({ ...prev, codestado: defaultCodEstado }));
    }
  }, [defaultCodEstado, isEditing]);

  const fetchEstados = async () => {
    try {
      const response = await fetch('/api/estados');
      if (!response.ok) throw new Error('Erro ao carregar estados');
      const data = await response.json();
      setEstados(data);
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao carregar estados');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/cidades', {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao salvar cidade');
      }

      const savedData = await response.json();
      toast.success(isEditing ? 'Cidade atualizada!' : 'Cidade cadastrada!');
      handleOpenChange(false);
      onSuccess?.(savedData);
      
      if (!isEditing) {
        setFormData({
          codcidade: '',
          nomecidade: '',
          codestado: defaultCodEstado || ''
        });
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao salvar cidade');
    }
  };

  const handleEstadoSuccess = (estado: Estado) => {
    fetchEstados();
    setFormData(prev => ({ ...prev, codestado: estado.codestado }));
  };

  const getEstadoNome = (codestado: string) => {
    const estado = estados.find(e => e.codestado === codestado);
    return estado ? `${estado.nomeestado} - ${estado.uf} (${estado.nomepais})` : '';
  };

  const filteredEstados = estados.filter((estado) =>
    estado.nomeestado.toLowerCase().includes(searchQuery.toLowerCase()) ||
    estado.uf.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const content = (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="codcidade">Código</Label>
        <Input
          id="codcidade"
          value={formData.codcidade}
          onChange={(e) => setFormData({ ...formData, codcidade: e.target.value })}
          required
          disabled={isEditing}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="nomecidade">Nome</Label>
        <Input
          id="nomecidade"
          value={formData.nomecidade}
          onChange={(e) => setFormData({ ...formData, nomecidade: e.target.value })}
          required
        />
      </div>
      <div className="space-y-2">
        <Label>Estado</Label>
        <div className="flex gap-2">
          <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={comboboxOpen}
                className="w-full justify-between"
              >
                {formData.codestado ? getEstadoNome(formData.codestado) : "Selecione um estado"}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0" align="start">
              <Command shouldFilter={false}>
                <CommandInput 
                  placeholder="Pesquisar estado..." 
                  value={searchQuery}
                  onValueChange={setSearchQuery}
                />
                <CommandList>
                  <CommandEmpty>Nenhum estado encontrado.</CommandEmpty>
                  <CommandGroup>
                    {filteredEstados.map((estado) => (
                      <CommandItem
                        key={estado.codestado}
                        value={estado.codestado}
                        onSelect={(currentValue) => {
                          setFormData({ ...formData, codestado: currentValue });
                          setComboboxOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            formData.codestado === estado.codestado ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {estado.nomeestado} - {estado.uf} ({estado.nomepais})
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          <EstadoForm
            trigger={
              <Button
                type="button"
                variant="outline"
                className="shrink-0"
              >
                Novo Estado
              </Button>
            }
            onSuccess={handleEstadoSuccess}
          />
        </div>
      </div>
      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={() => handleOpenChange(false)}
        >
          Cancelar
        </Button>
        <Button type="submit" className="bg-violet-600 hover:bg-violet-500">
          {isEditing ? 'Atualizar' : 'Cadastrar'}
        </Button>
      </DialogFooter>
    </form>
  );

  if (trigger) {
    return (
      <Dialog open={controlledOpen} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
        <DialogContent className="z-[50]">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Editar Cidade' : 'Nova Cidade'}</DialogTitle>
          </DialogHeader>
          {content}
        </DialogContent>
      </Dialog>
    );
  }

  return content;
} 