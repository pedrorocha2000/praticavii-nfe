import { NotaFiscal } from '@/types/nota-fiscal';
import { Table } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { formatarData, formatarHora, formatarMoeda } from '@/lib/utils';
import Link from 'next/link';

interface NotaFiscalListProps {
    notasFiscais: NotaFiscal[];
}

export function NotaFiscalList({ notasFiscais }: NotaFiscalListProps) {
    return (
        <Table>
            <thead>
                <tr>
                    <th>Modelo</th>
                    <th>Série</th>
                    <th>Número</th>
                    <th>Fornecedor</th>
                    <th>Data de Emissão</th>
                    <th>Valor Total</th>
                    <th>Ações</th>
                </tr>
            </thead>
            <tbody>
                {notasFiscais.map((notaFiscal) => (
                    <tr key={`${notaFiscal.modelo}-${notaFiscal.serie}-${notaFiscal.numnfe}`}>
                        <td>{notaFiscal.modelo}</td>
                        <td>{notaFiscal.serie}</td>
                        <td>{notaFiscal.numnfe}</td>
                        <td>{notaFiscal.fornecedor.nomerazao}</td>
                        <td>
                            {formatarData(notaFiscal.dataEmissao)} às{' '}
                            {formatarHora(notaFiscal.horaEmissao)}
                        </td>
                        <td>{formatarMoeda(notaFiscal.valorTotal)}</td>
                        <td>
                            <div className="flex gap-2">
                                <Link
                                    href={`/notas-fiscais/${notaFiscal.modelo}/${notaFiscal.serie}/${notaFiscal.numnfe}`}
                                >
                                    <Button variant="outline">Visualizar</Button>
                                </Link>
                                <Link
                                    href={`/notas-fiscais/${notaFiscal.modelo}/${notaFiscal.serie}/${notaFiscal.numnfe}/edit`}
                                >
                                    <Button variant="outline">Editar</Button>
                                </Link>
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </Table>
    );
} 