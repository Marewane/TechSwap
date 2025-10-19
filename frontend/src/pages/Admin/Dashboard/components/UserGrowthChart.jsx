import { Card, CardHeader, CardTitle, CardContent,CardDescription } from "@/components/ui/card";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

const UserGrowthChart = ({ userGrowth }) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>User Growth</CardTitle>
                <CardDescription>
                    User Growth over the last 6 months.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={userGrowth}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Line type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={3} />
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
};

export default UserGrowthChart;
