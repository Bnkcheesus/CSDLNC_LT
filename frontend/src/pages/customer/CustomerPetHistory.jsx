import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Header from "../../components/ui/Header";
import Navbar from "../../components/ui/Navbar";
import PageTitle from "../../components/ui/PageTitle.jsx";
import ServiceTypeBar from "../../components/ui/ServiceTypeBar.jsx";
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from "lucide-react";

export default function CustomerPetHistory() {
    const { maTC } = useParams();
    const maTK = localStorage.getItem("maTK");
    const token = localStorage.getItem("token");

    const [pet, setPet] = useState(null);
    const [type, setType] = useState("all");
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [limit] = useState(20);
    const [totalPages, setTotalPages] = useState(1);
    const [error, setError] = useState("");
    const [openRow, setOpenRow] = useState(null);
    const [rowDetails, setRowDetails] = useState({});

    useEffect(() => {
        if (!token || !maTC) return;

        const fetchPetProfile = async () => {
            setLoading(true);
            setError("");
            try {
                const res = await axios.get(`http://localhost:5000/api/customer/pets/${maTC}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                });

                if (res.data.success) {
                    setPet(res.data.data);
                } else {
                    setError("Failed to fetch pet profile.");
                }
            } catch (err) {
                console.error("Error fetching pet profile:", err);
                setError("An error occurred while fetching pet profile.");
            } finally {
                setLoading(false);
            }
        };

        fetchPetProfile();
    }, [token, maTC]);

    useEffect(() => {
        if (!maTK || !token || !maTC) return;

        const fetchPetHistory = async () => {
            setLoading(true);
            setError("");
            try {
                const res = await axios.get(`http://localhost:5000/api/customer/pets/${maTC}/history`, {
                    params: { type: type, page: page, limit: limit },
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                });

                if (res.data.success) {
                    setRows(res.data.data.rows || []);
                    setTotalPages(res.data.data.totalPages || 1);
                }
                else {
                    setError("Failed to fetch pet history.");
                }
            } catch (err) {
                console.error("Error fetching pet history:", err);
                setError("An error occurred while fetching pet history.");
            } finally {
                setLoading(false);
            }
        };

        fetchPetHistory();
    }, [maTK, token, maTC, type, page, limit]);

    const handleToggleRow = async (r) => {
        if (openRow === r.MaSDDV) {
            setOpenRow(null);
            return;
        }

        if (!rowDetails[r.MaSDDV]) {
            try {
                let res;
                if (r.LoaiDV === "KB") {
                    res = await axios.get(`http://localhost:5000/api/customer/khambenh/${r.MaSDDV}`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        }
                    });
                } else if (r.LoaiDV === "TP") {
                    res = await axios.get(`http://localhost:5000/api/customer/tiemphong/${r.MaSDDV}`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        }
                    });
                }

                if (res?.data?.success) {
                    setRowDetails(prev => ({ ...prev, [r.MaSDDV]: res.data.data }));
                }
            } catch (err) {
                console.error("Error fetching service details:", err);
            }
        }

        setOpenRow(r.MaSDDV);
    };

    return (
        <div className="min-h-screen bg-white text-sm">
            <Header />
            <Navbar />
            <PageTitle title="Thú cưng" />

            {/* ---------------- PET INFORMATION ---------------- */}
            <div className="max-w-[1200px] mx-auto px-4 mt-6">
                {pet && (
                    <div className="bg-white border rounded-md shadow-sm p-4 mb-6">
                        <h3 className="text-base font-semibold mb-3">Thông tin thú cưng</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-y-2 text-sm">
                            <p><strong>Mã thú cưng:</strong> {pet.MaTC}</p>
                            <p><strong>Tên thú cưng:</strong> {pet.TenTC}</p>
                            <p><strong>Loài:</strong> {pet.Loai}</p>
                            <p><strong>Giống:</strong> {pet.Giong}</p>
                            <p><strong>Ngày sinh:</strong> {pet.NgaySinh ? new Date(pet.NgaySinh).toLocaleDateString() : "-"}</p>
                            <p><strong>Giới tính:</strong> {pet.GioiTinh}</p>
                            <p><strong>Tình trạng sức khoẻ:</strong> {pet.TinhTrangSucKhoe}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* ---------------- SERVICE TYPE BAR ---------------- */}
            <ServiceTypeBar
                active={type}
                onChange={(t) => {
                    setType(t);
                    setPage(1);
                }}
                types={[
                    { key: "all", label: "Tất cả dịch vụ" },
                    { key: "KB", label: "Khám bệnh" },
                    { key: "TP", label: "Tiêm phòng" }
                ]}
            />

            {/* ---------------- HISTORY TABLE ---------------- */}
            <div className="max-w-[1200px] mx-auto px-4 py-6">
                <div className="bg-white shadow-sm border border-gray-200 rounded-md overflow-hidden">

                    <div className="p-4 border-b border-gray-100">
                        <h3 className="text-base font-semibold">Lịch sử khám & tiêm phòng</h3>
                    </div>

                    <div className="p-4">
                        {loading ? (
                            <div className="text-center py-10">Đang tải...</div>
                        ) : error ? (
                            <div className="text-center text-red-600 py-6">{error}</div>
                        ) : rows.length === 0 ? (
                            <div className="text-center py-8 text-gray-600">
                                Không có lịch sử cho thú cưng này.
                            </div>
                        ) : (
                            <table className="w-full table-auto text-left">
                                <thead>
                                    <tr className="text-xs text-gray-600">
                                        <th className="px-3 py-2">Mã SDDV</th>
                                        <th className="px-3 py-2">Ngày sử dụng</th>
                                        <th className="px-3 py-2">Loại dịch vụ</th>
                                        <th className="px-3 py-2">Chi nhánh</th>
                                        <th className="px-3 py-2">Bác sĩ</th>
                                        <th className="px-3 py-2"></th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {rows.map((r) => (
                                        <React.Fragment key={r.MaSDDV}>
                                            <tr
                                                key={r.MaSDDV}
                                                className="border-t hover:bg-gray-50"
                                            >
                                                <td className="px-3 py-3">{r.MaSDDV}</td>
                                                <td className="px-3 py-3">
                                                    {r.NgaySuDung
                                                        ? new Date(r.NgaySuDung).toLocaleDateString()
                                                        : "-"}
                                                </td>
                                                <td className="px-3 py-3">{r.LoaiDV}</td>
                                                <td className="px-3 py-3">{r.TenCN}</td>
                                                <td className="px-3 py-3">{r.TenBS}</td>

                                                <td className="px-3 py-3 text-right">
                                                    <button
                                                        className="p-2 rounded hover:bg-gray-200"
                                                        onClick={() => handleToggleRow(r)}
                                                    >
                                                        {openRow === r.MaSDDV ? (
                                                            <ChevronUp size={18} />
                                                        ) : (
                                                            <ChevronDown size={18} />
                                                        )}
                                                    </button>
                                                </td>
                                            </tr>

                                            {/* EXPANDED DETAILS */}
                                            {openRow === r.MaSDDV && (
                                                <tr className="bg-gray-50 border-t">
                                                    <td colSpan="6" className="p-4">
                                                        {!rowDetails[r.MaSDDV] ? (
                                                            <div>Đang tải chi tiết...</div>
                                                        ) : r.LoaiDV === "KB" ? (
                                                            <div>
                                                                <h4 className="font-medium mb-2">Toa thuốc</h4>
                                                                <table className="w-full text-sm">
                                                                    <thead>
                                                                        <tr className="text-xs text-gray-600">
                                                                            <th className="px-2 py-1">Tên thuốc</th>
                                                                            <th className="px-2 py-1">Số lượng</th>
                                                                            <th className="px-2 py-1">Liều lượng</th>
                                                                            <th className="px-2 py-1">Cách dùng</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {rowDetails[r.MaSDDV].toaThuoc.map((d) => (
                                                                            <tr key={d.MaSP} className="border-t">
                                                                                <td className="px-2 py-1">{d.TenSP}</td>
                                                                                <td className="px-2 py-1">{d.SoLuong}</td>
                                                                                <td className="px-2 py-1">{d.LieuLuong}</td>
                                                                                <td className="px-2 py-1">{d.CachDung}</td>
                                                                            </tr>
                                                                        ))}
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        ) : (
                                                            <div>
                                                                <h4 className="font-medium mb-2">Chi tiết tiêm phòng</h4>
                                                                <table className="w-full text-sm">
                                                                    <thead>
                                                                        <tr className="text-xs text-gray-600">
                                                                            <th className="px-2 py-1">Tên vaccine</th>
                                                                            <th className="px-2 py-1">Liều lượng</th>
                                                                            <th className="px-2 py-1">Mã gói tiêm</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {rowDetails[r.MaSDDV].toaTiem.map((d) => (
                                                                            <tr key={d.MaSP} className="border-t">
                                                                                <td className="px-2 py-1">{d.TenSP}</td>
                                                                                <td className="px-2 py-1">{d.LieuLuong}</td>
                                                                                <td className="px-2 py-1">{d.MaDK || "-"}</td>
                                                                            </tr>
                                                                        ))}
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* PAGINATION */}
                    <div className="p-4 border-t bg-gray-50 flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                            Trang {page} / {totalPages}
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                disabled={page <= 1}
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                className="p-2 rounded disabled:opacity-50"
                            >
                                <ChevronLeft size={18} />
                            </button>

                            <button
                                disabled={page >= totalPages}
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                className="p-2 rounded disabled:opacity-50"
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}