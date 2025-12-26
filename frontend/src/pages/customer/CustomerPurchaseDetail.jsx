import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Header from "../../components/ui/Header";
import Navbar from "../../components/ui/Navbar";
import PageTitle from "../../components/ui/PageTitle.jsx";
import RatingSection from "../../components/ui/RatingSection.jsx";

export default function CustomerPurchaseDetail() {
    const { maSDDV } = useParams();
    const token = localStorage.getItem("token");
    const [detail, setDetail] = useState(null);
    const [loading, setLoading] = useState(true);
    const [hoaDonMua, setHoaDonMua] = useState([]);

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/customer/muahang/${maSDDV}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                });

                if (res.data.success) {
                    setDetail(res.data.data.general);
                    setHoaDonMua(res.data.data.hoaDonMua);
                } else {
                    console.error("Failed to fetch purchase detail:", res.data.message);
                }
            } catch (err) {
                console.error("Error fetching purchase detail:", err);
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
            <PageTitle title={`Chi tiết mua hàng #${maSDDV}`} />

            <div className="max-w-[1200px] mx-auto mt-6 px-4 grid grid-cols-3 gap-4">
                {loading ? (
                    <p className="p-4 col-span-3">Đang tải...</p>
                ) : (
                    <>
                        {/* LEFT BOX — PURCHASE DETAILS */}
                        <div className="col-span-2 bg-white shadow-sm border rounded-md">
                            <div className="bg-blue-200 px-6 py-3 text-center border-b">
                                <h3 className="text-base font-semibold text-gray-800">Thông tin mua hàng</h3>
                            </div>

                            <div className="p-6 space-y-3">

                                {/* General Information */}
                                <section className="border-b">
                                    <h3 className="text-base font-semibold mb-3">Thông tin chung</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <Info label="Mã mua hàng" value={detail.MaSDDV} />
                                        <Info label="Mã hoá đơn" value={detail.MaHD} />
                                        <Info label="Ngày mua hàng" value={detail.NgayLap ? new Date(detail.NgayLap).toLocaleDateString() : "-"} />
                                        <Info label="Chi nhánh" value={detail.TenCN || "-"} />
                                        <Info label="Nhân viên bán hàng" value={detail.TenNV || "-"} />
                                        <Info label="Tổng tiền" value={`${detail.TongTien ? detail.TongTien.toLocaleString() + " đ" : "-" }`} />
                                    </div>
                                    <div className="p-4"> </div>
                                </section>

                                {/* Purchase Invoice Table */}
                                <section className="mt-6">
                                    <h3 className="text-base font-semibold mb-3">Hoá đơn mua hàng</h3>
                                    <table className="w-full text-center border-t">
                                        <thead className="bg-gray-50">
                                            <tr className="text-xs text-gray-600">
                                                <th className="px-2 py-1">Tên sản phẩm</th>
                                                <th className="px-2 py-1">Số lượng</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {hoaDonMua.length === 0 ? (
                                                <tr><td colSpan="2" className="text-center text-xs p-3">Không có hoá đơn mua hàng</td></tr>
                                            ) : (
                                                hoaDonMua.map((item) => (
                                                    <tr key={item.MaSP} className="text-xs border-t">
                                                        <td className="px-2 py-1">{item.TenSP}</td>
                                                        <td className="px-2 py-1 ">{item.SoLuong}</td>
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

function Info({ label, value }) {
    return (
        <div>
            <p className="font-medium">{label}</p>
            <p className="border p-2 rounded bg-gray-50">{value || "—"}</p>
        </div>
    );
}