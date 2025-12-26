import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2 } from "lucide-react";

export default function CustomerCart() {
    const navigate = useNavigate();

    const [cart, setCart] = useState(() => {
        return JSON.parse(localStorage.getItem("cart")) || [];
    });

    useEffect(() => {
        localStorage.setItem("cart", JSON.stringify(cart));
    }, [cart]);

    const handleRemoveFromCart = (productId) => {
        setCart(prev => prev.filter(p => p.MaSP !== productId));
    };

    const handleCheckout = () => {
        navigate('/customer/order/checkout');
    }

    return (
        <div className="bg-white shadow-sm border border-gray-200 rounded-md overflow-hidden">
          {/* table header */}
          <div className="border-b border-gray-100 flex items-center justify-between p-4">
            <h3 className="text-base font-semibold">Giỏ hàng của bạn ({cart.length} sản phẩm)</h3>
          </div>

          {/* table content */}
          <div className="p-4">
            {cart.length === 0 ? (
              <div className="text-center py-8 text-gray-600">
                Giỏ hàng trống.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full table-auto text-left">
                  <thead>
                    <tr className="text-xs text-gray-600">
                      <th className="px-3 py-2">Sản phẩm</th>
                      <th className="px-3 py-2">Loại</th>
                      <th className="px-3 py-2">Số lượng</th>
                      <th className="px-3 py-2">Tổng tiền</th>
                      <th className="px-3 py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {cart.map((c) => (
                      <tr
                        key={c.MaSP}
                        className="border-t hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-3 py-3 text-sm">{c.MaSP + " - " + c.TenSP}</td>
                        <td className="px-3 py-3 text-sm">{c.LoaiSP}</td>
                        <td className="px-3 py-3 text-sm">
                            <input
                                type="number"
                                min="1"
                                step="1"
                                className="border p-2 rounded"
                                value={c.SoLuong}
                                onChange={(e) => {
                                    const newQty = Math.max(1, parseInt(e.target.value) || 1);
                                    setCart(prev => prev.map(p =>
                                        p.MaSP === c.MaSP
                                            ? { ...p, SoLuong: newQty, TongTien: (p.Gia * newQty) }
                                            : p
                                    ));
                                }}
                            />
                        </td>
                        <td className="px-3 py-3 text-sm">{c.Gia ? (c.Gia * c.SoLuong).toLocaleString() + " đ" : "-"}</td>
                        <td className="px-3 py-3 text-sm text-right">
                          <button
                            onClick={() => handleRemoveFromCart(c.MaSP)}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded hover:bg-gray-100"
                            title="Xóa khỏi giỏ hàng"
                          >
                            <Trash2 size={16} />
                            <span className="sr-only">Xóa khỏi giỏ hàng</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>   

          {/* SUBMIT */}
        {cart.length > 0 && (
            <div className="p-6 text-center">
                <button
                    onClick={handleCheckout}
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
                    Thanh toán
                </button>
            </div>         
        )}                    
        </div>
    );
}