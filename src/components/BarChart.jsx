import React from 'react';
import {
  BarChart as RechartsBar,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';

const COLORS = ['#4a4af5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

const getBarColor = (percentage) => {
  if (percentage >= 85) return '#10b981';
  if (percentage >= 70) return '#4a4af5';
  if (percentage >= 55) return '#f59e0b';
  return '#ef4444';
};

const BarChart = ({ data, dataKey = 'percentage', xAxisKey = 'name', showColorByValue = false }) => {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <RechartsBar data={data} layout="vertical" margin={{ top: 20, right: 30, left: 100, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
        <XAxis type="number" domain={[0, 100]} tick={{ fill: '#6b7280' }} />
        <YAxis 
          type="category" 
          dataKey={xAxisKey} 
          tick={{ fill: '#374151', fontSize: 12 }} 
          width={100}
        />
        <Tooltip
          formatter={(value) => [`${value}%`, 'Score']}
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            padding: '8px 12px'
          }}
        />
        <Bar dataKey={dataKey} radius={[0, 4, 4, 0]}>
          {data.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={showColorByValue ? getBarColor(entry[dataKey]) : COLORS[index % COLORS.length]}
            />
          ))}
        </Bar>
      </RechartsBar>
    </ResponsiveContainer>
  );
};

export default BarChart;
