import React, { useEffect, useState,  } from "react";
import axios from "axios";

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
      <header className="frontpage">
        <div>
          <h1>Price Checker</h1>
          <p></p>
        </div>
      </header>
      {/* <section></section> */}
      {/* <section className=""></section> */}
      <section className="faq"></section>
      <footer></footer>
      <h1 className="text-center">Free Component</h1>
      {/* displaying our message from our API call */}
      {/* <h3 className="text-center text-danger">{message}</h3> */}<h1 className="text-center">Free Component</h1>
      {/* displaying our message from our API call */}
      {/* <h3 className="text-center text-danger">{message}</h3> */}
    </main>
  );
}