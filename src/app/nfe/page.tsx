'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PlusIcon, ArrowDownIcon, ArrowUpIcon } from '@heroicons/react/24/outline';

export default function NFePage() {
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Notas Fiscais</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card NFe Entrada */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center mb-4">
            <ArrowDownIcon className="h-8 w-8 text-blue-500 mr-3" />
            <h2 className="text-xl font-semibold">Nota Fiscal de Entrada</h2>
          </div>
          <p className="text-gray-600 mb-4">
            Registre notas fiscais de compras de fornecedores, atualizando automaticamente
            o estoque e gerando contas a pagar.
          </p>
          <div className="flex space-x-3">
            <Link 
              href="/nfe/entrada/nova" 
              className="flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Nova NFe Entrada
            </Link>
            <Link 
              href="/nfe/entrada" 
              className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
            >
              Ver Todas
            </Link>
          </div>
        </div>

        {/* Card NFe Saída */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center mb-4">
            <ArrowUpIcon className="h-8 w-8 text-green-500 mr-3" />
            <h2 className="text-xl font-semibold">Nota Fiscal de Saída</h2>
          </div>
          <p className="text-gray-600 mb-4">
            Emita notas fiscais de vendas para clientes, controlando o estoque
            e gerando contas a receber automaticamente.
          </p>
          <div className="flex space-x-3">
            <Link 
              href="/nfe/saida/nova" 
              className="flex items-center px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Nova NFe Saída
            </Link>
            <Link 
              href="/nfe/saida" 
              className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
            >
              Ver Todas
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 