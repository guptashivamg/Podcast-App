import { cn } from '@/lib/utils';
import Link from 'next/link';
import React from 'react';

const Header = ({ headerTitle, titleClassName }: { headerTitle?: string; titleClassName?: string }) => {
  let linkUrl = "/";
  
  if (headerTitle === "Fans Like You") {
    linkUrl = "/discover";
  } else if (headerTitle === "Top Podcasters" || headerTitle === "Popular Creators") {
    linkUrl = "/community";
  }

  return (
    <header className="flex items-center justify-between">
      {headerTitle ? (
        <h1 className={cn('text-18 font-bold text-white-1', titleClassName)}>{headerTitle}</h1>
      ) : <div />}
      {/* Empty div is passed as we want to occupy space if header title doesn't exist */}
      <Link 
        href={linkUrl} 
        className="text-16 font-semibold text-orange-1 hover:text-orange-400 hover:scale-105 transition-all duration-300"
      >
        See all
      </Link>
    </header>
  )
}

export default Header