import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Layout from "../components/Layout";

export default function SuperAdminDashboard() {
  const [stores, setStores] = useState([]);
  const [revenue, setRevenue] = useState(0);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newMobile, setNewMobile] = useState("");
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [storesRes, revenueRes] = await Promise.all([
        axios.get("http://localhost:5000/api/superadmin/stores", { headers }),
        axios.get("http://localhost:5000/api/superadmin/revenue", { headers }),
      ]);
      setStores(storesRes.data);
      setRevenue(revenueRes.data.totalRevenue || 0);
    } catch (err) {
      console.log(err);
    }
  };

  const createStore = async () => {
    if (!newName || !newEmail || !newPassword || !newMobile) return alert("Fill all fields!");
    try {
      await axios.post(
        "http://localhost:5000/api/superadmin/create-store",
        { name: newName, email: newEmail, password: newPassword, mobileNumber: newMobile},
        { headers }
      );
      alert(`Store created! Share these creds:\nEmail: ${newEmail}\nPassword: ${newPassword}`);
      setNewName(""); setNewEmail(""); setNewPassword(""); setNewMobile("");
      setShowCreateForm(false);
      fetchAll();
    } catch (err) {
      alert(err.response?.data?.msg || "Failed to create store");
    }
  };

  const suspendStore = async (id) => {
    if (!window.confirm("Suspend this store?")) return;
    await axios.patch(`http://localhost:5000/api/superadmin/suspend/${id}`, {}, { headers });
    fetchAll();
  };

  const deleteStore = async (id) => {
    if (!window.confirm("Delete this store? This cannot be undone!")) return;
    await axios.delete(`http://localhost:5000/api/superadmin/delete/${id}`, { headers });
    fetchAll();
  };

  const activateSubscription = async (id, plan) => {
    if (!window.confirm(`Activate ${plan} subscription for this store?`)) return;
    try {
      await axios.patch(
        `http://localhost:5000/api/superadmin/subscribe/${id}`,
        { plan },
        { headers }
      );
      alert(`${plan} subscription activated!`);
      fetchAll();
    } catch (err) {
      alert("Failed to activate subscription");
    }
  };

  const removePlan = async (id) => {
    if (!window.confirm("Remove plan and reset to trial?")) return;
    try {
      await axios.patch(
        `http://localhost:5000/api/superadmin/removeplan/${id}`,
        {},
        { headers }
      );
      alert("Plan removed!");
      fetchAll();
    } catch (err) {
      alert("Failed to remove plan");
    }
  };

  const totalStores = stores.length;
  const activeStores = stores.filter(s => s.status === "active").length;
  const pendingStores = stores.filter(s => s.status === "pending").length;
  const suspendedStores = stores.filter(s => s.status === "suspended").length;
  const trialStores = stores.filter(s => s.subscriptionPlan === "trial").length;
  const subscribedStores = stores.filter(s => ["1month", "3months", "6months", "1year"].includes(s.subscriptionPlan)).length;

  const getTrialDaysLeft = (trialEndDate) => {
    if (!trialEndDate) return "N/A";
    const diff = new Date(trialEndDate) - new Date();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? `${days} days` : "Expired";
  };

  const getSubStatus = (store) => {
    if (store.subscriptionPlan === "trial") {
      const daysLeft = getTrialDaysLeft(store.trialEndDate);
      return (
        <span className={`px-2 py-1 rounded text-xs font-semibold ${
          daysLeft === "Expired" ? "bg-red-100 text-red-600" : "bg-yellow-100 text-yellow-700"
        }`}>
          ⏳ Trial: {daysLeft}
        </span>
      );
    }
    if (["1month", "3months", "6months", "1year"].includes(store.subscriptionPlan)) {
      const expiry = new Date(store.subscriptionEndDate).toLocaleDateString("en-IN");
      return (
        <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-semibold">
          ✅ {store.subscriptionPlan} — till {expiry}
        </span>
      );
    }
    return <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-xs">None</span>;
  };

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-6">👑 Super Admin Dashboard</h1>

      {/* Create Store */}
      <div className="mb-6">
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {showCreateForm ? "Cancel" : "+ Create New Store"}
        </button>

        {showCreateForm && (
          <div className="bg-white shadow rounded p-6 mt-4 max-w-md">
            <h3 className="font-bold text-lg mb-4">Create New Store</h3>
            <div className="mb-3">
              <label className="block text-gray-600 mb-1">Store Name</label>
              <input
                className="w-full border p-2 rounded"
                placeholder="Store name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label className="block text-gray-600 mb-1">Email</label>
              <input
                className="w-full border p-2 rounded"
                placeholder="store@email.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label className="block text-gray-600 mb-1">Password</label>
              <input
                className="w-full border p-2 rounded"
                type="password"
                placeholder="Set a password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label className="block text-gray-600 mb-1">Mobile Number</label>
              <input
                className="w-full border p-2 rounded"
                placeholder="e.g. 15551941598"
                value={newMobile}
                onChange={(e) => setNewMobile(e.target.value)}
              />
            </div>
            <button
              onClick={createStore}
              className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 w-full"
            >
              Create Store
            </button>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="flex gap-4 mb-8 flex-wrap">
        <StatCard title="Total Stores" value={totalStores} color="blue" />
        <StatCard title="Active" value={activeStores} color="green" />
        <StatCard title="Pending" value={pendingStores} color="yellow" />
        <StatCard title="Suspended" value={suspendedStores} color="red" />
        <StatCard title="On Trial" value={trialStores} color="purple" />
        <StatCard title="Subscribed" value={subscribedStores} color="green" />
        <StatCard title="Platform Revenue" value={`₹ ${revenue}`} color="yellow" />
      </div>

      {/* Stores Table */}
      <div className="bg-white shadow rounded overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="p-4 text-left text-sm text-gray-600">Store</th>
              <th className="p-4 text-left text-sm text-gray-600">Email</th>
              <th className="p-4 text-left text-sm text-gray-600">Mobile</th>
              <th className="p-4 text-left text-sm text-gray-600">Status</th>
              <th className="p-4 text-left text-sm text-gray-600">Subscription</th>
              <th className="p-4 text-left text-sm text-gray-600">Actions</th>
              <th className="p-4 text-left text-sm text-gray-600">Activate Plan</th>
            </tr>
          </thead>
          <tbody>
            {stores.map((store) => (
              <tr key={store._id} className="border-t hover:bg-gray-50">
                <td className="p-4 font-medium">
                  <button
                    onClick={() => navigate(`/superadmin/store/${store._id}`)}
                    className="text-blue-600 hover:underline"
                  >
                    {store.name}
                  </button>
                </td>
                <td className="p-4 text-gray-500 text-sm">{store.email}</td>
                <td className="p-4 text-gray-500 text-sm">{store.mobileNumber || "-"}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    store.status === "active" ? "bg-green-100 text-green-700" :
                    store.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                    "bg-red-100 text-red-600"
                  }`}>
                    {store.status}
                  </span>
                </td>
                <td className="p-4">{getSubStatus(store)}</td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <button onClick={() => suspendStore(store._id)} className="bg-yellow-500 text-white px-3 py-1 rounded text-xs hover:bg-yellow-600">Suspend</button>
                    <button onClick={() => deleteStore(store._id)} className="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600">Delete</button>
                  </div>
                </td>
                <td className="p-4">
                  <select
                    className="border p-1 rounded text-sm text-gray-600"
                    defaultValue=""
                    onChange={(e) => {
                      if (e.target.value === "remove") {
                        removePlan(store._id);
                        e.target.value = "";
                      } else if (e.target.value) {
                        activateSubscription(store._id, e.target.value);
                        e.target.value = "";
                      }
                    }}
                  >
                    <option value="" disabled>Select Plan</option>
                    <option value="1month">1 Month</option>
                    <option value="3months">3 Months</option>
                    <option value="6months">6 Months</option>
                    <option value="1year">1 Year</option>
                    <option value="remove">❌ Remove Plan</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
    <div className={`p-6 rounded shadow w-40 text-center ${colors[color]}`}>
      <h4 className="text-sm text-gray-500">{title}</h4>
      <h2 className="text-2xl font-bold mt-2">{value}</h2>
    </div>
  );
}