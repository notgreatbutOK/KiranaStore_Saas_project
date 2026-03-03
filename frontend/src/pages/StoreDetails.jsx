import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Layout from "../components/Layout";

export default function StoreDetails() {
  const { storeId } = useParams();
  const navigate = useNavigate();
  const [details, setDetails] = useState(null);

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchDetails();
  }, []);

  const fetchDetails = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/superadmin/store/${storeId}`,
        { headers }
      );
      setDetails(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  if (!details) return <Layout><p className="p-8 text-gray-400">Loading...</p></Layout>;

  const { store, totalProducts, totalCustomers, totalOrders, revenue } = details;

  return (
    <Layout>
      <button
        onClick={() => navigate("/superadmin")}
        className="mb-6 text-blue-600 hover:underline text-sm"
      >
        ← Back to Dashboard
      </button>

      <h1 className="text-2xl font-bold mb-2">🏪 {store.name}</h1>
      <p className="text-gray-500 mb-6">{store.email}</p>

      {/* Store Stats */}
      <div className="flex gap-6 mb-8 flex-wrap">
        <StatCard title="Products" value={totalProducts} color="blue" />
        <StatCard title="Customers" value={totalCustomers} color="green" />
        <StatCard title="Orders" value={totalOrders} color="purple" />
        <StatCard title="Revenue" value={`₹ ${revenue}`} color="yellow" />
      </div>

      {/* Store Info */}
      <div className="bg-white shadow rounded p-6">
        <h3 className="font-bold text-lg mb-4">Store Info</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Status</p>
            <span className={`px-2 py-1 rounded text-xs font-semibold ${
              store.status === "active" ? "bg-green-100 text-green-700" :
              store.status === "pending" ? "bg-yellow-100 text-yellow-700" :
              "bg-red-100 text-red-600"
            }`}>
              {store.status}
            </span>
          </div>
          <div>
            <p className="text-gray-500">Subscription Plan</p>
            <p className="font-semibold">{store.subscriptionPlan}</p>
          </div>
          <div>
            <p className="text-gray-500">Trial End Date</p>
            <p className="font-semibold">{new Date(store.trialEndDate).toLocaleDateString("en-IN")}</p>
          </div>
          <div>
            <p className="text-gray-500">Subscription End Date</p>
            <p className="font-semibold">
              {store.subscriptionEndDate
                ? new Date(store.subscriptionEndDate).toLocaleDateString("en-IN")
                : "N/A"}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Registered On</p>
            <p className="font-semibold">{new Date(store.createdAt).toLocaleDateString("en-IN")}</p>
          </div>
        </div>
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
  };

  return (
    <div className={`p-6 rounded shadow w-40 text-center ${colors[color]}`}>
      <h4 className="text-sm text-gray-500">{title}</h4>
      <h2 className="text-2xl font-bold mt-2">{value}</h2>
    </div>
  );
}