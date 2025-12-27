import React, { useEffect, useState } from "react";
import { User, Lock, Gem } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Header() {
    const [hoTen, setHoTen] = useState("");
    const [role, setRole] = useState("");
    const [branch, setBranch] = useState("");
    const [rank, setRank] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const maTK = localStorage.getItem("maTK");
                if (!maTK) return;

                const res = await axios.get(`http://localhost:5000/api/user/name`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });
                setHoTen(res.data.hoTen);
                const role = localStorage.getItem("role");
                if (role === "customer") {
                    const resCustomer = await axios.get(`http://localhost:5000/api/customer/profile`, {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                        },
                    });
                    setHoTen(resCustomer.data.data.HoTen);
                    switch (resCustomer.data.data.LoaiThanhVien) {
                        case "CB":
                            setRank(" Cơ bản");
                            break;
                        case "TT":
                            setRank(" Thân thiết");
                            break;
                        case "VIP":
                            setRank(" VIP");
                    }
                }
                else {
                    const resStaff = await axios.get(`http://localhost:5000/api/staff/profile`, {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                        },
                    });
                    setHoTen(resStaff.data.data.HoTen);
                    setBranch(` - ${resStaff.data.data.TenCN}`);
                }
                switch (role) {
                    case "customer":
                        setRole(" (Khách hàng) - ");
                        break;
                    case "receptionist":
                        setRole(" (Nhân viên tiếp tân)");
                        break;
                    case "sales":
                        setRole(" (Nhân viên bán hàng)");
                        break;
                    case "doctor":
                        setRole(" (Bác sĩ thú y)");
                        break;
                    case "manager":
                        setRole(" (Quản lý)");
                        break;
                    default:
                        setRole("");
                }
            } catch (err) {
                console.error("Error fetching header:", err);
            }
        };
        fetchUser();
    }, []);

    const handleAuthClick = () => {
        // Logout
        if (!localStorage.getItem("token")) {
            navigate("/login");
            return;
        }
        localStorage.clear();
        setHoTen("");
        setRole("");
        setBranch("");
        setRank("");
        navigate("/login");
    };

  return (
    <header className="w-full bg-gray-800 text-white text-sm">
      <div className="max-w-[1200px] mx-auto px-4 py-2 flex items-center gap-4">
        {/* left: user icon + name */}
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-sm bg-gray-700">
            <User size={16} />
          </div>
          <div className="font-semibold text-gray-200 flex items-center gap-1">
              {hoTen && <span>{hoTen}</span>}
              {role && <span>{role}</span>}
              {branch && <span>{branch}</span>}

              {rank && (
                  <>
                      <Gem size={16} />
                      <span>{rank}</span>
                  </>
              )}
          </div>
        </div>

        {/* spacer */}
        <div className="flex-1" />

        {/* right: lock icon + login/logout text */}
        <div
          className="flex items-center gap-2 cursor-pointer hover:text-blue-400 transition-colors"
          onClick={handleAuthClick}
          title={localStorage.getItem("token") ? "Logout" : "Login"}
        >
          <Lock size={16} />
          <span className="underline-offset-2">
            {localStorage.getItem("token") ? "Logout" : "Login"}
          </span>
        </div>
      </div>
    </header>
  );
}