import React from 'react';

const ScoreGauge = ({ score, maxScore = 100, size = 200, label = '' }) => {
  const percentage = (score / maxScore) * 100;
  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  const getColor = () => {
    if (percentage >= 85) return '#10b981'; // Green
    if (percentage >= 70) return '#4a4af5'; // Blue
    if (percentage >= 55) return '#f59e0b'; // Yellow
    return '#ef4444'; // Red
  };

  const getRating = () => {
    if (percentage >= 85) return { en: 'Excellent', ar: 'ممتاز' };
    if (percentage >= 70) return { en: 'Good', ar: 'جيد' };
    if (percentage >= 55) return { en: 'Average', ar: 'متوسط' };
    return { en: 'Needs Work', ar: 'يحتاج تحسين' };
  };

  const color = getColor();
  const rating = getRating();

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="12"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      {/* Center content */}
      <div className="absolute flex flex-col items-center justify-center" style={{ width: size, height: size }}>
        <span className="text-4xl font-bold" style={{ color }}>{Math.round(percentage)}%</span>
        <span className="text-sm text-gray-500">{label}</span>
      </div>
      {/* Rating label */}
      <div 
        className="mt-2 px-4 py-1 rounded-full text-white font-medium"
        style={{ backgroundColor: color }}
      >
        {rating.en}
      </div>
    </div>
  );
};

export default ScoreGauge;
