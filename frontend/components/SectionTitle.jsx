// components/SectionTitle.jsx
import React from 'react';

export default function SectionTitle({ title, subtitle }) {
  // A clean, simple layout for section headings
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <h2 className="text-4xl font-extrabold tracking-tighter text-gray-900 sm:text-5xl">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-5 max-w-2xl text-lg sm:text-xl text-gray-500 font-normal leading-relaxed tracking-wide">
          {subtitle}
        </p>
      )}
    </div>
  );
}
