import { useState, useEffect } from 'react';
import { Fornecedor, CreateFornecedorDTO, UpdateFornecedorDTO } from '@/types/fornecedor';

interface FornecedorFormProps {
  fornecedor?: Fornecedor;
  onSubmit: (data: CreateFornecedorDTO | UpdateFornecedorDTO) => Promise<void>;
  onCancel: () => void;
}

export default function FornecedorForm({ fornecedor, onSubmit, onCancel }: FornecedorFormProps) {
  const [formData, setFormData] = useState<CreateFornecedorDTO>({
    CodForn: 0,
    NomeRazao: '',
    CNPJ: '',
    InscricaoEstadual: '',
    Endereco: '',
    Numero: '',
    Complemento: '',
    Bairro: '',
    CEP: '',
    CodCid: 0,
    Telefone: '',
    Email: ''
  });

  useEffect(() => {
    if (fornecedor) {
      setFormData(fornecedor);
    }
  }, [fornecedor]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="NomeRazao" className="block text-sm font-medium text-gray-700">
            Nome/Razão Social
          </label>
          <input
            type="text"
            id="NomeRazao"
            name="NomeRazao"
            value={formData.NomeRazao}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="CNPJ" className="block text-sm font-medium text-gray-700">
            CNPJ
          </label>
          <input
            type="text"
            id="CNPJ"
            name="CNPJ"
            value={formData.CNPJ}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="InscricaoEstadual" className="block text-sm font-medium text-gray-700">
            Inscrição Estadual
          </label>
          <input
            type="text"
            id="InscricaoEstadual"
            name="InscricaoEstadual"
            value={formData.InscricaoEstadual}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="Endereco" className="block text-sm font-medium text-gray-700">
            Endereço
          </label>
          <input
            type="text"
            id="Endereco"
            name="Endereco"
            value={formData.Endereco}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="Numero" className="block text-sm font-medium text-gray-700">
            Número
          </label>
          <input
            type="text"
            id="Numero"
            name="Numero"
            value={formData.Numero}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="Complemento" className="block text-sm font-medium text-gray-700">
            Complemento
          </label>
          <input
            type="text"
            id="Complemento"
            name="Complemento"
            value={formData.Complemento}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="Bairro" className="block text-sm font-medium text-gray-700">
            Bairro
          </label>
          <input
            type="text"
            id="Bairro"
            name="Bairro"
            value={formData.Bairro}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="CEP" className="block text-sm font-medium text-gray-700">
            CEP
          </label>
          <input
            type="text"
            id="CEP"
            name="CEP"
            value={formData.CEP}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="CodCid" className="block text-sm font-medium text-gray-700">
            Código da Cidade
          </label>
          <input
            type="number"
            id="CodCid"
            name="CodCid"
            value={formData.CodCid}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="Telefone" className="block text-sm font-medium text-gray-700">
            Telefone
          </label>
          <input
            type="tel"
            id="Telefone"
            name="Telefone"
            value={formData.Telefone}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="Email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            id="Email"
            name="Email"
            value={formData.Email}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-4 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-500 hover:bg-blue-600"
        >
          {fornecedor ? 'Atualizar' : 'Cadastrar'}
        </button>
      </div>
    </form>
  );
} 