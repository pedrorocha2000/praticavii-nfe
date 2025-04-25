'use client';

import { NotaFiscal } from '@/types/nota-fiscal';
import { Button, Card, Col, DatePicker, Form, Input, InputNumber, Row, Select, Space, Table } from 'antd';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

interface Fornecedor {
    codForn: number;
    nomerazao: string;
    cnpj: string;
}

interface Transportadora {
    codTrans: number;
    nomerazao: string;
    cnpj: string;
}

interface CondicaoPagamento {
    codCondPgto: number;
    descricao: string;
}

interface Produto {
    codProd: number;
    nome: string;
    unidade: string;
}

export default function NotaFiscalForm() {
    const [form] = Form.useForm();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
    const [transportadoras, setTransportadoras] = useState<Transportadora[]>([]);
    const [condicoesPagamento, setCondicoesPagamento] = useState<CondicaoPagamento[]>([]);
    const [produtos, setProdutos] = useState<Produto[]>([]);
    const [produtosNota, setProdutosNota] = useState<any[]>([]);

    const fetchFornecedores = useCallback(async () => {
        try {
            const response = await fetch('/api/fornecedores');
            const data = await response.json();
            setFornecedores(data);
        } catch (error) {
            console.error('Erro ao buscar fornecedores:', error);
        }
    }, []);

    const fetchTransportadoras = useCallback(async () => {
        try {
            const response = await fetch('/api/transportadoras');
            const data = await response.json();
            setTransportadoras(data);
        } catch (error) {
            console.error('Erro ao buscar transportadoras:', error);
        }
    }, []);

    const fetchCondicoesPagamento = useCallback(async () => {
        try {
            const response = await fetch('/api/cond_pgto');
            const data = await response.json();
            setCondicoesPagamento(data);
        } catch (error) {
            console.error('Erro ao buscar condições de pagamento:', error);
        }
    }, []);

    const fetchProdutos = useCallback(async () => {
        try {
            const response = await fetch('/api/produtos');
            const data = await response.json();
            setProdutos(data);
        } catch (error) {
            console.error('Erro ao buscar produtos:', error);
        }
    }, []);

    useEffect(() => {
        fetchFornecedores();
        fetchTransportadoras();
        fetchCondicoesPagamento();
        fetchProdutos();
    }, [fetchFornecedores, fetchTransportadoras, fetchCondicoesPagamento, fetchProdutos]);

    const handleSubmit = async (values: any) => {
        try {
            setLoading(true);

            const notaFiscal: NotaFiscal = {
                ...values,
                dataEmissao: values.dataEmissao.format('YYYY-MM-DD'),
                horaEmissao: values.horaEmissao.format('HH:mm'),
                dataSaida: values.dataSaida?.format('YYYY-MM-DD'),
                horaSaida: values.horaSaida?.format('HH:mm'),
                produtos: produtosNota,
                parcelas: [], // Será preenchido automaticamente pelo backend
            };

            const response = await fetch('/api/notas-fiscais', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(notaFiscal),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Erro ao criar nota fiscal');
            }

            router.push('/notas-fiscais');
        } catch (error) {
            console.error('Erro ao criar nota fiscal:', error);
            alert(error instanceof Error ? error.message : 'Erro ao criar nota fiscal');
        } finally {
            setLoading(false);
        }
    };

    const handleAddProduto = () => {
        const values = form.getFieldValue('produto');
        if (!values) return;

        const { codProd, quantidade, valorUnitario } = values;
        const produto = produtos.find((p) => p.codProd === codProd);
        if (!produto) return;

        const valorTotal = quantidade * valorUnitario;

        const novoProduto = {
            codProd,
            nome: produto.nome,
            unidade: produto.unidade,
            quantidade,
            valorUnitario,
            valorTotal,
            ncm: values.ncm,
            cfop: values.cfop,
            pesoBruto: values.pesoBruto,
            pesoLiquido: values.pesoLiquido,
            baseICMS: values.baseICMS,
            aliqICMS: values.aliqICMS,
            valorICMS: (values.baseICMS * values.aliqICMS) / 100,
            baseIPI: values.baseIPI,
            aliqIPI: values.aliqIPI,
            valorIPI: (values.baseIPI * values.aliqIPI) / 100,
            basePIS: values.basePIS,
            aliqPIS: values.aliqPIS,
            valorPIS: (values.basePIS * values.aliqPIS) / 100,
            baseCOFINS: values.baseCOFINS,
            aliqCOFINS: values.aliqCOFINS,
            valorCOFINS: (values.baseCOFINS * values.aliqCOFINS) / 100,
        };

        setProdutosNota([...produtosNota, novoProduto]);
        form.setFieldValue('produto', undefined);
    };

    const handleRemoveProduto = (codProd: number) => {
        setProdutosNota(produtosNota.filter((p) => p.codProd !== codProd));
    };

    const produtosColumns = [
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
            align: 'right' as const,
        },
        {
            title: 'Valor Unit.',
            dataIndex: 'valorUnitario',
            key: 'valorUnitario',
            width: 120,
            align: 'right' as const,
        },
        {
            title: 'Valor Total',
            dataIndex: 'valorTotal',
            key: 'valorTotal',
            width: 120,
            align: 'right' as const,
        },
        {
            title: 'Ações',
            key: 'acoes',
            width: 100,
            render: (_: any, record: any) => (
                <Button type="link" danger onClick={() => handleRemoveProduto(record.codProd)}>
                    Remover
                </Button>
            ),
        },
    ];

    return (
        <Card title="Nova Nota Fiscal">
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={{
                    modelo: '55',
                    serie: '1',
                }}
            >
                <Row gutter={[16, 16]}>
                    <Col span={4}>
                        <Form.Item
                            name="modelo"
                            label="Modelo"
                            rules={[{ required: true, message: 'Campo obrigatório' }]}
                        >
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={4}>
                        <Form.Item
                            name="serie"
                            label="Série"
                            rules={[{ required: true, message: 'Campo obrigatório' }]}
                        >
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={4}>
                        <Form.Item
                            name="numnfe"
                            label="Número"
                            rules={[{ required: true, message: 'Campo obrigatório' }]}
                        >
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="naturezaOperacao"
                            label="Natureza da Operação"
                            rules={[{ required: true, message: 'Campo obrigatório' }]}
                        >
                            <Input />
                        </Form.Item>
                    </Col>

                    <Col span={8}>
                        <Form.Item
                            name="codForn"
                            label="Fornecedor"
                            rules={[{ required: true, message: 'Campo obrigatório' }]}
                        >
                            <Select
                                showSearch
                                placeholder="Selecione um fornecedor"
                                optionFilterProp="children"
                                filterOption={(input, option) =>
                                    option?.label.toLowerCase().includes(input.toLowerCase())
                                }
                                options={fornecedores.map((f) => ({
                                    value: f.codForn,
                                    label: `${f.nomerazao} (${f.cnpj})`,
                                }))}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="codTrans" label="Transportadora">
                            <Select
                                showSearch
                                placeholder="Selecione uma transportadora"
                                optionFilterProp="children"
                                allowClear
                                filterOption={(input, option) =>
                                    option?.label.toLowerCase().includes(input.toLowerCase())
                                }
                                options={transportadoras.map((t) => ({
                                    value: t.codTrans,
                                    label: `${t.nomerazao} (${t.cnpj})`,
                                }))}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            name="codCondPgto"
                            label="Condição de Pagamento"
                            rules={[{ required: true, message: 'Campo obrigatório' }]}
                        >
                            <Select
                                showSearch
                                placeholder="Selecione uma condição de pagamento"
                                optionFilterProp="children"
                                filterOption={(input, option) =>
                                    option?.label.toLowerCase().includes(input.toLowerCase())
                                }
                                options={condicoesPagamento.map((c) => ({
                                    value: c.codCondPgto,
                                    label: c.descricao,
                                }))}
                            />
                        </Form.Item>
                    </Col>

                    <Col span={6}>
                        <Form.Item
                            name="dataEmissao"
                            label="Data Emissão"
                            rules={[{ required: true, message: 'Campo obrigatório' }]}
                        >
                            <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item
                            name="horaEmissao"
                            label="Hora Emissão"
                            rules={[{ required: true, message: 'Campo obrigatório' }]}
                        >
                            <DatePicker.TimePicker format="HH:mm" style={{ width: '100%' }} />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item name="dataSaida" label="Data Saída">
                            <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item name="horaSaida" label="Hora Saída">
                            <DatePicker.TimePicker format="HH:mm" style={{ width: '100%' }} />
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <Form.Item
                            name="chaveAcesso"
                            label="Chave de Acesso"
                            rules={[{ required: true, message: 'Campo obrigatório' }]}
                        >
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="protocoloAutorizacao" label="Protocolo de Autorização">
                            <Input />
                        </Form.Item>
                    </Col>

                    <Col span={24}>
                        <Card title="Adicionar Produto" size="small">
                            <Form.Item shouldUpdate noStyle>
                                {() => (
                                    <Row gutter={[16, 16]}>
                                        <Col span={8}>
                                            <Form.Item
                                                name={['produto', 'codProd']}
                                                label="Produto"
                                                rules={[
                                                    {
                                                        required: true,
                                                        message: 'Campo obrigatório',
                                                    },
                                                ]}
                                            >
                                                <Select
                                                    showSearch
                                                    placeholder="Selecione um produto"
                                                    optionFilterProp="children"
                                                    filterOption={(input, option) =>
                                                        option?.label
                                                            .toLowerCase()
                                                            .includes(input.toLowerCase())
                                                    }
                                                    options={produtos.map((p) => ({
                                                        value: p.codProd,
                                                        label: `${p.nome} (${p.unidade})`,
                                                    }))}
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col span={4}>
                                            <Form.Item
                                                name={['produto', 'quantidade']}
                                                label="Quantidade"
                                                rules={[
                                                    {
                                                        required: true,
                                                        message: 'Campo obrigatório',
                                                    },
                                                ]}
                                            >
                                                <InputNumber
                                                    style={{ width: '100%' }}
                                                    min={0}
                                                    precision={4}
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col span={4}>
                                            <Form.Item
                                                name={['produto', 'valorUnitario']}
                                                label="Valor Unitário"
                                                rules={[
                                                    {
                                                        required: true,
                                                        message: 'Campo obrigatório',
                                                    },
                                                ]}
                                            >
                                                <InputNumber
                                                    style={{ width: '100%' }}
                                                    min={0}
                                                    precision={2}
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col span={4}>
                                            <Form.Item
                                                name={['produto', 'ncm']}
                                                label="NCM"
                                                rules={[
                                                    {
                                                        required: true,
                                                        message: 'Campo obrigatório',
                                                    },
                                                ]}
                                            >
                                                <Input />
                                            </Form.Item>
                                        </Col>
                                        <Col span={4}>
                                            <Form.Item
                                                name={['produto', 'cfop']}
                                                label="CFOP"
                                                rules={[
                                                    {
                                                        required: true,
                                                        message: 'Campo obrigatório',
                                                    },
                                                ]}
                                            >
                                                <Input />
                                            </Form.Item>
                                        </Col>

                                        <Col span={6}>
                                            <Form.Item
                                                name={['produto', 'pesoBruto']}
                                                label="Peso Bruto"
                                                rules={[
                                                    {
                                                        required: true,
                                                        message: 'Campo obrigatório',
                                                    },
                                                ]}
                                            >
                                                <InputNumber
                                                    style={{ width: '100%' }}
                                                    min={0}
                                                    precision={4}
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col span={6}>
                                            <Form.Item
                                                name={['produto', 'pesoLiquido']}
                                                label="Peso Líquido"
                                                rules={[
                                                    {
                                                        required: true,
                                                        message: 'Campo obrigatório',
                                                    },
                                                ]}
                                            >
                                                <InputNumber
                                                    style={{ width: '100%' }}
                                                    min={0}
                                                    precision={4}
                                                />
                                            </Form.Item>
                                        </Col>

                                        <Col span={6}>
                                            <Form.Item
                                                name={['produto', 'baseICMS']}
                                                label="Base ICMS"
                                                rules={[
                                                    {
                                                        required: true,
                                                        message: 'Campo obrigatório',
                                                    },
                                                ]}
                                            >
                                                <InputNumber
                                                    style={{ width: '100%' }}
                                                    min={0}
                                                    precision={2}
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col span={6}>
                                            <Form.Item
                                                name={['produto', 'aliqICMS']}
                                                label="Alíquota ICMS"
                                                rules={[
                                                    {
                                                        required: true,
                                                        message: 'Campo obrigatório',
                                                    },
                                                ]}
                                            >
                                                <InputNumber
                                                    style={{ width: '100%' }}
                                                    min={0}
                                                    max={100}
                                                    precision={2}
                                                />
                                            </Form.Item>
                                        </Col>

                                        <Col span={6}>
                                            <Form.Item
                                                name={['produto', 'baseIPI']}
                                                label="Base IPI"
                                                rules={[
                                                    {
                                                        required: true,
                                                        message: 'Campo obrigatório',
                                                    },
                                                ]}
                                            >
                                                <InputNumber
                                                    style={{ width: '100%' }}
                                                    min={0}
                                                    precision={2}
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col span={6}>
                                            <Form.Item
                                                name={['produto', 'aliqIPI']}
                                                label="Alíquota IPI"
                                                rules={[
                                                    {
                                                        required: true,
                                                        message: 'Campo obrigatório',
                                                    },
                                                ]}
                                            >
                                                <InputNumber
                                                    style={{ width: '100%' }}
                                                    min={0}
                                                    max={100}
                                                    precision={2}
                                                />
                                            </Form.Item>
                                        </Col>

                                        <Col span={6}>
                                            <Form.Item
                                                name={['produto', 'basePIS']}
                                                label="Base PIS"
                                                rules={[
                                                    {
                                                        required: true,
                                                        message: 'Campo obrigatório',
                                                    },
                                                ]}
                                            >
                                                <InputNumber
                                                    style={{ width: '100%' }}
                                                    min={0}
                                                    precision={2}
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col span={6}>
                                            <Form.Item
                                                name={['produto', 'aliqPIS']}
                                                label="Alíquota PIS"
                                                rules={[
                                                    {
                                                        required: true,
                                                        message: 'Campo obrigatório',
                                                    },
                                                ]}
                                            >
                                                <InputNumber
                                                    style={{ width: '100%' }}
                                                    min={0}
                                                    max={100}
                                                    precision={2}
                                                />
                                            </Form.Item>
                                        </Col>

                                        <Col span={6}>
                                            <Form.Item
                                                name={['produto', 'baseCOFINS']}
                                                label="Base COFINS"
                                                rules={[
                                                    {
                                                        required: true,
                                                        message: 'Campo obrigatório',
                                                    },
                                                ]}
                                            >
                                                <InputNumber
                                                    style={{ width: '100%' }}
                                                    min={0}
                                                    precision={2}
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col span={6}>
                                            <Form.Item
                                                name={['produto', 'aliqCOFINS']}
                                                label="Alíquota COFINS"
                                                rules={[
                                                    {
                                                        required: true,
                                                        message: 'Campo obrigatório',
                                                    },
                                                ]}
                                            >
                                                <InputNumber
                                                    style={{ width: '100%' }}
                                                    min={0}
                                                    max={100}
                                                    precision={2}
                                                />
                                            </Form.Item>
                                        </Col>

                                        <Col span={24}>
                                            <Button type="dashed" onClick={handleAddProduto} block>
                                                Adicionar Produto
                                            </Button>
                                        </Col>
                                    </Row>
                                )}
                            </Form.Item>
                        </Card>
                    </Col>

                    <Col span={24}>
                        <Table
                            columns={produtosColumns}
                            dataSource={produtosNota}
                            rowKey="codProd"
                            pagination={false}
                            scroll={{ x: 1000 }}
                            summary={(data) => {
                                const total = data.reduce((acc, curr) => acc + curr.valorTotal, 0);

                                return (
                                    <Table.Summary.Row>
                                        <Table.Summary.Cell index={0} colSpan={5} align="right">
                                            <strong>Total:</strong>
                                        </Table.Summary.Cell>
                                        <Table.Summary.Cell index={1} align="right">
                                            <strong>{total.toFixed(2)}</strong>
                                        </Table.Summary.Cell>
                                        <Table.Summary.Cell index={2} />
                                    </Table.Summary.Row>
                                );
                            }}
                        />
                    </Col>

                    <Col span={24}>
                        <Space>
                            <Button type="primary" htmlType="submit" loading={loading}>
                                Salvar
                            </Button>
                            <Button onClick={() => router.push('/notas-fiscais')}>Cancelar</Button>
                        </Space>
                    </Col>
                </Row>
            </Form>
        </Card>
    );
} 