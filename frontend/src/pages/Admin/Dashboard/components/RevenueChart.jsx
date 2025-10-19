import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";

const RevenueChart = ({ monthlyRevenue}) => {
    // Transform the data to match the chart format
    const chartData = monthlyRevenue.map(item => ({
        month: item.month,
        revenue: item.revenue
    }));

    // Chart configuration for styling
    const chartConfig = {
        revenue: {
            label: "Revenue",
            color: "hsl(221, 83%, 53%)", // Blue color matching your design
        },
    };

    // Format currency for display
    const formatCurrency = (value) => {
        return `$${value}`;
    };
    return (
        <Card className={`h-full flex flex-col`}>
            <CardHeader>
                <CardTitle>Monthly Revenue</CardTitle>
                <CardDescription>
                    Revenue performance over the last 6 months.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
                <ChartContainer config={chartConfig} className="h-full w-full">
                    <LineChart
                        data={chartData}
                        margin={{ top : 5, right : 10, left : 10, bottom : 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis
                            dataKey="month"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tick={{ fill: '#888', fontSize: 12 }}
                        />
                        <YAxis
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tickFormatter={formatCurrency}
                            tick={{ fill: '#888', fontSize: 12 }}
                        />
                        <ChartTooltip
                            content={<ChartTooltipContent />}
                            cursor={{ stroke: '#ddd', strokeWidth : 1 }}
                        />
                        <Line
                            type="monotone"
                            dataKey="revenue"
                            stroke="hsl(221, 83%, 53%)"
                            strokeWidth={2}
                            dot={{
                                fill: "hsl(221, 83%, 53%)",
                                strokeWidth : 2,
                                r: 4,
                            }}
                            activeDot={{
                                r: 6,
                                fill: "hsl(221, 83%, 53%)",
                            }}
                        />
                    </LineChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
};

export default RevenueChart;