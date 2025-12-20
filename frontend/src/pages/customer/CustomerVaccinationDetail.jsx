import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Header from "../../components/ui/Header";
import Navbar from "../../components/ui/Navbar";
import PageTitle from "../../components/ui/PageTitle.jsx";
import RatingSection from "../../components/ui/RatingSection.jsx";

export default function CustomerVaccinationDetail() {
    const { maSDDV } = useParams();
    const token = localStorage.getItem("token");
    const [detail, setDetail] = useState(null);
    const [loading, setLoading] = useState(true);
    const [toaTiem, setToaTiem] = useState([]);

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/customer/tiemphong/${maSDDV}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                });

                if (res.data.success) {
                    setDetail(res.data.data.general);
                    setToaTiem(res.data.data.toaTiem);
                } else {
                    console.error("Failed to fetch vaccination detail:", res.data.message);
                }
            } catch (err) {
                console.error("Error fetching vaccination detail:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [maSDDV, token]);

    if (loading) {
        return <p className="p-4">Đang tải...</p>;
    }

    return (
        <div className="min-h-screen bg-white text-sm">
            <Header />
            <Navbar />
            <PageTitle title={`Chi tiết tiêm phòng #${maSDDV}`} />

            <div className="max-w-[1200px] mx-auto mt-6 px-4 grid grid-cols-3 gap-4">

                {/* LEFT BOX — VACCINATION DETAILS */}
                <div className="col-span-2 bg-white shadow-sm border rounded-md">
                    <div className="bg-blue-200 px-6 py-3 text-center border-b">
                        <h3 className="text-base font-semibold text-gray-800">Thông tin tiêm phòng</h3>
                    </div>

                    <div className="p-6 space-y-3">

                        {/* General Information */}
                        <section className="border-b">
                            <h3 className="text-base font-semibold mb-3">Thông tin chung</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <Info label="Mã tiêm phòng" value={detail.MaSDDV} />
                                <Info label="Mã hoá đơn" value={detail.MaHD} />
                                <Info label="Ngày tiêm" value={detail.NgayLap} />
                                <Info label="Chi nhánh" value={detail.TenCN} />
                                <Info label="Thú cưng" value={detail.TenTC} />
                                <Info label="Bác sĩ" value={detail.TenBS} />
                                <Info label="Tổng tiền" value={`${detail.TongTienDV} VND`} />
                            </div>
                            <div className="p-4"> </div>
                        </section>

                        {/* Vaccines Table */}
                        <section className="mt-6">
                            <h3 className="text-base font-semibold mb-3">Toa tiêm</h3>
                            <table className="w-full text-center border-t">
                                <thead className="bg-gray-50">
                                    <tr className="text-xs text-gray-600">
                                        <th className="px-2 py-1">Tên vaccine</th>
                                        <th className="px-2 py-1">Liều lượng</th>
                                        <th className="px-2 py-1">Mã đăng ký gói tiêm</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {toaTiem.length === 0 ? (
                                        <tr><td colSpan="3" className="text-center text-xs p-3">Không có toa tiêm</td></tr>
                                    ) : (
                                        toaTiem.map((item) => (
                                            <tr key={item.MaSP} className="text-xs border-t">
                                                <td className="px-2 py-1">{item.TenSP}</td>
                                                <td className="px-2 py-1">{item.LieuLuong}</td>
                                                <td className="px-2 py-1">{item.MaDK || "-"}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </section>
                    </div>
                </div>

                {/* RIGHT BOX — RATING */}
                <div className="bg-white shadow-sm border rounded-md h-fit">
                    <div className="bg-blue-200 px-6 py-3 text-center border-b">
                        <h3 className="text-base font-semibold text-gray-800">Đánh giá dịch vụ</h3>
                    </div>

                    <div className="p-6 space-y-4">
                        <RatingSection maSDDV={maSDDV} />
                    </div>
                </div>
            </div>
        </div>
    );
}

function Info({ label, value }) {
    return (
        <div>
            <p className="font-medium">{label}</p>
            <p className="border p-2 rounded bg-gray-50">{value || "—"}</p>
        </div>
    );
}