import { useState } from "react";
import axios from "axios";
import { API_URL } from "../auth/api";
function Login({ onLoginSuccess }) {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const endpoint = isRegistering ? "/register" : "/login";
      const response = await axios.post(`${API_URL}${endpoint}`, formData);

      if (isRegistering) {
        alert("Đăng ký thành công! Vui lòng đăng nhập.");
        setIsRegistering(false);
        return;
      }

      const { token } = response.data;
      localStorage.setItem("token", token);
      onLoginSuccess(token);
    } catch (error) {
      setError(error.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  return (
    <div className="login-container">
      <h2>{isRegistering ? "Đăng Ký" : "Đăng Nhập"}</h2>
      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div>
          <label>Username:</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>

        {isRegistering && (
          <div>
            <label>Email:</label>
            <input type="email" name="email" onChange={handleChange} required />
          </div>
        )}

        <div>
          <label>Password:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit">{isRegistering ? "Đăng Ký" : "Đăng Nhập"}</button>
      </form>

      <button
        className="toggle-auth"
        onClick={() => setIsRegistering(!isRegistering)}
      >
        {isRegistering
          ? "Đã có tài khoản? Đăng nhập"
          : "Chưa có tài khoản? Đăng ký"}
      </button>
    </div>
  );
}

export default Login;
