import { useEffect, lazy } from 'react';
import { useLocation } from 'react-router-dom';
const Hero = lazy(() => import("../components/homepage/Hero"));
const Features = lazy(() => import("../components/homepage/Features"));
const About = lazy(() => import("../components/homepage/About"));
const HowItWorks = lazy(() => import("../components/homepage/HowItWorks"));
const Footer = lazy(() => import("../components/homepage/Footer"));
import SEO from '../components/SEO';
import '../styles/homepage.scss'

export default function HomePage() {
    const location = useLocation();

    useEffect(() => {
        // If the URL has a hash (e.g. #features) when the page loads
        if (location.hash) {
            const id = location.hash.substring(1); // remove the '#'
            // A tiny timeout ensures the browser has finished rendering the sections
            setTimeout(() => {
                const element = document.getElementById(id);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                }
            }, 100);
        } else {
            // Scroll to top if just navigating to '/'
            window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
        }
    }, [location]);

    return (
        <>
            <SEO title={"Budget Buddy"} />
            <main className="homepage">
                <Hero />
                <Features />
                <About />
                <HowItWorks />
                <Footer />
            </main>
        </>
    );
}
