import { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const fetchCustomers = async () => {
    const res = await axios.get("http://localhost:5000/api/customers", { headers });
    setCustomers(res.data);
  };

  useEffect(() => { fetchCustomers(); }, []);

  const addCustomer = async () => {
    await axios.post("http://localhost:5000/api/customers", { name, phone }, { headers });
    setName(""); setPhone("");
    fetchCustomers();
  };

  const deleteCustomer = async (id) => {
    if (!window.confirm("Delete this customer?")) return;
    await axios.delete(`http://localhost:5000/api/customers/${id}`, { headers });
    fetchCustomers();
  };

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  );

  return (
    <Layout>
      <h2 className="text-2xl font-bold mb-6">Customers</h2>

      <div className="flex gap-4 mb-6">
        <input className="border p-2 rounded" placeholder="Customer Name" value={name} onChange={(e) => setName(e.target.value)} />
        <input className="border p-2 rounded" placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <button onClick={addCustomer} className="bg-blue-600 text-white px-4 py-2 rounded">Add</button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          className="border p-2 rounded w-72"
          placeholder="🔍 Search by name or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <table className="w-full bg-white shadow rounded">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-3 text-left">Name</th>
            <th className="p-3 text-left">Phone</th>
            <th className="p-3 text-left">Total Due</th>
            <th className="p-3 text-left">Action</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((c) => (
            <tr key={c._id} className="border-t">
              <td className="p-3">{c.name}</td>
              <td className="p-3">{c.phone}</td>
              <td className="p-3 font-bold text-red-500">{c.totalDue > 0 ? `₹ ${c.totalDue}` : "-"}</td>
              <td className="p-3">
                <button onClick={() => deleteCustomer(c._id)} className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600">Delete</button>
              </td>
            </tr>
          ))}
          {filtered.length === 0 && (
            <tr><td colSpan="4" className="p-4 text-center text-gray-400">No customers found</td></tr>
          )}
        </tbody>
      </table>
    </Layout>
  );
}