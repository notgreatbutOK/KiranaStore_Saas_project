import { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const fetchProducts = async () => {
    const res = await axios.get(
      "http://localhost:5000/api/products",
      { headers }
    );
    setProducts(res.data);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const addProduct = async () => {
    await axios.post(
      "http://localhost:5000/api/products",
      { name, price },
      { headers }
    );
    setName("");
    setPrice("");
    fetchProducts();
  };

  return (
    <Layout>
      <h2 className="text-2xl font-bold mb-6">Products</h2>

      <div className="flex gap-4 mb-6">
        <input
          className="border p-2 rounded"
          placeholder="Product Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="border p-2 rounded"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
        <button
          onClick={addProduct}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Add
        </button>
      </div>

      <table className="w-full bg-white shadow rounded">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-3 text-left">Name</th>
            <th className="p-3 text-left">Price</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p._id} className="border-t">
              <td className="p-3">{p.name}</td>
              <td className="p-3">₹ {p.price}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Layout>
  );
}