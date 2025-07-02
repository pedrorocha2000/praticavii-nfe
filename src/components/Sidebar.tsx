import { HomeIcon, DocumentTextIcon, UserGroupIcon, CreditCardIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export function Sidebar() {
  const menuItems = [
    { name: 'Dashboard', icon: HomeIcon, href: '/' },
    { 
      name: 'Notas Fiscais', 
      icon: DocumentTextIcon,
      subItems: [
        { name: 'Nova NFe', href: '/nfe' },
        { name: 'NFe Entrada', href: '/nfe/entrada' },
        { name: 'NFe Saída', href: '/nfe/saida' },
      ]
    },
    { 
      name: 'Cadastros',
      icon: UserGroupIcon,
      subItems: [
        { name: 'Clientes', href: '/clientes' },
        { name: 'Fornecedores', href: '/fornecedores' },
        { name: 'Funcionários', href: '/funcionarios' },
        { name: 'Funções de Funcionário', href: '/funcoes-funcionario' },
        { name: 'Produtos', href: '/produtos' },
        { name: 'Categorias', href: '/categorias' },
        { name: 'Marcas', href: '/marcas' },
        { name: 'Unidades de Medida', href: '/unidades-medida' },
        { name: 'Transportadoras', href: '/transportadoras' },
        { name: 'Veículos', href: '/veiculos' },
      ]
    },
    {
      name: 'Financeiro',
      icon: CreditCardIcon,
      subItems: [
        { name: 'Contas a Receber', href: '/contas-receber' },
        { name: 'Contas a Pagar', href: '/contas-pagar' },
        { name: 'Formas de Pagamento', href: '/formas-pagamento' },
        { name: 'Condições de Pagamento', href: '/condicoes-pagamento' },
      ]
    },
    {
      name: 'Localidades',
      icon: GlobeAltIcon,
      subItems: [
        { name: 'Países', href: '/paises' },
        { name: 'Estados', href: '/estados' },
        { name: 'Cidades', href: '/cidades' },
      ]
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-gray-200 bg-white">
        <span className="text-xl font-semibold text-gray-800">NFe System</span>
      </div>

      {/* Menu */}
      <nav className="p-4 space-y-1 flex-1 bg-white">
        {menuItems.map((item) => (
          <div key={item.name}>
            {item.href ? (
              <Link 
                href={item.href}
                className="w-full flex items-center px-4 py-2 text-sm text-gray-600 hover:bg-violet-50 hover:text-violet-600 rounded-lg transition-colors"
              >
                <item.icon className="h-5 w-5 mr-3" />
                {item.name}
              </Link>
            ) : (
              <>
                <button className="w-full flex items-center px-4 py-2 text-sm text-gray-600 hover:bg-violet-50 hover:text-violet-600 rounded-lg transition-colors">
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.name}
                </button>
                {item.subItems && (
                  <div className="ml-11 mt-1 space-y-1">
                    {item.subItems.map((subItem) => (
                      <Link
                        key={subItem.name}
                        href={subItem.href}
                        className="block px-4 py-2 text-sm text-gray-500 hover:text-violet-600 rounded-lg"
                      >
                        {subItem.name}
                      </Link>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
} 