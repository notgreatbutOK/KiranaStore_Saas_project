import { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";

export default function Udhaar() {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [ledger, setLedger] = useState([]);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    const res = await axios.get("http://localhost:5000/api/customers", { headers });
    setCustomers(res.data);
  };

  const fetchLedger = async (customerId) => {
    const res = await axios.get(`http://localhost:5000/api/udhaar/${customerId}`, { headers });
    setLedger(res.data);
  };

  const selectCustomer = (c) => {
    setSelectedCustomer(c);
    fetchLedger(c._id);
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
      setAmount("");
      setDescription("");
      fetchCustomers();
      fetchLedger(selectedCustomer._id);
    } catch (err) {
      alert(err.response?.data?.msg || "Failed");
    }
  };

  return (
    <Layout>
      <h2 className="text-2xl font-bold mb-6">💸 Udhaar Ledger</h2>

      <div className="grid grid-cols-2 gap-6">

        {/* Left — Customers List */}
        <div>
          <h3 className="font-bold text-lg mb-4">Customers</h3>
          <table className="w-full bg-white shadow rounded">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Phone</th>
                <th className="p-3 text-left">Due</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr
                  key={c._id}
                  className={`border-t cursor-pointer hover:bg-blue-50 ${
                    selectedCustomer?._id === c._id ? "bg-blue-100" : ""
                  }`}
                  onClick={() => selectCustomer(c)}
                >
                  <td className="p-3">{c.name}</td>
                  <td className="p-3 text-sm text-gray-500">{c.phone}</td>
                  <td className="p-3 font-bold text-red-500">
                    {c.totalDue > 0 ? `₹ ${c.totalDue}` : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Right — Ledger + Payment Form */}
        <div>
          {selectedCustomer ? (
            <>
              <h3 className="font-bold text-lg mb-2">
                📒 {selectedCustomer.name}'s History
              </h3>
              <p className="text-red-500 font-bold mb-4">
                Total Due: ₹ {selectedCustomer.totalDue}
              </p>

              {/* Payment Form */}
              {selectedCustomer.totalDue > 0 && (
                <div className="bg-white shadow rounded p-4 mb-4">
                  <h4 className="font-semibold mb-3">Record Payment</h4>
                  <div className="flex gap-3 mb-3">
                    <input
                      className="border p-2 rounded w-32"
                      type="number"
                      placeholder="Amount"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                    <input
                      className="border p-2 rounded flex-1"
                      placeholder="Note (optional)"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                  <button
                    onClick={recordPayment}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                  >
                    Confirm Payment
                  </button>
                </div>
              )}

              {/* Ledger History */}
              <div className="bg-white shadow rounded">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-3 text-left text-sm">Type</th>
                      <th className="p-3 text-left text-sm">Amount</th>
                      <th className="p-3 text-left text-sm">Note</th>
                      <th className="p-3 text-left text-sm">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ledger.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="p-4 text-center text-gray-400">
                          No history yet
                        </td>
                      </tr>
                    ) : (
                      ledger.map((l) => (
                        <tr key={l._id} className="border-t">
                          <td className="p-3">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              l.type === "credit"
                                ? "bg-red-100 text-red-600"
                                : "bg-green-100 text-green-600"
                            }`}>
                              {l.type === "credit" ? "🔴 Credit" : "🟢 Payment"}
                            </span>
                          </td>
                          <td className="p-3 font-bold">₹ {l.amount}</td>
                          <td className="p-3 text-sm text-gray-500">{l.description || "-"}</td>
                          <td className="p-3 text-sm text-gray-500">
                            {new Date(l.createdAt).toLocaleDateString("en-IN")}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="bg-white shadow rounded p-8 text-center text-gray-400">
              👈 Click a customer to see their history
            </div>
          )}
        </div>

      </div>
    </Layout>
  );
}