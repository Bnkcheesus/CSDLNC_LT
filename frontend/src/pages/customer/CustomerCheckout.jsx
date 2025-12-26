import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/ui/Header";
import Navbar from "../../components/ui/Navbar";
import PageTitle from "../../components/ui/PageTitle.jsx";
import axios from "axios";

export default function CustomerCheckout() {
    const maTK = localStorage.getItem("maTK");
    const token = localStorage.getItem("token");
    const navigate = useNavigate();
    
    const cart = JSON.parse(localStorage.getItem("cart")) || [];

    const [customerName, setCustomerName] = useState("");
    const [method, setMethod] = useState("TM");

    useEffect(() => {
        if (!maTK || !token) return;
        const fetchCustomerName = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/user/name`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                });
                setCustomerName(res.data.hoTen);
            } catch (error) {
                console.error("Failed to fetch customer name:", error);
            }
        };

        fetchCustomerName();
    }, [maTK, token]);
    
    const handlePlaceOrder = async () => {
        try {
            const res = await axios.post("http://localhost:5000/api/customer/order", {
                MaTKKH: maTK,
                HinhThucThanhToan: method
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });

            const MaHD = res.data.data.MaHD;
            const MaSDDV = res.data.data.MaSDDV;

            for (const c of cart.filter(c => c.MaSP)) {
                await axios.post(`http://localhost:5000/api/customer/order/${MaSDDV}`, {
                    MaSP: c.MaSP,
                    SoLuong: c.SoLuong
                }, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                });
            }

            alert("Đặt hàng thành công! Mã hoá đơn: " + MaHD);
            localStorage.removeItem("cart");
            navigate("/customer/order");
        } catch (err) {
            console.error("Error placing order:", err);
            alert("Đã có lỗi xảy ra khi đặt hàng.");
        }
    }

    return (
    <div className="min-h-screen bg-white text-sm">
      <Header />
      <Navbar />
      <PageTitle title={`Checkout`} />

      <div className="max-w-[1200px] mx-auto px-4 mt-6">
        <div className="bg-white border rounded-md shadow-sm p-4 mb-6">
            <h3 className="text-base font-semibold mb-3">Thông tin hoá đơn đặt hàng</h3>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-y-2 text-sm border-b p-6">
                <p><strong>Mã khách hàng:</strong> {maTK}</p>
                <p><strong>Tên khách hàng:</strong> {customerName}</p>
                <p><strong>Ngày đặt hàng:</strong> {new Date().toLocaleDateString()}</p>
                <p><strong>Số sản phẩm:</strong> {cart.reduce((total, item) => total + item.SoLuong, 0)}</p>
                <p><strong>Tổng tiền:</strong> {cart.reduce((total, item) => total + item.TongTien, 0).toLocaleString() + " đ"}</p>
                <p><strong>Hình thức thanh toán</strong> {
                    <select
                        value={method}
                        onChange={(e) => setMethod(e.target.value)}
                        className="border rounded px-2 py-1"
                    >
                        <option value="TM">Tiền mặt</option>
                        <option value="CK">Chuyển khoản</option>
                    </select>
                }</p>
            </div>

            <div className="p-6">
                <table className="w-full text-center border-t">
                    <thead className="bg-gray-50">
                        <tr className="text-xs text-gray-600">
                            <th className="px-2 py-1">Sản phẩm</th>
                            <th className="px-2 py-1">Số lượng</th>
                            <th className="px-2 py-1">Tổng tiền</th>
                        </tr>
                    </thead>
                    <tbody>
                        {cart.filter(c => c.MaSP).map((c, i) => (
                        <tr key={i} className="text-xs border-t">
                            <td className="px-2 py-1">{c.MaSP + " - " + c.TenSP}</td>
                            <td className="px-2 py-1">{c.SoLuong}</td>
                            <td className="px-2 py-1">{c.TongTien.toLocaleString() + " đ"}</td>
                        </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="p-6 text-center">
                <button
                    onClick={handlePlaceOrder}
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
                    Đặt hàng
                </button>
            </div>  
        </div>
      </div>
    </div>
  );
}