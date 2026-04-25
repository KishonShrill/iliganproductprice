import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    // async rewrites() {
    //     return [
    //         // 1. Map the exact /docs route to the index.html file
    //         {
    //             source: '/docs/',
    //             destination: '/docs/index.html',
    //         },
    //         // 2. Map any sub-folders (like /docs/getting-started/) to their respective index files
    //         {
    //             source: '/docs/:path((?!.*\\.).*)/',
    //             destination: '/docs/:path*/index.html',
    //         }
    //     ];
    // },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'res.cloudinary.com',
            },
        ],
    },
};

export default nextConfig;
