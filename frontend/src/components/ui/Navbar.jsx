import { Link, useLocation } from "react-router-dom";

const MENU_CONFIG = [
    { label: "Trang chủ", to: "/customer/home", roles: ["customer"] },
    { label: "Trang chủ", to: "/staff/home", roles: ["manager", "receptionist", "sales", "doctor"] },
    { label: "Dịch vụ", to: "/customer/services", roles: ["customer"] },
    { label: "Vaccine", to: "/customer/vaccines", roles: ["customer"] },
    { label: "Thú cưng", to: "/customer/pets", roles: ["customer"] },
    { label: "Thông tin cá nhân", to: "/customer/profile", roles: ["customer"] },
    { label: "Hoá đơn dịch vụ", to: "/staff/service-invoices", roles: ["receptionist"] },
    { label: "Hoá đơn mua hàng", to: "/staff/sales-invoices", roles: ["sales"] },
];

export default function Navbar() {
    const role = localStorage.getItem("role") || null;
    const location = useLocation();

    if (!role) {
        return <div className="h-2 bg-blue-400" />;
    }

    const filteredMenu = MENU_CONFIG.filter((item) => item.roles.includes(role));

  return (
    <nav className="w-full bg-blue-500 text-white text-sm">
      <div className="max-w-[1200px] mx-auto px-4">
        <ul className="flex gap-10 py-3">
          {filteredMenu.map((item) => {
            const isActive = location.pathname === item.to;
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
