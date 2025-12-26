import { useState } from "react";
import Header from "../../components/ui/Header";
import Navbar from "../../components/ui/Navbar";
import PageTitle from "../../components/ui/PageTitle.jsx";
import CategoryBar from "../../components/ui/CategoryBar.jsx";
import CustomerProducts from "../../components/ui/customer/CustomerProducts.jsx";
import CustomerCart from "../../components/ui/customer/CustomerCart.jsx";
//import CustomerOrderHistory from "../../components/ui/customer/CustomerOrderHistory.jsx";

export default function CustomerOrder() {
    const [type, setType] = useState("products");

    return (
    <div className="min-h-screen bg-white text-sm">
      <Header />
      <Navbar />
      <PageTitle title="Mua hàng" />

      <CategoryBar
        active={type}
        onChange={(t) => {
          setType(t);
        }}
          types={[
            { key: "products", label: "Danh mục sản phẩm" },
            { key: "cart", label: "Giỏ hàng" },
            { key: "history", label: "Lịch sử đơn hàng" }
        ]}
      />

      <div className="max-w-[1200px] mx-auto px-4 py-6">
        <>
            {type === "products" && (
                <CustomerProducts />
            )}

            {type === "cart" && (
                <CustomerCart />
            )}

            { /* {type === "history" && (
                <CustomerOrderHistory />
            )} */}
        </>
      </div>
    </div>
  );
}