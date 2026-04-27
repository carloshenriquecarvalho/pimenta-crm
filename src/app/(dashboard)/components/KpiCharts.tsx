'use client'

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, FunnelChart, Funnel, LabelList, Cell,
} from 'recharts'

// ---- Bar Chart: Deals por Responsável ----
export function DealsByOwnerChart({ data }: { data: { name: string; deals: number; value: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip
          formatter={(v: number) => [v, 'Deals']}
          contentStyle={{ borderRadius: 8, fontSize: 12 }}
        />
        <Bar dataKey="deals" fill="#6366f1" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

// ---- Horizontal Bar Chart: Funil de Conversão por Stage ----
export function FunnelChart_({ data }: { data: { name: string; deals: number; color: string }[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} layout="vertical" margin={{ top: 5, right: 10, left: 60, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 11 }} />
        <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={80} />
        <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
        <Bar dataKey="deals" radius={[0, 4, 4, 0]}>
          {data.map((entry, idx) => (
            <Cell key={idx} fill={entry.color || '#6366f1'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

// ---- Line Chart: Deals criados por semana ----
export function WeeklyDealsChart({ data }: { data: { week: string; deals: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="week" tick={{ fontSize: 10 }} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
        <Line
          type="monotone"
          dataKey="deals"
          stroke="#6366f1"
          strokeWidth={2}
          dot={{ fill: '#6366f1', r: 3 }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
