import type { NextConfig } from "next";

const DEVELOPMENT = process.env.NEXT_PUBLIC_DEVELOPMENT === "true";

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
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    {
                        key: 'Content-Security-Policy',
                        value: `connect-src 'self' https://accounts.google.com https://iliganproductprice-mauve.vercel.app ${DEVELOPMENT ? `http://localhost:5000 http://127.0.0.1:5000` : ''};`
                    },
                ],
            },
        ];
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'lh3.googleusercontent.com',
                port: '',
                pathname: '/**', // This allows any image path from this domain
            },
            // You might also want to add Cloudinary here since you use it for products!
            {
                protocol: 'https',
                hostname: 'res.cloudinary.com',
                port: '',
                pathname: '/**',
            }
        ],
    },
};

export default nextConfig;
