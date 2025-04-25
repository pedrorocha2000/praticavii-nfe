'use client';

import { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { Modal } from '@/components/Modal';
import { DataTable } from '@/components/DataTable';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { CidadeSelect } from '@/components/forms/CidadeSelect';
import CidadeForm from '@/components/forms/CidadeForm';

interface Funcionario {
  codfunc: number;
  codpessoa: number;
  tipopessoa: 'F' | 'J';
  nomerazao: string;
  nomefantasia: string;
  cpfcnpj: string;
  rg_inscricaoestadual: string;
  endereco: string;
  numero: string;
  complemento: string;
  bairro: string;
  cep: string;
  codcid: number;
  telefone: string;
  email: string;
  datacadastro: string;
  nomecidade?: string;
  nomeestado?: string;
  nomepais?: string;
  cargo: string;
  departamento: string;
  data_admissao: string;
  salario: number;
  status: 'Ativo' | 'Inativo' | 'Afastado' | 'Demitido';
}

export default function FuncionariosPage() {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedFuncionario, setSelectedFuncionario] = useState<Funcionario | null>(null);
  const [selectedCidade, setSelectedCidade] = useState<{ codcid: number; nomecidade: string; nomeestado: string; nomepais?: string } | null>(null);
  const [formData, setFormData] = useState<Omit<Funcionario, 'datacadastro' | 'codfunc' | 'codpessoa'>>({
    tipopessoa: 'F',
    nomerazao: '',
    nomefantasia: '',
    cpfcnpj: '',
    rg_inscricaoestadual: '',
    endereco: '',
    numero: '',
    complemento: '',
    bairro: '',
    cep: '',
    codcid: 0,
    telefone: '',
    email: '',
    cargo: '',
    departamento: '',
    data_admissao: '',
    salario: 0,
    status: 'Ativo'
  });
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Funcionario;
    direction: 'asc' | 'desc';
  }>({ key: 'nomerazao', direction: 'asc' });

  useEffect(() => {
    fetchFuncionarios();
  }, []);

  const fetchFuncionarios = async () => {
    try {
      const response = await fetch('/api/funcionarios');
      const data = await response.json();
      setFuncionarios(data);
    } catch (error) {
      console.error('Erro ao carregar funcionários:', error);
      toast.error('Erro ao carregar funcionários');
    }
  };

  const handleSort = (key: keyof Funcionario) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleOpenModal = (funcionario?: Funcionario) => {
    if (funcionario) {
      setSelectedFuncionario(funcionario);
      setSelectedCidade({
        codcid: funcionario.codcid,
        nomecidade: funcionario.nomecidade || '',
        nomeestado: funcionario.nomeestado || '',
        nomepais: funcionario.nomepais || ''
      });
      setFormData({
        tipopessoa: funcionario.tipopessoa,
        nomerazao: funcionario.nomerazao,
        nomefantasia: funcionario.nomefantasia,
        cpfcnpj: funcionario.cpfcnpj,
        rg_inscricaoestadual: funcionario.rg_inscricaoestadual,
        endereco: funcionario.endereco,
        numero: funcionario.numero,
        complemento: funcionario.complemento || '',
        bairro: funcionario.bairro,
        cep: funcionario.cep,
        codcid: funcionario.codcid,
        telefone: funcionario.telefone,
        email: funcionario.email,
        cargo: funcionario.cargo,
        departamento: funcionario.departamento,
        data_admissao: funcionario.data_admissao,
        salario: funcionario.salario,
        status: funcionario.status
      });
    } else {
      setSelectedFuncionario(null);
      setSelectedCidade(null);
      setFormData({
        tipopessoa: 'F',
        nomerazao: '',
        nomefantasia: '',
        cpfcnpj: '',
        rg_inscricaoestadual: '',
        endereco: '',
        numero: '',
        complemento: '',
        bairro: '',
        cep: '',
        codcid: 0,
        telefone: '',
        email: '',
        cargo: '',
        departamento: '',
        data_admissao: '',
        salario: 0,
        status: 'Ativo'
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedFuncionario(null);
  };

  const handleOpenDeleteModal = (funcionario: Funcionario) => {
    setSelectedFuncionario(funcionario);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedFuncionario(null);
  };

  const formatCPFCNPJ = (value: string) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '');
    
    if (formData.tipopessoa === 'F') {
      // CPF: 000.000.000-00
      return numbers
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
        .slice(0, 14);
    } else {
      // CNPJ: 00.000.000/0000-00
      return numbers
        .replace(/(\d{2})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1/$2')
        .replace(/(\d{4})(\d{1,2})$/, '$1-$2')
        .slice(0, 18);
    }
  };

  const validateCPFCNPJ = (cpfcnpj: string) => {
    const numbers = cpfcnpj.replace(/\D/g, '');
    
    // Se o funcionário não for do Brasil, CPF/CNPJ é opcional
    if (selectedCidade?.nomepais && selectedCidade.nomepais.toLowerCase() !== 'brasil') {
      return true;
    }
    
    if (formData.tipopessoa === 'F') {
      return numbers.length === 11;
    } else {
      return numbers.length === 14;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Se não selecionou cidade, mostra erro
    if (!selectedCidade) {
      toast.error('Por favor, selecione uma cidade');
      return;
    }

    // Validar CPF/CNPJ apenas para funcionários do Brasil ou se foi preenchido
    if (selectedCidade.nomepais?.toLowerCase() === 'brasil') {
      if (!validateCPFCNPJ(formData.cpfcnpj)) {
        toast.error(formData.tipopessoa === 'F' ? 'CPF inválido' : 'CNPJ inválido');
        return;
      }
    } else if (formData.cpfcnpj && !validateCPFCNPJ(formData.cpfcnpj)) {
      // Se não for do Brasil mas preencheu o CPF/CNPJ, valida o formato
      toast.error(formData.tipopessoa === 'F' ? 'CPF inválido' : 'CNPJ inválido');
      return;
    }

    try {
      // Remove formatação do CPF/CNPJ antes de enviar
      const dataToSend = {
        ...formData,
        cpfcnpj: formData.cpfcnpj.replace(/\D/g, ''),
      };

      let response;
      if (selectedFuncionario) {
        // Se estiver editando, inclui o codfunc e codpessoa
        response = await fetch('/api/funcionarios', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...dataToSend,
            codfunc: selectedFuncionario.codfunc,
            codpessoa: selectedFuncionario.codpessoa
          }),
        });
      } else {
        // Se estiver criando, não inclui o codfunc nem codpessoa
        response = await fetch('/api/funcionarios', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(dataToSend),
        });
      }

      const data = await response.json();

      if (response.ok) {
        fetchFuncionarios();
        handleCloseModal();
        toast.success(
          selectedFuncionario
            ? 'Funcionário atualizado com sucesso!'
            : 'Funcionário cadastrado com sucesso!'
        );
      } else {
        toast.error(data.error || 'Erro ao salvar funcionário');
      }
    } catch (error) {
      console.error('Erro ao salvar funcionário:', error);
      toast.error('Erro ao salvar funcionário');
    }
  };

  const handleDelete = async () => {
    if (!selectedFuncionario) return;

    try {
      const response = await fetch(
        `/api/funcionarios?codfunc=${selectedFuncionario.codfunc}&codpessoa=${selectedFuncionario.codpessoa}`,
        {
          method: 'DELETE',
        }
      );

      const data = await response.json();

      if (response.ok) {
        fetchFuncionarios();
        handleCloseDeleteModal();
        toast.success('Funcionário excluído com sucesso!');
      } else {
        toast.error(data.error || 'Erro ao excluir funcionário');
      }
    } catch (error) {
      console.error('Erro ao excluir funcionário:', error);
      toast.error('Erro ao excluir funcionário');
    }
  };

  const sortedFuncionarios = [...funcionarios].sort((a, b) => {
    if (sortConfig.key === 'nomerazao') {
      return sortConfig.direction === 'asc'
        ? a.nomerazao.localeCompare(b.nomerazao)
        : b.nomerazao.localeCompare(a.nomerazao);
    }
    return 0;
  });

  const columns = [
    { key: 'nomerazao', label: 'Nome' },
    { key: 'cpfcnpj', label: 'CPF/CNPJ' },
    { key: 'cargo', label: 'Cargo' },
    { key: 'departamento', label: 'Departamento' },
    { key: 'status', label: 'Status' },
    {
      key: 'actions',
      label: 'Ações',
      render: (funcionario: Funcionario) => (
        <div className="flex gap-2 justify-end">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenModal(funcionario);
            }}
          >
            <PencilIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenDeleteModal(funcionario);
            }}
          >
            <TrashIcon className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Funcionários</h1>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500"
          >
            <PlusIcon className="h-4 w-4" />
            Novo Funcionário
          </Button>
        </div>
      </div>

      <div className="mt-8">
        <DataTable
          data={sortedFuncionarios}
          columns={columns}
          onSort={handleSort}
          sortConfig={sortConfig}
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={selectedFuncionario ? 'Editar Funcionário' : 'Novo Funcionário'}
      >
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="tipopessoa">Tipo de Pessoa</Label>
                <select
                  id="tipopessoa"
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.tipopessoa}
                  onChange={(e) => setFormData({ ...formData, tipopessoa: e.target.value as 'F' | 'J' })}
                  required
                >
                  <option value="F">Física</option>
                  <option value="J">Jurídica</option>
                </select>
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'Ativo' | 'Inativo' | 'Afastado' | 'Demitido' })}
                  required
                >
                  <option value="Ativo">Ativo</option>
                  <option value="Inativo">Inativo</option>
                  <option value="Afastado">Afastado</option>
                  <option value="Demitido">Demitido</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nomerazao">Nome/Razão Social</Label>
                <Input
                  id="nomerazao"
                  value={formData.nomerazao}
                  onChange={(e) => setFormData({ ...formData, nomerazao: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="nomefantasia">Nome Fantasia/Apelido</Label>
                <Input
                  id="nomefantasia"
                  value={formData.nomefantasia}
                  onChange={(e) => setFormData({ ...formData, nomefantasia: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="cidade">Cidade</Label>
              <CidadeSelect
                value={selectedCidade}
                onChange={setSelectedCidade}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cpfcnpj">
                  {formData.tipopessoa === 'F' ? 'CPF' : 'CNPJ'}
                  {selectedCidade?.nomepais?.toLowerCase() !== 'brasil' && ' (Opcional)'}
                </Label>
                <Input
                  id="cpfcnpj"
                  value={formData.cpfcnpj}
                  onChange={(e) => setFormData({ ...formData, cpfcnpj: formatCPFCNPJ(e.target.value) })}
                  required={selectedCidade?.nomepais?.toLowerCase() === 'brasil'}
                />
              </div>

              <div>
                <Label htmlFor="rg_inscricaoestadual">
                  {formData.tipopessoa === 'F' ? 'RG' : 'Inscrição Estadual'}
                </Label>
                <Input
                  id="rg_inscricaoestadual"
                  value={formData.rg_inscricaoestadual}
                  onChange={(e) => setFormData({ ...formData, rg_inscricaoestadual: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="endereco">Endereço</Label>
                <Input
                  id="endereco"
                  value={formData.endereco}
                  onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="numero">Número</Label>
                <Input
                  id="numero"
                  value={formData.numero}
                  onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="complemento">Complemento</Label>
                <Input
                  id="complemento"
                  value={formData.complemento}
                  onChange={(e) => setFormData({ ...formData, complemento: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="bairro">Bairro</Label>
                <Input
                  id="bairro"
                  value={formData.bairro}
                  onChange={(e) => setFormData({ ...formData, bairro: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cep">CEP</Label>
                <Input
                  id="cep"
                  value={formData.cep}
                  onChange={(e) => setFormData({ ...formData, cep: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cargo">Cargo</Label>
                <Input
                  id="cargo"
                  value={formData.cargo}
                  onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="departamento">Departamento</Label>
                <Input
                  id="departamento"
                  value={formData.departamento}
                  onChange={(e) => setFormData({ ...formData, departamento: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="data_admissao">Data de Admissão</Label>
                <Input
                  id="data_admissao"
                  type="date"
                  value={formData.data_admissao}
                  onChange={(e) => setFormData({ ...formData, data_admissao: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="salario">Salário</Label>
                <Input
                  id="salario"
                  type="number"
                  value={formData.salario}
                  onChange={(e) => setFormData({ ...formData, salario: parseFloat(e.target.value) })}
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleCloseModal}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-violet-600 hover:bg-violet-500"
            >
              {selectedFuncionario ? 'Atualizar' : 'Cadastrar'}
            </Button>
          </div>
        </form>
      </Modal>

      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Funcionário</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Tem certeza que deseja excluir este funcionário?</p>
            <p className="font-semibold">{selectedFuncionario?.nomerazao}</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDeleteModal}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 