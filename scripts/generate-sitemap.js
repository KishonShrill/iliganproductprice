import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { fileURLToPath } from 'url';
import { ResultAsync } from 'neverthrow';
import { config } from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
config()

const LOCALHOST = process.env.VITE_LOCALHOST;
const API_VERSION = process.env.VITE_API_VERSION;
const DEVELOPMENT = process.env.VITE_DEVELOPMENT === "true";

const SITE_URL = 'https://productprice-iligan.vercel.app'
const LOCATIONS_URL = DEVELOPMENT
    ? `http://${LOCALHOST}:5000/api/${API_VERSION}/locations`
    : `https://iliganproductprice-mauve.vercel.app/api/${API_VERSION}/locations`;

// 2. Define static routes based on your App.jsx
const staticPages = [
    { path: '/', priority: '1.0', changefreq: 'daily' },
    { path: '/locations', priority: '0.9', changefreq: 'weekly' },
    { path: '/receipt', priority: '0.5', changefreq: 'monthly' },
    { path: '/authenticate', priority: '0.5', changefreq: 'monthly' },
];

// 3. Mock function to get dynamic locations (Replace this with your actual DB/API call)
async function fetchLocationSlugs() {
    // Imagine this fetches from your React Query endpoint or database
    return await ResultAsync
        .fromPromise(axios.get(LOCATIONS_URL), (error) => {
            return error.response?.data?.message || "Unable to connect to server. Please try again later.";
        })
        .map((response) => response.data)
        .match(
            (data) => {
                if (Array.isArray(data)) {
                    return data.map(location => location._id);
                }
                console.warn("API did not return an array.");
                return [];
            },
            (errorMsg) => {
                console.error("Fetch Error:", errorMsg);
                return [];
            } // Return empty array on error to prevent crashes            }
        );
}

async function generateSitemap() {
    console.log('🗺️ Generating sitemap...');
    const currentDate = new Date().toISOString().split('T')[0];
    const allPages = [...staticPages];

    // Fetch dynamic location slugs and add them to the pages array
    const locationSlugs = await fetchLocationSlugs();
    locationSlugs.forEach(slug => {
        allPages.push({
            path: `/location/${slug}`,
            priority: '0.8',
            changefreq: 'weekly'
        });
    });

    // Build the XML string
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    allPages.forEach(page => {
        xml += `  <url>\n`;
        xml += `    <loc>${SITE_URL}${page.path}</loc>\n`;
        xml += `    <lastmod>${currentDate}</lastmod>\n`;
        xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
        xml += `    <priority>${page.priority}</priority>\n`;
        xml += `  </url>\n`;
    });

    xml += `</urlset>`;

    // Write the file to the Vite 'public' folder
    const outputPath = path.join(__dirname, '..', 'public', 'sitemap.xml');
    fs.writeFileSync(outputPath, xml, 'utf8');

    console.log(`✅ Sitemap successfully generated with ${allPages.length} URLs!`);
}

generateSitemap().catch(console.error);
