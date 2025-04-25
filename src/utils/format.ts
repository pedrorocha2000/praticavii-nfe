export function formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(value);
}

export function formatDate(date: string): string {
    return new Date(date).toLocaleDateString('pt-BR');
}

export function formatDateTime(date: string, time: string): string {
    const [year, month, day] = date.split('-');
    const [hour, minute] = time.split(':');
    const dateTime = new Date(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day),
        parseInt(hour),
        parseInt(minute)
    );
    return dateTime.toLocaleString('pt-BR');
}

export function formatNumber(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);
}

export function formatCNPJ(cnpj: string): string {
    return cnpj.replace(
        /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
        '$1.$2.$3/$4-$5'
    );
}

export function formatCEP(cep: string): string {
    return cep.replace(/^(\d{5})(\d{3})$/, '$1-$2');
}

export function formatIE(ie: string): string {
    return ie.replace(/^(\d{3})(\d{3})(\d{3})(\d{3})$/, '$1.$2.$3.$4');
} 