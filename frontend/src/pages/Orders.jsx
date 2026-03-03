import { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";

export default function Orders() {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [paymentType, setPaymentType] = useState("cash");
  const [receipt, setReceipt] = useState(null);

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };
  const storeName = localStorage.getItem("name") || "Kirana Store";

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    const [custRes, prodRes, orderRes] = await Promise.all([
      axios.get("http://localhost:5000/api/customers", { headers }),
      axios.get("http://localhost:5000/api/products", { headers }),
      axios.get("http://localhost:5000/api/orders", { headers }),
    ]);
    setCustomers(custRes.data);
    setProducts(prodRes.data);
    setOrders(orderRes.data);
  };

  const createOrder = async () => {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/orders",
        {
          customerId: selectedCustomer,
          paymentType,
          items: [{ productId: selectedProduct, quantity: Number(quantity) }]
        },
        { headers }
      );
      setReceipt(res.data);
      fetchAll();
    } catch (err) {
      alert(err.response?.data?.msg || "Order failed");
    }
  };

  const printReceipt = () => {
    window.print();
  };

  const selectedProductData = products.find(p => p._id === selectedProduct);
  const selectedCustomerData = customers.find(c => c._id === selectedCustomer);

  return (
    <Layout>
      <h2 className="text-2xl font-bold mb-6">Orders</h2>

      {/* Receipt Popup */}
      {receipt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg p-8 w-96 print:shadow-none" id="receipt">
            <div className="text-center mb-4">
              <h2 className="text-xl font-bold">{storeName}</h2>
              <p className="text-gray-500 text-sm">Receipt</p>
              <p className="text-gray-400 text-xs">{new Date().toLocaleDateString("en-IN")}</p>
            </div>

            <hr className="my-3" />

            <div className="mb-3">
              <p className="text-sm text-gray-500">Customer</p>
              <p className="font-semibold">{selectedCustomerData?.name || "N/A"}</p>
            </div>

            <table className="w-full text-sm mb-3">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-1">Item</th>
                  <th className="text-right py-1">Qty</th>
                  <th className="text-right py-1">Price</th>
                  <th className="text-right py-1">Total</th>
                </tr>
              </thead>
              <tbody>
                {receipt.items?.map((item, i) => (
                  <tr key={i} className="border-b">
                    <td className="py-1">{selectedProductData?.name || "Product"}</td>
                    <td className="text-right py-1">{item.quantity}</td>
                    <td className="text-right py-1">₹{item.price}</td>
                    <td className="text-right py-1">₹{item.quantity * item.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-between font-bold text-lg mt-2">
              <span>Total</span>
              <span>₹ {receipt.totalAmount}</span>
            </div>

            <div className="mt-2 text-sm text-gray-500">
              Payment: <span className={`font-semibold ${receipt.paymentType === "cash" ? "text-green-600" : "text-red-500"}`}>
                {receipt.paymentType === "cash" ? "Cash" : "Udhaar"}
              </span>
            </div>

            <hr className="my-4" />
            <p className="text-center text-xs text-gray-400">Thank you for shopping! 🙏</p>

            <div className="flex gap-3 mt-6 print:hidden">
              <button
                onClick={printReceipt}
                className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
              >
                🖨️ Print
              </button>
              <button
                onClick={() => setReceipt(null)}
                className="flex-1 bg-gray-400 text-white py-2 rounded hover:bg-gray-500"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Order Form */}
      <div className="bg-white shadow rounded p-6 max-w-md mb-8">
        <h3 className="font-bold text-lg mb-4">Create New Order</h3>

        <div className="mb-4">
          <label className="block text-gray-600 mb-1">Customer</label>
          <select
            className="w-full border p-2 rounded"
            onChange={(e) => setSelectedCustomer(e.target.value)}
          >
            <option>Select Customer</option>
            {customers.map((c) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-gray-600 mb-1">Product</label>
          <select
            className="w-full border p-2 rounded"
            onChange={(e) => setSelectedProduct(e.target.value)}
          >
            <option>Select Product</option>
            {products.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name} - ₹{p.price} (Stock: {p.quantity})
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-gray-600 mb-1">Quantity</label>
          <input
            className="w-full border p-2 rounded"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-600 mb-1">Payment Type</label>
          <select
            className="w-full border p-2 rounded"
            onChange={(e) => setPaymentType(e.target.value)}
          >
            <option value="cash">Cash</option>
            <option value="udhaar">Udhaar</option>
          </select>
        </div>

        <button
          onClick={createOrder}
          className="bg-blue-600 text-white px-6 py-2 rounded w-full hover:bg-blue-700"
        >
          Create Order
        </button>
      </div>

      {/* Orders List */}
      <h3 className="font-bold text-lg mb-4">Past Orders</h3>
      <table className="w-full bg-white shadow rounded">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-3 text-left">Customer</th>
            <th className="p-3 text-left">Items</th>
            <th className="p-3 text-left">Total</th>
            <th className="p-3 text-left">Payment</th>
            <th className="p-3 text-left">Date</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o._id} className="border-t">
              <td className="p-3">{o.customerId?.name || "N/A"}</td>
              <td className="p-3">
                {o.items?.map((item, i) => (
                  <span key={i}>
                    {item.productId?.name || "Product"} x{item.quantity}
                  </span>
                ))}
              </td>
              <td className="p-3">₹ {o.totalAmount}</td>
              <td className="p-3">
                <span className={`px-2 py-1 rounded text-xs ${
                  o.paymentType === "cash"
                    ? "bg-green-100 text-green-600"
                    : "bg-red-100 text-red-600"
                }`}>
                  {o.paymentType}
                </span>
              </td>
              <td className="p-3 text-sm text-gray-500">
                {new Date(o.createdAt).toLocaleDateString("en-IN")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Layout>
  );
}