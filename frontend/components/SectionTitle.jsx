// components/SectionTitle.jsx
import React from 'react';

export default function SectionTitle({ title, subtitle }) {
  // A clean, simple layout for section headings
  return (
    <div className="flex flex-col items-center justify-center py-5 md:py-10 text-center">
      <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-3 md:mt-5 max-w-xl text-base md:text-lg sm:text-xl text-gray-500 font-normal leading-relaxed tracking-normal md:tracking-wide px-2">
          {subtitle}
        </p>
      )}
    </div>
  );
}
