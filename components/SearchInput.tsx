/**
 * 
 * @returns Search input component for the Companions Library page.
 */
'use client';

import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { use, useEffect, useState } from "react";




const SearchInput = () => {
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();
    const query = searchParams.get('topic') || '';

    const [searchQuery, setSearchQuery] = useState('');
    

    useEffect(() => {
        // Update the URL query string based on the search input.
        // If searchQuery is not empty, set the 'topic' param.
        // If searchQuery is empty, remove the 'topic' param to reset the URL.
        const params = new URLSearchParams(searchParams.toString());
        if (searchQuery) {
            params.set('topic', searchQuery);
        } else {
            params.delete('topic');
        }
        router.push(`${pathname}${params.toString() ? `?${params.toString()}` : ''}`);
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
