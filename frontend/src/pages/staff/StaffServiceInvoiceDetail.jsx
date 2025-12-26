import React, { useState, useEffect } from "react";
import { Pencil, Save, X } from "lucide-react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Header from "../../components/ui/Header";
import Navbar from "../../components/ui/Navbar";
import PageTitle from "../../components/ui/PageTitle.jsx";
import AddServiceBox from "../../components/ui/AddServiceBox.jsx";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function StaffServiceInvoiceDetail() {
    const { maHD } = useParams();
    const token = localStorage.getItem("token");

    const [invoice, setInvoice] = useState(null);
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [openRow, setOpenRow] = useState(null);
    const [rowDetails, setRowDetails] = useState({});

    const [isEditing, setIsEditing] = useState(false);

    const [editInvoice, setEditInvoice] = useState({
        KhuyenMai: 0,
        HinhThucThanhToan: "TM"
    });

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
                    setEditInvoice({
                        MaTKNV: res.data.data.MaTKNV || null,
                        KhuyenMai: res.data.data.KhuyenMai || 0,
                        HinhThucThanhToan: res.data.data.HinhThucThanhToan || "TM"
                    });
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

    const handleUpdateInvoice = async () => {
        try {
            const res = await axios.put(
                `http://localhost:5000/api/staff/invoices/${maHD}`,
                {
                    MaTKNV: null,
                    KhuyenMai: editInvoice.KhuyenMai,
                    HinhThucThanhToan: editInvoice.HinhThucThanhToan
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (!res.data.success) {
                alert("Cập nhật hoá đơn thất bại");
                return;
            }

            const resInvoice = await axios.get(
                `http://localhost:5000/api/staff/invoices/${maHD}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (resInvoice.data.success) {
                setInvoice(resInvoice.data.data);
                setEditInvoice({
                    KhuyenMai: resInvoice.data.data.KhuyenMai || 0,
                    HinhThucThanhToan: resInvoice.data.data.HinhThucThanhToan || null
                });
            }

            setIsEditing(false);
            alert("Cập nhật hoá đơn thành công");
        } catch (err) {
            console.error(err);
        }
    };

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

    const handleUpdateInvoiceStaff = async () => {
        try {
            const res = await axios.put(
                `http://localhost:5000/api/staff/invoices/${maHD}`,
                {
                    MaTKNV: localStorage.getItem("maTK"),
                    KhuyenMai: null,
                    HinhThucThanhToan: null
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (!res.data.success) {
                alert("Tiếp nhận hoá đơn thất bại");
                return;
            }
            const resInvoice = await axios.get(
                `http://localhost:5000/api/staff/invoices/${maHD}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (resInvoice.data.success) {
                setInvoice(resInvoice.data.data);
                setEditInvoice({
                    KhuyenMai: resInvoice.data.data.KhuyenMai || 0,
                    HinhThucThanhToan: resInvoice.data.data.HinhThucThanhToan || null
                });
            }

            setIsEditing(false);
            alert("Tiếp nhận hoá đơn thành công");
        } catch (err) {
            console.error(err);
        }
    };

    const handleTiepNhan = async () => {
        try {
            handleUpdateInvoiceStaff();
        } catch (err) {
            console.error("Error handling appointment:", err);
        }
    };

    return (
        <div className="min-h-screen bg-white text-sm">
            <Header />
            <Navbar />
            <PageTitle title="Chi tiết hoá đơn" />

            <div className="max-w-[1200px] mx-auto px-4 mt-6">
                {invoice && (
                    <div className="bg-white border rounded-md shadow-sm p-4 mb-6">
                        <h3 className="text-base font-semibold mb-3">Thông tin hoá đơn 
                        {!isEditing ? (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="p-2 rounded hover:bg-gray-100"
                                title="Chỉnh sửa"
                            >
                                <Pencil size={16} />
                            </button>
                        ) : (
                            <div className="inline">
                                <button
                                    onClick={handleUpdateInvoice}
                                    className="p-2 rounded hover:bg-green-100 text-green-600"
                                    title="Cập nhật"
                                >
                                    <Save size={16} />
                                </button>
                                <button
                                    onClick={() => {
                                        setIsEditing(false);
                                        setEditInvoice({
                                            KhuyenMai: invoice.KhuyenMai || 0,
                                            HinhThucThanhToan: invoice.HinhThucThanhToan || "TM"
                                        });
                                    }}
                                    className="p-2 rounded hover:bg-red-100 text-red-600"
                                    title="Huỷ"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        )}
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-y-2 text-sm">
                            <p><strong>Mã hoá đơn:</strong> {invoice.MaHD}</p>
                            <p><strong>Ngày lập:</strong> {invoice.NgayLap ? new Date(invoice.NgayLap).toLocaleDateString() : "-"}</p>
                            <p><strong>Chi nhánh:</strong> {invoice.TenCN}</p>
                            <p><strong>Mã nhân viên:</strong> {
                                !isEditing ? (
                                    <span>{invoice.MaTKNV || " - "}</span>
                                ) : (
                                    !invoice.MaTKNV ? (
                                        <button
                                            onClick={handleTiepNhan}
                                            className=" px-6 py-2 bg-blue-500 text-white font-medium rounded
                                            shadow-[inset_0px_2px_4px_rgba(255,255,255,0.6),inset_0px_-3px_6px_rgba(0,0,0,0.3)]
                                            hover:brightness-110 active:shadow-[inset_0px_1px_3px_rgba(0,0,0,0.4)]
                                            transition-all "
                                        >
                                            Tiếp nhận
                                        </button>
                                    ) : (
                                        <span>{invoice.MaTKNV || " - "}</span>
                                    )
                                )
                            }</p>
                            <p><strong>Mã khách hàng:</strong> {invoice.MaTKKH}</p>
                            <p><strong></strong> {""}</p>
                            <p><strong>Tổng tiền:</strong> {invoice.TongTien ? invoice.TongTien.toLocaleString() : "-"}</p>
                            <p>
                                <strong>Khuyến mãi: </strong>
                                {!isEditing ? (
                                    <span>
                                        {invoice.KhuyenMai
                                            ? invoice.KhuyenMai.toLocaleString()
                                            : " - "}
                                    </span>
                                ) : (
                                    <input
                                        type="number"
                                        disabled={invoice.MaTKNV === null}
                                        min={0}
                                        max={invoice.TongTien || 0}
                                        step={1000}
                                        value={editInvoice.KhuyenMai}
                                        onChange={(e) =>
                                            setEditInvoice(prev => ({
                                                ...prev,
                                                KhuyenMai: Number(e.target.value)
                                            }))
                                        }
                                        className="border rounded px-2 py-1 w-32 text-sm"
                                    />
                                )}
                            </p>
                            <p>
                                <strong>Hình thức thanh toán:</strong>{" "}
                                {!isEditing ? (
                                    invoice.HinhThucThanhToan === "TM" ? "Tiền mặt" :
                                    invoice.HinhThucThanhToan === "CK" ? "Chuyển khoản" :
                                    " - "
                                ) : (
                                    <select
                                        value={editInvoice.HinhThucThanhToan}
                                        disabled={invoice.MaTKNV === null}
                                        onChange={(e) =>
                                            setEditInvoice(prev => ({
                                                ...prev,
                                                HinhThucThanhToan: e.target.value
                                            }))
                                        }
                                        className="border rounded px-2 py-1"
                                    >
                                        <option value="TM">Tiền mặt</option>
                                        <option value="CK">Chuyển khoản</option>
                                    </select>
                                )}
                            </p>

                        </div>
                    </div>
                )}
            </div>

            <div className="max-w-[1200px] mx-auto px-4 py-6">
                {invoice && (
                    <AddServiceBox
                        maCN={invoice.MaCN}
                        maTKKH={invoice.MaTKKH}
                        onAdd={async (service) => {
                            const resAdd =await axios.post("http://localhost:5000/api/staff/sddv", {
                                MaHD: invoice.MaHD,
                                LoaiDV: service.LoaiDV,
                                MaBS: service.MaBS,
                                MaTC: service.MaTC
                            }, {
                                headers: { Authorization: `Bearer ${token}` }
                            });

                            if (!resAdd.data.success) {
                                alert("Thêm dịch vụ vào hoá đơn thất bại.");
                                return;
                            }
                            alert("Thêm dịch vụ vào hoá đơn thành công.");

                            // reload details
                            const res = await axios.get(
                                `http://localhost:5000/api/staff/invoices/${maHD}/details`,
                                { headers: { Authorization: `Bearer ${token}` } }
                            );
                            if (res.data.success) setRows(res.data.data);
                        }}
                    />
                )}
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
                                                                            <th className="px-2 py-1">Giá</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {rowDetails[r.MaSDDV].map((d) => (
                                                                            <tr key={d.MaSP} className="text-xs border-t">
                                                                                <td className="px-2 py-1">{d.TenThuoc}</td>
                                                                                <td className="px-2 py-1">{d.SoLuong}</td>
                                                                                <td className="px-2 py-1">{d.Gia ? d.Gia.toLocaleString() : "-"}</td>
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
                                                                            <th className="px-2 py-1">Mã đăng ký gói</th>
                                                                            <th className="px-2 py-1">Tên gói</th>
                                                                            <th className="px-2 py-1">Giá</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {rowDetails[r.MaSDDV].map((d) => (
                                                                            <tr key={d.MaSP} className="text-xs border-t">
                                                                                <td className="px-2 py-1">{d.TenVaccine}</td>
                                                                                <td className="px-2 py-1">{d.LieuLuong}</td>
                                                                                <td className="px-2 py-1">{d.MaDK || "-"}</td>
                                                                                <td className="px-2 py-1">{d.TenGoi || "-"}</td>
                                                                                <td className="px-2 py-1">{d.Gia ? d.Gia.toLocaleString() : "-"}</td>
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
                                                                            <th className="px-2 py-1">Giá</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {rowDetails[r.MaSDDV].map((d) => (
                                                                            <tr key={d.MaSP} className="text-xs border-t">
                                                                                <td className="px-2 py-1">{d.TenSP}</td>
                                                                                <td className="px-2 py-1">{d.SoLuong}</td>
                                                                                <td className="px-2 py-1">{d.Gia ? d.Gia.toLocaleString() : "-"}</td>
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