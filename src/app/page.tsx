'use client';

import { useEffect, useState } from 'react';
import { DocumentTextIcon, UserGroupIcon, CubeIcon, TruckIcon, BanknotesIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/react/24/outline';

interface DashboardStats {
    notasCount: number;
    clientesCount: number;
    produtosCount: number;
    transportadorasCount: number;
    contasReceber: number;
    contasPagar: number;
}

interface NotaRecente {
    modelo: number;
    serie: number;
    numnfe: number;
    tipo: string;
    valortotal: string;
    dataemissao: string;
    nomecliente?: string;
    nomefornecedor?: string;
}

export default function Dashboard() {
    const [stats, setStats] = useState<DashboardStats>({
        notasCount: 0,
        clientesCount: 0,
        produtosCount: 0,
        transportadorasCount: 0,
        contasReceber: 0,
        contasPagar: 0
    });
    const [notasRecentes, setNotasRecentes] = useState<NotaRecente[]>([]);

    useEffect(() => {
        // Buscar estatísticas
        Promise.all([
            fetch('/api/nfe_saida').then(res => res.json()),
            fetch('/api/clientes').then(res => res.json()),
            fetch('/api/produtos').then(res => res.json()),
            fetch('/api/transportadoras').then(res => res.json()),
            fetch('/api/contas').then(res => res.json())
        ]).then(([notas, clientes, produtos, transportadoras, contas]) => {
            // Calcular totais de contas
            const contasReceber = contas
                .filter((conta: any) => conta.tipo === 'R' && !conta.datapagamento)
                .reduce((acc: number, conta: any) => acc + parseFloat(conta.valorparcela), 0);
            
            const contasPagar = contas
                .filter((conta: any) => conta.tipo === 'P' && !conta.datapagamento)
                .reduce((acc: number, conta: any) => acc + parseFloat(conta.valorparcela), 0);

            setStats({
                notasCount: notas.length,
                clientesCount: clientes.length,
                produtosCount: produtos.length,
                transportadorasCount: transportadoras.length,
                contasReceber,
                contasPagar
            });
        });

        // Buscar notas recentes
        Promise.all([
            fetch('/api/nfe_saida').then(res => res.json()),
            fetch('/api/nfe_entrada').then(res => res.json())
        ]).then(([notasSaida, notasEntrada]) => {
            const todasNotas = [
                ...notasSaida.map((nota: any) => ({ ...nota, tipo: 'Saída' })),
                ...notasEntrada.map((nota: any) => ({ ...nota, tipo: 'Entrada' }))
            ]
            .sort((a: any, b: any) => new Date(b.dataemissao).getTime() - new Date(a.dataemissao).getTime())
            .slice(0, 5);

            setNotasRecentes(todasNotas);
        });
    }, []);

    const statsCards = [
        {
            name: 'Notas Emitidas',
            value: stats.notasCount.toString(),
        icon: DocumentTextIcon,
    },
    {
            name: 'Clientes',
            value: stats.clientesCount.toString(),
        icon: UserGroupIcon,
    },
        {
            name: 'Produtos',
            value: stats.produtosCount.toString(),
            icon: CubeIcon,
        },
    {
        name: 'Transportadoras',
            value: stats.transportadorasCount.toString(),
        icon: TruckIcon,
    },
    ];

    const financeCards = [
        {
            name: 'A Receber',
            value: `R$ ${stats.contasReceber.toFixed(2)}`,
            icon: ArrowTrendingUpIcon,
            color: 'text-green-600',
            bgColor: 'bg-green-50',
            borderColor: 'hover:border-green-200'
        },
        {
            name: 'A Pagar',
            value: `R$ ${stats.contasPagar.toFixed(2)}`,
            icon: ArrowTrendingDownIcon,
            color: 'text-red-600',
            bgColor: 'bg-red-50',
            borderColor: 'hover:border-red-200'
        },
        {
            name: 'Saldo',
            value: `R$ ${(stats.contasReceber - stats.contasPagar).toFixed(2)}`,
            icon: BanknotesIcon,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
            borderColor: 'hover:border-blue-200'
        },
    ];

    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <div>
                <h1 className="text-2xl font-semibold text-gray-900">Bem-vindo ao Sistema NFe!</h1>
                <p className="mt-1 text-sm text-gray-500">
                    Aqui está o que está acontecendo com seu sistema hoje.
                    </p>
                </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {statsCards.map((stat) => (
                    <div
                        key={stat.name}
                        className="bg-white p-6 rounded-xl border border-gray-200 hover:border-violet-200 transition-colors"
                    >
                        <div className="flex items-center justify-between">
                            <stat.icon className="h-8 w-8 text-violet-600" />
                        </div>
                        <h3 className="mt-4 text-2xl font-semibold text-gray-900">{stat.value}</h3>
                        <p className="mt-1 text-sm text-gray-500">{stat.name}</p>
                    </div>
                ))}
            </div>

            {/* Finance Grid */}
            <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Financeiro</h2>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {financeCards.map((card) => (
                        <div
                            key={card.name}
                            className={`${card.bgColor} p-6 rounded-xl border border-gray-200 ${card.borderColor} transition-colors`}
                        >
                            <div className="flex items-center justify-between">
                                <card.icon className={`h-8 w-8 ${card.color}`} />
                            </div>
                            <h3 className="mt-4 text-2xl font-semibold text-gray-900">{card.value}</h3>
                            <p className="mt-1 text-sm text-gray-500">{card.name}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Recent Notes */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Notas Fiscais Recentes</h2>
                </div>
                <div className="divide-y divide-gray-200">
                    {notasRecentes.map((nota) => (
                        <div key={`${nota.modelo}-${nota.serie}-${nota.numnfe}`} 
                             className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                            <div className="flex items-center space-x-4">
                                <div className="flex-shrink-0">
                                    <DocumentTextIcon className="h-6 w-6 text-violet-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">
                                        NFe #{nota.numnfe} - {nota.tipo}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {nota.tipo === 'Saída' ? nota.nomecliente : nota.nomefornecedor}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-medium text-gray-900">
                                    R$ {parseFloat(nota.valortotal).toFixed(2)}
                                </p>
                                <p className="text-sm text-gray-500">
                                    {new Date(nota.dataemissao).toLocaleDateString('pt-BR')}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
