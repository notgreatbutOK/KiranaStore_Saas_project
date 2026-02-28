import { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";

export default function Udhaar() {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    const res = await axios.get(
      "http://localhost:5000/api/customers",
      { headers }
    );
    setCustomers(res.data);
  };

  const recordPayment = async () => {
    if (!selectedCustomer) return alert("Select a customer first!");
    if (!amount) return alert("Enter amount!");
    try {
      await axios.post(
        "http://localhost:5000/api/udhaar/payment",
        {
          customerId: selectedCustomer._id,
          amount: Number(amount),
          description: description || "Payment received"
        },
        { headers }
      );
      alert("Payment recorded!");
      setAmount("");
      setDescription("");
      setSelectedCustomer(null);
      fetchCustomers();
    } catch (err) {
      alert(err.response?.data?.msg || "Failed");
    }
  };

  return (
    <Layout>
      <h2 className="text-2xl font-bold mb-6">Udhaar Ledger</h2>

      {/* Customers Table */}
      <table className="w-full bg-white shadow rounded mb-8">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-3 text-left">Customer</th>
            <th className="p-3 text-left">Phone</th>
            <th className="p-3 text-left">Total Due</th>
            <th className="p-3 text-left">Action</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((c) => (
            <tr key={c._id} className="border-t">
              <td className="p-3">{c.name}</td>
              <td className="p-3">{c.phone}</td>
              <td className="p-3 font-bold text-red-500">
                ₹ {c.totalDue || 0}
              </td>
              <td className="p-3">
                {c.totalDue > 0 && (
                  <button
                    onClick={() => setSelectedCustomer(c)}
                    className="bg-green-500 text-white px-3 py-1 rounded text-sm"
                  >
                    Record Payment
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Payment Form */}
      {selectedCustomer && (
        <div className="bg-white shadow rounded p-6 max-w-md">
          <h3 className="font-bold text-lg mb-4">
            Record Payment for {selectedCustomer.name}
          </h3>
          <p className="text-gray-500 mb-4">
            Total Due: <span className="text-red-500 font-bold">₹ {selectedCustomer.totalDue}</span>
          </p>

          <div className="mb-4">
            <label className="block text-gray-600 mb-1">Amount Paid</label>
            <input
              className="w-full border p-2 rounded"
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-600 mb-1">Note (optional)</label>
            <input
              className="w-full border p-2 rounded"
              placeholder="e.g. Paid by cash"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={recordPayment}
              className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600"
            >
              Confirm Payment
            </button>
            <button
              onClick={() => setSelectedCustomer(null)}
              className="bg-gray-400 text-white px-6 py-2 rounded hover:bg-gray-500"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
}