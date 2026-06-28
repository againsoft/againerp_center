"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { CenterAgentMetricPoint } from "@/lib/mock-data/center";

type Props = {
  series: CenterAgentMetricPoint[];
  title: string;
  subtitle?: string;
  height?: number;
  showApi?: boolean;
};

export function CenterMonitoringMetricsChart({
  series,
  title,
  subtitle,
  height = 200,
  showApi = false,
}: Props) {
  if (series.length === 0) {
    return (
      <div className="rounded-lg border border-dashed bg-muted/20 px-4 py-8 text-center text-xs text-muted-foreground">
        No time-series data — agent offline or pending first heartbeat.
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h3 className="text-sm font-medium">{title}</h3>
          {subtitle ? <p className="text-xs text-muted-foreground">{subtitle}</p> : null}
        </div>
        <div className="flex flex-wrap gap-3 text-[10px] text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-violet-600" />
            CPU %
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-sky-500" />
            RAM %
          </span>
          {showApi ? (
            <span className="inline-flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              API p95 ms
            </span>
          ) : null}
        </div>
      </div>

      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={series} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10 }}
              interval={3}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              yAxisId="percent"
              domain={[0, 100]}
              tick={{ fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              width={32}
            />
            {showApi ? (
              <YAxis
                yAxisId="api"
                orientation="right"
                tick={{ fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                width={36}
              />
            ) : null}
            <Tooltip
              contentStyle={{ fontSize: 12 }}
              formatter={(value, name) => {
                const numeric = typeof value === "number" ? value : Number(value);
                if (name === "apiP95") return [`${numeric} ms`, "API p95"];
                return [`${numeric}%`, String(name).toUpperCase()];
              }}
            />
            <Line
              yAxisId="percent"
              type="monotone"
              dataKey="cpu"
              stroke="hsl(262 83% 58%)"
              strokeWidth={2}
              dot={false}
              name="cpu"
            />
            <Line
              yAxisId="percent"
              type="monotone"
              dataKey="ram"
              stroke="hsl(199 89% 48%)"
              strokeWidth={2}
              dot={false}
              name="ram"
            />
            {showApi ? (
              <Line
                yAxisId="api"
                type="monotone"
                dataKey="apiP95"
                stroke="hsl(38 92% 50%)"
                strokeWidth={2}
                dot={false}
                name="apiP95"
              />
            ) : null}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
