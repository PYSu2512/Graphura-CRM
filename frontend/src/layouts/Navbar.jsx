function Navbar({ toggleSidebar }) {
  return (
    <div className="flex items-center justify-between">

      {/* Left */}
      <div className="flex items-center gap-3">
        <button onClick={toggleSidebar} className="md:hidden text-xl">
          ☰
        </button>
        <h1 className="text-lg font-semibold">CRM Dashboard</h1>
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">
        <input
          type="text"
          placeholder="Search..."
          className="hidden md:block px-3 py-1 border rounded-lg text-sm"
        />
        <span className="text-sm text-gray-600">Admin</span>
        <div className="w-8 h-8 bg-blue-500 rounded-full"></div>
      </div>

    </div>
  );
}

export default Navbar;