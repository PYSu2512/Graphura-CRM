import { Bell, Menu, Search } from "lucide-react";
import { useLocation } from "react-router-dom";

function Navbar({ toggleSidebar }) {
  const location = useLocation();
  const isSuperAdmin = location.pathname.startsWith('/super-admin');

  return (
    <div className="flex h-16 w-full items-center justify-between">
      <div className="flex flex-1 items-center">
        <button onClick={toggleSidebar} className="mr-4 text-gray-500 md:hidden">
          <Menu size={22} />
        </button>
        <div className="hidden items-center gap-2 rounded-full bg-gray-100/80 px-4 py-1.5 text-gray-500 transition-colors focus-within:bg-gray-100 md:flex">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search anywhere..."
            className="w-64 border-none bg-transparent text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <button className="relative text-gray-400 hover:text-gray-600">
          <Bell size={20} />
          <span className="absolute right-0 top-0 h-1.5 w-1.5 rounded-full bg-red-500"></span>
        </button>

        <div className="flex cursor-pointer items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-100 text-sm font-semibold text-sky-700">
            {isSuperAdmin ? 'SA' : 'A'}
          </div>
          <span className="hidden text-sm font-medium text-gray-700 sm:block">
            {isSuperAdmin ? 'Super Admin' : 'Admin'}
          </span>
        </div>
      </div>
    </div>
  );
}

export default Navbar;
