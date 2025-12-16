import { useState, useEffect } from "react";
import Header from "../../components/ui/Header";
import Navbar from "../../components/ui/Navbar";
import PageTitle from "../../components/ui/PageTitle.jsx";
import axios from "axios";

export default function StaffAddServiceInvoice() {
    const token = localStorage.getItem("token");
    const [staff, setStaff] = useState({
        MaTKNV: "",
        HoTen: "",
        MaCN: "",
        TenCN: ""
    });

    const [customerKeyword, setCustomerKeyword] = useState("");
    const [customerResults, setCustomerResults] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);

    const [pets, setPets] = useState([]);
    const [doctors, setDoctors] = useState([]);

    const [serviceForm, setServiceForm] = useState({
        LoaiDV: "KB",
        MaBS: "",
        MaTC: ""
    });

    const [services, setServices] = useState([]);

    useEffect(() => {
        const fetchStaffInfo = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/staff/profile`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                });
                if (res.data.success) {
                    setStaff({
                        MaTKNV: res.data.data.MaTKNV,
                        HoTen: res.data.data.HoTen,
                        MaCN: res.data.data.MaCN,
                        TenCN: res.data.data.TenCN
                    });
                } else {
                    console.error("Failed to fetch staff info:", res.data.message);
                }
            } catch (err) {
                console.error("Error fetching staff info:", err);
            }
        };
        fetchStaffInfo();
    }, [token]);

    useEffect(() => {
        if (!staff.MaCN) return;
        const fetchDoctors = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/staff/doctors/${staff.MaCN}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                });
                if (res.data.success) {
                    setDoctors(res.data.data);
                } else {
                    console.error("Failed to fetch doctors:", res.data.message);
                }
            } catch (err) {
                console.error("Error fetching doctors:", err);
            }
        };
        fetchDoctors();
    }, [staff.MaCN, token]);

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

    useEffect(() => {
        if (!selectedCustomer) {
            return;
        }

        const fetchPets = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/staff/pets/${selectedCustomer.MaTKKH}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                });
                if (res.data.success) {
                    setPets(res.data.data);
                } else {
                    console.error("Failed to fetch pets:", res.data.message);
                }
            } catch (err) {
                console.error("Error fetching pets:", err);
            }
        };
        fetchPets();
    }, [selectedCustomer, token]);

    const handleAddService = () => {
        if (!serviceForm.LoaiDV || !serviceForm.MaBS || !serviceForm.MaTC) {
            alert("Vui lòng điền đầy đủ thông tin dịch vụ.");
            return;
        }

        const doctor = doctors.find(doc => doc.MaTKNV === serviceForm.MaBS);
        const pet = pets.find(p => p.MaTC === serviceForm.MaTC);

        setServices (prevServices => [
            ...prevServices,
            {
                LoaiDV: serviceForm.LoaiDV,
                MaBS: serviceForm.MaBS,
                TenBS: doctor ? doctor.HoTen : "",
                MaTC: serviceForm.MaTC,
                TenTC: pet ? pet.TenTC : ""
            }
        ]);

        setServiceForm({
            LoaiDV: "KB",
            MaBS: "",
            MaTC: ""
        });
    }

    const handleSubmitInvoice = async () => {
        try {
            if (!selectedCustomer) {
                alert("Vui lòng chọn khách hàng.");
                return;
            }
            const res = await axios.post("http://localhost:5000/api/staff/hddv", {
                MaTKKH: selectedCustomer.MaTKKH,
                MaTKNV: staff.MaTKNV,
                MaCN: staff.MaCN
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });

            const MaHD = res.data.data.MaHD;

            for (const service of services) {
                await axios.post("http://localhost:5000/api/staff/sddv", {
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

            alert("Hoá đơn dịch vụ đã được tạo thành công!");
            setSelectedCustomer(null);
            setCustomerKeyword("");
            setPets([]);
            setServices([]);
        } catch (err) {
            console.error("Error submitting service invoice:", err);
            alert("Đã có lỗi xảy ra khi tạo hoá đơn dịch vụ.");
        }
    }

    return (
    <div className="min-h-screen bg-white text-sm">
      <Header />
      <Navbar />
      <PageTitle title="Thêm hoá đơn dịch vụ" />

      <div className="max-w-5xl mx-auto mt-6 bg-white border rounded shadow-sm">

        {/* STAFF INFO */}
        <div className="p-6 grid grid-cols-3 gap-4 border-b">
          <div>
            <label className="font-medium">Mã nhân viên</label>
            <input value={staff.MaTKNV} disabled className="w-full p-2 border bg-gray-100 rounded" />
          </div>
          <div>
            <label className="font-medium">Tên nhân viên</label>
            <input value={staff.HoTen} disabled className="w-full p-2 border bg-gray-100 rounded" />
          </div>
          <div>
            <label className="font-medium">Chi nhánh</label>
            <input value={staff.TenCN} disabled className="w-full p-2 border bg-gray-100 rounded" />
          </div>
        </div>

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

        {/* ADD SERVICE */}
        <div className="p-6 border-b grid grid-cols-4 gap-4">
          <select
            value={serviceForm.LoaiDV}
            onChange={e => setServiceForm({ ...serviceForm, LoaiDV: e.target.value })}
            className="p-2 border rounded"
          >
            <option value="KB">Khám bệnh</option>
            <option value="TP">Tiêm phòng</option>
          </select>

          <select
            value={serviceForm.MaBS}
            onChange={e => setServiceForm({ ...serviceForm, MaBS: e.target.value })}
            className="p-2 border rounded"
          >
            <option value="">-- Chọn bác sĩ --</option>
            {doctors.map(d => (
              <option key={d.MaTKNV} value={d.MaTKNV}>{d.HoTen}</option>
            ))}
          </select>

          <select
            value={serviceForm.MaTC}
            onChange={e => setServiceForm({ ...serviceForm, MaTC: e.target.value })}
            className="p-2 border rounded"
          >
            <option value="">-- Chọn thú cưng --</option>
            {pets.map(p => (
              <option key={p.MaTC} value={p.MaTC}>{p.TenTC}</option>
            ))}
          </select>

          <button
            onClick={handleAddService}
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
            Thêm dịch vụ
          </button>
        </div>

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
            Thêm hoá đơn
          </button>
        </div>

      </div>
    </div>
  );
}