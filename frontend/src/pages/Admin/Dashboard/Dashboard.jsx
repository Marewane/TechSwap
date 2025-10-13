const Dashboard = () => {
    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Dashboard</h1>
            <p className="text-gray-600 mb-8">
                Welcome to TechSwap Admin Panel
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { title: "Total Users", value: "1,234" },
                    { title: "Active Sessions", value: "89" },
                    { title: "Reports", value: "23" },
                    { title: "Revenue", value: "$45,678" },
                ].map((stat, index) => (
                    <div key={index} className="bg-white rounded-lg shadow p-6 border">
                        <h3 className="text-gray-500 text-sm mb-1">{stat.title}</h3>
                        <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Dashboard;