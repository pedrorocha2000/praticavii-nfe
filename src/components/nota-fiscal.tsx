import { NotaFiscal } from '@/types/nota-fiscal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import Link from 'next/link';
import { Eye, Pencil, Trash } from 'lucide-react';
import { formatarData, formatarHora, formatarMoeda } from '@/lib/utils';

interface Props {
    notaFiscal: NotaFiscal;
}

export function NotaFiscalComponent({ notaFiscal }: Props) {
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">
                    Nota Fiscal {notaFiscal.modelo}-{notaFiscal.serie}-{notaFiscal.numnfe}
                </h1>
                <div className="space-x-2">
                    <Link
                        href={`/notas-fiscais/${notaFiscal.modelo}/${notaFiscal.serie}/${notaFiscal.numnfe}/edit`}
                    >
                        <Button>Editar</Button>
                    </Link>
                </div>
            </div>

            <Card className="p-4">
                <h2 className="text-lg font-semibold mb-4">Nota Fiscal</h2>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm text-gray-500">Natureza da Operação</p>
                        <p>{notaFiscal.naturezaOperacao}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Data de Emissão</p>
                        <p>
                            {formatarData(notaFiscal.dataEmissao)} às{' '}
                            {formatarHora(notaFiscal.horaEmissao)}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Data de Saída</p>
                        <p>
                            {formatarData(notaFiscal.dataSaida)} às{' '}
                            {formatarHora(notaFiscal.horaSaida)}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Valor Total</p>
                        <p>{formatarMoeda(notaFiscal.valorTotal)}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Chave de Acesso</p>
                        <p>{notaFiscal.chaveAcesso}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Protocolo de Autorização</p>
                        <p>{notaFiscal.protocoloAutorizacao}</p>
                    </div>
                </div>
            </Card>

            <Card className="p-4">
                <h2 className="text-lg font-semibold mb-4">Fornecedor</h2>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm text-gray-500">Nome/Razão Social</p>
                        <p>{notaFiscal.fornecedor.nomerazao}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">CNPJ</p>
                        <p>{notaFiscal.fornecedor.cnpj}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Inscrição Estadual</p>
                        <p>{notaFiscal.fornecedor.ie}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Endereço</p>
                        <p>{notaFiscal.fornecedor.endereco}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Bairro</p>
                        <p>{notaFiscal.fornecedor.bairro}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Cidade</p>
                        <p>{notaFiscal.fornecedor.cidade}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Estado</p>
                        <p>{notaFiscal.fornecedor.uf}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">CEP</p>
                        <p>{notaFiscal.fornecedor.cep}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Telefone</p>
                        <p>{notaFiscal.fornecedor.telefone}</p>
                    </div>
                </div>
            </Card>

            {notaFiscal.transportadora && (
                <Card className="p-4">
                    <h2 className="text-lg font-semibold mb-4">Transportadora</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-500">Nome/Razão Social</p>
                            <p>{notaFiscal.transportadora.nomerazao}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">CNPJ</p>
                            <p>{notaFiscal.transportadora.cnpj}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Inscrição Estadual</p>
                            <p>{notaFiscal.transportadora.ie}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Endereço</p>
                            <p>{notaFiscal.transportadora.endereco}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Bairro</p>
                            <p>{notaFiscal.transportadora.bairro}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Cidade</p>
                            <p>{notaFiscal.transportadora.cidade}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Estado</p>
                            <p>{notaFiscal.transportadora.uf}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">CEP</p>
                            <p>{notaFiscal.transportadora.cep}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Telefone</p>
                            <p>{notaFiscal.transportadora.telefone}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Placa</p>
                            <p>{notaFiscal.placa}</p>
                        </div>
                    </div>
                </Card>
            )}

            <Card className="p-4">
                <h2 className="text-lg font-semibold mb-4">Produtos</h2>
                <Table>
                    <thead>
                        <tr>
                            <th>Código</th>
                            <th>Nome</th>
                            <th>NCM</th>
                            <th>CFOP</th>
                            <th>Un.</th>
                            <th>Qtde.</th>
                            <th>Valor Un.</th>
                            <th>Valor Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {notaFiscal.produtos.map((produto) => (
                            <tr key={produto.codProd}>
                                <td>{produto.codProd}</td>
                                <td>{produto.nome}</td>
                                <td>{produto.ncm}</td>
                                <td>{produto.cfop}</td>
                                <td>{produto.unidade}</td>
                                <td>{produto.quantidade}</td>
                                <td>{formatarMoeda(produto.valorUnitario)}</td>
                                <td>{formatarMoeda(produto.valorTotal)}</td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </Card>

            <Card className="p-4">
                <h2 className="text-lg font-semibold mb-4">Condição de Pagamento</h2>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm text-gray-500">Descrição</p>
                        <p>{notaFiscal.condicaoPagamento.descricao}</p>
                    </div>
                </div>
                <Table className="mt-4">
                    <thead>
                        <tr>
                            <th>Parcela</th>
                            <th>Forma de Pagamento</th>
                        </tr>
                    </thead>
                    <tbody>
                        {notaFiscal.condicaoPagamento.parcelas.map((parcela) => (
                            <tr key={parcela.numParcela}>
                                <td>{parcela.numParcela}</td>
                                <td>{parcela.descricaoForma}</td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </Card>
        </div>
    );
} 