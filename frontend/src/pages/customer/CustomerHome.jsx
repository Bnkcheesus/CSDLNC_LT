import Header from "../../components/ui/Header.jsx";
import Navbar from "../../components/ui/Navbar.jsx";
import PageTitle from "../../components/ui/PageTitle.jsx";


export default function CustomerHome() {
    

    return (
      <div className="min-h-screen bg-white text-sm"> {/* text-sm applies smaller font app-wide for this page */}
        <Header />
        <Navbar />
  
        <PageTitle title="Trang chủ" />
      </div>
    );
}