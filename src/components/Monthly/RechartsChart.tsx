import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface RechartsChartProps {
  completed: number;
  total: number;
  isCurrentDay?: boolean;
}

const RechartsChartComponent: React.FC<RechartsChartProps> = ({ completed, total, isCurrentDay = false }) => {
  if (total === 0) return null;
  
  // Data needs to be in the format Recharts expects
  const data = [
    { name: 'Completed', value: completed },
    { name: 'Remaining', value: total - completed }
  ];
    // Colors for the pie chart segments
  const COLORS = ['#22c55e', isCurrentDay ? '#6b7280' : '#ef4444']; // Green for completed, Grey for remaining on today's date, otherwise Red
  
  return (
    <div className="relative w-6 h-6">
      {/* Recharts uses ResponsiveContainer for responsive charts */}
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}            
            cx="50%"
            cy="50%"
            innerRadius={0}
            outerRadius={10}
            paddingAngle={0}
            dataKey="value"
            // For small charts, disable animations to avoid flickering
            isAnimationActive={false}
            // Ensure the chart doesn't have any gaps
            startAngle={90}
            endAngle={450}
          >
            {data.map((_, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[index]} 
                stroke="none" 
              />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RechartsChartComponent;
