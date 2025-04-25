'use client';

import { NotaFiscalCompleta } from '@/types/nota-fiscal';
import { formatCEP, formatCNPJ, formatCurrency, formatDateTime, formatIE, formatNumber } from '@/utils/format';
import { Button, Card, Col, Descriptions, Row, Table } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

interface NotaFiscalViewProps {
    modelo: string;
    serie: string;
    numnfe: string;
}

export default function NotaFiscalView({ modelo, serie, numnfe }: NotaFiscalViewProps) {
    const [notaFiscal, setNotaFiscal] = useState<NotaFiscalCompleta>();
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const fetchNotaFiscal = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/notas-fiscais?modelo=${modelo}&serie=${serie}&numnfe=${numnfe}`);
            const [data] = await response.json();
            setNotaFiscal(data);
        } catch (error) {
            console.error('Erro ao buscar nota fiscal:', error);
        } finally {
            setLoading(false);
        }
    }, [modelo, serie, numnfe]);

    useEffect(() => {
        fetchNotaFiscal();
    }, [fetchNotaFiscal]);

    const handleDelete = async () => {
        if (!window.confirm('Tem certeza que deseja excluir esta nota fiscal?')) {
            return;
        }

        try {
            const response = await fetch(
                `/api/notas-fiscais?modelo=${modelo}&serie=${serie}&numnfe=${numnfe}`,
                { method: 'DELETE' }
            );

            if (response.ok) {
                router.push('/notas-fiscais');
            } else {
                const error = await response.json();
                alert(error.message || 'Erro ao excluir nota fiscal');
            }
        } catch (error) {
            console.error('Erro ao excluir nota fiscal:', error);
            alert('Erro ao excluir nota fiscal');
        }
    };

    const produtosColumns: ColumnsType<NotaFiscalCompleta['produtos'][0]> = [
        {
            title: 'Código',
            dataIndex: 'codProd',
            key: 'codProd',
            width: 80,
        },
        {
            title: 'Nome',
            dataIndex: 'nome',
            key: 'nome',
            width: 300,
        },
        {
            title: 'NCM',
            dataIndex: 'ncm',
            key: 'ncm',
            width: 100,
        },
        {
            title: 'CFOP',
            dataIndex: 'cfop',
            key: 'cfop',
            width: 80,
        },
        {
            title: 'Un.',
            dataIndex: 'unidade',
            key: 'unidade',
            width: 60,
        },
        {
            title: 'Qtde.',
            dataIndex: 'quantidade',
            key: 'quantidade',
            width: 100,
            align: 'right',
            render: (value) => formatNumber(value),
        },
        {
            title: 'Valor Unit.',
            dataIndex: 'valorUnitario',
            key: 'valorUnitario',
            width: 120,
            align: 'right',
            render: (value) => formatCurrency(value),
        },
        {
            title: 'Valor Total',
            dataIndex: 'valorTotal',
            key: 'valorTotal',
            width: 120,
            align: 'right',
            render: (value) => formatCurrency(value),
        },
    ];

    if (loading || !notaFiscal) {
        return <Card loading={loading} />;
    }

    return (
        <div>
            <Card
                title={`Nota Fiscal ${modelo}-${serie}-${numnfe}`}
                extra={
                    <Button type="primary" danger onClick={handleDelete}>
                        Excluir
                    </Button>
                }
            >
                <Row gutter={[16, 16]}>
                    <Col span={24}>
                        <Descriptions title="Dados Gerais" bordered column={2}>
                            <Descriptions.Item label="Natureza da Operação">
                                {notaFiscal.naturezaOperacao}
                            </Descriptions.Item>
                            <Descriptions.Item label="Data/Hora Emissão">
                                {formatDateTime(notaFiscal.dataEmissao, notaFiscal.horaEmissao)}
                            </Descriptions.Item>
                            {notaFiscal.dataSaida && notaFiscal.horaSaida && (
                                <Descriptions.Item label="Data/Hora Saída">
                                    {formatDateTime(notaFiscal.dataSaida, notaFiscal.horaSaida)}
                                </Descriptions.Item>
                            )}
                            <Descriptions.Item label="Valor Total">
                                {formatCurrency(notaFiscal.valorTotal)}
                            </Descriptions.Item>
                            <Descriptions.Item label="Chave de Acesso" span={2}>
                                {notaFiscal.chaveAcesso}
                            </Descriptions.Item>
                            {notaFiscal.protocoloAutorizacao && (
                                <Descriptions.Item label="Protocolo de Autorização" span={2}>
                                    {notaFiscal.protocoloAutorizacao}
                                </Descriptions.Item>
                            )}
                        </Descriptions>
                    </Col>

                    <Col span={24}>
                        <Descriptions title="Fornecedor" bordered column={2}>
                            <Descriptions.Item label="Nome/Razão Social">
                                {notaFiscal.fornecedor.nomerazao}
                            </Descriptions.Item>
                            <Descriptions.Item label="CNPJ">
                                {formatCNPJ(notaFiscal.fornecedor.cnpj)}
                            </Descriptions.Item>
                            <Descriptions.Item label="Inscrição Estadual">
                                {formatIE(notaFiscal.fornecedor.inscricaoestadual)}
                            </Descriptions.Item>
                            <Descriptions.Item label="Endereço" span={2}>
                                {`${notaFiscal.fornecedor.endereco}, ${notaFiscal.fornecedor.numero}${
                                    notaFiscal.fornecedor.complemento
                                        ? ` - ${notaFiscal.fornecedor.complemento}`
                                        : ''
                                } - ${notaFiscal.fornecedor.bairro} - ${formatCEP(
                                    notaFiscal.fornecedor.cep
                                )} - ${notaFiscal.fornecedor.cidade}/${notaFiscal.fornecedor.estado}`}
                            </Descriptions.Item>
                        </Descriptions>
                    </Col>

                    {notaFiscal.transportadora && (
                        <Col span={24}>
                            <Descriptions title="Transportadora" bordered column={2}>
                                <Descriptions.Item label="Nome/Razão Social">
                                    {notaFiscal.transportadora.nomerazao}
                                </Descriptions.Item>
                                <Descriptions.Item label="CNPJ">
                                    {formatCNPJ(notaFiscal.transportadora.cnpj)}
                                </Descriptions.Item>
                                <Descriptions.Item label="Inscrição Estadual">
                                    {formatIE(notaFiscal.transportadora.inscricaoestadual)}
                                </Descriptions.Item>
                                <Descriptions.Item label="Endereço" span={2}>
                                    {`${notaFiscal.transportadora.endereco}, ${
                                        notaFiscal.transportadora.numero
                                    }${
                                        notaFiscal.transportadora.complemento
                                            ? ` - ${notaFiscal.transportadora.complemento}`
                                            : ''
                                    } - ${notaFiscal.transportadora.bairro} - ${formatCEP(
                                        notaFiscal.transportadora.cep
                                    )} - ${notaFiscal.transportadora.cidade}/${
                                        notaFiscal.transportadora.estado
                                    }`}
                                </Descriptions.Item>
                                {notaFiscal.placa && (
                                    <Descriptions.Item label="Placa do Veículo">
                                        {notaFiscal.placa}
                                    </Descriptions.Item>
                                )}
                            </Descriptions>
                        </Col>
                    )}

                    <Col span={24}>
                        <Card title="Produtos">
                            <Table
                                columns={produtosColumns}
                                dataSource={notaFiscal.produtos}
                                rowKey="codProd"
                                pagination={false}
                                scroll={{ x: 1000 }}
                                summary={(data) => {
                                    const total = data.reduce(
                                        (acc, curr) => acc + curr.valorTotal,
                                        0
                                    );

                                    return (
                                        <Table.Summary.Row>
                                            <Table.Summary.Cell
                                                index={0}
                                                colSpan={7}
                                                align="right"
                                            >
                                                <strong>Total:</strong>
                                            </Table.Summary.Cell>
                                            <Table.Summary.Cell index={1} align="right">
                                                <strong>{formatCurrency(total)}</strong>
                                            </Table.Summary.Cell>
                                        </Table.Summary.Row>
                                    );
                                }}
                            />
                        </Card>
                    </Col>

                    <Col span={24}>
                        <Descriptions title="Condição de Pagamento" bordered>
                            <Descriptions.Item label="Descrição">
                                {notaFiscal.condicaoPagamento.descricao}
                            </Descriptions.Item>
                        </Descriptions>
                        <Table
                            columns={[
                                {
                                    title: 'Parcela',
                                    dataIndex: 'numParcela',
                                    key: 'numParcela',
                                    width: 100,
                                },
                                {
                                    title: 'Forma de Pagamento',
                                    dataIndex: 'descricaoForma',
                                    key: 'descricaoForma',
                                    width: 200,
                                },
                            ]}
                            dataSource={notaFiscal.condicaoPagamento.parcelas}
                            rowKey="numParcela"
                            pagination={false}
                            style={{ marginTop: 16 }}
                        />
                    </Col>
                </Row>
            </Card>
        </div>
    );
} 