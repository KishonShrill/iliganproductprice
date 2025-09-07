import { Link } from 'react-router-dom';
import Hero from '../components/homepage/Hero';
import Features from '../components/homepage/Features';
import About from '../components/homepage/About';
import HowItWorks from '../components/homepage/HowItWorks';
import Footer from '../components/homepage/Footer';
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
