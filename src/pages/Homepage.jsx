import { Link } from 'react-router-dom';
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
      <section className="homepage__hero">
        <h2 className="homepage__hero-title">Estimate Your Shopping Budget Effortlessly</h2>
        <p className="homepage__hero-subtitle computer">Stop collecting receipts!<br />Use Budget Buddy to quickly add products and see your estimated total before you hit the checkout.</p>
        <p className="homepage__hero-subtitle phone-block">Stop collecting receipts!<br />Use Budget Buddy now!</p>
        <Link to="/locations" className="cta-button">Start Estimating Now!</Link>
      </section>

      <section className="homepage__purpose">
        <h3>Why Use Budget Buddy?</h3>
        <p>Budget Buddy is designed to help you keep track of your potential spending while shopping. Simply add the items you&#39;re considering to your cart, and watch the total update instantly. It&#39;s a handy web app that&#39;s with you whenever you&#39;re online, making budget estimation quick and easy.</p>
        {/* <p>Budget Buddy is designed to help you keep track of your potential spending while shopping. Simply add the items you're considering to your cart, and watch the total update instantly. It's a handy web app that's with you whenever you're online, making budget estimation quick and easy.</p> */}
      </section>

      <section className="homepage__persistence">
        <h3>Your Cart Stays With You</h3>
        <p>Worried about losing your progress? Don&#39;t be! Budget Buddy saves your current cart directly on your device using local storage. Close the tab, shut down your browser – when you come back on the same device, your items will still be right there in the cart, ready for you to continue.</p>
      </section>

      <section className="homepage__contacts">
        <h3>Contact the Developer</h3>
        <ul>
          <li>Email: <a href="mailto:chriscentlouisjune.pingol@g.msuiit.edu.ph?subject=Inquiry">Institutional Email</a></li>
          <li>Email: <a href="mailto:crystalbluew@gmail.com?subject=Inquiry">Personal Email</a></li>
          <li>Location: Iligan City, Philippines</li>
        </ul>
      </section>

      <section className="homepage__socials">
        <h3>Connect Online</h3>
        <ul>
            <li><a href="#" style={{color: "black"}}>🔒 Facebook</a></li>
            <li><a href="#" style={{color: "black"}}>🔒 Twitter</a></li>
            <li><a href="https://www.linkedin.com/in/chriscent-louis-june-pingol/" target="_blank">✅ LinkedIn</a></li>
            <li><a href="https://github.com/KishonShrill" target="_blank">✅ GitHub</a></li>
        </ul>
      </section>

      <footer>
        <p>&copy; 2025 Budget Buddy. Developed by Perseque. All rights reserved.</p>
      </footer>
    </main>
  );
}