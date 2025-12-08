import React from 'react';
import { FeatureProps } from '../types';

export const FeatureCard: React.FC<FeatureProps> = ({ title, description, icon }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-100 flex flex-col items-start hover:shadow-md transition-shadow duration-300">
      <div className="p-3 bg-teal-50 rounded-lg text-teal-700 mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-stone-900 mb-2">{title}</h3>
      <p className="text-stone-600 leading-relaxed">{description}</p>
    </div>
  );
};