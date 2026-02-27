import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      console.log("LOGIN BUTTON CLICKED");

      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        { email, password }
      );

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);

      if (res.data.role === "superadmin") {
        navigate("/superadmin");
      } else {
        navigate("/dashboard");
      }

    } catch (err) {
      console.log("ERROR:", err.response);
      alert(err.response?.data?.msg || "Login failed");
    }
  };

  return (
    <div style={{ padding: "50px" }}>
      <h2>Kirana SaaS Login</h2>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <br /><br />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <br /><br />

      <button type="button" onClick={handleLogin}>
        Login
      </button>
    </div>
  );
}