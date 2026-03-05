import { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";

export default function StoreDashboard() {
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const planPrices = {
    "1month": 499,
    "3months": 1299,
    "6months": 2399,
    "1year": 4299
  };

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
  try {
    const [dashRes, productRes, customerRes, orderRes, subRes] = await Promise.all([
      axios.get("http://localhost:5000/api/dashboard", { headers }),
      axios.get("http://localhost:5000/api/products", { headers }),
      axios.get("http://localhost:5000/api/customers", { headers }),
      axios.get("http://localhost:5000/api/orders", { headers }),
      axios.get("http://localhost:5000/api/payment/subscription", { headers }),
    ]);

    setStats(dashRes.data);
    setProducts(productRes.data);
    setCustomers(customerRes.data);
    setOrders(orderRes.data);
    setSubscription(subRes.data);
  } catch (err) {
    console.log(err);
  }
};

const initiatePayment = async (plan) => {
  try {
    const res = await axios.post(
      "http://localhost:5000/api/payment/initiate",
      { plan },
      { headers }
    );

    const params = res.data;

    // Create and submit form to PayU
    const form = document.createElement("form");
    form.method = "POST";
    form.action = params.action;

    Object.keys(params).forEach(key => {
      if (key === "action") return;
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = key;
      input.value = params[key];
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
  } catch (err) {
    alert("Payment initiation failed!");
  }
};

  return (
    <Layout>
      <h2 className="text-2xl font-bold mb-6">🏪 Store Dashboard</h2>

      {/* Subscription Banner */}
{subscription && (
  <div className={`rounded p-4 mb-6 ${
    subscription.plan === "trial"
      ? "bg-yellow-50 border border-yellow-300"
      : "bg-green-50 border border-green-300"
  }`}>
    <div className="flex justify-between items-center flex-wrap gap-4">
      <div>
        {subscription.plan === "trial" ? (
          <>
            <h3 className="font-bold text-yellow-700">⏳ Trial Plan</h3>
            <p className="text-yellow-600 text-sm">
              {subscription.daysLeft > 0
                ? `${subscription.daysLeft} days remaining`
                : "Trial expired!"}
            </p>
          </>
        ) : (
          <>
            <h3 className="font-bold text-green-700">✅ {subscription.plan} Plan Active</h3>
            <p className="text-green-600 text-sm">
              Valid till {new Date(subscription.endDate).toLocaleDateString("en-IN")}
            </p>
          </>
        )}
      </div>

      {/* Plan selection */}
      <div className="flex gap-2 flex-wrap">
        {Object.entries(planPrices).map(([plan, price]) => (
          <button
            key={plan}
            onClick={() => initiatePayment(plan)}
            className="bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700"
          >
            {plan} — ₹{price}
          </button>
        ))}
      </div>
    </div>
  </div>
)}

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