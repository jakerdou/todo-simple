import React, { useState, useEffect } from 'react';

interface PieChartProps {
  completed: number;
  total: number;
}

const CssPieChart: React.FC<PieChartProps> = ({ completed, total }) => {
  const [animatedPercentage, setAnimatedPercentage] = useState(0);
  
  if (total === 0) return null;
  
  const percentage = (completed / total) * 100;
  
  useEffect(() => {
    // Animate the percentage from 0 to the actual value
    const timer = setTimeout(() => {
      setAnimatedPercentage(percentage);
    }, 50); // Small delay for the animation to work properly
    
    return () => clearTimeout(timer);
  }, [percentage]);
  
  return (
    <div className="relative w-6 h-6">
      <div 
        className="w-full h-full rounded-full shadow-sm transition-all duration-500" 
        style={{
          background: `conic-gradient(
            #22c55e 0% ${animatedPercentage}%, 
            ${completed === total ? '#4b5563' : '#ef4444'} ${animatedPercentage}% 100%
          )`
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center text-[8px] text-white font-bold">
        
      </div>
    </div>
  );
};

export default CssPieChart;
