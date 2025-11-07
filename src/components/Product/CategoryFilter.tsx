import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

interface CategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

const categories = [
  'all',
  'mobile',
  'web',
  'ai',
  'blockchain',
  'fintech',
  'healthtech',
  'edtech',
  'agtech',
];

export function CategoryFilter({ selectedCategory, onCategoryChange }: CategoryFilterProps) {
  const { t } = useLanguage();

  return (
    <div className="flex items-center space-x-3 overflow-x-auto pb-2">
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => onCategoryChange(category)}
          className={`whitespace-nowrap px-4 py-2 rounded-lg font-medium transition-all shadow-lg ${
            selectedCategory === category
              ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-cyan-500/25'
              : 'bg-slate-700 text-slate-200 hover:bg-slate-600 border border-slate-600'
          }`}
        >
          {t(`category.${category}`)}
        </button>
      ))}
    </div>
  );
}