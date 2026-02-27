import { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";

export default function Udhaar() {
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        "http://localhost:5000/api/customers",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setCustomers(res.data);
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  return (
    <Layout>
      <h2 className="text-2xl font-bold mb-6">Udhaar Ledger</h2>

      <table className="w-full bg-white shadow rounded">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-3 text-left">Customer</th>
            <th className="p-3 text-left">Balance</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((c) => (
            <tr key={c._id} className="border-t">
              <td className="p-3">{c.name}</td>
              <td className="p-3">₹ {c.totalDue || 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Layout>
  );
}