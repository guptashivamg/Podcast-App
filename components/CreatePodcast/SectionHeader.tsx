import React from 'react';

interface SectionHeaderProps {
    title: string;
    rightElement?: React.ReactNode;
}

const SectionHeader = ({ title, rightElement }: SectionHeaderProps) => {
    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <div className="h-4 w-1 bg-orange-1 rounded-full" />
                <h2 className="text-lg font-semibold text-white-1">{title}</h2>
            </div>
            {rightElement}
        </div>
    );
};

export default SectionHeader;