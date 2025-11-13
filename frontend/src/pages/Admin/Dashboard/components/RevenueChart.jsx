import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";

const RevenueChart = ({ monthlyRevenue }) => {
    // Transform the data to match the chart format
    const chartData = (monthlyRevenue ?? []).map(item => ({
        month: item.month,
        revenue: item.revenue
    }));

    // Chart configuration for styling
    const chartConfig = {
        revenue: {
            label: "Revenue",
            color: "rgba(109, 122, 255, 0.95)",
        },
    };

    // Format currency for display
    const formatCurrency = (value) => {
        return `$${value}`;
    };
    return (
        <Card className="flex h-full flex-col border border-border/60 bg-card/95 p-0 shadow-[0_32px_100px_rgba(46,47,70,0.18)]">
            <CardHeader className="border-b border-border/40">
                <CardTitle className="text-lg font-semibold text-foreground">Monthly Revenue</CardTitle>
                <CardDescription className="text-xs font-mono uppercase tracking-[0.18em] text-muted-foreground">
                    Coin bundle performance over the last six months
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col p-6">
                <ChartContainer config={chartConfig} className="h-full w-full">
                    <LineChart
                        data={chartData}
                        margin={{ top : 5, right : 10, left : 10, bottom : 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(46,47,70,0.08)" />
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
                            tickFormatter={formatCurrency}
                            tick={{ fill: "rgba(15,23,42,0.55)", fontSize: 12, fontWeight: 500 }}
                        />
                        <ChartTooltip
                            content={<ChartTooltipContent />}
                            cursor={{ stroke: "rgba(109,122,255,0.35)", strokeWidth : 1.4 }}
                        />
                        <Line
                            type="monotone"
                            dataKey="revenue"
                            stroke="rgba(109, 122, 255, 0.95)"
                            strokeWidth={2}
                            dot={{
                                fill: "rgba(56, 249, 215, 0.9)",
                                strokeWidth : 2,
                                r: 4,
                            }}
                            activeDot={{
                                r: 6,
                                fill: "rgba(56, 249, 215, 0.9)",
                            }}
                        />
                    </LineChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
};

export default RevenueChart;