import { useState } from "react";
import Header from "../../components/ui/Header";
import Navbar from "../../components/ui/Navbar";
import PageTitle from "../../components/ui/PageTitle";
import CategoryBar from "../../components/ui/CategoryBar";

import SystemProductsTable from "../../components/ui/manager/SystemProductsTable";
import ProductsOfBranchTable from "../../components/ui/manager/ProductsOfBranchTable";

export default function ManagerProducts() {
    const [type, setType] = useState("overview");

    return (
        <div className="min-h-screen bg-white text-sm">
            <Header />
            <Navbar />
            <PageTitle title="Thống kê sản phẩm" />

            <CategoryBar
                active={type}
                onChange={setType}
                types={[
                    { key: "overview", label: "Toàn hệ thống" },
                    { key: "branch", label: "Chi nhánh của bạn" }
                ]}
            />

            <div className="max-w-[1200px] mx-auto px-4 py-6">
                <>
                    {type === "overview" && (
                        <SystemProductsTable />
                    )}

                    {type === "branch" && (
                        <ProductsOfBranchTable />
                    )}
                </>
            </div>
        </div>
    );
}
