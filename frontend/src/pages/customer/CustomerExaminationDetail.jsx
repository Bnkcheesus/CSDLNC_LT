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

    return (
        <div className="min-h-screen bg-white text-sm">
            <Header />
            <Navbar />
            <PageTitle title={`Chi tiết khám bệnh #${maSDDV}`} />

            <div className="max-w-[1200px] mx-auto mt-6 px-4 grid grid-cols-3 gap-4">
                {loading ? (
                    <p className="p-4 col-span-3">Đang tải...</p>
                ) : (
                    <>
                        {/* LEFT BOX — EXAMINATION DETAILS */}
                        <div className="col-span-2 bg-white shadow-sm border rounded-md">
                            <div className="bg-blue-200 px-6 py-3 text-center border-b">
                                <h3 className="text-base font-semibold text-gray-800">Thông tin khám bệnh</h3>
                            </div>

                            <div className="p-6 space-y-3">

                                {/* General Information */}
                                <section className="border-b">
                                    <h3 className="text-base font-semibold mb-3">Thông tin chung</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-2 gap-y-2 text-sm">
                                        <p><strong>Mã khám bệnh:</strong> {detail.MaSDDV}</p>
                                        <p><strong>Mã hoá đơn:</strong> {detail.MaHD}</p>
                                        <p><strong>Ngày khám:</strong> {detail.NgayLap ? new Date(detail.NgayLap).toLocaleDateString() : "-"}</p>
                                        <p><strong>Chi nhánh:</strong> {detail.TenCN || "-"}</p>
                                        <p><strong>Thú cưng:</strong> {detail.MaTC ? detail.MaTC + " - " + detail.TenTC : "-"}</p>
                                        <p><strong>Bác sĩ:</strong> {detail.TenBS || "-"}</p>
                                        <p><strong>Triệu chứng:</strong> {detail.TrieuChung || "-"}</p>
                                        <p><strong>Chuẩn đoán:</strong> {detail.ChuanDoan || "-"}</p>
                                        <p><strong>Ngày tái khám:</strong> {detail.NgayTaiKham ? new Date(detail.NgayTaiKham).toLocaleDateString() : "-"}</p>
                                        <p><strong>Tổng tiền:</strong> {`${detail.TongTien ? detail.TongTien.toLocaleString() + " đ" : "-"}`}</p>
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
                    </>
                )}
            </div>
        </div>
    );
}