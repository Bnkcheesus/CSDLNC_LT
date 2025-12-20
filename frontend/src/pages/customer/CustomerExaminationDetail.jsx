import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Header from "../../components/ui/Header";
import Navbar from "../../components/ui/Navbar";
import PageTitle from "../../components/ui/PageTitle.jsx";
import RatingSection from "../../components/ui/RatingSection.jsx";

export default function CustomerExaminationDetail() {
    const { maSDDV } = useParams();
    const token = localStorage.getItem("token");
    const [detail, setDetail] = useState(null);
    const [loading, setLoading] = useState(true);
    const [toaThuoc, setToaThuoc] = useState([]);

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/customer/khambenh/${maSDDV}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                });

                if (res.data.success) {
                    setDetail(res.data.data.general);
                    setToaThuoc(res.data.data.toaThuoc);
                } else {
                    console.error("Failed to fetch examination detail:", res.data.message);
                }
            } catch (err) {
                console.error("Error fetching examination detail:", err);
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
            <PageTitle title={`Chi tiết khám bệnh #${maSDDV}`} />

            <div className="max-w-[1200px] mx-auto mt-6 px-4 grid grid-cols-3 gap-4">

                {/* LEFT BOX — EXAMINATION DETAILS */}
                <div className="col-span-2 bg-white shadow-sm border rounded-md">
                    <div className="bg-blue-200 px-6 py-3 text-center border-b">
                        <h3 className="text-base font-semibold text-gray-800">Thông tin khám bệnh</h3>
                    </div>

                    <div className="p-6 space-y-3">

                        {/* General Information */}
                        <section className="border-b">
                            <h3 className="text-base font-semibold mb-3">Thông tin chung</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <Info label="Mã khám bệnh" value={detail.MaSDDV} />
                                <Info label="Mã hoá đơn" value={detail.MaHD} />
                                <Info label="Ngày khám" value={detail.NgayLap} />
                                <Info label="Chi nhánh" value={detail.TenCN} />
                                <Info label="Thú cưng" value={detail.TenTC} />
                                <Info label="Bác sĩ" value={detail.TenBS} />
                                <Info label="Triệu chứng" value={detail.TrieuChung} />
                                <Info label="Chuẩn đoán" value={detail.ChuanDoan} />
                                <Info label="Ngày tái khám" value={detail.NgayTaiKham} />
                                <Info label="Tổng tiền" value={`${detail.TongTien ? detail.TongTien.toLocaleString() : "-"}`} />
                            </div>
                            <div className="p-4"> </div>
                        </section>

                        {/* Prescription Table */}
                        <section className="mt-6">
                            <h3 className="text-base font-semibold mb-3">Toa thuốc</h3>
                            <table className="w-full text-center border-t">
                                <thead className="bg-gray-50">
                                    <tr className="text-xs text-gray-600">
                                        <th className="px-2 py-1">Tên thuốc</th>
                                        <th className="px-2 py-1">Số lượng</th>
                                        <th className="px-2 py-1">Liều lượng</th>
                                        <th className="px-2 py-1">Cách dùng</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {toaThuoc.length === 0 ? (
                                        <tr><td colSpan="4" className="text-center text-xs p-3">Không có toa thuốc</td></tr>
                                    ) : (
                                        toaThuoc.map((item) => (
                                            <tr key={item.MaSP} className="text-xs border-t">
                                                <td className="px-2 py-1">{item.TenSP}</td>
                                                <td className="px-2 py-1">{item.SoLuong}</td>
                                                <td className="px-2 py-1">{item.LieuLuong}</td>
                                                <td className="px-2 py-1">{item.CachDung}</td>
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