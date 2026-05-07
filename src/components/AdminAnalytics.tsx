import React from "react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from 'recharts';
import { Card, Badge, MetricTile } from "./UI";
import { 
  Users, BarChart3, TrendingUp, Zap, Globe, 
  Activity, ArrowUpRight, Award, ShieldCheck 
} from "lucide-react";

export default function AdminAnalytics() {
  const data = [
    { month: 'Jan', active: 400, revenue: 12400 },
    { month: 'Feb', active: 620, revenue: 18900 },
    { month: 'Mar', active: 890, revenue: 26500 },
    { month: 'Apr', active: 1100, revenue: 34200 },
    { month: 'May', active: 1450, revenue: 42100 },
  ];

  return (
    <div className="space-y-10 pb-20">
      <div>
        <h2 className="text-3xl font-serif font-bold text-fluent-navy">System Analytics Ecosystem</h2>
        <p className="text-slate-400 mt-2 text-[10px] font-black uppercase tracking-widest">Real-time synthesis of global platform health</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricTile label="Active Nodes" value="1,452" delta="+12%" icon={Users} color="#1B4F5E" />
        <MetricTile label="Monthly Revenue" value="£42.1K" delta="+8%" icon={TrendingUp} color="#C9A84C" />
        <MetricTile label="Global Retention" value="94.2%" icon={ShieldCheck} color="#0D1B2A" />
        <MetricTile label="System Uptime" value="99.99%" icon={Zap} color="#7C3AED" />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 p-10 bg-white border-black/5 shadow-xl">
           <div className="flex justify-between items-center mb-10">
              <h3 className="text-xl font-serif font-bold text-fluent-navy">Scholar Growth Vector</h3>
              <Badge color="teal" icon={Activity}>Real-time Sync</Badge>
           </div>
           <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1B4F5E" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#1B4F5E" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                <Area type="monotone" dataKey="active" stroke="#1B4F5E" strokeWidth={3} fillOpacity={1} fill="url(#colorActive)" />
              </AreaChart>
            </ResponsiveContainer>
           </div>
        </Card>

        <Card className="p-10 bg-white border-black/5 shadow-xl">
           <h3 className="text-xl font-serif font-bold text-fluent-navy mb-8 text-center">Regional Delivery</h3>
           <div className="space-y-8">
              {[
                { label: "London Hub", value: 65, color: "bg-fluent-teal" },
                { label: "Dubai Satellite", value: 25, color: "bg-fluent-gold" },
                { label: "Singapore Node", value: 10, color: "bg-slate-200" }
              ].map(hub => (
                <div key={hub.label}>
                   <div className="flex justify-between text-[10px] font-black uppercase mb-2">
                      <span className="text-slate-400">{hub.label}</span>
                      <span className="text-fluent-navy">{hub.value}%</span>
                   </div>
                   <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                      <div className={`${hub.color} h-full rounded-full`} style={{ width: `${hub.value}%` }} />
                   </div>
                </div>
              ))}
           </div>

           <div className="mt-12 p-6 bg-slate-50 rounded-[24px] text-center border border-black/5 border-dashed">
              <div className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1">Capacity Index</div>
              <div className="text-2xl font-serif font-bold text-fluent-navy">82.4%</div>
           </div>
        </Card>
      </div>
    </div>
  );
}
