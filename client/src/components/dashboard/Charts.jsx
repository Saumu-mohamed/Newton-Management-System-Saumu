import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from
  'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
const CHART_COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))'];
export function AreaChartCard({ title, data, dataKey, xAxisKey, color = CHART_COLORS[0] }) {
  return (
    <Card className="border-border/40 bg-card/50 backdrop-blur-sm overflow-hidden shadow-2xl shadow-primary/5 group">
      <CardHeader className="pb-4 border-b border-border/10 bg-muted/5">
        <CardTitle className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground/80">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="h-70 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id={`gradient-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 4" vertical={false} className="stroke-muted/30" />
              <XAxis
                dataKey={xAxisKey}
                tick={{ fontSize: 10, fontWeight: 600 }}
                tickLine={false}
                axisLine={false}
                dy={10}
                className="text-muted-foreground/60 uppercase tracking-tighter" />
              <YAxis
                tick={{ fontSize: 10, fontWeight: 600 }}
                tickLine={false}
                axisLine={false}
                dx={-10}
                className="text-muted-foreground/60" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(var(--card), 0.8)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(var(--border), 0.2)',
                  borderRadius: '16px',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}
                cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1, strokeDasharray: '4 4' }}
              />
              <Area
                type="monotone"
                dataKey={dataKey}
                stroke={color}
                strokeWidth={3}
                fill={`url(#gradient-${dataKey})`}
                animationDuration={1500}
                animationEasing="ease-in-out" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>);
}
export function BarChartCard({ title, data, dataKeys, xAxisKey, colors = CHART_COLORS }) {
  return (
    <Card className="border-border/40 bg-card/50 backdrop-blur-sm overflow-hidden shadow-2xl shadow-primary/5 group">
      <CardHeader className="pb-4 border-b border-border/10 bg-muted/5">
        <CardTitle className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground/80">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="h-70 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="4 4" vertical={false} className="stroke-muted/30" />
              <XAxis
                dataKey={xAxisKey}
                tick={{ fontSize: 10, fontWeight: 600 }}
                tickLine={false}
                axisLine={false}
                dy={10}
                className="text-muted-foreground/60 uppercase" />
              <YAxis
                tick={{ fontSize: 10, fontWeight: 600 }}
                tickLine={false}
                axisLine={false}
                dx={-10}
                className="text-muted-foreground/60" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(var(--card), 0.8)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(var(--border), 0.2)',
                  borderRadius: '16px',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}
                cursor={{ fill: 'rgba(var(--primary), 0.05)' }}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" />
              {dataKeys.map((key, index) =>
                <Bar
                  key={key}
                  dataKey={key}
                  fill={colors[index % colors.length]}
                  radius={[6, 6, 0, 0]}
                  barSize={32}
                  animationDuration={1500}
                  animationEasing="ease-in-out" />
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>);
}
export function PieChartCard({ title, data, colors = CHART_COLORS }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-60">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value">
                {data.map((_, index) =>
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                )}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>);
}