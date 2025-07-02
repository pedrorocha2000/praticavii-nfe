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
import { DataTable } from '@/components/DataTable';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface Transportadora {
  codtrans: number;
  nomerazao: string;
  nomefantasia: string;
  nomecidade?: string;
  nomeestado?: string;
  telefone: string;
}

interface TransportadoraSelectProps {
  value: { codtrans: number; nomerazao: string } | null;
  onChange: (transportadora: { codtrans: number; nomerazao: string } | null) => void;
  error?: string;
}

export default function TransportadoraSelect({ value, onChange, error }: TransportadoraSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [transportadoras, setTransportadoras] = useState<Transportadora[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Transportadora;
    direction: 'asc' | 'desc';
  }>({ key: 'nomerazao', direction: 'asc' });

  const fetchTransportadoras = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/transportadoras');
      const data = await response.json();
      setTransportadoras(data);
    } catch (error) {
      console.error('Erro ao carregar transportadoras:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchTransportadoras();
    }
  }, [isOpen]);

  const handleSelect = (transportadora: Transportadora) => {
    onChange({
      codtrans: transportadora.codtrans,
      nomerazao: transportadora.nomerazao
    });
    setIsOpen(false);
  };

  const handleSort = (key: keyof Transportadora) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const filteredAndSortedTransportadoras = transportadoras
    .filter(transportadora => 
      transportadora.codtrans.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      transportadora.nomerazao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transportadora.nomefantasia?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transportadora.nomecidade?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transportadora.telefone?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const aValue = String(a[sortConfig.key] || '');
      const bValue = String(b[sortConfig.key] || '');
      return sortConfig.direction === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    });

  const columns = [
    { 
      key: 'codtrans', 
      label: 'Código',
      render: (item: Transportadora) => (
        <span className="font-mono text-sm">{item.codtrans}</span>
      )
    },
    { 
      key: 'nomerazao', 
      label: 'Nome/Razão Social',
      render: (item: Transportadora) => (
        <span className="font-medium">{item.nomerazao}</span>
      )
    },
    { 
      key: 'nomefantasia', 
      label: 'Nome Fantasia',
      render: (item: Transportadora) => (
        <span>{item.nomefantasia || '-'}</span>
      )
    },
    { 
      key: 'cidade', 
      label: 'Cidade',
      render: (item: Transportadora) => (
        <span className="text-sm">
          {item.nomecidade && item.nomeestado 
            ? `${item.nomecidade}/${item.nomeestado}`
            : '-'
          }
        </span>
      )
    },
    { 
      key: 'telefone', 
      label: 'Telefone',
      render: (item: Transportadora) => (
        <span className="font-mono text-sm">{item.telefone || '-'}</span>
      )
    }
  ];

  return (
    <>
      <div className="space-y-2">
        <div className="flex gap-2">
          <Input
            value={value ? `${value.codtrans} - ${value.nomerazao}` : ''}
            placeholder="Selecione uma transportadora..."
            readOnly
            className={error ? 'border-red-500' : ''}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsOpen(true)}
          >
            Selecionar
          </Button>
          {value && (
            <Button
              type="button"
              variant="outline"
              onClick={() => onChange(null)}
            >
              Limpar
            </Button>
          )}
        </div>
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Selecionar Transportadora</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="relative">
              <Input
                type="text"
                placeholder="Buscar transportadora..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-2.5 text-gray-400" />
            </div>

            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
              </div>
            ) : (
              <DataTable
                data={filteredAndSortedTransportadoras}
                columns={columns}
                onRowClick={handleSelect}
                sortKey={sortConfig.key}
                sortDirection={sortConfig.direction}
                onSort={handleSort}
              />
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
} 