import { Outlet } from "react-router-dom";
import Navbar from "@/pages/User/Navbar";

const UserLayout = () => {
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1 mt-16 p-6">
                {/* <Outlet /> */}
            </main>
        </div>
    );
};

export default UserLayout;
