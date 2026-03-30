import { Helmet } from 'react-helmet-async';
import PropTypes from 'prop-types';

// Your default fallback values
const defaultSEO = {
    title: "Budget Buddy Iligan City",
    description: "Iligan City Budget Budget : A budget expense tracker, budgeting, and price checking to enhance the livelihood and habits of the Iligan city people",
    url: "https://productprice-iligan.vercel.app/",
    image: "https://res.cloudinary.com/dlmabgte3/image/upload/v1774840647/budgetbuddy_preview.png",
    imageAlt: "Budget Buddy Iligan City app preview showing product prices",
    type: "website",
    twitterCard: "summary_large_image", // This makes the image big on Twitter/X
    twitterImage: "https://res.cloudinary.com/dlmabgte3/image/upload/v1774840647/budgetbuddy_preview.png", // This makes the image big on Twitter/X
};


SEO.propTypes = {
    title: PropTypes.string,
    description: PropTypes.string,
    url: PropTypes.string,
    specificUrl: PropTypes.string,
    image: PropTypes.string,
    imageAlt: PropTypes.string,
    type: PropTypes.string,
    twitterCard: PropTypes.string,
    twitterImage: PropTypes.string,
}

export default function SEO({
    title,
    description,
    url,
    specificUrl = '',
    image,
    imageAlt,
    type,
    twitterImage,
    twitterCard
}) {
    const seo = {
        title: title || defaultSEO.title,
        description: description || defaultSEO.description,
        url: url || `${defaultSEO.url}${specificUrl}`,
        image: image || defaultSEO.image,
        imageAlt: imageAlt || defaultSEO.imageAlt,
        type: type || defaultSEO.type,
        twitterCard: twitterCard || defaultSEO.twitterCard,
        twitterImage: twitterImage || defaultSEO.twitterImage,
    };

    // Optional: Append the site name to specific page titles (e.g., "Locations | Budget Buddy Iligan City")
    const fullTitle = title ? `${title} | ${defaultSEO.title}` : defaultSEO.title;

    return (
        <Helmet>
            {/* Standard HTML Tags */}
            <title>{fullTitle}</title>
            <meta name="description" content={seo.description} />
            <link rel="canonical" href={seo.url} />

            {/* Open Graph (Facebook, LinkedIn, Discord, etc.) */}
            <meta property="og:type" content={seo.type} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={seo.description} />
            <meta property="og:url" content={seo.url} />
            <meta property="og:image" content={seo.image} />

            {/* Twitter / X */}
            <meta name="twitter:card" content={seo.twitterCard} />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={seo.description} />
            <meta name="twitter:image" content={seo.image} />
            <meta name="twitter:image:alt" content={seo.imageAlt} />

            {/* Uncomment this if you have a Twitter account for the app */}
            {/* <meta name="twitter:site" content={defaultSEO.twitterSite} /> */}
        </Helmet>
    );
}
