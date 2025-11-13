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
            color: "rgba(248, 113, 113, 0.9)",
        },
    };

    return (
        <Card className="border border-border/60 bg-card/95 p-0 shadow-[0_30px_100px_rgba(46,47,70,0.18)]">
            <CardHeader className="border-b border-border/40">
                <CardTitle className="text-lg font-semibold text-foreground">Reports Activity</CardTitle>
                <CardDescription className="text-xs font-mono uppercase tracking-[0.18em] text-muted-foreground">
                    Reports received over the last six months
                </CardDescription>
            </CardHeader>

            <CardContent className="p-6">
                <ChartContainer config={chartConfig} className="h-[300px] w-full">
                    {/* Changed from LineChart to BarChart */}
                    <BarChart
                        data={chartData}
                        margin={{ top : 5, right : 10, left : 10, bottom : 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(46,47,70,0.08)" vertical={false} /> {/* vertical={false} is often better for bar charts */}
                        <XAxis
                            dataKey="month"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tick={{ fill: "rgba(15,23,42,0.55)", fontSize: 12, fontWeight: 500 }}
                        />
                        <YAxis
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tick={{ fill: "rgba(15,23,42,0.55)", fontSize: 12, fontWeight: 500 }}
                        />
                        <ChartTooltip
                            content={<ChartTooltipContent />}
                            cursor={false} // Bar charts often use a non-visible or custom cursor
                        />
                        {/* Changed from Line to Bar */}
                        <Bar
                            dataKey="reports"
                            fill="rgba(248, 113, 113, 0.9)"
                            radius={[12, 12, 12, 12]}
                            isAnimationActive={true}
                        />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
};

export default ReportChart;