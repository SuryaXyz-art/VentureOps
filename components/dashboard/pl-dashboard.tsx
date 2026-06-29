"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function PLDashboard({
  revenue,
  costs,
  profit,
  blockedRiskValue
}: {
  revenue: number;
  costs: number;
  profit: number;
  blockedRiskValue: number;
}) {
  const data = [
    { name: "Revenue", value: revenue },
    { name: "Costs", value: costs },
    { name: "Profit", value: profit },
    { name: "Blocked", value: blockedRiskValue }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>P&L Control Tower</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {data.map((item) => (
            <div key={item.name} className="rounded-lg border border-border/70 bg-background/45 p-3">
              <p className="text-xs text-muted-foreground">{item.name}</p>
              <p className="mt-1 text-2xl font-semibold">${item.value.toFixed(2)}</p>
            </div>
          ))}
        </div>
        <div className="mt-5 h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
              <XAxis dataKey="name" stroke="rgba(230,250,250,0.65)" fontSize={12} tickLine={false} />
              <YAxis stroke="rgba(230,250,250,0.65)" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                cursor={{ fill: "rgba(47,210,184,0.08)" }}
                contentStyle={{
                  background: "#101724",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 8,
                  color: "#eefafa"
                }}
              />
              <Bar dataKey="value" fill="#2fd2b8" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
