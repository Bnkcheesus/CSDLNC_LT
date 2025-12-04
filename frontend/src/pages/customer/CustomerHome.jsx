import FeatureCard from "../../components/ui/FeatureCard";
import { useEffect, useState } from "react";
import axios from "axios";

export default function CustomerHome() {
    const [hoTen, setHoTen] = useState("");
    const maTK = localStorage.getItem("maTK");
    console.log("CustomerHome maTK:", maTK);

    useEffect(() => {
        const fetchCustomerName = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/customer/${maTK}/name`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });
                console.log("API DATA:", res.data);
                setHoTen(res.data.hoTen);
            } catch (err) {
                console.error("Error fetching customer name:", err);
            }
        };

        fetchCustomerName();
    }, [maTK]);

    return (
    <div className="min-h-screen bg-indigo-100 p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Xin chào, {hoTen || "khách hàng"} 👋
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        <FeatureCard
          title="Tra cứu gói vaccine"
          description="Xem chi tiết các gói vaccine dành cho thú cưng."
          to="/customer/vaccine-packages"
          icon={<span className="text-4xl">💉</span>}
        />

        <FeatureCard
          title="Lịch sử khám & tiêm phòng"
          description="Theo dõi lịch sử sức khỏe và đơn hàng của bạn."
          to="/customer/history"
          icon={<span className="text-4xl">📜</span>}
        />

        <FeatureCard
          title="Đánh giá dịch vụ"
          description="Gửi đánh giá sau khi sử dụng dịch vụ."
          to="/customer/reviews"
          icon={<span className="text-4xl">⭐</span>}
        />

        <FeatureCard
          title="Thông tin cá nhân"
          description="Xem và cập nhật hồ sơ của bạn."
          to="/customer/profile"
          icon={<span className="text-4xl">👤</span>}
        />

      </div>
    </div>
  );
}