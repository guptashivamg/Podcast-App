import React from "react";
import { Search } from "lucide-react";

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeTab: "followers" | "following" | "topPodcasters";
}

const SearchBar = ({ searchQuery, setSearchQuery, activeTab }: SearchBarProps) => {
  return (
    <div className="relative mb-6">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search size={18} className="text-white-3" />
      </div>
      <input
        type="text"
        placeholder={`Search ${activeTab === "topPodcasters" ? "top podcasters" : activeTab}...`}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full pl-10 pr-4 py-3 bg-black-1/30 border border-gray-800 rounded-xl text-white-1 placeholder-white-3 focus:outline-none focus:border-orange-1/50"
      />
    </div>
  );
};

export default SearchBar;