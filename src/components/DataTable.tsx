import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

interface Column<T> {
  key: keyof T | string;
  label: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

interface Action<T> {
  icon: React.ForwardRefExoticComponent<any> | ((item: T) => React.ReactNode);
  onClick: (item: T, e?: React.MouseEvent) => void;
  label: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  actions?: Action<T>[];
  sortKey?: keyof T;
  sortDirection?: 'asc' | 'desc';
  onSort?: (key: keyof T) => void;
  onRowClick?: (item: T) => void;
  expandedRows?: number[];
  expandedContent?: (item: T) => React.ReactNode;
}

export function DataTable<T>({ 
  data, 
  columns, 
  onEdit, 
  onDelete,
  actions = [],
  sortKey,
  sortDirection,
  onSort,
  onRowClick,
  expandedRows = [],
  expandedContent
}: DataTableProps<T>) {
  return (
    <div className="mt-8 flow-root">
      <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  {columns.map((column) => (
                    <th
                      key={String(column.key)}
                      scope="col"
                      className={`py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6 cursor-pointer ${column.className || ''}`}
                      onClick={() => onSort?.(column.key as keyof T)}
                    >
                      <div className="flex items-center gap-1">
                        {column.label}
                        {sortKey === column.key && (
                          sortDirection === 'asc' ? (
                            <ChevronUpIcon className="h-4 w-4" />
                          ) : (
                            <ChevronDownIcon className="h-4 w-4" />
                          )
                        )}
                      </div>
                    </th>
                  ))}
                  {(onEdit || onDelete || actions.length > 0) && (
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Ações</span>
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {data.map((item: any, index) => (
                  <>
                    <tr 
                      key={`row-${index}`}
                      onClick={() => onRowClick?.(item)}
                      className={onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''}
                    >
                      {columns.map((column) => (
                        <td
                          key={String(column.key)}
                          className={`whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 ${column.className || ''}`}
                        >
                          {column.render ? column.render(item) : String(item[column.key as keyof T])}
                        </td>
                      ))}
                      {(onEdit || onDelete || actions.length > 0) && (
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <div className="flex justify-end gap-2">
                            {actions.map((action, actionIndex) => {
                              const IconComponent = typeof action.icon === 'function' 
                                ? () => action.icon(item) 
                                : action.icon;
                              
                              return (
                                <button
                                  key={actionIndex}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    action.onClick(item, e);
                                  }}
                                  className="text-blue-600 hover:text-blue-900"
                                  title={action.label}
                                >
                                  {typeof action.icon === 'function' ? (
                                    action.icon(item)
                                  ) : (
                                    <action.icon className="h-5 w-5" />
                                  )}
                                  <span className="sr-only">{action.label}</span>
                                </button>
                              );
                            })}
                            {onEdit && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onEdit(item);
                                }}
                                className="text-blue-600 hover:text-blue-900"
                                title="Editar"
                              >
                                <PencilIcon className="h-5 w-5" />
                                <span className="sr-only">Editar</span>
                              </button>
                            )}
                            {onDelete && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDelete(item);
                                }}
                                className="text-red-600 hover:text-red-900"
                                title="Excluir"
                              >
                                <TrashIcon className="h-5 w-5" />
                                <span className="sr-only">Excluir</span>
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                    {expandedContent && expandedRows.includes(item.codcli) && (
                      <tr key={`expanded-${index}`}>
                        <td colSpan={columns.length + (onEdit || onDelete || actions.length > 0 ? 1 : 0)}>
                          {expandedContent(item)}
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 
 
 
 