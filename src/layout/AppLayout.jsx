import { Outlet } from 'react-router-dom';

const AppLayout = () => {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar Placeholder */}
      <aside className="w-64 bg-gray-800 text-white p-4">
        <h2 className="text-xl font-bold mb-6">HopePMS</h2>
        <nav className="flex flex-col gap-2">
          <div className="p-2 bg-gray-700 rounded">Navigation Links Here</div>
        </nav>
      </aside>

      <div className="flex-1 flex flex-col">
        {/* Navbar Placeholder */}
        <header className="h-16 bg-white shadow flex items-center px-6">
          <span className="text-gray-600">Top Navbar Header</span>
        </header>

        {/* Main Content Area - This is where your nested routes will render! */}
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;