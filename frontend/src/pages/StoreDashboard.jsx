import { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";

export default function StoreDashboard() {
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [dashRes, productRes, customerRes, orderRes] = await Promise.all([
        axios.get("http://localhost:5000/api/dashboard", { headers }),
        axios.get("http://localhost:5000/api/products", { headers }),
        axios.get("http://localhost:5000/api/customers", { headers }),
        axios.get("http://localhost:5000/api/orders", { headers }),
      ]);

      setStats(dashRes.data);
      setProducts(productRes.data);
      setCustomers(customerRes.data);
      setOrders(orderRes.data);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <Layout>
      <h2 className="text-2xl font-bold mb-6">🏪 Store Dashboard</h2>

      {/* Top Stats */}
      <div className="flex gap-6 mb-8 flex-wrap">
        <StatCard title="Total Products" value={products.length} color="blue" />
        <StatCard title="Total Customers" value={customers.length} color="green" />
        <StatCard title="Total Orders" value={orders.length} color="purple" />
        <StatCard title="Total Revenue" value={`₹ ${stats?.totalRevenue || 0}`} color="yellow" />
        <StatCard title="Pending Udhaar" value={`₹ ${stats?.totalPendingUdhaar || 0}`} color="red" />
      </div>

      {/* Low Stock Alerts */}
      {stats?.lowStock?.length > 0 && (
        <div className="bg-red-50 border border-red-300 rounded p-4 mb-8">
          <h3 className="text-red-600 font-bold text-lg mb-3">
            ⚠️ Low Stock Alerts ({stats.lowStock.length})
          </h3>
          <div className="flex gap-3 flex-wrap">
            {stats.lowStock.map((p) => (
              <div key={p._id} className="bg-white border border-red-200 rounded px-3 py-2 text-sm">
                <span className="font-semibold">{p.name}</span>
                <span className="text-red-500 ml-2">
                  {p.quantity === 0 ? "Out of Stock" : `Only ${p.quantity} left`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-6 mb-8">

        {/* Recent Orders */}
        <div className="bg-white shadow rounded p-4">
          <h3 className="font-bold text-lg mb-4">📦 Recent Orders</h3>
          {stats?.recentOrders?.length === 0 ? (
            <p className="text-gray-400">No orders yet</p>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 text-left text-sm">Customer</th>
                  <th className="p-2 text-left text-sm">Amount</th>
                  <th className="p-2 text-left text-sm">Type</th>
                </tr>
              </thead>
              <tbody>
                {stats?.recentOrders?.map((o) => (
                  <tr key={o._id} className="border-t">
                    <td className="p-2 text-sm">{o.customerId?.name || "N/A"}</td>
                    <td className="p-2 text-sm">₹ {o.totalAmount}</td>
                    <td className="p-2 text-sm capitalize">
                      <span className={`px-2 py-1 rounded text-xs ${
                        o.paymentType === "cash"
                          ? "bg-green-100 text-green-600"
                          : "bg-red-100 text-red-600"
                      }`}>
                        {o.paymentType}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Top Selling Products */}
        <div className="bg-white shadow rounded p-4">
          <h3 className="font-bold text-lg mb-4">🏆 Top Selling Products</h3>
          {stats?.topProducts?.length === 0 ? (
            <p className="text-gray-400">No sales yet</p>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 text-left text-sm">Product</th>
                  <th className="p-2 text-left text-sm">Sold</th>
                </tr>
              </thead>
              <tbody>
                {stats?.topProducts?.map((p) => (
                  <tr key={p._id} className="border-t">
                    <td className="p-2 text-sm">{p.product?.name}</td>
                    <td className="p-2 text-sm font-bold">{p.totalSold} units</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>

      {/* Pending Udhaar Table */}
      <div className="bg-white shadow rounded p-4">
        <h3 className="font-bold text-lg mb-4">💸 Pending Udhaar</h3>
        {customers.filter(c => c.totalDue > 0).length === 0 ? (
          <p className="text-gray-400">No pending udhaar</p>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left text-sm">Customer</th>
                <th className="p-2 text-left text-sm">Phone</th>
                <th className="p-2 text-left text-sm">Amount Due</th>
              </tr>
            </thead>
            <tbody>
              {customers
                .filter(c => c.totalDue > 0)
                .map((c) => (
                  <tr key={c._id} className="border-t">
                    <td className="p-2 text-sm">{c.name}</td>
                    <td className="p-2 text-sm">{c.phone}</td>
                    <td className="p-2 text-sm font-bold text-red-500">₹ {c.totalDue}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </div>

    </Layout>
  );
}

function StatCard({ title, value, color }) {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    yellow: "bg-yellow-50 text-yellow-600",
    red: "bg-red-50 text-red-600",
  };

  return (
    <div className={`p-6 rounded shadow w-48 text-center ${colors[color]}`}>
      <h4 className="text-sm text-gray-500">{title}</h4>
      <h2 className="text-2xl font-bold mt-2">{value}</h2>
    </div>
  );
}