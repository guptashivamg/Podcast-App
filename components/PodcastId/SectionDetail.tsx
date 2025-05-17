import React, { ReactNode } from 'react';

interface SectionDetailProps {
  title: string;
  children: ReactNode;
  rightElement?: ReactNode;
}

const DetailSection = ({ title, children, rightElement }: SectionDetailProps) => {
  return (
    <div className="bg-black-1/30 p-6 rounded-xl border border-gray-800">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="h-6 w-1.5 bg-gradient-to-t from-orange-1 to-orange-400 rounded-full" />
          <h2 className="text-20 font-bold text-white-1">{title}</h2>
        </div>
        {rightElement}
      </div>
      {children}
    </div>
  );
};

export default DetailSection;