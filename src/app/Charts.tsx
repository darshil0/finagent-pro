"use client";

import React from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { type ChartDataItem } from './page';

const COLORS = ['#0ea5e9', '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b'];

export default function Charts({ type, items }: { type: 'trend' | 'sector' | 'heatmap'; items: ChartDataItem[] }) {
  if (!items || items.length === 0) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center bg-slate-900/30 rounded-2xl border border-slate-700/30">
        <p className="text-slate-400">No chart data available</p>
      </div>
    );
  }

  const renderChart = () => {
    switch (type) {
      case 'trend':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={items}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  border: '1px solid #334155',
                  borderRadius: '12px',
                  color: '#e2e8f0'
                }} 
              />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#0ea5e9" strokeWidth={3} dot={{ fill: '#0ea5e9', r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'sector':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={items}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {items.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  border: '1px solid #334155',
                  borderRadius: '12px',
                  color: '#e2e8f0'
                }} 
              />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'heatmap':
      default:
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={items}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  border: '1px solid #334155',
                  borderRadius: '12px',
                  color: '#e2e8f0'
                }} 
              />
              <Legend />
              <Bar dataKey="value" fill="#6366f1" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <div className="w-full bg-slate-900/30 rounded-2xl p-6 border border-slate-700/30">
      <h3 className="text-lg font-semibold text-white mb-4 capitalize">{type} Analysis</h3>
      {renderChart()}
    </div>
  );
}
