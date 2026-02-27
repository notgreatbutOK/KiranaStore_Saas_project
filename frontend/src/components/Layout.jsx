import { Link, useNavigate } from "react-router-dom";

export default function Layout({ children }) {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  const role = localStorage.getItem("role");

  return (
    <div className="flex h-screen bg-gray-100">

      {/* Sidebar */}
      <div className="w-64 bg-blue-900 text-white flex flex-col">

        {/* Logo */}
        <div className="p-5 text-xl font-bold border-b border-blue-700">
          Kirana SaaS
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-3">

          {role === "superadmin" ? (
            <>
              <Link to="/superadmin" className="block hover:text-gray-300">
                Dashboard
              </Link>
            </>
          ) : (
            <>
              <Link to="/dashboard" className="block hover:text-gray-300">
                Dashboard
              </Link>

              <Link to="/products" className="block hover:text-gray-300">
                Products
              </Link>

              <Link to="/customers" className="block hover:text-gray-300">
                Customers
              </Link>

              <Link to="/orders" className="block hover:text-gray-300">
                Orders
              </Link>

              <Link to="/udhaar" className="block hover:text-gray-300">
                Udhaar
              

              </Link>
            </>
          )}

        </nav>

        {/* Logout */}
        <button
          onClick={logout}
          className="p-4 bg-blue-800 hover:bg-blue-700"
        >
          Logout
        </button>

      </div>

      {/* Main Area */}
      <div className="flex-1 flex flex-col">

        {/* Top Bar */}
        <div className="bg-white shadow p-4 flex justify-between">
          <h1 className="font-semibold text-lg">
            {role === "superadmin"
              ? "Super Admin Panel"
              : "Store Dashboard"}
          </h1>

          <span className="text-sm text-gray-500">
            {role}
          </span>
        </div>

        {/* Page Content */}
        <div className="p-8 overflow-y-auto">
          {children}
        </div>

      </div>
    </div>
  );
}