import { BellIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export function Header() {
  return (
    <header className="h-16 bg-white border-b border-gray-200 px-8 flex items-center justify-between">
      {/* Search */}
      <div className="flex items-center flex-1 max-w-2xl">
        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar..."
          className="ml-2 flex-1 bg-transparent border-0 outline-none text-sm text-gray-800 placeholder-gray-400"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-4">
        <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full">
          <BellIcon className="h-5 w-5" />
        </button>
        <button className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-violet-100 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-violet-600">PK</span>
          </div>
        </button>
      </div>
    </header>
  );
} 
 
 
 