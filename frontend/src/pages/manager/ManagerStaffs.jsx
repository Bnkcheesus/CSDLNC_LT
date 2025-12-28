import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../../components/ui/Header.jsx";
import Navbar from "../../components/ui/Navbar.jsx";
import PageTitle from "../../components/ui/PageTitle.jsx";
import CategoryBar from "../../components/ui/CategoryBar.jsx";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function ManagerStaffs() {
    const maTK = localStorage.getItem("maTK");
    const token = localStorage.getItem("token");
    const navigate = useNavigate();
    
    const [type, setType] = useState("all");
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [limit] = useState(20);
    const [order, setOrder] = useState("desc");
    const [totalPages, setTotalPages] = useState(1);
    const [error, setError] = useState("");

    const [branch, setBranch] = useState({
        MaCN: "",
        TenCN: ""
    });

    useEffect(() => {
        if (!token) return;
        
        const fetchBranchInfo = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/staff/profile`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });
                if (res.data.success) {
                    setBranch({
                        MaCN: res.data.data.MaCN,
                        TenCN: res.data.data.TenCN
                    });
                } else {
                    console.error("Failed to fetch branch info:", res.data.message);
                }
            } catch (err) {
                console.error("Error fetching branch info:", err);
            }
        };

        fetchBranchInfo();
    }, [token]);

    useEffect(() => {
        if (!maTK || !token || !branch.MaCN) return;

        const fetchStaffs = async () => {
            setLoading(true);
            setError("");
            try {
                const res = await axios.get(`http://localhost:5000/api/manager/staffs/${branch.MaCN}`, {
                    params: { type: type, page: page, limit: limit, order: order },
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                });

                if (res.data.success) {
                    setRows(res.data.data.rows || []);
                    console.log(res.data.data);
                    setTotalPages(res.data.data.totalPages || 1);
                } else {
                    setError("Failed to fetch staffs.");
                }
            } catch (err) {
                console.error("Error fetching staffs:", err);
                setError("An error occurred while fetching staffs.");
            } finally {
                setLoading(false);
            }
        };

        fetchStaffs();
    }, [maTK, token, type, page, limit, order, branch.MaCN]);

    const handleAddStaff = () => {
        navigate("/manager/staffs/new");
    }

    return (
        <div className="min-h-screen bg-white text-sm">
        <Header />
        <Navbar />
        <PageTitle title="Nhân viên chi nhánh" />

        <CategoryBar
            active={type}
            onChange={(t) => {
            setType(t);
            setPage(1);
            setOrder("desc");
            }}
            types={[
                { key: "all", label: "Tất cả" },
                { key: "BSTY", label: "Bác sĩ thú y" },
                { key: "NVTT", label: "Nhân viên tiếp tân" },
                { key: "NVBH", label: "Nhân viên bán hàng" }
            ]}
        />

        {/* table content */}
        <div className="max-w-[1200px] mx-auto px-4 py-6">
            <div className="p-4 text-right">
                <button
                    onClick={handleAddStaff}
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
                    + Tạo nhân viên mới
                </button>
            </div>
            {loading ? (
            <div className="text-center py-10">Đang tải...</div>
            ) : error ? (
            <div className="text-center text-red-600 py-6">{error}</div>
            ) : rows.length === 0 ? (
            <div className="text-center py-8 text-gray-600">
                Không tìm thấy nhân viên.
            </div>
            ) : (
                <div className="mt-6 bg-white border rounded shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b">
                        <h3 className="font-semibold text-base">
                            Thống kê nhân viên - {branch.TenCN}
                        </h3>

                        <select
                            value={order}
                            onChange={(e) => setOrder(e.target.value)}
                            className="border rounded px-2 py-1 text-sm"
                        >
                            <option value="desc">Điểm giảm dần</option>
                            <option value="asc">Điểm tăng dần</option>
                        </select>
                    </div>

                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-gray-600 text-xs">
                            <tr>
                                <th className="px-3 py-2 text-left">Nhân viên</th>
                                <th className="px-3 py-2 text-center">Chức vụ</th>
                                <th className="px-3 py-2 text-center">Số lượt xử lý nghiệp vụ</th>
                                <th className="px-3 py-2 text-center">Điểm đánh giá trung bình</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="text-center py-4 text-gray-500"
                                    >
                                        Không có dữ liệu
                                    </td>
                                </tr>
                            ) : (
                                rows.map((r) => (
                                    <tr
                                        key={r.MaTKNV}
                                        className="border-t hover:bg-gray-50"
                                    >
                                        <td className="px-3 py-2">
                                            {r.MaTKNV + " - " + r.HoTen}
                                        </td>
                                        <td className="px-3 py-2 text-center font-medium">
                                            {r.ChucVu}
                                        </td>
                                        <td className="px-3 py-2 text-center">
                                            {r.SoLuotXuLyNghiepVu?.toLocaleString()}
                                        </td>
                                        <td className="px-3 py-2 text-center">
                                            {r.DiemDanhGiaTB ? r.DiemDanhGiaTB : "-"}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        

            {/* pagination */}
            <div className="p-4 border-t bg-gray-50 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                Hiển thị trang {page} / {totalPages}
                </div>

                <div className="flex items-center gap-2">
                <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="p-2 rounded disabled:opacity-50"
                    title="Trang trước"
                >
                    <ChevronLeft size={18} />
                </button>

                <div className="text-sm px-2">
                    {/* optional: page input or display */}
                    <span>{page}</span>
                </div>

                <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="p-2 rounded disabled:opacity-50"
                    title="Trang sau"
                >
                    <ChevronRight size={18} />
                </button>
                </div>
            </div>
            </div>
        </div>
    );
}
