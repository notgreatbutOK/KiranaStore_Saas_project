import { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";

export default function Orders() {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [paymentType, setPaymentType] = useState("cash");

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchCustomers();
    fetchProducts();
  }, []);

  const fetchCustomers = async () => {
    const res = await axios.get(
      "http://localhost:5000/api/customers",
      { headers }
    );
    setCustomers(res.data);
  };

  const fetchProducts = async () => {
    const res = await axios.get(
      "http://localhost:5000/api/products",
      { headers }
    );
    setProducts(res.data);
  };

  const createOrder = async () => {
    try {
      await axios.post(
        "http://localhost:5000/api/orders",
        {
          customerId: selectedCustomer,
          paymentType,
          items: [
            {
              productId: selectedProduct,
              quantity: Number(quantity)
            }
          ]
        },
        { headers }
      );
      alert("Order Created Successfully!");
    } catch (err) {
      alert(err.response?.data?.msg || "Order failed");
    }
  };

  return (
    <Layout>
      <h2 className="text-2xl font-bold mb-6">Create Order</h2>

      <div className="bg-white shadow rounded p-6 max-w-md">

        <div className="mb-4">
          <label className="block text-gray-600 mb-1">Customer</label>
          <select
            className="w-full border p-2 rounded"
            onChange={(e) => setSelectedCustomer(e.target.value)}
          >
            <option>Select Customer</option>
            {customers.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
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
                {p.name} - ₹{p.price}
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
          className="bg-blue-600 text-white px-6 py-2 rounded w-full"
        >
          Create Order
        </button>

      </div>
    </Layout>
  );
}