import React, { ReactNode } from 'react';
import SectionHeader from './SectionHeader';

interface SectionContainerProps {
    title: string;
    children: ReactNode;
    rightElement?: ReactNode;
}

const SectionContainer = ({ title, children, rightElement }: SectionContainerProps) => {
    return (
        <div className="space-y-4">
            <SectionHeader title={title} rightElement={rightElement} />
            <div className="bg-black-1/30 rounded-xl p-6 border border-gray-800">
                {children}
            </div>
        </div>
    );
};

export default SectionContainer;