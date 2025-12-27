import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../../components/ui/Header.jsx";
import Navbar from "../../components/ui/Navbar.jsx";
import PageTitle from "../../components/ui/PageTitle.jsx";
import axios from "axios";

export default function CustomerPackageRegister() {
    const { maGoi } = useParams();
    const maTK = localStorage.getItem("maTK");
    const token = localStorage.getItem("token");
    const navigate = useNavigate();
    const [packageInfo, setPackageInfo] = useState(null);
    const [packageData, setPackageData] = useState([]);
    const [startDate, setStartDate] = useState("");
    const [pets, setPets] = useState([]);
    const [selectedPet, setSelectedPet] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!maTK || !token) return;
        const fetchPackageData = async () => {
            setLoading(true);
            setError("");
            try {
                const res = await axios.get(`http://localhost:5000/api/user/packages/${maGoi}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                });
                if (res.data.success) {
                    setPackageInfo(res.data.data.info || null);
                    setPackageData(res.data.data.rows || []);
                } else {
                    setError("Failed to fetch package data.");
                }
            } catch (error) {
                console.error("Failed to fetch package data:", error);
                setError("An error occurred while fetching package data.");
            } finally {
                setLoading(false);
            }
        };

        fetchPackageData();
    }, [maTK, token, maGoi]);

    useEffect(() => {
        if (!maTK || !token) return;
        const fetchPets = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/customer/all-pets`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                });
                if (res.data.success) {
                    setPets(res.data.data || []);
                }
            } catch (error) {
                console.error("Failed to fetch pets:", error);
            }
        };

        fetchPets();
    }, [maTK, token]);

    const handleRegister = async () => {
        try {
            const res = await axios.post(`http://localhost:5000/api/customer/packages/register`, {
                MaTC: selectedPet,
                MaGoi: maGoi,
                NgayBatDau: startDate
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            if (res.data.success) {
                alert("Đăng ký gói tiêm thành công!");
                navigate("/customer/packages");
            } else {
                alert("Đăng ký gói tiêm thất bại!");
            }
        } catch (error) {
            console.error("Failed to register package:", error);
            alert("Đã có lỗi xảy ra khi đăng ký gói tiêm.");
        }
    };

    return (
    <div className="min-h-screen bg-white text-sm">
      <Header />
      <Navbar />
      <PageTitle title={`Chi tiết gói tiêm - ${maGoi}`} />

      <div className="max-w-[1200px] mx-auto px-4 mt-6">
        {loading ? (
            <div className="text-center py-10">Đang tải...</div>
        ) : error ? (
            <div className="text-center py-10 text-red-500">{error}</div>
        ) : (
            <div className="bg-white border rounded-md shadow-sm p-4 mb-6">
                <h3 className="text-base font-semibold mb-3">Chi tiết gói tiêm</h3>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-y-2 text-sm border-b p-6">
                    <p><strong>Mã gói:</strong> {maGoi}</p>
                    <p><strong>Tên gói:</strong> {packageInfo ? packageInfo.TenGoi : "-"}</p>
                    <p><strong>Thời hạn:</strong> {packageInfo ? packageInfo.ThoiHan : "-"}</p>
                    <p><strong>Số mũi tiêm:</strong> {packageInfo ? packageInfo.SoMuiTiem : "-"}</p>
                    <p><strong>Mức ưu đãi:</strong> {packageInfo ? packageInfo.MucUuDai + "%" : "-"}</p>
                    <p><strong>Tổng tiền:</strong> {packageInfo?.TongTienGoi ? packageInfo.TongTienGoi.toLocaleString() + " đ" : "-"}</p>
                </div>

                <div className="p-6 border-b">
                    <table className="w-full text-center border-t">
                        <thead className="bg-gray-50">
                            <tr className="text-xs text-gray-600">
                                <th className="px-2 py-1">Vaccine</th>
                                <th className="px-2 py-1">Mô tả</th>
                                <th className="px-2 py-1">Liều lượng</th>
                            </tr>
                        </thead>
                        <tbody>
                            {packageData.filter(p => p.MaSP).map((p, i) => (
                            <tr key={i} className="text-xs border-t">
                                <td className="px-2 py-1">{p.MaSP + " - " + p.TenSP}</td>
                                <td className="px-2 py-1">{p.ThoiGian}</td>
                                <td className="px-2 py-1">{p.LieuLuong}</td>
                            </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="font-medium">Thú cưng</label>
                        <select
                            value={selectedPet}
                            onChange={e => setSelectedPet(e.target.value)}
                            className="w-full p-2 border rounded"
                        >
                            <option value="">-- Chọn thú cưng --</option>
                            {pets.map(p => (
                                <option key={p.MaTC} value={p.MaTC}>{p.MaTC + " - " + p.TenTC}</option>
                            ))}
                        </select>
                    </div>
                    
                    <div>
                        <label className="font-medium">Ngày bắt đầu</label>
                        <input
                            type="date"
                            name="NgayBatDau"
                            min={new Date().toISOString().split("T")[0]}
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full p-2 border rounded"
                        />
                    </div>
                </div>  
                <div className="p-4 text-center">
                    <button
                        onClick={handleRegister}
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
                        Đăng ký gói tiêm
                    </button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}