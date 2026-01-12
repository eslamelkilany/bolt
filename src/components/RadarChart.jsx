import React from 'react';
import {
  RadarChart as RechartsRadar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  ResponsiveContainer,
  Tooltip
} from 'recharts';

const RadarChart = ({ data, dataKey = 'percentage', name = 'Score', color = '#4a4af5' }) => {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <RechartsRadar data={data} cx="50%" cy="50%" outerRadius="80%">
        <PolarGrid stroke="#e0e0e0" />
        <PolarAngleAxis 
          dataKey="name" 
          tick={{ fill: '#374151', fontSize: 12 }}
          className="text-sm"
        />
        <PolarRadiusAxis 
          angle={30} 
          domain={[0, 100]} 
          tick={{ fill: '#6b7280', fontSize: 10 }}
        />
        <Radar
          name={name}
          dataKey={dataKey}
          stroke={color}
          fill={color}
          fillOpacity={0.3}
          strokeWidth={2}
        />
        <Tooltip 
          formatter={(value) => [`${value}%`, name]}
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            padding: '8px 12px'
          }}
        />
        <Legend />
      </RechartsRadar>
    </ResponsiveContainer>
  );
};

export default RadarChart;
