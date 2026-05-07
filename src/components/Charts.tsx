import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ScatterChart, Scatter, LineChart, Line } from 'recharts';

export const MasteryHeatmap = ({ data, title = "Conceptual Fluency: Math vs Science" }: { data: any[], title?: string }) => {
  return (
    <div className="h-96 w-full bg-white p-6 rounded-2xl shadow-sm border border-black/5">
        <h4 className="text-sm font-bold text-fluent-navy mb-4">{title}</h4>
        <ResponsiveContainer width="100%" height="85%">
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" dataKey="math" name="Math" unit="%" label={{ value: 'Math Mastery', position: 'bottom', offset: 0 }} />
              <YAxis type="number" dataKey="science" name="Science" unit="%" label={{ value: 'Science Mastery', angle: -90, position: 'left' }} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Scatter name="Concepts" data={data} fill="#1B4F5E" />
          </ScatterChart>
        </ResponsiveContainer>
    </div>
  );
};
