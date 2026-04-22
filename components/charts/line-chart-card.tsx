"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function LineChartCard({
  title,
  description,
  data,
}: {
  title: string;
  description: string;
  data: Array<{ date: string; mood: number; checkins: number }>;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Card className="rounded-[2rem] border-white/70 bg-white/90 shadow-sm">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent className="h-[340px]">
        {mounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--foreground) / 0.12)" />
              <XAxis dataKey="date" tickFormatter={(value) => formatDate(value, "dd/MM")} />
              <YAxis domain={[1, 5]} />
              <Tooltip />
              <Area type="monotone" dataKey="mood" stroke="rgb(var(--brand-teal))" fill="rgb(var(--brand-teal))" fillOpacity={0.16} strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        ) : null}
      </CardContent>
    </Card>
  );
}
