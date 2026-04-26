"use client";

import React, { forwardRef } from "react";
import Image from "next/image";

interface SearchbarProps {
    type: string;
    placeholder?: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    children?: React.ReactNode;
}

const Searchbar = forwardRef<HTMLInputElement, SearchbarProps>(
    ({ type, placeholder = "Search", children, onChange }, ref) => {
        return (
            <div className="flex w-full items-center gap-2">
                <div className="searchbar-container relative flex flex-1 items-center overflow-hidden rounded-xl border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800 transition-all focus-within:border-[#ee4d2d] focus-within:ring-1 focus-within:ring-[#ee4d2d]">
                    <Image
                        className="ml-3 opacity-50 dark:invert"
                        height={20}
                        width={20}
                        src="/UI/search-01-stroke-rounded.svg"
                        alt="Search"
                    />
                    <input
                        ref={ref}
                        className="searchbar w-full bg-transparent px-3 py-2.5 text-sm outline-none text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                        type={type}
                        placeholder={placeholder}
                        onChange={onChange}
                    />
                </div>
                {children}
            </div>
        );
    }
);

Searchbar.displayName = "Searchbar";

export default Searchbar;
