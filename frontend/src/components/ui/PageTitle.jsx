import React from 'react';
import { Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PageTitle({ title }) {
    const navigate = useNavigate();
    const role = localStorage.getItem('role');

    const goHome = () => {
        if (!role) return navigate('/login');
        if (role === 'customer') return navigate('/customer/home');
        if (['manager', 'receptionist', 'sales', 'doctor'].includes(role)) {
            return navigate('/staff/home');
        }
        return navigate('/login');
    };

  return (
    <div className="w-full bg-gray-100">
      <div className="max-w-[1200px] mx-auto px-4 py-4 flex items-center">
        <div className="flex-1">
          <h2 className="text-base font-semibold text-gray-700">{title}</h2>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={goHome}
            disabled={!role}
            className={`p-2 rounded hover:bg-gray-200 transition-colors ${!role ? "opacity-40 cursor-not-allowed" : ""}`}
            title={role ? "Go to Home" : "Login to access Home"}
          >
            <Home size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}