import { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";

export default function StoreDashboard() {
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);

  const token = localStorage.getItem("token");

  const fetchData = async () => {
    try {
      const productRes = await axios.get(
        "http://localhost:5000/api/products",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const customerRes = await axios.get(
        "http://localhost:5000/api/customers",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const orderRes = await axios.get(
        "http://localhost:5000/api/orders",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setProducts(productRes.data);
      setCustomers(customerRes.data);
      setOrders(orderRes.data);

    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Layout>
      <h2 className="text-2xl font-bold mb-6">🏪 Store Dashboard</h2>

      <div className="flex gap-6">
        <Card title="Total Products" value={products.length} />
        <Card title="Total Customers" value={customers.length} />
        <Card title="Total Orders" value={orders.length} />
      </div>
    </Layout>
  );
}

function Card({ title, value }) {
  return (
    <div className="p-6 bg-white shadow rounded w-48 text-center">
      <h4 className="text-gray-600">{title}</h4>
      <h2 className="text-2xl font-bold mt-2">{value}</h2>
    </div>
  );
}