import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Header from "../../components/ui/Header";
import Navbar from "../../components/ui/Navbar";
import PageTitle from "../../components/ui/PageTitle.jsx";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function CustomerPetHistory() {
    const { maHD } = useParams();
    const token = localStorage.getItem("token");

    const [invoice, setInvoice] = useState(null);
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [openRow, setOpenRow] = useState(null);
    const [rowDetails, setRowDetails] = useState({});

    useEffect(() => {
        if (!token || !maHD) return;

        const fetchServiceInvoice = async () => {
            setLoading(true);
            setError("");
            try {
                const res = await axios.get(`http://localhost:5000/api/staff/invoices/${maHD}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                });

                if (res.data.success) {
                    setInvoice(res.data.data);
                } else {
                    setError("Failed to fetch invoice.");
                }
            } catch (err) {
                console.error("Error fetching invoice:", err);
                setError("An error occurred while fetching invoice.");
            } finally {
                setLoading(false);
            }
        };

        fetchServiceInvoice();
    }, [token, maHD]);

    useEffect(() => {
        if (!token || !maHD) return;
        const fetchInvoiceDetails = async () => {
            setLoading(true);
            setError("");
            try {
                const res = await axios.get(`http://localhost:5000/api/staff/invoices/${maHD}/details`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                });

                if (res.data.success) {
                    setRows(res.data.data || []);
                }
                else {
                    setError("Failed to fetch invoice details.");
                }
            } catch (err) {
                console.error("Error fetching invoice details:", err);
                setError("An error occurred while fetching invoice details.");
            } finally {
                setLoading(false);
            }
        };

        fetchInvoiceDetails();
    }, [token, maHD]);

    const handleToggleRow = async (r) => {
        if (openRow === r.MaSDDV) {
            setOpenRow(null);
            return;
        }

        if (!rowDetails[r.MaSDDV]) {
            try {
                let res;
                if (r.LoaiDV === "KB") {
                    res = await axios.get(`http://localhost:5000/api/staff/khambenh/${r.MaSDDV}`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        }
                    });
                } else if (r.LoaiDV === "TP") {
                    res = await axios.get(`http://localhost:5000/api/staff/tiemphong/${r.MaSDDV}`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        }
                    });
                } else if (r.LoaiDV === "MH") {
                    res = await axios.get(`http://localhost:5000/api/staff/muahang/${r.MaSDDV}`, {
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
            <PageTitle title="Chi tiết hoá đơn" />

            <div className="max-w-[1200px] mx-auto px-4 mt-6">
                {invoice && (
                    <div className="bg-white border rounded-md shadow-sm p-4 mb-6">
                        <h3 className="text-base font-semibold mb-3">Thông tin hoá đơn</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-y-2 text-sm">
                            <p><strong>Mã hoá đơn:</strong> {invoice.MaHD}</p>
                            <p><strong>Ngày lập:</strong> {invoice.NgayLap ? new Date(invoice.NgayLap).toLocaleDateString() : "-"}</p>
                            <p><strong>Chi nhánh:</strong> {invoice.TenCN}</p>
                            <p><strong>Mã nhân viên:</strong> {invoice.MaTKNV}</p>
                            <p><strong>Mã khách hàng:</strong> {invoice.MaTKKH}</p>
                        </div>
                    </div>
                )}
            </div>

            <div className="max-w-[1200px] mx-auto px-4 py-6">
                <div className="bg-white shadow-sm border border-gray-200 rounded-md overflow-hidden">

                    <div className="p-4 border-b border-gray-100">
                        <h3 className="text-base font-semibold">Chi tiết hoá đơn</h3>
                    </div>

                    <div className="p-4">
                        {loading ? (
                            <div className="text-center py-10">Đang tải...</div>
                        ) : error ? (
                            <div className="text-center text-red-600 py-6">{error}</div>
                        ) : rows.length === 0 ? (
                            <div className="text-center py-8 text-gray-600">
                                Không có chi tiết hoá đơn.
                            </div>
                        ) : (
                            <table className="w-full table-auto text-left">
                                <thead>
                                    <tr className="text-xs text-gray-600">
                                        <th className="px-3 py-2">Mã SDDV</th>
                                        <th className="px-3 py-2">Loại dịch vụ</th>
                                        <th className="px-3 py-2">Bác sĩ/Nhân viên bán hàng</th>
                                        <th className="px-3 py-2">Thành tiền</th>
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
                                                <td className="px-3 py-3">{r.LoaiDV}</td>
                                                <td className="px-3 py-3">{r.TenNV}</td>
                                                <td className="px-3 py-3">{r.TongTienDV ? r.TongTienDV.toLocaleString() : "-"}</td>

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
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {rowDetails[r.MaSDDV].map((d) => (
                                                                            <tr key={d.MaSP} className="border-t">
                                                                                <td className="px-2 py-1">{d.TenSP}</td>
                                                                                <td className="px-2 py-1">{d.SoLuong}</td>
                                                                            </tr>
                                                                        ))}
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        ) : ( r.LoaiDV === "TP" ? (
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
                                                                        {rowDetails[r.MaSDDV].map((d) => (
                                                                            <tr key={d.MaSP} className="border-t">
                                                                                <td className="px-2 py-1">{d.TenSP}</td>
                                                                                <td className="px-2 py-1">{d.LieuLuong}</td>
                                                                                <td className="px-2 py-1">{d.MaGoi || "-"}</td>
                                                                            </tr>
                                                                        ))}
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        ) : (
                                                            <div>
                                                                <h4 className="font-medium mb-2">Chi tiết mua hàng</h4>
                                                                <table className="w-full text-sm">
                                                                    <thead>
                                                                        <tr className="text-xs text-gray-600">
                                                                            <th className="px-2 py-1">Tên sản phẩm</th>
                                                                            <th className="px-2 py-1">Số lượng</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {rowDetails[r.MaSDDV].map((d) => (
                                                                            <tr key={d.MaSP} className="border-t">
                                                                                <td className="px-2 py-1">{d.TenSP}</td>
                                                                                <td className="px-2 py-1">{d.SoLuong}</td>
                                                                            </tr>
                                                                        ))}
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        ))}
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}