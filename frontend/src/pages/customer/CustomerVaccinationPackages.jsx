import { useState, useEffect } from "react";
import axios from "axios";
import Header from "../../components/ui/Header";
import Navbar from "../../components/ui/Navbar";
import PageTitle from "../../components/ui/PageTitle.jsx";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function CustomerVaccinationPackages() {
    const maTK = localStorage.getItem("maTK");
    const token = localStorage.getItem("token");
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [limit] = useState(20);
    const [totalPages, setTotalPages] = useState(1);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!maTK || !token) return;

        const fetchCustomerVaccinationPackages = async () => {
            setLoading(true);
            setError("");
            try {
                const res = await axios.get(`http://localhost:5000/api/customer/packages`, {
                    params: { page: page, limit: limit },
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                });

                if (res.data.success) {
                    setRows(res.data.data.rows || []);
                    setTotalPages(res.data.data.totalPages || 1);
                } else {
                    setError("Failed to fetch customer vaccination packages.");
                }
            } catch (err) {
                console.error("Error fetching customer vaccination packages:", err);
                setError("An error occurred while fetching customer vaccination packages.");
            } finally {
                setLoading(false);
            }
        };

        fetchCustomerVaccinationPackages();
    }, [maTK, token, page, limit]);

  return (
    <div className="min-h-screen bg-white text-sm">
      <Header />
      <Navbar />
      <PageTitle title="Gói tiêm của bạn" />

      <div className="max-w-[1200px] mx-auto px-4 py-6">
        <div className="bg-white shadow-sm border border-gray-200 rounded-md overflow-hidden">
          {/* table header */}
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-base font-semibold">Gói tiêm đã đăng ký</h3>
          </div>

          {/* table content */}
          <div className="p-4">
            {loading ? (
              <div className="text-center py-10">Đang tải...</div>
            ) : error ? (
              <div className="text-center text-red-600 py-6">{error}</div>
            ) : rows.length === 0 ? (
              <div className="text-center py-8 text-gray-600">
                Không tìm thấy gói tiêm.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full table-auto text-left">
                  <thead>
                    <tr className="text-xs text-gray-600">
                      <th className="px-3 py-2">Mã đăng ký</th>
                      <th className="px-3 py-2">Ngày đăng ký</th>
                      <th className="px-3 py-2">Tên gói</th>
                      <th className="px-3 py-2">Thú cưng</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => (
                      <tr
                        key={r.MaDK}
                        className="border-t hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-3 py-3 text-sm">{r.MaDK}</td>
                        <td className="px-3 py-3 text-sm">
                            {r.NgayDK
                            ? new Date(r.NgayDK).toLocaleDateString()
                            : "-"}
                        </td>
                        <td className="px-3 py-3 text-sm">{r.TenGoi || "-"}</td>
                        <td className="px-3 py-3 text-sm">{r.MaTC + " - " + r.TenTC || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

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
    </div>
  );
}