import FeatureCard from "../../components/ui/FeatureCard";
import { useEffect, useState } from "react";
import axios from "axios";

export default function CustomerHome() {
    const [customer, setCustomer] = useState("");

    const maTK = localStorage.getItem("maTK");

    useEffect(() => {
        const fetchCustomer = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/customer/${maTK}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });
                setCustomer(res.data.data);
            } catch (err) {
                console.error("Error fetching customer name:", err);
            }
        };

        fetchCustomer();
    }, []);

    return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Header Banner */}
      <div className="bg-white shadow-md rounded-xl p-6 mb-8 border border-gray-200">
        <h2 className="text-xl font-bold text-gray-800 mb-3">
          Xin chào, {customer?.HoTen || "khách hàng"} 👋
        </h2>

        {customer ? (
          <div className="space-y-1 text-gray-700">
            <p><strong>Mã khách hàng:</strong> {customer.MaTKKH}</p>
            <p><strong>Số điện thoại:</strong> {customer.SDT}</p>
            <p><strong>Email:</strong> {customer.Email}</p>
            <p><strong>Điểm tích lũy:</strong> {customer.DiemTichLuy}</p>
            <p><strong>Loại thành viên:</strong> {customer.LoaiThanhVien}</p>
          </div>
        ) : (
          <p className="text-gray-500 italic">Đang tải thông tin...</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        <FeatureCard
          title="Tra cứu gói vaccine"
          description="Xem chi tiết các gói vaccine dành cho thú cưng."
          to="/customer/vaccine-packages"
          icon={<span className="text-4xl"></span>}
        />

        <FeatureCard
          title="Lịch sử sử dụng dịch vụ"
          description="Theo dõi lịch sử khám bệnh, tiêm phòng và mua hàng của bạn."
          to="/customer/history"
          icon={<span className="text-4xl"></span>}
        />

        <FeatureCard
          title="Đánh giá dịch vụ"
          description="Gửi đánh giá sau khi sử dụng dịch vụ."
          to="/customer/reviews"
          icon={<span className="text-4xl"></span>}
        />

        <FeatureCard
          title="Quản lý thú cưng"
          description="Tra cứu lịch sử khám bệnh, tiêm phòng của thú cưng của bạn."
          to="/customer/reviews"
          icon={<span className="text-4xl"></span>}
        />

        <FeatureCard
          title="Chỉnh sửa hồ sơ cá nhân"
          description="Cập nhật hồ sơ của bạn."
          to="/customer/profile"
          icon={<span className="text-4xl"></span>}
        />

      </div>
    </div>
  );
}