import { useState, useEffect } from "react";
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
    const [type, setType] = useState("CTTP");
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [limit] = useState(20);
    const [totalPages, setTotalPages] = useState(1);
    const [error, setError] = useState("");
    const [openRow, setOpenRow] = useState(null);
    const [rowDetails, setRowDetails] = useState({});

    const [vaccineKeyword, setVaccineKeyword] = useState("");
    const [vaccineResults, setVaccineResults] = useState([]);
    const [packages, setPackages] = useState([]);

    const [sddv, setSDDV] = useState({});
    const [pet, setPet] = useState([]);

    const [cttpForm, setCttpForm] = useState({
        MaVaccine: "",
        TenVaccine: "",
        LieuLuong: "",
        isInGoiTiem: false,
        MaDK: null,
        MaGoi: null,
        TenGoi: null
    });

    const [toaTiem, setToaTiem] = useState([{
        MaVaccine: "",
        TenVaccine: "",
        LieuLuong: "",
        MaDK: null,
        MaGoi: null,
        TenGoi: null,
        isNew: true
    }]);

    useEffect(() => {
        const fetchVaccinationInfo = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/doctor/tiemphong/${maSDDV}`, {
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
                } else {
                    console.error("Failed to fetch vaccination info:", res.data.message);
                }
            } catch (err) {
                console.error("Error fetching vaccination info:", err);
            }
        };
        fetchVaccinationInfo();
    }, [maSDDV, token]);

    useEffect(() => {
        const fetchToaTiem = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/doctor/tiemphong/${maSDDV}/toatiem`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                });
                if (res.data.success) {
                    setToaTiem(res.data.data.map(item => ({ ...item, isNew: false })));
                } else {
                    console.error("Failed to fetch toa tiem:", res.data.message);
                }
            } catch (err) {
                console.error("Error fetching toa tiem:", err);
            }
        };
        fetchToaTiem();
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
        if (type !== "LSTP") return;

        const fetchPetVaccinationHistory = async () => {
            setLoading(true);
            setError("");
            try {
                const res = await axios.get(`http://localhost:5000/api/doctor/pet/${sddv.MaTC}/history`, {
                    params: { type: "TP", page: page, limit: limit },
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                });

                if (res.data.success) {
                    setRows(res.data.data.rows || []);
                    setTotalPages(res.data.data.totalPages || 1);
                }
                else {
                    setError("Failed to fetch pet vaccination history.");
                }
            } catch (err) {
                console.error("Error fetching pet vaccination history:", err);
                setError("An error occurred while fetching pet vaccination history.");
            } finally {
                setLoading(false);
            }
        };

        fetchPetVaccinationHistory();
    }, [token, type, sddv.MaTC, page, limit]);

    const handleToggleRow = async (r) => {
        if (openRow === r.MaSDDV) {
            setOpenRow(null);
            return;
        }

        if (!rowDetails[r.MaSDDV]) {
            try {
                let res;
                res = await axios.get(`http://localhost:5000/api/doctor/tiemphong/${r.MaSDDV}/toatiem`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                });

                if (res?.data?.success) {
                    setRowDetails(prev => ({ ...prev, [r.MaSDDV]: res.data.data }));
                }
            } catch (err) {
                console.error("Error fetching vaccination details:", err);
            }
        }

        setOpenRow(r.MaSDDV);
    };

    const handleVaccineSearchChange = (e) => {
        setVaccineKeyword(e.target.value);
        setCttpForm({
            ...cttpForm,
            MaVaccine: "",
            TenVaccine: "",
            isInGoiTiem: false,
            MaDK: null,
            MaGoi: null,
            TenGoi: null
         });

        if (!e.target.value.trim()) {
            setVaccineResults([]);
        }
    };

    useEffect(() => {
        if (!vaccineKeyword.trim()) {
            return;
        }

        const fetchVaccine = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/doctor/vaccine?search=${vaccineKeyword}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                });
                if (res.data.success) {
                    setVaccineResults(res.data.data);
                } else {
                    console.error("Failed to fetch vaccine:", res.data.message);
                }
            } catch (err) {
                console.error("Error fetching vaccine:", err);
            }
        };
        fetchVaccine();
    }, [vaccineKeyword, token, vaccineResults]);
    
    const handleAddVaccine = () => {
        if (!cttpForm.MaVaccine || !cttpForm.TenVaccine || !cttpForm.LieuLuong) {
            alert("Vui lòng điền đầy đủ thông tin vaccine.");
            return;
        }
        if (cttpForm.isInGoiTiem && (!cttpForm.MaDK || !cttpForm.MaGoi || !cttpForm.TenGoi)) {
            alert("Vui lòng điền đầy đủ thông tin gói tiêm.");
            return;
        }

        setToaTiem(prevToaTiem => [
            ...prevToaTiem,
            {
                MaVaccine: cttpForm.MaVaccine,
                TenVaccine: cttpForm.TenVaccine,
                LieuLuong: cttpForm.LieuLuong,
                MaDK: cttpForm.isInGoiTiem ? cttpForm.MaDK : null,
                MaGoi: cttpForm.isInGoiTiem ? cttpForm.MaGoi : null,
                TenGoi: cttpForm.isInGoiTiem ? cttpForm.TenGoi : null,
                isNew: true
            }
        ]);

        setCttpForm({
            MaVaccine: "",
            TenVaccine: "",
            LieuLuong: "",
            isInGoiTiem: false,
            MaDK: null,
            MaGoi: null,
            TenGoi: null
        });
        setVaccineKeyword("");
    }

    useEffect(() => {
        if (!cttpForm.isInGoiTiem) {
            return;
        }

        const fetchDangKyGoiTiem = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/doctor/pet/${sddv.MaTC}/goitiem`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                });
                if (res.data.success) {
                    setPackages(res.data.data);
                } else {
                    console.error("Failed to fetch dang ky goi tiem:", res.data.message);
                }
            } catch (err) {
                console.error("Error fetching dang ky goi tiem:", err);
            }
        };
        fetchDangKyGoiTiem();
    }, [cttpForm.isInGoiTiem, sddv.MaTC, token]);

    const handleSubmitChange = async () => {
        try {
            for (const t of toaTiem) {
                if (!t.isNew) continue;
                await axios.post(`http://localhost:5000/api/doctor/tiemphong/${maSDDV}/toatiem`, {
                    MaVaccine: t.MaVaccine,
                    LieuLuong: t.LieuLuong,
                    MaDK: t.MaDK ? t.MaDK : null
                }, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                });
                t.isNew = false;
            }

            alert("Chi tiết tiêm phòng đã được cập nhật thành công!");
        } catch (err) {
            console.error("Error submitting change:", err);
            alert("Đã có lỗi xảy ra khi cập nhật chi tiết tiêm phòng.");
        }
    }

    return (
    <div className="min-h-screen bg-white text-sm">
      <Header />
      <Navbar />
      <PageTitle title={`Chi tiết tiêm phòng #${maSDDV}`} />

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
            { key: "CTTP", label: "Chi tiết tiêm phòng" },
            { key: "LSTP", label: "Lịch sử tiêm phòng" }
        ]}
      />

      {type === "CTTP" && (
        <div className="max-w-[1200px] mx-auto px-4 py-6">
            <div className="bg-white border rounded shadow-sm p-4">
                <h3 className="text-base font-semibold mb-3">Thông tin tiêm phòng</h3>
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
                        <label className="font-medium">Ngày tiêm</label>
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

                {/* ADD VACCINE */}
                <div className="p-6 border-b">
                    <div className="grid grid-cols-4 gap-4">
                        <div>
                            <label className="font-medium">Vaccine</label>
                            <input
                                value={vaccineKeyword}
                                onChange={handleVaccineSearchChange}
                                className="w-full p-2 border rounded"
                                placeholder="Nhập mã hoặc tên vaccine"
                            />

                            {vaccineResults.length > 0 && (
                                <div className="absolute bg-white border w-full mt-1 z-10 max-h-40 overflow-auto">
                                {vaccineResults.map(c => (
                                    <div
                                    key={c.MaVaccine}
                                    className="p-2 hover:bg-gray-100 cursor-pointer"
                                    onClick={() => {
                                        setVaccineKeyword(`${c.MaVaccine} - ${c.TenVaccine}`);
                                        setVaccineResults([]);
                                        setCttpForm({ ...cttpForm, MaVaccine: c.MaVaccine, TenVaccine: c.TenVaccine });
                                    }}
                                    >
                                    {c.MaVaccine} - {c.TenVaccine}
                                    </div>
                                ))}
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="font-medium">Liều lượng</label>
                            <input
                                type="number"
                                min="1"
                                step="1"
                                className="border p-2 rounded w-full"
                                value={cttpForm.LieuLuong || ""}
                                onChange={(e) => setCttpForm({ ...cttpForm, LieuLuong: e.target.value })}
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="font-medium block mb-1">Gói tiêm</label>

                            {/* RADIO */}
                            <label className="inline-flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={cttpForm.isInGoiTiem}
                                    onChange={(e) =>
                                        setCttpForm({
                                            ...cttpForm,
                                            isInGoiTiem: e.target.checked,
                                            MaDK: null,
                                            MaGoi: null,
                                            TenGoi: null
                                        })
                                    }
                                />
                                <span>Sử dụng gói tiêm</span>
                            </label>

                            {/* DROPDOWN */}
                            <select
                                disabled={!cttpForm.isInGoiTiem}
                                className={`w-full mt-2 p-2 border rounded 
                                    ${!cttpForm.isInGoiTiem ? "bg-gray-100 cursor-not-allowed" : ""}`}
                                value={cttpForm.MaDK || ""}
                                onChange={(e) => {
                                    const selected = packages.find(p => p.MaDK === e.target.value);
                                    if (!selected) return;

                                    setCttpForm({
                                        ...cttpForm,
                                        MaDK: selected.MaDK,
                                        MaGoi: selected.MaGoi,
                                        TenGoi: selected.TenGoi
                                    });
                                }}
                            >
                                <option value="">-- Chọn gói tiêm --</option>
                                {packages.map(p => (
                                    <option key={p.MaDK} value={p.MaDK}>
                                        {p.TenGoi} (ĐK: {p.MaDK})
                                    </option>
                                ))}
                            </select>
                        </div>

                    </div >
                    
                    <div className="p-4"></div>
                    <div className="text-right">
                        <button
                            onClick={handleAddVaccine}
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
                            Thêm vaccine
                        </button>
                    </div>
                </div>
                
                

                {/* TOA TIEM */}
                <table className="w-full text-center border-t">
                    <thead className="bg-gray-50">
                        <tr className="text-xs text-gray-600">
                            <th className="px-2 py-1">Mã vaccine</th>
                            <th className="px-2 py-1">Tên vaccine</th>
                            <th className="px-2 py-1">Liều lượng</th>
                            <th className="px-2 py-1">Mã đăng ký</th>
                            <th className="px-2 py-1">Mã gói</th>
                            <th className="px-2 py-1">Tên gói</th>
                        </tr>
                    </thead>
                    <tbody>
                        {toaTiem.map((s, i) => (
                        <tr key={i} className="text-xs border-t">
                            <td className="px-2 py-1">{s.MaVaccine}</td>
                            <td className="px-2 py-1">{s.TenVaccine}</td>
                            <td className="px-2 py-1">{s.LieuLuong}</td>
                            <td className="px-2 py-1">{s.MaDK || "-"}</td>
                            <td className="px-2 py-1">{s.MaGoi || "-"}</td>
                            <td className="px-2 py-1">{s.TenGoi || "-"}</td>
                        </tr>
                        ))}
                    </tbody>
                </table>

                {/* SUBMIT */}
                <div className="p-6 text-center">
                <button
                    onClick={handleSubmitChange}
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
     {type === "LSTP" && (
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