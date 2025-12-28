import { useState, useEffect } from "react";
import Header from "../../components/ui/Header";
import Navbar from "../../components/ui/Navbar";
import PageTitle from "../../components/ui/PageTitle.jsx";
import axios from "axios";

export default function StaffAddCustomerPet() {
    const token = localStorage.getItem("token");

    const [customerKeyword, setCustomerKeyword] = useState("");
    const [customerResults, setCustomerResults] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);

    const [pet, setPet] = useState({
        TenTC: "",
        Loai: "",
        Giong: "",
        NgaySinh: "",
        GioiTinh: ""
    });

    const handleCustomerSearchChange = (e) => {
        setCustomerKeyword(e.target.value);
        setSelectedCustomer(null);

        if (!e.target.value.trim()) {
            setCustomerResults([]);
        }
    };

    useEffect(() => {
        if (!customerKeyword.trim()) {
            return;
        }

        const fetchCustomers = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/staff/customers?search=${customerKeyword}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                });
                if (res.data.success) {
                    setCustomerResults(res.data.data);
                } else {
                    console.error("Failed to fetch customers:", res.data.message);
                }
            } catch (err) {
                console.error("Error fetching customers:", err);
            }
        };
        fetchCustomers();
    }, [customerKeyword, token]);

    const handleAddPet = async () => {
        try {
            if (!selectedCustomer) {
                alert("Vui lòng chọn khách hàng.");
                return;
            }
            if (!pet.TenTC || !pet.Loai || !pet.Giong || !pet.NgaySinh || !pet.GioiTinh) {
                alert("Vui lòng điền đầy đủ thông tin thú cưng.");
                return;
            }
            const res = await axios.post("http://localhost:5000/api/staff/pets", {
                MaTKKH: selectedCustomer.MaTKKH,
                TenTC: pet.TenTC,
                Loai: pet.Loai,
                Giong: pet.Giong,
                NgaySinh: pet.NgaySinh,
                GioiTinh: pet.GioiTinh
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            if (!res.data.success) {
                alert("Đã có lỗi xảy ra khi tạo thú cưng.");
                return;
            }
            const MaTC = res.data.data.MaTC;

            alert("Thú cưng đã được tạo thành công! Mã thú cưng: " + MaTC);
            setSelectedCustomer(null);
            setCustomerKeyword("");
            setPet({
                TenTC: "",
                Loai: "",
                Giong: "",
                NgaySinh: "",
                GioiTinh: ""
            });
        } catch (err) {
            console.error("Error adding pet:", err);
            alert("Đã có lỗi xảy ra khi tạo thú cưng.");
        }
    }

    return (
    <div className="min-h-screen bg-white text-sm">
      <Header />
      <Navbar />
      <PageTitle title="Thêm thú cưng khách hàng" />

      <div className="max-w-5xl mx-auto mt-6 bg-white border rounded shadow-sm">

        {/* CUSTOMER */}
        <div className="p-6 border-b relative">
          <label className="font-medium">Khách hàng</label>
          <input
            value={customerKeyword}
            onChange={handleCustomerSearchChange}
            className="w-full p-2 border rounded"
            placeholder="Nhập mã hoặc tên khách hàng"
          />

          {customerResults.length > 0 && (
            <div className="absolute bg-white border w-full mt-1 z-10 max-h-40 overflow-auto">
              {customerResults.map(c => (
                <div
                  key={c.MaTKKH}
                  className="p-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    setSelectedCustomer(c);
                    setCustomerKeyword(`${c.MaTKKH} - ${c.HoTen}`);
                    setCustomerResults([]);
                  }}
                >
                  {c.MaTKKH} - {c.HoTen}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 border-b grid grid-cols-3 gap-4">
            <div>
                <label className="font-medium">Tên thú cưng</label>
                <input
                    type="text"
                    name="TenTC"
                    value={pet.TenTC}
                    onChange={(e) => setPet({ ...pet, TenTC: e.target.value })}
                    className="w-full p-2 border rounded"
                />
            </div>

            <div>
                <label className="font-medium">Loài</label>
                <input
                    type="text"
                    name="Loai"
                    value={pet.Loai}
                    onChange={(e) => setPet({ ...pet, Loai: e.target.value })}
                    className="w-full p-2 border rounded"
                />
            </div>

            <div>
                <label className="font-medium">Giống</label>
                <input
                    type="text"
                    name="Giong"
                    value={pet.Giong}
                    onChange={(e) => setPet({ ...pet, Giong: e.target.value })}
                    className="w-full p-2 border rounded"
                />
            </div>

            <div>
                <label className="font-medium">Ngày sinh</label>
                <input
                    type="date"
                    name="NgaySinh"
                    value={pet.NgaySinh}
                    onChange={(e) => setPet({ ...pet, NgaySinh: e.target.value })}
                    className="w-full p-2 border rounded"
                />
            </div>

            <div>
                <label className="font-medium">Giới tính</label>
                <div className="flex items-center gap-6">
                {["Đực", "Cái"].map((g) => (
                    <label key={g} className="flex items-center gap-2">
                    <input
                        type="radio"
                        name="gender"
                        value={g}
                        checked={pet.GioiTinh === g}
                        onChange={(e) => setPet({ ...pet, GioiTinh: e.target.value })}
                    />
                    {g}
                    </label>
                ))}
                </div>
            </div>
        </div>

        {/* SUBMIT */}
        <div className="p-6 text-center">
          <button
            onClick={handleAddPet}
            className="
              px-6 py-2 
              bg-blue-500 text-white font-medium
              rounded 
              shadow-[inset_0px_2px_4px_rgba(255,255,255,0.6),inset_0px_-3px_6px_rgba(0,0,0,0.3)]
              hover:brightness-110
              active:shadow-[inset_0px_1px_3px_rgba(0,0,0,0.4)]
              transition-all
            "
          >
            Thêm thú cưng
          </button>
        </div>

      </div>
    </div>
  );
}