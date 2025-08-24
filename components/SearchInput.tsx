/**
 * 
 * @returns Search input component for the Companions Library page.
 */
'use client';

import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";




const SearchInput = () => {
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();
    // State to manage the search query
    const [searchQuery, setSearchQuery] = useState(() => searchParams.get('topic') || '');
    
    // Effect to update the URL when the search query changes
    useEffect(() => {
        const current = searchParams.get('topic') || '';
        // Only push if the param actually changed
        if (current === searchQuery) return;

        const params = new URLSearchParams(searchParams.toString());
        if (searchQuery) {
            params.set('topic', searchQuery);
        } else {
            params.delete('topic');
        }
        router.push(`${pathname}${params.toString() ? `?${params.toString()}` : ''}`, { scroll: false });
    }, [searchQuery, router, searchParams, pathname]);

  return (
    <div className="relative border border-black rounded-lg items0center flex gap-2 px-2 py-1 h-fit">
        <Image
            src="/icons/search.svg"
            alt="search"
            width={20}
            height={20}
            
        />
        <input
            placeholder="Search companions"
            className="outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
        />
    </div>
  )
}

export default SearchInput
