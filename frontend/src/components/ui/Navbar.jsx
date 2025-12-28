import { Link, useLocation } from "react-router-dom";

const MENU_CONFIG = [
    { label: "Trang chủ", to: "/customer/home", roles: ["customer"] },
    { label: "Trang chủ", to: "/staff/home", roles: ["manager", "receptionist", "sales", "doctor"] },
    { label: "Dịch vụ", to: "/customer/history", roles: ["customer"], relatedPaths: ["/customer/khambenh", "/customer/tiemphong", "/customer/muahang", "/customer/appointment"] },
    { label: "Gói tiêm", to: "/customer/packages", roles: ["customer"], relatedPaths: ["/customer/packages"] },
    { label: "Thú cưng", to: "/customer/pets", roles: ["customer"], relatedPaths: ["/customer/pets/"]},
    { label: "Mua hàng", to: "/customer/order", roles: ["customer"], relatedPaths: ["/customer/order"] },
    { label: "Thông tin cá nhân", to: "/customer/profile", roles: ["customer"] },
    { label: "Hoá đơn dịch vụ", to: "/staff/invoices", roles: ["receptionist"], relatedPaths: ["/staff/invoices/"] },
    { label: "Thú cưng", to: "/staff/pets", roles: ["receptionist"], relatedPaths: ["/staff/pets/"] },
    { label: "Bán hàng", to: "/staff/sales/new", roles: ["sales"] },
    { label: "Khám bệnh & tiêm phòng", to: "/staff/doctor/history", roles: ["doctor"], relatedPaths: ["/staff/doctor/khambenh/", "/staff/doctor/tiemphong/"] },
    { label: "Doanh thu", to: "/manager/revenue", roles: ["manager"], relatedPaths: ["/manager/revenue/"] },
    { label: "Sản phẩm", to: "/manager/products", roles: ["manager"], relatedPaths: ["/manager/products/"] },
    { label: "Nhân viên", to: "/manager/staffs", roles: ["manager"], relatedPaths: ["/manager/staffs/"] },
    { label: "Thông tin cá nhân", to: "/staff/profile", roles: ["doctor", "manager", "receptionist", "sales"] },
];

export default function Navbar() {
    const role = localStorage.getItem("role") || null;
    const location = useLocation();

    if (!role) {
        return <div className="h-2 bg-blue-500" />;
    }

    const filteredMenu = MENU_CONFIG.filter((item) => item.roles.includes(role));

  return (
    <nav className="w-full bg-blue-500 text-white text-sm">
      <div className="max-w-[1200px] mx-auto px-4">
        <ul className="flex gap-10 py-3">
          {filteredMenu.map((item) => {
            const isActive =
                location.pathname === item.to ||
                item.relatedPaths?.some(prefix => location.pathname.startsWith(prefix));
            return (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className={
                    "px-4 py-2 rounded-sm transition-colors " +
                    (isActive
                      ? "bg-gray-800 text-white"
                      : "hover:text-blue-200")
                  }
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
