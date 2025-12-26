import { useState, useEffect } from "react";
import axios from "axios";
import { PackagePlus, ChevronLeft, ChevronRight } from "lucide-react";

export default function CustomerProducts() {
    const maTK = localStorage.getItem("maTK");
    const token = localStorage.getItem("token");
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [limit] = useState(20);
    const [totalPages, setTotalPages] = useState(1);
    const [error, setError] = useState("");
    const [productKeyword, setProductKeyword] = useState("");

    const [cart, setCart] = useState(() => {
        return JSON.parse(localStorage.getItem("cart")) || [];
    });

    useEffect(() => {
        localStorage.setItem("cart", JSON.stringify(cart));
    }, [cart]);

    useEffect(() => {
        if (!maTK || !token) return;

        const fetchProducts = async () => {
            setLoading(true);
            setError("");
            try {
                const res = await axios.get(`http://localhost:5000/api/customer/products`, {
                    params: { keyword: productKeyword === "" ? null : productKeyword, page: page, limit: limit },
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                });

                if (res.data.success) {
                    setRows(res.data.data.rows || []);
                    setTotalPages(res.data.data.totalPages || 1);
                } else {
                    setError("Failed to fetch products.");
                }
            } catch (err) {
                console.error("Error fetching products:", err);
                setError("An error occurred while fetching products.");
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [maTK, token, productKeyword, page, limit]);

    const handleAddToCart = (product) => {
        setCart(prev => {
            const existing = prev.find(p => p.MaSP === product.MaSP);
            if (existing) {
                return prev.map(p =>
                p.MaSP === product.MaSP
                    ? { ...p, SoLuong: p.SoLuong + 1 }
                    : p
                );
            }
            return [...prev, {
                MaSP: product.MaSP,
                TenSP: product.TenSP,
                LoaiSP: product.LoaiSP,
                Gia: product.Gia,
                SoLuong: 1
            }];
        });

        alert(`Đã thêm sản phẩm "${product.TenSP}" vào giỏ hàng.`);
    }

    return (
        <div className="bg-white shadow-sm border border-gray-200 rounded-md overflow-hidden">
          {/* table header */}
          <div className="border-b border-gray-100 flex items-center justify-between p-4">
            <h3 className="text-base font-semibold">Danh mục sản phẩm</h3>
            <input
                value={productKeyword}
                onChange={(e) => setProductKeyword(e.target.value)}
                className="p-2 border rounded w-full max-w-sm"
                placeholder="Nhập mã hoặc tên sản phẩm để tìm kiếm"
            />
          </div>

          {/* table content */}
          <div className="p-4">
            {loading ? (
              <div className="text-center py-10">Đang tải...</div>
            ) : error ? (
              <div className="text-center text-red-600 py-6">{error}</div>
            ) : rows.length === 0 ? (
              <div className="text-center py-8 text-gray-600">
                Không tìm thấy sản phẩm.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full table-auto text-left">
                  <thead>
                    <tr className="text-xs text-gray-600">
                      <th className="px-3 py-2">Sản phẩm</th>
                      <th className="px-3 py-2">Loại</th>
                      <th className="px-3 py-2">Giá bán</th>
                      <th className="px-3 py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => (
                      <tr
                        key={r.MaSP}
                        className="border-t hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-3 py-3 text-sm">{r.MaSP + " - " + r.TenSP}</td>
                        <td className="px-3 py-3 text-sm">{r.LoaiSP}</td>
                        <td className="px-3 py-3 text-sm">{r.Gia ? r.Gia.toLocaleString() + " đ" : "-"}</td>
                        <td className="px-3 py-3 text-sm text-right">
                          <button
                            onClick={() => handleAddToCart(r)}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded hover:bg-gray-100"
                            title="Thêm vào giỏ hàng"
                          >
                            <PackagePlus size={16} />
                            <span className="sr-only">Thêm vào giỏ hàng</span>
                          </button>
                        </td>
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
    );
}