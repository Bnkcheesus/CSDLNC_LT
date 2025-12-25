import { useState, useEffect } from "react";
import Header from "../../components/ui/Header";
import Navbar from "../../components/ui/Navbar";
import PageTitle from "../../components/ui/PageTitle.jsx";
import AddServiceBox from "../../components/ui/AddServiceBox.jsx";
import axios from "axios";

export default function CustomerAddAppointment() {
    const token = localStorage.getItem("token");
    const [customer, setCustomer] = useState({
        MaTKKH: localStorage.getItem("maTK"),
        HoTen: ""
    });

    const [branches, setBranches] = useState([]);
    const [selectedBranch, setSelectedBranch] = useState(null);
    const [date, setDate] = useState(null);

    const [services, setServices] = useState([]);

    useEffect(() => {
        const fetchCustomerName = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/user/name`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                });
                if (res.data.success) {
                    setCustomer({
                        MaTKKH: localStorage.getItem("maTK"),
                        HoTen: res.data.hoTen
                    });
                } else {
                    console.error("Failed to fetch customer name:", res.data.message);
                }
            } catch (err) {
                console.error("Error fetching customer name:", err);
            }
        };
        fetchCustomerName();
    }, [token]);

    useEffect(() => {
        const fetchBranches = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/user/branches`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                });
                if (res.data.success) {
                    setBranches(res.data.data);
                } else {
                    console.error("Failed to fetch branches:", res.data.message);
                }
            } catch (err) {
                console.error("Error fetching branches:", err);
            }
        };
        fetchBranches();
    }, [token]);

    const handleSubmitInvoice = async () => {
        try {
            if (!selectedBranch) {
                alert("Vui lòng chọn chi nhánh.");
                return;
            }
            if (!date) {
                alert("Vui lòng chọn ngày hẹn.");
                return;
            }
            if (services.length === 0) {
                alert("Vui lòng thêm dịch vụ.");
                return;
            }
            const res = await axios.post("http://localhost:5000/api/customer/appointment", {
                MaCN: selectedBranch.MaCN,
                NgayHen: date
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });

            const MaHD = res.data.data.MaHD;

            for (const service of services) {
                await axios.post("http://localhost:5000/api/customer/appointment/service", {
                    MaHD: MaHD,
                    LoaiDV: service.LoaiDV,
                    MaBS: service.MaBS,
                    MaTC: service.MaTC
                }, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                });
            }

            alert("Đặt hẹn thành công!");
            setSelectedBranch(null);
            setServices([]);
        } catch (err) {
            console.error("Error submitting service invoice:", err);
            alert("Đã có lỗi xảy ra khi đặt hẹn.");
        }
    }

    return (
    <div className="min-h-screen bg-white text-sm">
      <Header />
      <Navbar />
      <PageTitle title="Đặt lịch khám & tiêm" />

      <div className="max-w-5xl mx-auto mt-6 bg-white border rounded shadow-sm">

        {/* CUSTOMER INFO */}
        <div className="p-6 grid grid-cols-3 gap-4 border-b">
          <div>
            <label className="font-medium">Mã khách hàng</label>
            <input value={customer.MaTKKH} disabled className="w-full p-2 border bg-gray-100 rounded" />
          </div>
          <div>
            <label className="font-medium">Tên khách hàng</label>
            <input value={customer.HoTen} disabled className="w-full p-2 border bg-gray-100 rounded" />
          </div>
        </div>

        {/* BRANCH */}
        <div className="p-6 border-b grid grid-cols-2 gap-4">
            <div>
                <label className="font-medium">Chi nhánh</label>
                <select
                    value={selectedBranch ? selectedBranch.MaCN : ""}
                    onChange={e => setSelectedBranch(branches.find(b => b.MaCN === e.target.value))}
                    className="w-full p-2 border rounded"
                >
                    <option value="">-- Chọn chi nhánh --</option>
                    {branches.map(b => (
                        <option key={b.MaCN} value={b.MaCN}>{b.TenCN}</option>
                    ))}
                </select>
            </div>
                
            <div>
                <label className="font-medium">Ngày hẹn</label>
                <input
                    type="date"
                    name="NgayHen"
                    value={date || ""}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full p-2 border rounded"
                />
            </div>
        </div>

        {/* ADD SERVICE */}
        <AddServiceBox
            maCN={selectedBranch ? selectedBranch.MaCN : null}
            maTKKH={customer.MaTKKH}
            onAdd={(service) => {
                setServices(prev => [...prev, service]);
            }}
        />

        {/* SERVICE LIST */}
        <table className="w-full text-center border-t">
          <thead className="bg-gray-50">
            <tr className="text-xs text-gray-600">
              <th className="px-2 py-1">Loại dịch vụ</th>
              <th className="px-2 py-1">Bác sĩ</th>
              <th className="px-2 py-1">Thú cưng</th>
            </tr>
          </thead>
          <tbody>
            {services.map((s, i) => (
              <tr key={i} className="text-xs border-t">
                <td className="px-2 py-1">{s.LoaiDV}</td>
                <td className="px-2 py-1">{s.TenBS}</td>
                <td className="px-2 py-1">{s.TenTC}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* SUBMIT */}
        <div className="p-6 text-center">
          <button
            onClick={handleSubmitInvoice}
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
            Đặt hẹn
          </button>
        </div>

      </div>
    </div>
  );
}