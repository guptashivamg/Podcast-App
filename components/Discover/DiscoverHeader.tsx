import React from 'react';
import Searchbar from '@/components/Discover/Searchbar';

const DiscoverHeader = () => {
    return (
        <div className="bg-gradient-to-r from-white-1/10 to-white-1/5 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white-1/10 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-1/10 to-transparent opacity-50"></div>
            <div className="relative z-10">
                <h1 className="text-3xl font-bold text-white-1 mb-5 flex items-center gap-2">
                    Discover Podcasts
                </h1>
                <Searchbar />
            </div>
        </div>
    );
};

export default DiscoverHeader;