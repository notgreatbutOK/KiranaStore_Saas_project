import { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";

export default function SuperAdminDashboard() {
  const [stores, setStores] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/superadmin/stores",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStores(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const approveStore = async (id) => {
    await axios.patch(
      `http://localhost:5000/api/superadmin/approve/${id}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    fetchStores();
  };

  const suspendStore = async (id) => {
    await axios.patch(
      `http://localhost:5000/api/superadmin/suspend/${id}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    fetchStores();
  };

  const deleteStore = async (id) => {
    await axios.delete(
      `http://localhost:5000/api/superadmin/delete/${id}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    fetchStores();
  };

  const totalStores = stores.length;
  const activeStores = stores.filter(s => s.status === "active").length;
  const pendingStores = stores.filter(s => s.status === "pending").length;
  const suspendedStores = stores.filter(s => s.status === "suspended").length;

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-6">👑 Super Admin Dashboard</h1>

      <div className="flex gap-6 mb-6">
        <Card title="Total" value={totalStores} />
        <Card title="Active" value={activeStores} color="green" />
        <Card title="Pending" value={pendingStores} color="yellow" />
        <Card title="Suspended" value={suspendedStores} color="red" />
      </div>

      <table className="w-full bg-white shadow rounded">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-3 text-left">Store Name</th>
            <th className="p-3 text-left">Email</th>
            <th className="p-3 text-left">Status</th>
            <th className="p-3 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {stores.map((store) => (
            <tr key={store._id} className="border-t">
              <td className="p-3">{store.name}</td>
              <td className="p-3">{store.email}</td>
              <td className="p-3 capitalize">{store.status}</td>
              <td className="p-3 space-x-2">
                <button
                  onClick={() => approveStore(store._id)}
                  className="bg-green-500 text-white px-3 py-1 rounded"
                >
                  Approve
                </button>
                <button
                  onClick={() => suspendStore(store._id)}
                  className="bg-yellow-500 text-white px-3 py-1 rounded"
                >
                  Suspend
                </button>
                <button
                  onClick={() => deleteStore(store._id)}
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Layout>
  );
}

function Card({ title, value }) {
  return (
    <div className="p-6 bg-white shadow rounded w-40 text-center">
      <h4 className="text-gray-600">{title}</h4>
      <h2 className="text-2xl font-bold mt-2">{value}</h2>
    </div>
  );
}