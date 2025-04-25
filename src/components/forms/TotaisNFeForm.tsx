'use client';

interface TotaisNFe {
  base_calculo_icms: number;
  valor_icms: number;
  base_calculo_icms_st: number;
  valor_icms_st: number;
  valor_produtos: number;
  valor_frete: number;
  valor_seguro: number;
  valor_desconto: number;
  valor_total: number;
}

interface TotaisNFeFormProps {
  totais: TotaisNFe;
  onFreteChange?: (valor: number) => void;
  onSeguroChange?: (valor: number) => void;
  onDescontoChange?: (valor: number) => void;
}

export default function TotaisNFeForm({ 
  totais,
  onFreteChange,
  onSeguroChange,
  onDescontoChange
}: TotaisNFeFormProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Base de Cálculo do ICMS
        </label>
        <input
          type="text"
          value={totais.base_calculo_icms.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
          })}
          className="w-full rounded border p-2 bg-gray-100"
          disabled
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Valor do ICMS
        </label>
        <input
          type="text"
          value={totais.valor_icms.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
          })}
          className="w-full rounded border p-2 bg-gray-100"
          disabled
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Base de Cálculo do ICMS ST
        </label>
        <input
          type="text"
          value={totais.base_calculo_icms_st.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
          })}
          className="w-full rounded border p-2 bg-gray-100"
          disabled
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Valor do ICMS ST
        </label>
        <input
          type="text"
          value={totais.valor_icms_st.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
          })}
          className="w-full rounded border p-2 bg-gray-100"
          disabled
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Valor dos Produtos
        </label>
        <input
          type="text"
          value={totais.valor_produtos.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
          })}
          className="w-full rounded border p-2 bg-gray-100"
          disabled
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Valor do Frete
        </label>
        <input
          type="number"
          value={totais.valor_frete}
          onChange={(e) => onFreteChange?.(parseFloat(e.target.value) || 0)}
          className="w-full rounded border p-2"
          min="0"
          step="0.01"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Valor do Seguro
        </label>
        <input
          type="number"
          value={totais.valor_seguro}
          onChange={(e) => onSeguroChange?.(parseFloat(e.target.value) || 0)}
          className="w-full rounded border p-2"
          min="0"
          step="0.01"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Valor do Desconto
        </label>
        <input
          type="number"
          value={totais.valor_desconto}
          onChange={(e) => onDescontoChange?.(parseFloat(e.target.value) || 0)}
          className="w-full rounded border p-2"
          min="0"
          step="0.01"
        />
      </div>

      <div className="col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Valor Total da NFe
        </label>
        <input
          type="text"
          value={totais.valor_total.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
          })}
          className="w-full rounded border p-2 bg-gray-100 text-lg font-bold"
          disabled
        />
      </div>
    </div>
  );
} 