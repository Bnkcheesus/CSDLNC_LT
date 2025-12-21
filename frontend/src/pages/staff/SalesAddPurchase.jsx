import { useState, useEffect } from "react";
import { Pencil, Trash2, Check, X } from "lucide-react";
import Header from "../../components/ui/Header";
import Navbar from "../../components/ui/Navbar";
import PageTitle from "../../components/ui/PageTitle.jsx";
import axios from "axios";

export default function SalesAddPurchase() {
    const token = localStorage.getItem("token");
    const [staff, setStaff] = useState({
        MaTKNV: "",
        HoTen: "",
        MaCN: "",
        TenCN: ""
    });

    const [invoiceKeyword, setInvoiceKeyword] = useState("");
    const [invoiceResults, setInvoiceResults] = useState([]);
    const [selectedInvoice, setSelectedInvoice] = useState(null);

    const [productKeyword, setProductKeyword] = useState("");
    const [productResults, setProductResults] = useState([]);

    const [editingIndex, setEditingIndex] = useState(null);
    const [editDraft, setEditDraft] = useState(null);

    const [customer, setCustomer] = useState({
        MaTKKH: "",
        HoTen: ""
    });

    const [ctmhForm, setCtmhForm] = useState({
        MaSP: "",
        TenSP: "",
        SoLuong: null
    });

    const [hdmh, setHDMH] = useState([{
        MaSP: "",
        TenSP: "",
        SoLuong: null
    }]);

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

    const handleInvoiceSearchChange = (e) => {
        setInvoiceKeyword(e.target.value);
        setSelectedInvoice(null);
        setHDMH([]);
        setCustomer({});

        if (!e.target.value.trim()) {
            setInvoiceResults([]);
        }
    };

    const handleProductSearchChange = (e) => {
        setProductKeyword(e.target.value);

        if (!e.target.value.trim()) {
            setProductResults([]);
        }
    };

    useEffect(() => {
        if (!invoiceKeyword.trim()) {
            return;
        }

        const fetchInvoices = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/sales/invoices/${staff.MaCN}?search=${invoiceKeyword}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                });
                if (res.data.success) {
                    setInvoiceResults(res.data.data);
                } else {
                    console.error("Failed to fetch invoices:", res.data.message);
                }
            } catch (err) {
                console.error("Error fetching invoices:", err);
            }
        };
        fetchInvoices();
    }, [staff.MaCN, invoiceKeyword, token]);

    useEffect(() => {
        if (!productKeyword.trim()) {
            return;
        }

        const fetchProducts = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/sales/products?search=${productKeyword}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                });
                if (res.data.success) {
                    setProductResults(res.data.data);
                } else {
                    console.error("Failed to fetch products:", res.data.message);
                }
            } catch (err) {
                console.error("Error fetching products:", err);
            }
        };
        fetchProducts();
    }, [productKeyword, token]);

    const handleAddProduct = () => {
        if (!ctmhForm.MaSP || !ctmhForm.TenSP || !ctmhForm.SoLuong) {
            alert("Vui lòng điền đầy đủ thông tin sản phẩm.");
            return;
        }

        setHDMH (prevHDMH => [
            ...prevHDMH,
            {
                MaSP: ctmhForm.MaSP,
                TenSP: ctmhForm.TenSP,
                SoLuong: ctmhForm.SoLuong
            }
        ]);

        setCtmhForm({
            MaSP: "",
            TenSP: "",
            SoLuong: null
        });
        setProductKeyword("");
    }

    const handleDeleteProduct = (index) => {
        if (!window.confirm("Bạn có chắc muốn xoá sản phẩm này?")) return;

        setHDMH(prev => {
            return prev.filter((_, i) => i !== index);
        });
    };

    const handleSaveEdit = (index) => {
        setHDMH(prev =>
            prev.map((t, i) =>
            i === index
                ? { ...editDraft }
                : t
            )
        );
        setEditingIndex(null);
        setEditDraft(null);
    };

    const handleSubmitChange = async () => {
        try {
            if (!selectedInvoice) {
                alert("Vui lòng chọn hoá đơn.");
                return;
            }

            const res = await axios.post("http://localhost:5000/api/sales/sddv", {
                MaHD: selectedInvoice.MaHD,
                MaNVBH: staff.MaTKNV
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });

            const MaSDDV = res.data.data.MaSDDV;

            for (const t of hdmh) {
                await axios.post(`http://localhost:5000/api/sales/hdmh`, {
                    MaSDDV: MaSDDV,
                    MaSP: t.MaSP,
                    SoLuong: t.SoLuong
                }, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                });
            }

            alert("Hoá đơn mua hàng đã được thêm thành công! Mã SDDV: " + MaSDDV);
            setSelectedInvoice(null);
            setInvoiceKeyword("");
            setHDMH([]);
            setProductKeyword("");
            setCustomer({
                MaTKKH: "",
                HoTen: ""
            });
        } catch (err) {
            console.error("Error submitting purchase invoice:", err);
            alert("Đã có lỗi xảy ra khi thêm hoá đơn mua hàng.");
        }
    }

    return (
    <div className="min-h-screen bg-white text-sm">
      <Header />
      <Navbar />
      <PageTitle title="Hoá đơn mua hàng" />

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

        {/* INVOICE */}
        <div className="p-6 border-b relative grid grid-cols-3 gap-4">
          <div>
            <label className="font-medium">Hoá đơn dịch vụ</label>
            <input
                value={invoiceKeyword}
                onChange={handleInvoiceSearchChange}
                className="w-full p-2 border rounded"
                placeholder="Nhập mã hoá đơn dịch vụ hoặc tên khách hàng"
            />

            {invoiceResults.length > 0 && (
                <div className="absolute bg-white border w-full mt-1 z-10 max-h-40 overflow-auto">
                {invoiceResults.map(c => (
                    <div
                    key={c.MaHD}
                    className="p-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                        setSelectedInvoice(c);
                        setInvoiceKeyword(`${c.MaHD} - ${c.TenKH}`);
                        setCustomer({
                            MaTKKH: c.MaTKKH,
                            HoTen: c.TenKH
                        });
                        setInvoiceResults([]);
                    }}
                    >
                    {c.MaHD} - {c.TenKH}
                    </div>
                ))}
                </div>
            )}
          </div>

          <div>
            <label className="font-medium">Khách hàng</label>
            <input
                value={customer.MaTKKH ? customer.MaTKKH + " - " + customer.HoTen : ""}
                disabled
                className="w-full p-2 border bg-gray-100 rounded"
                placeholder="Khách hàng"
            />
          </div>

          <div>
            <label className="font-medium">Ngày lập</label>
            <input
                value={selectedInvoice ? selectedInvoice.NgayLap : ""}
                disabled
                className="w-full p-2 border bg-gray-100 rounded"
                placeholder="Ngày lập"
            />
          </div>
        </div>

        {/* ADD PRODUCT */}
        <div className="p-6 border-b">
            <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="font-medium">Sản phẩm</label>
                <input
                    value={productKeyword}
                    onChange={handleProductSearchChange}
                    className="w-full p-2 border rounded"
                    placeholder="Nhập mã hoặc tên sản phẩm"
                />

                {productResults.length > 0 && (
                    <div className="absolute bg-white border w-full mt-1 z-10 max-h-40 overflow-auto">
                    {productResults.map(c => (
                        <div
                        key={c.MaSP}
                        className="p-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => {
                            setProductKeyword(`${c.MaSP} - ${c.TenSP}`);
                            setProductResults([]);
                            setCtmhForm({ ...ctmhForm, MaSP: c.MaSP, TenSP: c.TenSP });
                        }}
                        >
                        {c.MaSP} - {c.TenSP}
                        </div>
                    ))}
                    </div>
                )}
            </div>

            <div>
                <label className="font-medium">Số lượng</label>
                <input
                    type="number"
                    min="1"
                    step="1"
                    className="border p-2 rounded w-full"
                    value={ctmhForm.SoLuong || ""}
                    onChange={(e) => setCtmhForm({ ...ctmhForm, SoLuong: e.target.value })}
                />
            </div>

            <div> </div>
            <div className="text-right">
                <button
                    onClick={handleAddProduct}
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
                    Thêm sản phẩm
                </button>
            </div>
            </div>
        </div>
        

        {/* PURCHASE INVOICE */}
        <table className="w-full text-center border-t">
        <thead className="bg-gray-50">
            <tr className="text-xs text-gray-600">
            <th className="px-2 py-1">Mã sản phẩm</th>
            <th className="px-2 py-1">Tên sản phẩm</th>
            <th className="px-2 py-1">Số lượng</th>
            <th className="px-2 py-1"> </th>
            </tr>
        </thead>
        <tbody>
            {hdmh.filter(s => s.MaSP).map((s, i) => (
            <tr key={i} className="text-xs border-t">
                <td className="px-2 py-1">{s.MaSP}</td>
                <td className="px-2 py-1">{s.TenSP}</td>
                {/* SỐ LƯỢNG */}
                <td className="px-2 py-1">
                    {editingIndex === i ? (
                        <input
                            type="number"
                            min="1"
                            className="border p-1 w-20 rounded"
                            value={editDraft.SoLuong}
                            onChange={(e) =>
                                setEditDraft(d => ({ ...d, SoLuong: e.target.value }))
                            }
                        />
                        ) : (
                        s.SoLuong
                    )}
                </td>

                {/* ACTIONS */}
                <td className="px-2 py-1 text-right">
                    {editingIndex === i ? (
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => handleSaveEdit(i)}
                                className="text-green-600 hover:text-green-800"
                            >
                                <Check size={16} />
                            </button>
                            <button
                                onClick={() => {
                                    setEditingIndex(null);
                                    setEditDraft(null);
                                }}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    ) : (
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => {
                                    setEditingIndex(i);
                                    setEditDraft({ ...s });
                                }}
                                className="text-blue-600 hover:text-blue-800"
                                >
                                <Pencil size={16} />
                            </button>
                            <button
                                onClick={() => handleDeleteProduct(i)}
                                className="text-red-600 hover:text-red-800"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    )}
                </td>
            </tr>
            ))}
        </tbody>
        </table>

        {/* SUBMIT */}
        <div className="p-6 text-center">
        <button
            onClick={handleSubmitChange}
            disabled={editingIndex !== null || hdmh.length === 0 || !selectedInvoice}
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
            Thêm hoá đơn mua hàng
        </button>
        </div>

      </div>
    </div>
  );
}