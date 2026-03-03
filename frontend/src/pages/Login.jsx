import { useState } from "react";
import { useNavigate} from "react-router-dom";
import axios from "axios";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        { email, password }
      );

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("subscriptionPlan", res.data.subscriptionPlan);
      localStorage.setItem("trialDaysLeft", res.data.trialDaysLeft || "");
      localStorage.setItem("name", res.data.name);

      if (res.data.role === "superadmin") {
        navigate("/superadmin");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      const msg = err.response?.data?.msg || "Login failed";
      if (msg.includes("trial has expired") || msg.includes("subscription has expired")) {
        navigate("/trial-expired");
      } else {
        alert(msg);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded shadow w-96">

        <h2 className="text-2xl font-bold text-center text-blue-900 mb-2">
          Kirana SaaS
        </h2>
        <p className="text-center text-gray-500 mb-6">
          Login to your store
        </p>

        <div className="mb-4">
          <label className="block text-gray-600 mb-1">Email</label>
          <input
            className="w-full border p-2 rounded"
            type="email"
            placeholder="store@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-600 mb-1">Password</label>
          <input
            className="w-full border p-2 rounded"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button
          onClick={handleLogin}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Login
        </button>

        

      </div>
    </div>
  );
}