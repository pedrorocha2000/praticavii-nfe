import { NotaFiscal } from '@/types/nota-fiscal';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Table } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { formatarMoeda } from '@/lib/utils';

interface NotaFiscalCreateProps {
    fornecedores: any[];
    transportadoras: any[];
    condicoesPagamento: any[];
    produtos: any[];
    onSubmit: (data: any) => void;
}

export function NotaFiscalCreate({
    fornecedores,
    transportadoras,
    condicoesPagamento,
    produtos,
    onSubmit,
}: NotaFiscalCreateProps) {
    return (
        <form onSubmit={onSubmit} className="space-y-4">
            <Card className="p-4">
                <h2 className="text-lg font-semibold mb-4">Nota Fiscal</h2>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="modelo">Modelo</Label>
                        <Input id="modelo" name="modelo" required />
                    </div>
                    <div>
                        <Label htmlFor="serie">Série</Label>
                        <Input id="serie" name="serie" required />
                    </div>
                    <div>
                        <Label htmlFor="numnfe">Número</Label>
                        <Input id="numnfe" name="numnfe" required />
                    </div>
                    <div>
                        <Label htmlFor="naturezaOperacao">
                            Natureza da Operação
                        </Label>
                        <Input
                            id="naturezaOperacao"
                            name="naturezaOperacao"
                            required
                        />
                    </div>
                    <div>
                        <Label htmlFor="dataEmissao">Data de Emissão</Label>
                        <Input
                            id="dataEmissao"
                            name="dataEmissao"
                            type="date"
                            required
                        />
                    </div>
                    <div>
                        <Label htmlFor="horaEmissao">Hora de Emissão</Label>
                        <Input
                            id="horaEmissao"
                            name="horaEmissao"
                            type="time"
                            required
                        />
                    </div>
                    <div>
                        <Label htmlFor="dataSaida">Data de Saída</Label>
                        <Input
                            id="dataSaida"
                            name="dataSaida"
                            type="date"
                            required
                        />
                    </div>
                    <div>
                        <Label htmlFor="horaSaida">Hora de Saída</Label>
                        <Input
                            id="horaSaida"
                            name="horaSaida"
                            type="time"
                            required
                        />
                    </div>
                    <div>
                        <Label htmlFor="valorTotal">Valor Total</Label>
                        <Input
                            id="valorTotal"
                            name="valorTotal"
                            type="number"
                            step="0.01"
                            required
                        />
                    </div>
                    <div>
                        <Label htmlFor="chaveAcesso">Chave de Acesso</Label>
                        <Input id="chaveAcesso" name="chaveAcesso" required />
                    </div>
                    <div>
                        <Label htmlFor="protocoloAutorizacao">
                            Protocolo de Autorização
                        </Label>
                        <Input
                            id="protocoloAutorizacao"
                            name="protocoloAutorizacao"
                            required
                        />
                    </div>
                </div>
            </Card>

            <Card className="p-4">
                <h2 className="text-lg font-semibold mb-4">Fornecedor</h2>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="codForn">Fornecedor</Label>
                        <Select id="codForn" name="codForn" required>
                            <option value="">Selecione um fornecedor</option>
                            {fornecedores.map((fornecedor) => (
                                <option
                                    key={fornecedor.codForn}
                                    value={fornecedor.codForn}
                                >
                                    {fornecedor.nomerazao}
                                </option>
                            ))}
                        </Select>
                    </div>
                </div>
            </Card>

            <Card className="p-4">
                <h2 className="text-lg font-semibold mb-4">Transportadora</h2>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="codTrans">Transportadora</Label>
                        <Select id="codTrans" name="codTrans">
                            <option value="">
                                Selecione uma transportadora
                            </option>
                            {transportadoras.map((transportadora) => (
                                <option
                                    key={transportadora.codTrans}
                                    value={transportadora.codTrans}
                                >
                                    {transportadora.nomerazao}
                                </option>
                            ))}
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor="placa">Placa</Label>
                        <Input id="placa" name="placa" />
                    </div>
                </div>
            </Card>

            <Card className="p-4">
                <h2 className="text-lg font-semibold mb-4">
                    Condição de Pagamento
                </h2>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="codCondPgto">
                            Condição de Pagamento
                        </Label>
                        <Select id="codCondPgto" name="codCondPgto" required>
                            <option value="">
                                Selecione uma condição de pagamento
                            </option>
                            {condicoesPagamento.map((condicao) => (
                                <option
                                    key={condicao.codCondPgto}
                                    value={condicao.codCondPgto}
                                >
                                    {condicao.descricao}
                                </option>
                            ))}
                        </Select>
                    </div>
                </div>
            </Card>

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
                        {produtos.map((produto) => (
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

            <div className="flex justify-end">
                <Button type="submit">Salvar</Button>
            </div>
        </form>
    );
} 