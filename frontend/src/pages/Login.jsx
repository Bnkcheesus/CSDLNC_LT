import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import logo from "../assets/logo.png";

export default function Login() {
  const [maTK, setMaTK] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { maTK, password });
      if (res.data.success) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("role", res.data.role);
        localStorage.setItem("maTK", res.data.maTK);

        switch (res.data.role) {
          case 'customer':
            navigate('/customer/home');
            break;
          case 'admin':
            navigate('/admin/home');
            break;
          case 'receptionist':
            navigate('/reception/home');
            break;
          case 'sales':
            navigate('/sales/home');
            break;
          case 'doctor':
            navigate('/doctor/home');
            break;
          default:
            navigate('/login');
        }
      }
    } catch (err) {
        if (err.response) {
            setError(err.response.data.message);
        } else {
            setError('Network error. Backend might be offline.');
        }
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100">
      <div className="bg-white shadow-2xl rounded-xl p-10 w-[380px]">
        <div className="flex justify-center mb-6">
          <img
            src={logo}
            alt="PetCare Logo"
            className="w-24 h-24 object-contain"
          />
        </div>
        <h2 className="text-2xl font-bold text-center mb-6">Đăng nhập</h2>

        {error && (
          <div className="bg-red-100 text-red-600 px-4 py-2 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>

          {/* ID Input */}
          <div className="mb-4">
            <label className="block mb-1 font-semibold">ID</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2 focus:ring focus:border-blue-500"
              value={maTK}
              onChange={(e) => setMaTK(e.target.value)}
              required
            />
          </div>

          {/* Password Input */}
          <div className="mb-6">
            <label className="block mb-1 font-semibold">Password</label>
            <input
              type="password"
              className="w-full border rounded px-3 py-2 focus:ring focus:border-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Submit */}
          <button
            disabled={loading}
            className="w-full bg-blue-800 hover:bg-blue-700 text-white py-2 rounded font-semibold"
          >
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>
      </div>
    </div>
  );
}