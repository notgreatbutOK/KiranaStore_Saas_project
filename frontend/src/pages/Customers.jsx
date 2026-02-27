import { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const fetchCustomers = async () => {
    const res = await axios.get(
      "http://localhost:5000/api/customers",
      { headers }
    );
    setCustomers(res.data);
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const addCustomer = async () => {
    await axios.post(
      "http://localhost:5000/api/customers",
      { name, phone },
      { headers }
    );
    setName("");
    setPhone("");
    fetchCustomers();
  };

  return (
    <Layout>
      <h2 className="text-2xl font-bold mb-6">Customers</h2>

      <div className="flex gap-4 mb-6">
        <input
          className="border p-2 rounded"
          placeholder="Customer Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="border p-2 rounded"
          placeholder="Phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <button
          onClick={addCustomer}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Add
        </button>
      </div>

      <table className="w-full bg-white shadow rounded">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-3 text-left">Name</th>
            <th className="p-3 text-left">Phone</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((c) => (
            <tr key={c._id} className="border-t">
              <td className="p-3">{c.name}</td>
              <td className="p-3">{c.phone}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Layout>
  );
}