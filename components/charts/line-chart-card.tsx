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
              <defs>
                <linearGradient id="moodGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#1f7a63" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#1f7a63" stopOpacity={0.03} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e9e1d6" />
              <XAxis dataKey="date" tickFormatter={(value) => formatDate(value, "dd/MM")} />
              <YAxis domain={[1, 5]} />
              <Tooltip />
              <Area type="monotone" dataKey="mood" stroke="#1f7a63" fill="url(#moodGradient)" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        ) : null}
      </CardContent>
    </Card>
  );
}
