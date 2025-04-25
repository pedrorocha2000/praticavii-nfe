'use client';

import { useState } from 'react';
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

interface Pais {
  codpais: string;
  nomepais: string;
}

interface PaisFormProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: (pais: Pais) => void;
  initialData?: Pais;
  trigger?: React.ReactNode;
}

export default function PaisForm({
  isOpen,
  onOpenChange,
  onSuccess,
  initialData,
  trigger
}: PaisFormProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<Pais>({
    codpais: initialData?.codpais || '',
    nomepais: initialData?.nomepais || ''
  });

  const isEditing = !!initialData;
  const controlledOpen = isOpen !== undefined ? isOpen : open;
  const handleOpenChange = onOpenChange || setOpen;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/paises', {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao salvar país');
      }

      const savedData = await response.json();
      toast.success(isEditing ? 'País atualizado!' : 'País cadastrado!');
      handleOpenChange(false);
      onSuccess?.(savedData);
      
      if (!isEditing) {
        setFormData({
          codpais: '',
          nomepais: ''
        });
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao salvar país');
    }
  };

  const content = (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="codpais">Código</Label>
        <Input
          id="codpais"
          value={formData.codpais}
          onChange={(e) => setFormData({ ...formData, codpais: e.target.value })}
          required
          disabled={isEditing}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="nomepais">Nome</Label>
        <Input
          id="nomepais"
          value={formData.nomepais}
          onChange={(e) => setFormData({ ...formData, nomepais: e.target.value })}
          required
        />
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
        <DialogContent className="z-[60]">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Editar País' : 'Novo País'}</DialogTitle>
          </DialogHeader>
          {content}
        </DialogContent>
      </Dialog>
    );
  }

  return content;
} 