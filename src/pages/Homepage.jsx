import { lazy } from 'react';
const Hero = lazy(() => import("../components/homepage/Hero"));
const Features = lazy(() => import("../components/homepage/Features"));
const About = lazy(() => import("../components/homepage/About"));
const HowItWorks = lazy(() => import("../components/homepage/HowItWorks"));
const Footer = lazy(() => import("../components/homepage/Footer"));
import '../styles/homepage.scss'

export default function HomePage() {
  document.title = "Homepage - Budget Buddy"

  // // useEffect automatically executes once the page is fully loaded
  // useEffect(() => {
  //   // set configurations for the API call here
  //   const configuration = {
  //     method: "get",
  //     url: "https://iliganproductprice-mauve.vercel.app/free-endpoint",
  //   };

  //   // make the API call
  //   axios(configuration)
  //     .then((result) => {
  //       // assign the message in our result to the message we initialized above
  //       setMessage(result.data.message);
  //     })
  //     .catch((error) => {
  //       error = new Error();
  //     });
  // }, [])

  return (
    <main className="homepage">
      <Hero />
      <Features />
      <About />
      <HowItWorks />
      <Footer />
    </main>
  );
}
