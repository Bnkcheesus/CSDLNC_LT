import { useState } from "react";
import Header from "../../components/ui/Header";
import Navbar from "../../components/ui/Navbar";
import PageTitle from "../../components/ui/PageTitle.jsx";
import axios from "axios";

export default function StaffAddCustomerPet() {
    const token = localStorage.getItem("token");

    const [customer, setCustomer] = useState({
        HoTen: "",
        SDT: "",
        CCCD: ""
    });

    const handleAddCustomer = async () => {
        try {
            if (!customer.HoTen || !customer.SDT || !customer.CCCD) {
                alert("Vui lòng điền đầy đủ thông tin khách hàng.");
                return;
            }
            const res = await axios.post("http://localhost:5000/api/staff/customers", {
                HoTen: customer.HoTen,
                SDT: customer.SDT,
                CCCD: customer.CCCD
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            if (!res.data.success) {
                alert("Đã có lỗi xảy ra khi tạo khách hàng.");
                return;
            }
            const MaTKKH = res.data.data.MaTKKH;

            alert("Khách hàng đã được tạo thành công! Mã khách hàng: " + MaTKKH);
            setCustomer({
                HoTen: "",
                SDT: "",
                CCCD: ""
            });
        } catch (err) {
            console.error("Error adding customer:", err);
            alert("Đã có lỗi xảy ra khi tạo khách hàng.");
        }
    }

    return (
    <div className="min-h-screen bg-white text-sm">
      <Header />
      <Navbar />
      <PageTitle title="Đăng ký khách hàng mới" />

      <div className="max-w-5xl mx-auto mt-6 bg-white border rounded shadow-sm">

        <div className="p-6 border-b grid grid-cols-3 gap-4">
            <div>
                <label className="font-medium">Tên khách hàng</label>
                <input
                    type="text"
                    name="HoTen"
                    value={customer.HoTen}
                    onChange={(e) => setCustomer({ ...customer, HoTen: e.target.value })}
                    className="w-full p-2 border rounded"
                />
            </div>

            <div>
                <label className="font-medium">Số điện thoại</label>
                <input
                    type="text"
                    name="SDT"
                    value={customer.SDT}
                    onChange={(e) => setCustomer({ ...customer, SDT: e.target.value })}
                    className="w-full p-2 border rounded"
                />
            </div>

            <div>
                <label className="font-medium">CCCD</label>
                <input
                    type="text"
                    name="CCCD"
                    value={customer.CCCD}
                    onChange={(e) => setCustomer({ ...customer, CCCD: e.target.value })}
                    className="w-full p-2 border rounded"
                />
            </div>
        </div>

        {/* SUBMIT */}
        <div className="p-6 text-center">
          <button
            onClick={handleAddCustomer}
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
            Thêm khách hàng
          </button>
        </div>

      </div>
    </div>
  );
}