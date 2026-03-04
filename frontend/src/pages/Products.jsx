import { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";

const CATEGORIES = ["General", "Groceries", "Dairy", "Meat & Fish", "Fruits & Vegetables", "Beverages", "Snacks", "Cleaning", "Personal Care"];

export default function Products() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("pieces");
  const [category, setCategory] = useState("General");
  const [image, setImage] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editQuantity, setEditQuantity] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const fetchProducts = async () => {
    const res = await axios.get("http://localhost:5000/api/products", { headers });
    setProducts(res.data);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const addProduct = async () => {
    if (!name || !price || !quantity) return alert("Fill all fields!");
    const formData = new FormData();
    formData.append("name", name);
    formData.append("price", price);
    formData.append("quantity", quantity);
    formData.append("unit", unit);
    formData.append("category", category);
    if (image) formData.append("image", image);

    await axios.post("http://localhost:5000/api/products", formData, {
      headers: { ...headers, "Content-Type": "multipart/form-data" }
    });
    setName(""); setPrice(""); setQuantity(""); setUnit("pieces"); setCategory("General"); setImage(null);
    fetchProducts();
  };

  const updateProduct = async (id) => {
    await axios.patch(
      `http://localhost:5000/api/products/${id}`,
      { quantity: Number(editQuantity), price: Number(editPrice) },
      { headers }
    );
    setEditingId(null); setEditQuantity(""); setEditPrice("");
    fetchProducts();
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    await axios.delete(`http://localhost:5000/api/products/${id}`, { headers });
    fetchProducts();
  };

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCategory = categoryFilter === "All" || p.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <Layout>
      <h2 className="text-2xl font-bold mb-6">Products</h2>

      {/* Add Product Form */}
      <div className="bg-white shadow rounded p-4 mb-6">
        <h3 className="font-bold mb-3">Add New Product</h3>
        <div className="flex gap-3 flex-wrap items-end">
          <div>
            <label className="block text-gray-500 text-xs mb-1">Name</label>
            <input
              className="border p-2 rounded"
              placeholder="Product Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-gray-500 text-xs mb-1">Price ₹</label>
            <input
              className="border p-2 rounded w-28"
              placeholder="Price"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-gray-500 text-xs mb-1">Quantity</label>
            <input
              className="border p-2 rounded w-28"
              placeholder="Quantity"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-gray-500 text-xs mb-1">Unit</label>
            <select className="border p-2 rounded" value={unit} onChange={(e) => setUnit(e.target.value)}>
              <option value="pieces">Pieces</option>
              <option value="kg">KG</option>
              <option value="grams">Grams</option>
              <option value="liters">Liters</option>
              <option value="ml">ML</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-500 text-xs mb-1">Category</label>
            <select className="border p-2 rounded" value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-gray-500 text-xs mb-1">Image (optional)</label>
            <input
              type="file"
              accept="image/*"
              className="border p-2 rounded text-sm"
              onChange={(e) => setImage(e.target.files[0])}
            />
          </div>
          <button onClick={addProduct} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Add Product
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <input
          className="border p-2 rounded w-72"
          placeholder="🔍 Search products..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
        />
        <select
          className="border p-2 rounded"
          value={categoryFilter}
          onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
        >
          <option value="All">All Categories</option>
          {CATEGORIES.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Products Table */}
      <div className="overflow-x-auto">
        <table className="w-full bg-white shadow rounded">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-3 text-left">Image</th>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Category</th>
              <th className="p-3 text-left">Price</th>
              <th className="p-3 text-left">Stock</th>
              <th className="p-3 text-left">Unit</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((p) => (
              <tr key={p._id} className="border-t">
                <td className="p-3">
                  {p.image ? (
                    <img src={p.image} alt={p.name} className="w-12 h-12 object-cover rounded" />
                  ) : (
                    <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center text-gray-400 text-xs">
                      No img
                    </div>
                  )}
                </td>
                <td className="p-3 font-medium">{p.name}</td>
                <td className="p-3">
                  <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded text-xs">
                    {p.category || "General"}
                  </span>
                </td>
                <td className="p-3">₹ {p.price}</td>
                <td className="p-3">{p.quantity} {p.unit || "pieces"}</td>
                <td className="p-3 text-sm text-gray-500">{p.unit || "pieces"}</td>
                <td className="p-3">
                  {p.quantity === 0 ? (
                    <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-sm">Out of Stock</span>
                  ) : p.quantity < 5 ? (
                    <span className="bg-yellow-100 text-yellow-600 px-2 py-1 rounded text-sm">Low Stock</span>
                  ) : (
                    <span className="bg-green-100 text-green-600 px-2 py-1 rounded text-sm">In Stock</span>
                  )}
                </td>
                <td className="p-3">
                  {editingId === p._id ? (
                    <div className="flex gap-2">
                      <input className="border p-1 rounded w-20" type="number" value={editQuantity} onChange={(e) => setEditQuantity(e.target.value)} placeholder="Qty" />
                      <input className="border p-1 rounded w-20" type="number" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} placeholder="Price" />
                      <button onClick={() => updateProduct(p._id)} className="bg-green-500 text-white px-2 py-1 rounded text-sm">Save</button>
                      <button onClick={() => setEditingId(null)} className="bg-gray-400 text-white px-2 py-1 rounded text-sm">Cancel</button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button onClick={() => { setEditingId(p._id); setEditQuantity(p.quantity); setEditPrice(p.price); }} className="bg-blue-500 text-white px-3 py-1 rounded text-sm">Edit</button>
                      <button onClick={() => deleteProduct(p._id)} className="bg-red-500 text-white px-3 py-1 rounded text-sm">Delete</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {paginated.length === 0 && (
              <tr><td colSpan="8" className="p-4 text-center text-gray-400">No products found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          <button
            onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded border disabled:opacity-40 hover:bg-gray-100"
          >
            ← Prev
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 rounded border ${
                currentPage === i + 1 ? "bg-blue-600 text-white" : "hover:bg-gray-100"
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded border disabled:opacity-40 hover:bg-gray-100"
          >
            Next →
          </button>
        </div>
      )}
    </Layout>
  );
}