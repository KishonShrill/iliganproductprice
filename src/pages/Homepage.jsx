import React, { useEffect, useState,  } from "react";

export default function HomePage() {
  const [message, setMessage] = useState("");

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
        <h2>Estimate Your Shopping Budget Effortlessly</h2>
        <p>Stop collecting receipts! Use Budget Buddy to quickly add products and see your estimated total before you hit the checkout.</p>
        <a href="/groceries" className="cta-button">Start Estimating Now!</a>
      </section>

      <section className="homepage__purpose">
        <h3>Why Use Budget Buddy?</h3>
        <p>Budget Buddy is designed to help you keep track of your potential spending while shopping. Simply add the items you're considering to your cart, and watch the total update instantly. It's a handy web app that's with you whenever you're online, making budget estimation quick and easy.</p>
      </section>

      <section className="homepage__persistence">
        <h3>Your Cart Stays With You</h3>
        <p>Worried about losing your progress? Don't be! Budget Buddy saves your current cart directly on your device using local storage. Close the tab, shut down your browser – when you come back on the same device, your items will still be right there in the cart, ready for you to continue.</p>
      </section>

      <section className="homepage__contacts">
        <h3>Contact the Developer</h3>
        <ul>
          <li>Email: your.email@example.com</li>
          <li>Phone: +63 9XX XXX XXXX</li>
          <li>Location: Cagayan de Oro, Philippines</li>
        </ul>
      </section>

      <section className="homepage__socials">
        <h3>Connect Online</h3>
        <ul>
            <li><a href="#" target="_blank">Facebook</a></li>
            <li><a href="#" target="_blank">Twitter</a></li>
            <li><a href="#" target="_blank">LinkedIn</a></li>
            <li><a href="#" target="_blank">GitHub</a></li>
        </ul>
      </section>

      <footer>
        <p>&copy; 2025 Budget Buddy. Developed by [Your Name]. All rights reserved.</p>
      </footer>
    </main>
  );
}