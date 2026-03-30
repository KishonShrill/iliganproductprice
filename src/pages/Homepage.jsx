import { lazy } from 'react';
const Hero = lazy(() => import("../components/homepage/Hero"));
const Features = lazy(() => import("../components/homepage/Features"));
const About = lazy(() => import("../components/homepage/About"));
const HowItWorks = lazy(() => import("../components/homepage/HowItWorks"));
const Footer = lazy(() => import("../components/homepage/Footer"));
import SEO from '../components/SEO';
import '../styles/homepage.scss'

export default function HomePage() {
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
