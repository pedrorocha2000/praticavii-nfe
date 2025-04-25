'use client';

import { NotaFiscalCompleta } from '@/types/nota-fiscal';
import { formatCurrency, formatDate } from '@/utils/format';
import { Button, Table } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

export default function NotaFiscalList() {
    const [notasFiscais, setNotasFiscais] = useState<NotaFiscalCompleta[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const fetchNotasFiscais = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/notas-fiscais');
            const data = await response.json();
            setNotasFiscais(data);
        } catch (error) {
            console.error('Erro ao buscar notas fiscais:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchNotasFiscais();
    }, [fetchNotasFiscais]);

    const columns: ColumnsType<NotaFiscalCompleta> = [
        {
            title: 'Número',
            key: 'numnfe',
            render: (_, record) => `${record.modelo}-${record.serie}-${record.numnfe}`,
            width: 120,
        },
        {
            title: 'Fornecedor',
            dataIndex: ['fornecedor', 'nomerazao'],
            key: 'fornecedor',
            width: 300,
        },
        {
            title: 'Data Emissão',
            key: 'dataEmissao',
            render: (_, record) => formatDate(record.dataEmissao),
            width: 120,
        },
        {
            title: 'Valor Total',
            dataIndex: 'valorTotal',
            key: 'valorTotal',
            render: (value) => formatCurrency(value),
            width: 120,
            align: 'right',
        },
        {
            title: 'Natureza Operação',
            dataIndex: 'naturezaOperacao',
            key: 'naturezaOperacao',
            width: 200,
        },
        {
            title: 'Ações',
            key: 'acoes',
            width: 120,
            render: (_, record) => (
                <Button
                    type="link"
                    onClick={() => router.push(`/notas-fiscais/${record.modelo}/${record.serie}/${record.numnfe}`)}
                >
                    Visualizar
                </Button>
            ),
        },
    ];

    return (
        <Table
            columns={columns}
            dataSource={notasFiscais}
            loading={loading}
            rowKey={(record) => `${record.modelo}-${record.serie}-${record.numnfe}`}
            pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Total: ${total} notas fiscais`,
            }}
            scroll={{ x: 1000 }}
        />
    );
} 