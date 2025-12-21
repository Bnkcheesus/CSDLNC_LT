import { useState, useEffect } from "react";
import { Pencil, Trash2, Check, X } from "lucide-react";
import { useParams } from "react-router-dom";
import Header from "../../components/ui/Header";
import Navbar from "../../components/ui/Navbar";
import PageTitle from "../../components/ui/PageTitle.jsx";
import CategoryBar from "../../components/ui/CategoryBar.jsx";
import PetInfoCard from "../../components/ui/PetInfoCard.jsx";
import PetHistoryTable from "../../components/ui/PetHistoryTable.jsx";
import axios from "axios";

export default function DocExamination() {
    const token = localStorage.getItem("token");
    const { maSDDV } = useParams();
    const [type, setType] = useState("CTKB");
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [limit] = useState(20);
    const [totalPages, setTotalPages] = useState(1);
    const [error, setError] = useState("");
    const [openRow, setOpenRow] = useState(null);
    const [rowDetails, setRowDetails] = useState({});
    const [editingIndex, setEditingIndex] = useState(null);
    const [editDraft, setEditDraft] = useState(null);

    const [thuocKeyword, setThuocKeyword] = useState("");
    const [thuocResults, setThuocResults] = useState([]);
    const [deletedThuoc, setDeletedThuoc] = useState([]);

    const [sddv, setSDDV] = useState({});
    const [pet, setPet] = useState([]);

    const [ctkb, setCTKB] = useState({
        TrieuChung: "",
        ChuanDoan: "",
        NgayTaiKham: ""
    });

    const [ctttForm, setCtttForm] = useState({
        MaThuoc: "",
        TenThuoc: "",
        SoLuong: null,
        LieuLuong: "",
        CachDung: ""
    });

    const [toaThuoc, setToaThuoc] = useState([{
        MaThuoc: "",
        TenThuoc: "",
        SoLuong: null,
        LieuLuong: "",
        CachDung: "",
        isNew: true
    }]);

    useEffect(() => {
        const fetchExaminationInfo = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/doctor/khambenh/${maSDDV}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                });
                if (res.data.success) {
                    setSDDV({
                        MaSDDV: res.data.data.MaSDDV,
                        NgaySDDV: res.data.data.NgayLap,
                        LoaiDV: res.data.data.LoaiDV,
                        TenCN: res.data.data.TenCN,
                        MaKH: res.data.data.MaKH,
                        TenKH: res.data.data.TenKH,
                        MaTC: res.data.data.MaTC,
                        TenTC: res.data.data.TenTC,
                        MaBS: res.data.data.MaBS,
                        TenBS: res.data.data.TenBS
                    });
                    setCTKB({
                        TrieuChung: res.data.data.TrieuChung || "",
                        ChuanDoan: res.data.data.ChuanDoan || "",
                        NgayTaiKham: res.data.data.NgayTaiKham ? res.data.data.NgayTaiKham.slice(0, 10) : ""
                    });
                } else {
                    console.error("Failed to fetch examination info:", res.data.message);
                }
            } catch (err) {
                console.error("Error fetching examination info:", err);
            }
        };
        fetchExaminationInfo();
    }, [maSDDV, token]);

    useEffect(() => {
        const fetchToaThuoc = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/doctor/khambenh/${maSDDV}/toathuoc`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                });
                if (res.data.success) {
                    setToaThuoc(res.data.data.map(item => ({ ...item, isNew: false })));
                } else {
                    console.error("Failed to fetch toa thuoc:", res.data.message);
                }
            } catch (err) {
                console.error("Error fetching toa thuoc:", err);
            }
        };
        fetchToaThuoc();
    }, [maSDDV, token]);

    useEffect(() => {
        if (!sddv.MaTC) return;
        const fetchPet = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/doctor/pet/${sddv.MaTC}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                });
                if (res.data.success) {
                    setPet(res.data.data);
                } else {
                    console.error("Failed to fetch pet:", res.data.message);
                }
            } catch (err) {
                console.error("Error fetching pet:", err);
            }
        };
        fetchPet();
    }, [sddv.MaTC, token]);

    useEffect(() => {
        if (!token || !sddv.MaTC) return;
        if (type !== "LSKB") return;

        const fetchPetExaminationHistory = async () => {
            setLoading(true);
            setError("");
            try {
                const res = await axios.get(`http://localhost:5000/api/doctor/pet/${sddv.MaTC}/history`, {
                    params: { type: "KB", page: page, limit: limit },
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                });

                if (res.data.success) {
                    setRows(res.data.data.rows || []);
                    setTotalPages(res.data.data.totalPages || 1);
                }
                else {
                    setError("Failed to fetch pet examination history.");
                }
            } catch (err) {
                console.error("Error fetching pet examination history:", err);
                setError("An error occurred while fetching pet examination history.");
            } finally {
                setLoading(false);
            }
        };

        fetchPetExaminationHistory();
    }, [token, type, sddv.MaTC, page, limit]);

    const handleToggleRow = async (r) => {
        if (openRow === r.MaSDDV) {
            setOpenRow(null);
            return;
        }

        if (!rowDetails[r.MaSDDV]) {
            try {
                let res;
                res = await axios.get(`http://localhost:5000/api/doctor/khambenh/${r.MaSDDV}/toathuoc`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                });

                if (res?.data?.success) {
                    setRowDetails(prev => ({ ...prev, [r.MaSDDV]: res.data.data }));
                }
            } catch (err) {
                console.error("Error fetching prescription details:", err);
            }
        }

        setOpenRow(r.MaSDDV);
    };

    const handleThuocSearchChange = (e) => {
        setThuocKeyword(e.target.value);
        setCtttForm({ ...ctttForm, MaThuoc: "", TenThuoc: "" });

        if (!e.target.value.trim()) {
            setThuocResults([]);
        }
    };

    useEffect(() => {
        if (!thuocKeyword.trim()) {
            return;
        }

        const fetchThuoc = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/doctor/thuoc?search=${thuocKeyword}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                });
                if (res.data.success) {
                    setThuocResults(res.data.data);
                } else {
                    console.error("Failed to fetch thuoc:", res.data.message);
                }
            } catch (err) {
                console.error("Error fetching thuoc:", err);
            }
        };
        fetchThuoc();
    }, [thuocKeyword, token, thuocResults]);

    const handleAddThuoc = () => {
        if (!ctttForm.MaThuoc || !ctttForm.TenThuoc || !ctttForm.SoLuong || !ctttForm.LieuLuong || !ctttForm.CachDung) {
            alert("Vui lòng điền đầy đủ thông tin thuốc.");
            return;
        }

        setToaThuoc(prevToaThuoc => [
            ...prevToaThuoc,
            {
                MaThuoc: ctttForm.MaThuoc,
                TenThuoc: ctttForm.TenThuoc,
                SoLuong: ctttForm.SoLuong,
                LieuLuong: ctttForm.LieuLuong,
                CachDung: ctttForm.CachDung,
                isNew: true
            }
        ]);

        setCtttForm({
            MaThuoc: "",
            TenThuoc: "",
            SoLuong: null,
            LieuLuong: "",
            CachDung: ""
        });
        setThuocKeyword("");
    }

    const handleDeleteThuoc = (index) => {
        if (!window.confirm("Bạn có chắc muốn xoá thuốc này?")) return;

        setToaThuoc(prev => {
            const thuoc = prev[index];
            if (!thuoc.isNew) {
                setDeletedThuoc(d => [...d, thuoc]);
            }

            return prev.filter((_, i) => i !== index);
        });
    };

    const handleSaveEdit = (index) => {
        setToaThuoc(prev =>
            prev.map((t, i) =>
            i === index
                ? { ...editDraft, isNew: t.isNew }
                : t
            )
        );
        setEditingIndex(null);
        setEditDraft(null);
    };

    const handleSubmitChange = async () => {
        try {
            await axios.put(`http://localhost:5000/api/doctor/khambenh/${maSDDV}`, {
                TrieuChung: ctkb.TrieuChung,
                ChuanDoan: ctkb.ChuanDoan,
                NgayTaiKham: ctkb.NgayTaiKham
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });

            for (const t of deletedThuoc) {
                await axios.delete(`http://localhost:5000/api/doctor/khambenh/${maSDDV}/toathuoc/${t.MaThuoc}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );
            }
            setDeletedThuoc([]);

            for (const t of toaThuoc) {
                if (!t.isNew) {
                    await axios.put(`http://localhost:5000/api/doctor/khambenh/${maSDDV}/toathuoc/${t.MaThuoc}`, {
                        SoLuong: t.SoLuong,
                        LieuLuong: t.LieuLuong,
                        CachDung: t.CachDung
                    }, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        }
                    });
                }
                else {
                    await axios.post(`http://localhost:5000/api/doctor/khambenh/${maSDDV}/toathuoc`, {
                        MaThuoc: t.MaThuoc,
                        SoLuong: t.SoLuong,
                        LieuLuong: t.LieuLuong,
                        CachDung: t.CachDung
                    }, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        }
                    });
                    t.isNew = false;
                }
            }

            alert("Chi tiết khám bệnh đã được cập nhật thành công!");
        } catch (err) {
            console.error("Error submitting change:", err);
            alert("Đã có lỗi xảy ra khi cập nhật chi tiết khám bệnh.");
        }
    }

    return (
    <div className="min-h-screen bg-white text-sm">
      <Header />
      <Navbar />
      <PageTitle title={`Chi tiết khám bệnh #${maSDDV}`} />

      {/* ---------------- PET INFORMATION ---------------- */}
      <div className="max-w-[1200px] mx-auto px-4 mt-6">
        <PetInfoCard pet={pet} />
      </div>

      {/* ---------------- CATEGORY BAR ---------------- */}
      <CategoryBar
        active={type}
        onChange={(t) => {
            setType(t);
            setPage(1);
            setOpenRow(null);
        }}
        types={[
            { key: "CTKB", label: "Chi tiết khám bệnh" },
            { key: "LSKB", label: "Lịch sử khám bệnh" }
        ]}
      />

      {type === "CTKB" && (
        <div className="max-w-[1200px] mx-auto px-4 py-6">
            <div className="bg-white border rounded shadow-sm p-4">
                <h3 className="text-base font-semibold mb-3">Thông tin khám bệnh</h3>
                {/* SDDV INFO */}
                <div className="p-6 grid grid-cols-3 gap-4 border-b">
                    <div>
                        <label className="font-medium">Bác sĩ</label>
                        <input value={sddv.MaBS + " - " + sddv.TenBS} disabled className="w-full p-2 border bg-gray-100 rounded" />
                    </div>
                    <div>
                        <label className="font-medium">Chi nhánh</label>
                        <input value={sddv.TenCN} disabled className="w-full p-2 border bg-gray-100 rounded" />
                    </div>
                    <div>
                        <label className="font-medium">Ngày khám</label>
                        <input value={sddv.NgaySDDV} disabled className="w-full p-2 border bg-gray-100 rounded" />
                    </div>
                    <div>
                        <label className="font-medium">Khách hàng</label>
                        <input value={sddv.MaKH + " - " + sddv.TenKH} disabled className="w-full p-2 border bg-gray-100 rounded" />
                    </div>
                    <div>
                        <label className="font-medium">Thú cưng</label>
                        <input value={sddv.MaTC + " - " + sddv.TenTC} disabled className="w-full p-2 border bg-gray-100 rounded" />
                    </div>
                </div>

                {/* CTKB */}
                <div className="p-6 border-b grid grid-cols-3 gap-4">
                    <div>
                        <label className="font-medium">Triệu chứng</label>
                        <textarea
                            className="border p-2 rounded w-full h-24"
                            value={ctkb.TrieuChung}
                            onChange={(e) => setCTKB({ ...ctkb, TrieuChung: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="font-medium">Chuẩn đoán</label>
                        <textarea
                            className="border p-2 rounded w-full h-24"
                            value={ctkb.ChuanDoan}
                            onChange={(e) => setCTKB({ ...ctkb, ChuanDoan: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="font-medium">Ngày tái khám</label>
                        <input
                            type="date"
                            name="NgayTaiKham"
                            value={ctkb.NgayTaiKham}
                            onChange={(e) => setCTKB({ ...ctkb, NgayTaiKham: e.target.value })}
                            className="w-full p-2 border rounded"
                        />
                    </div>
                </div>

                {/* ADD THUOC */}
                <div className="p-6 border-b">
                    <div className="grid grid-cols-4 gap-4">
                    <div>
                        <label className="font-medium">Thuốc</label>
                        <input
                            value={thuocKeyword}
                            onChange={handleThuocSearchChange}
                            className="w-full p-2 border rounded"
                            placeholder="Nhập mã hoặc tên thuốc"
                        />

                        {thuocResults.length > 0 && (
                            <div className="absolute bg-white border w-full mt-1 z-10 max-h-40 overflow-auto">
                            {thuocResults.map(c => (
                                <div
                                key={c.MaThuoc}
                                className="p-2 hover:bg-gray-100 cursor-pointer"
                                onClick={() => {
                                    setThuocKeyword(`${c.MaThuoc} - ${c.TenThuoc}`);
                                    setThuocResults([]);
                                    setCtttForm({ ...ctttForm, MaThuoc: c.MaThuoc, TenThuoc: c.TenThuoc });
                                }}
                                >
                                {c.MaThuoc} - {c.TenThuoc}
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
                            value={ctttForm.SoLuong || ""}
                            onChange={(e) => setCtttForm({ ...ctttForm, SoLuong: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="font-medium">Liều lượng</label>
                        <input
                            type="text"
                            className="border p-2 rounded w-full"
                            value={ctttForm.LieuLuong}
                            onChange={(e) => setCtttForm({ ...ctttForm, LieuLuong: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="font-medium">Cách dùng</label>
                        <input
                            type="text"
                            className="border p-2 rounded w-full"
                            value={ctttForm.CachDung}
                            onChange={(e) => setCtttForm({ ...ctttForm, CachDung: e.target.value })}
                        />
                    </div>
                    </div >
                    
                    <div className="p-4"></div>
                    <div className="text-right">
                        <button
                            onClick={handleAddThuoc}
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
                            Thêm thuốc
                        </button>
                    </div>
                </div>
                
                

                {/* TOA THUOC */}
                <table className="w-full text-center border-t">
                <thead className="bg-gray-50">
                    <tr className="text-xs text-gray-600">
                    <th className="px-2 py-1">Mã thuốc</th>
                    <th className="px-2 py-1">Tên thuốc</th>
                    <th className="px-2 py-1">Số lượng</th>
                    <th className="px-2 py-1">Liều lượng</th>
                    <th className="px-2 py-1">Cách dùng</th>
                    <th className="px-2 py-1"> </th>
                    </tr>
                </thead>
                <tbody>
                    {toaThuoc.filter(s => s.MaThuoc).map((s, i) => (
                    <tr key={i} className="text-xs border-t">
                        <td className="px-2 py-1">{s.MaThuoc}</td>
                        <td className="px-2 py-1">{s.TenThuoc}</td>
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

                        {/* LIỀU LƯỢNG */}
                        <td className="px-2 py-1">
                            {editingIndex === i ? (
                                <input
                                    type="text"
                                    className="border p-1 w-full rounded"
                                    value={editDraft.LieuLuong}
                                    onChange={(e) => {
                                        setEditDraft(d => ({ ...d, LieuLuong: e.target.value }));
                                    }}
                                />
                            ) : (
                                s.LieuLuong
                            )}
                        </td>

                        {/* CÁCH DÙNG */}
                        <td className="px-2 py-1">
                            {editingIndex === i ? (
                                <input
                                    type="text"
                                    className="border p-1 w-full rounded"
                                    value={editDraft.CachDung}
                                    onChange={(e) => {
                                        setEditDraft(d => ({ ...d, CachDung: e.target.value }));
                                    }}
                                />
                            ) : (
                                s.CachDung
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
                                        onClick={() => handleDeleteThuoc(i)}
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
                    disabled={editingIndex !== null}
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
                    Cập nhật
                </button>
                </div>
            </div>
        </div>
     )}
     {type === "LSKB" && (
        <div className="max-w-[1200px] mx-auto px-4 py-6">
            <PetHistoryTable
            rows={rows}
            loading={loading}
            error={error}
            page={page}
            totalPages={totalPages}
            openRow={openRow}
            rowDetails={rowDetails}
            onToggleRow={handleToggleRow}
            onPrevPage={() => setPage(p => Math.max(1, p - 1))}
            onNextPage={() => setPage(p => Math.min(totalPages, p + 1))}
            />
        </div>
      )}
    </div>
  );
}