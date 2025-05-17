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
  
  // Calculate the pie segments using clip-path instead of conic-gradient for better compatibility
  const createCompatiblePieChart = () => {
    if (completed === 0) {
      // Return empty pie (all red or gray)
      return {
        backgroundColor: completed === total ? '#4b5563' : '#ef4444'
      };
    } else if (completed === total) {
      // Return full pie (all green)
      return {
        backgroundColor: '#22c55e'
      };
    } else {
      // Create a partial pie
      const degrees = (animatedPercentage * 3.6); // Convert percentage to degrees (100% = 360 degrees)
      return {
        backgroundImage: `
          linear-gradient(${degrees}deg, 
            #22c55e 50%, 
            transparent 50%),
          linear-gradient(0deg, 
            #22c55e 50%, 
            ${completed === total ? '#4b5563' : '#ef4444'} 50%)
        `,
      };
    }
  };
  
  return (
    <div className="relative w-6 h-6">
      <div 
        className="w-full h-full rounded-full shadow-sm transition-all duration-500" 
        style={createCompatiblePieChart()}
      />
      <div className="absolute inset-0 flex items-center justify-center text-[8px] text-white font-bold">
        
      </div>
    </div>
  );
};

export default CssPieChart;
