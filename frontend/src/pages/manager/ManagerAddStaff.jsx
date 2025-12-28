import { useState, useEffect } from "react";
import Header from "../../components/ui/Header";
import Navbar from "../../components/ui/Navbar";
import PageTitle from "../../components/ui/PageTitle.jsx";
import axios from "axios";

export default function ManagerAddStaff() {
    const token = localStorage.getItem("token");
    const [branch, setBranch] = useState({
        MaCN: "",
        TenCN: ""
    });

    const [staff, setStaff] = useState({
        HoTen: "",
        NgayVaoLam: "",
        ChucVu: "",
        LuongCoBan: 0
    });

    useEffect(() => {
        if (!token) return;
        
        const fetchBranchInfo = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/staff/profile`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });
                if (res.data.success) {
                    setBranch({
                        MaCN: res.data.data.MaCN,
                        TenCN: res.data.data.TenCN
                    });
                } else {
                    console.error("Failed to fetch branch info:", res.data.message);
                }
            } catch (err) {
                console.error("Error fetching branch info:", err);
            }
        };

        fetchBranchInfo();
    }, [token]);


    const handleAddStaff = async () => {
        try {
            if (!branch.MaCN) {
                return;
            }
            if (!staff.HoTen || !staff.NgayVaoLam || !staff.ChucVu) {
                alert("Vui lòng điền đầy đủ thông tin nhân viên.");
                return;
            }
            const res = await axios.post("http://localhost:5000/api/manager/staffs", {
                HoTen: staff.HoTen,
                NgayVaoLam: staff.NgayVaoLam,
                ChucVu: staff.ChucVu,
                LuongCoBan: staff.LuongCoBan,
                MaCN: branch.MaCN
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            if (!res.data.success) {
                alert("Đã có lỗi xảy ra khi tạo nhân viên.");
                return;
            }
            const MaTKNV = res.data.data.MaTKNV;

            alert("Nhân viên đã được tạo thành công! Mã nhân viên: " + MaTKNV);
            setStaff({
                HoTen: "",
                NgayVaoLam: "",
                ChucVu: "",
                LuongCoBan: 0
            });
        } catch (err) {
            console.error("Error adding staff:", err);
            alert("Đã có lỗi xảy ra khi tạo nhân viên.");
        }
    }

    return (
    <div className="min-h-screen bg-white text-sm">
      <Header />
      <Navbar />
      <PageTitle title={`Thêm nhân viên mới - ${branch.TenCN}`} />

      <div className="max-w-5xl mx-auto mt-6 bg-white border rounded shadow-sm">
        <div className="p-6 border-b grid grid-cols-2 gap-4">
            <div>
                <label className="font-medium">Tên nhân viên</label>
                <input
                    type="text"
                    name="HoTen"
                    value={staff.HoTen}
                    onChange={(e) => setStaff({ ...staff, HoTen: e.target.value })}
                    className="w-full p-2 border rounded"
                />
            </div>

            <div>
                <label className="font-medium">Ngày vào làm</label>
                <input
                    type="date"
                    name="NgayVaoLam"
                    min={new Date().toISOString().split("T")[0]}
                    value={staff.NgayVaoLam}
                    onChange={(e) => setStaff({ ...staff, NgayVaoLam: e.target.value })}
                    className="w-full p-2 border rounded"
                />
            </div>

            <div>
                <label className="font-medium">Chức vụ</label>
                <div className="flex items-center gap-6">
                {["NVTT", "NVBH", "BSTY"].map((g) => (
                    <label key={g} className="flex items-center gap-2">
                    <input
                        type="radio"
                        name="ChucVu"
                        value={g}
                        checked={staff.ChucVu === g}
                        onChange={(e) => setStaff({ ...staff, ChucVu: e.target.value })}
                    />
                    {g}
                    </label>
                ))}
                </div>
            </div>

            <div>
                <label className="font-medium">Lương cơ bản</label>
                <input
                    type="number"
                    name="LuongCoBan"
                    value={staff.LuongCoBan}
                    step={100000}
                    onChange={(e) => setStaff({ ...staff, LuongCoBan: Number(e.target.value) })}
                    className="w-full p-2 border rounded"
                />
            </div>
        </div>

        {/* SUBMIT */}
        <div className="p-6 text-center">
          <button
            onClick={handleAddStaff}
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
            Thêm nhân viên
          </button>
        </div>

      </div>
    </div>
  );
}