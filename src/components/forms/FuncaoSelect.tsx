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
import { PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { toast } from "sonner";
import { DataTable } from '@/components/DataTable';

interface FuncaoFuncionario {
  codfuncao: number;
  nome_funcao: string;
  exige_cnh: boolean;
  carga_horaria_semanal: number | null;
}

interface FuncaoSelectProps {
  value?: FuncaoFuncionario | null;
  onSelect: (funcao: FuncaoFuncionario) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function FuncaoSelect({ value, onSelect, placeholder = "Selecione uma função", disabled = false }: FuncaoSelectProps) {
  const [funcoes, setFuncoes] = useState<FuncaoFuncionario[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState<FuncaoFuncionario>({
    codfuncao: 0,
    nome_funcao: '',
    exige_cnh: false,
    carga_horaria_semanal: null
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (isModalOpen) {
      fetchFuncoes();
    }
  }, [isModalOpen]);

  const fetchFuncoes = async () => {
    try {
      const response = await fetch('/api/funcoes-funcionario');
      if (!response.ok) throw new Error('Erro ao carregar funções');
      const data = await response.json();
      setFuncoes(data);
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao carregar funções');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome_funcao.trim()) {
      toast.error('Nome da função é obrigatório');
      return;
    }

    if (formData.carga_horaria_semanal !== null && formData.carga_horaria_semanal !== undefined) {
      if (formData.carga_horaria_semanal < 0 || formData.carga_horaria_semanal > 168) {
        toast.error('Carga horária deve estar entre 0 e 168 horas');
        return;
      }
    }

    try {
      const response = await fetch('/api/funcoes-funcionario', {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        await fetchFuncoes();
        setIsFormOpen(false);
        setFormData({
          codfuncao: 0,
          nome_funcao: '',
          exige_cnh: false,
          carga_horaria_semanal: null
        });
        setIsEditing(false);
        toast.success(isEditing ? 'Função atualizada com sucesso!' : 'Função cadastrada com sucesso!');
        
        // Se não estava editando, seleciona a função recém-criada
        if (!isEditing) {
          onSelect(data);
          setIsModalOpen(false);
        }
      } else {
        toast.error(data.error || 'Erro ao salvar função');
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao salvar função');
    }
  };

  const handleSelect = (funcao: FuncaoFuncionario) => {
    onSelect(funcao);
    setIsModalOpen(false);
  };

  const filteredFuncoes = funcoes.filter(funcao =>
    funcao.nome_funcao.toLowerCase().includes(searchTerm.toLowerCase()) ||
    funcao.codfuncao.toString().includes(searchTerm)
  );

  const selectedFuncao = value || funcoes.find(f => f.codfuncao === value?.codfuncao);

  const columns = [
    { key: 'codfuncao', label: 'Código' },
    { key: 'nome_funcao', label: 'Nome' },
    { 
      key: 'carga_horaria_semanal', 
      label: 'Carga Horária',
      render: (funcao: FuncaoFuncionario) => 
        funcao.carga_horaria_semanal ? `${funcao.carga_horaria_semanal}h/sem` : '-'
    },
    { 
      key: 'exige_cnh', 
      label: 'CNH',
      render: (funcao: FuncaoFuncionario) => 
        funcao.exige_cnh ? (
          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
            Sim
          </span>
        ) : (
          <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
            Não
          </span>
        )
    },
  ];

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          value={selectedFuncao?.nome_funcao || ''}
          readOnly
          placeholder={placeholder}
          disabled={disabled}
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsModalOpen(true)}
          disabled={disabled}
        >
          Selecionar
        </Button>
      </div>

      {/* Modal de Seleção */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Selecionar Função</DialogTitle>
          </DialogHeader>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 relative">
              <Input
                type="text"
                placeholder="Buscar função..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-2.5 text-gray-400" />
            </div>
            <Button
              type="button"
              onClick={() => {
                setFormData({
                  codfuncao: 0,
                  nome_funcao: '',
                  exige_cnh: false,
                  carga_horaria_semanal: null
                });
                setIsEditing(false);
                setIsFormOpen(true);
              }}
              className="bg-violet-600 hover:bg-violet-500 shrink-0"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Nova Função
            </Button>
          </div>

          <DataTable
            data={filteredFuncoes}
            columns={columns}
            onRowClick={handleSelect}
          />
        </DialogContent>
      </Dialog>

      {/* Modal de Formulário */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Editar Função' : 'Nova Função'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="nome_funcao">Nome da Função *</Label>
              <Input
                id="nome_funcao"
                value={formData.nome_funcao}
                onChange={(e) => setFormData({ ...formData, nome_funcao: e.target.value })}
                placeholder="Digite o nome da função"
                required
              />
            </div>
            <div>
              <Label htmlFor="carga_horaria_semanal">Carga Horária Semanal (horas)</Label>
              <Input
                id="carga_horaria_semanal"
                type="number"
                min="0"
                max="168"
                value={formData.carga_horaria_semanal || ''}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  carga_horaria_semanal: e.target.value ? parseInt(e.target.value) : null 
                })}
                placeholder="40"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                id="exige_cnh"
                type="checkbox"
                checked={formData.exige_cnh}
                onChange={(e) => setFormData({ ...formData, exige_cnh: e.target.checked })}
                className="rounded border-gray-300 text-violet-600 focus:ring-violet-500"
              />
              <Label htmlFor="exige_cnh">Exige CNH</Label>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-violet-600 hover:bg-violet-500">
                {isEditing ? 'Atualizar' : 'Salvar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 