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
import PaisForm from './PaisForm';
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

interface Pais {
  codpais: string;
  nomepais: string;
}

interface Estado {
  codestado: string;
  nomeestado: string;
  uf: string;
  codpais: string;
}

interface EstadoFormProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: (estado: Estado) => void;
  initialData?: Estado;
  trigger?: React.ReactNode;
  defaultCodPais?: string;
}

export default function EstadoForm({
  isOpen,
  onOpenChange,
  onSuccess,
  initialData,
  trigger,
  defaultCodPais
}: EstadoFormProps) {
  const [open, setOpen] = useState(false);
  const [paises, setPaises] = useState<Pais[]>([]);
  const [formData, setFormData] = useState<Estado>({
    codestado: initialData?.codestado || '',
    nomeestado: initialData?.nomeestado || '',
    uf: initialData?.uf || '',
    codpais: initialData?.codpais || defaultCodPais || ''
  });
  const [comboboxOpen, setComboboxOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const isEditing = !!initialData;
  const controlledOpen = isOpen !== undefined ? isOpen : open;
  const handleOpenChange = onOpenChange || setOpen;

  useEffect(() => {
    fetchPaises();
  }, []);

  useEffect(() => {
    if (defaultCodPais && !isEditing) {
      setFormData(prev => ({ ...prev, codpais: defaultCodPais }));
    }
  }, [defaultCodPais, isEditing]);

  const fetchPaises = async () => {
    try {
      const response = await fetch('/api/paises');
      if (!response.ok) throw new Error('Erro ao carregar países');
      const data = await response.json();
      setPaises(data);
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao carregar países');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/estados', {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao salvar estado');
      }

      const savedData = await response.json();
      toast.success(isEditing ? 'Estado atualizado!' : 'Estado cadastrado!');
      handleOpenChange(false);
      onSuccess?.(savedData);
      
      if (!isEditing) {
        setFormData({
          codestado: '',
          nomeestado: '',
          uf: '',
          codpais: defaultCodPais || ''
        });
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao salvar estado');
    }
  };

  const handlePaisSuccess = (pais: Pais) => {
    fetchPaises();
    setFormData(prev => ({ ...prev, codpais: pais.codpais }));
  };

  const getPaisNome = (codpais: string) => {
    const pais = paises.find(p => p.codpais === codpais);
    return pais ? pais.nomepais : '';
  };

  const filteredPaises = paises.filter((pais) =>
    pais.nomepais.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const content = (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="codestado">Código</Label>
        <Input
          id="codestado"
          value={formData.codestado}
          onChange={(e) => setFormData({ ...formData, codestado: e.target.value })}
          required
          disabled={isEditing}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="nomeestado">Nome</Label>
        <Input
          id="nomeestado"
          value={formData.nomeestado}
          onChange={(e) => setFormData({ ...formData, nomeestado: e.target.value })}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="uf">UF</Label>
        <Input
          id="uf"
          value={formData.uf}
          onChange={(e) => setFormData({ ...formData, uf: e.target.value.toUpperCase() })}
          required
          maxLength={2}
        />
      </div>
      <div className="space-y-2">
        <Label>País</Label>
        <div className="flex gap-2">
          <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={comboboxOpen}
                className="w-full justify-between"
              >
                {formData.codpais ? getPaisNome(formData.codpais) : "Selecione um país"}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0" align="start">
              <Command shouldFilter={false}>
                <CommandInput 
                  placeholder="Pesquisar país..." 
                  value={searchQuery}
                  onValueChange={setSearchQuery}
                />
                <CommandList>
                  <CommandEmpty>Nenhum país encontrado.</CommandEmpty>
                  <CommandGroup>
                    {filteredPaises.map((pais) => (
                      <CommandItem
                        key={pais.codpais}
                        value={pais.codpais}
                        onSelect={(currentValue) => {
                          setFormData({ ...formData, codpais: currentValue });
                          setComboboxOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            formData.codpais === pais.codpais ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {pais.nomepais}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          <PaisForm
            trigger={
              <Button
                type="button"
                variant="outline"
                className="shrink-0"
              >
                Novo País
              </Button>
            }
            onSuccess={handlePaisSuccess}
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
        <DialogContent className="z-[55]">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Editar Estado' : 'Novo Estado'}</DialogTitle>
          </DialogHeader>
          {content}
        </DialogContent>
      </Dialog>
    );
  }

  return content;
} 