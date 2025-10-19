import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";

const ReportChart = ({ reportsPerMonth }) => {
    // Format chart data (month + number of reports)
    const chartData = reportsPerMonth.map(item => ({
        month: item.month,
        reports: item.reports,
    }));

    // Chart configuration (for tooltip & styling)
    const chartConfig = {
        reports: {
            label: "Reports",
            color: "hsl(0, 80%, 50%)", // red color tone
        },
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Reports Activity</CardTitle>
                <CardDescription>
                    Number of reports received in the last 6 months.
                </CardDescription>
            </CardHeader>

            <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px] w-full">
                    {/* Changed from LineChart to BarChart */}
                    <BarChart
                        data={chartData}
                        margin={{ top : 5, right : 10, left : 10, bottom : 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} /> {/* vertical={false} is often better for bar charts */}
                        <XAxis
                            dataKey="month"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tick={{ fill: "#888", fontSize: 12 }}
                        />
                        <YAxis
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tick={{ fill: "#888", fontSize: 12 }}
                        />
                        <ChartTooltip
                            content={<ChartTooltipContent />}
                            cursor={false} // Bar charts often use a non-visible or custom cursor
                        />
                        {/* Changed from Line to Bar */}
                        <Bar
                            dataKey="reports"
                            fill="var(--color-reports)"
                            radius={[4, 4, 0, 0]}
                            isAnimationActive={true}
                        />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
};

export default ReportChart;