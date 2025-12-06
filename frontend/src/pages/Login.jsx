import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Header from '../components/ui/Header.jsx';
import Navbar from '../components/ui/Navbar.jsx';
import PageTitle from '../components/ui/PageTitle.jsx';
//import logo from "../assets/logo.png";

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
          case 'manager', 'receptionist', 'sales', 'doctor':
            navigate('/staff/home');
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
    <div className="min-h-screen bg-white text-sm"> {/* text-sm applies smaller font app-wide for this page */}
      <Header />
      <div className="h-2 bg-blue-400" />

      <PageTitle title="Đăng nhập" />

      <div className="max-w-[1000px] mx-auto px-4 py-8">
        {/* Centered rounded login box */}
        <div className="mx-auto w-full max-w-[720px] rounded-md border border-gray-300 overflow-hidden shadow-sm">
          {/* header */}
          <div className="bg-blue-200 px-6 py-3 text-center border-b border-gray-300">
            <h3 className="text-base font-semibold text-gray-800">Đăng nhập</h3>
          </div>

          {/* body: form */}
          <div className="bg-white px-8 py-8">
            {error && (
              <div className="bg-red-200 text-red-700 px-4 py-2 mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="w-full">
              {/* row: ID */}
              <div className="flex items-center mb-6">
                <label className="w-36 text-right pr-4 font-medium">ID:</label>
                <input
                  value={maTK}
                  onChange={(e) => setMaTK(e.target.value)}
                  className="flex-1 border border-gray-300 px-3 py-2 rounded focus:outline-none focus:border-2 focus:border-black"
                  required
                />
                <label className="w-20"></label>
              </div>

              {/* row: Password */}
              <div className="flex items-center mb-8">
                <label className="w-36 text-right pr-4 font-medium">Password:</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="flex-1 border border-gray-300 px-3 py-2 rounded focus:outline-none focus:border-2 focus:border-black"
                  required
                />
                <label className="w-20"></label>
              </div>

              {/* button (concave style) */}
              <div className="flex justify-center">
                <button
                  type="submit"
                  disabled={loading}
                  className="relative inline-block px-6 py-2 rounded-md bg-blue-700 text-blue-200 font-medium hover:text-white shadow-inner active:translate-y-0.5 transition-colors"
                  style={{
                    // slight bevel feel (concave)
                    boxShadow: "inset 0 3px 0 rgba(255,255,255,0.06), inset 0 -3px 0 rgba(0,0,0,0.12)",
                  }}
                >
                  {loading ? "Đang đăng nhập..." : "Login"}
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}