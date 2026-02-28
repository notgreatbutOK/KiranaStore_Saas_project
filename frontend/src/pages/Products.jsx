import { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editQuantity, setEditQuantity] = useState("");

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
      { name, price: Number(price), quantity: Number(quantity) },
      { headers }
    );
    setName("");
    setPrice("");
    setQuantity("");
    fetchProducts();
  };

  const updateQuantity = async (id) => {
    await axios.patch(
      `http://localhost:5000/api/products/${id}`,
      { quantity: Number(editQuantity) },
      { headers }
    );
    setEditingId(null);
    setEditQuantity("");
    fetchProducts();
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    await axios.delete(
      `http://localhost:5000/api/products/${id}`,
      { headers }
    );
    fetchProducts();
  };

  return (
    <Layout>
      <h2 className="text-2xl font-bold mb-6">Products</h2>

      {/* Add Product Form */}
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
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
        <input
          className="border p-2 rounded"
          placeholder="Quantity"
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />
        <button
          onClick={addProduct}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Add
        </button>
      </div>

      {/* Products Table */}
      <table className="w-full bg-white shadow rounded">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-3 text-left">Name</th>
            <th className="p-3 text-left">Price</th>
            <th className="p-3 text-left">Stock</th>
            <th className="p-3 text-left">Status</th>
            <th className="p-3 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p._id} className="border-t">
              <td className="p-3">{p.name}</td>
              <td className="p-3">₹ {p.price}</td>
              <td className="p-3">{p.quantity}</td>
              <td className="p-3">
                {p.quantity === 0 ? (
                  <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-sm">
                    Out of Stock
                  </span>
                ) : p.quantity < 5 ? (
                  <span className="bg-yellow-100 text-yellow-600 px-2 py-1 rounded text-sm">
                    Low Stock
                  </span>
                ) : (
                  <span className="bg-green-100 text-green-600 px-2 py-1 rounded text-sm">
                    In Stock
                  </span>
                )}
              </td>
              <td className="p-3">
                {editingId === p._id ? (
                  <div className="flex gap-2">
                    <input
                      className="border p-1 rounded w-20"
                      type="number"
                      value={editQuantity}
                      onChange={(e) => setEditQuantity(e.target.value)}
                      placeholder="Qty"
                    />
                    <button
                      onClick={() => updateQuantity(p._id)}
                      className="bg-green-500 text-white px-2 py-1 rounded text-sm"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="bg-gray-400 text-white px-2 py-1 rounded text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingId(p._id);
                        setEditQuantity(p.quantity);
                      }}
                      className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteProduct(p._id)}
                      className="bg-red-500 text-white px-3 py-1 rounded text-sm"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Layout>
  );
}