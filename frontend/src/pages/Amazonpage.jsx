import React, { useState, useEffect, useRef } from "react";
import "./insta.css";
import axios from "axios";
import { MutatingDots } from "react-loader-spinner";
import { gsap } from "gsap";

const AmazonPage = () => {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const pageRef = useRef(null); // Reference for GSAP animation

  useEffect(() => {
    // GSAP animation for sliding content
    gsap.fromTo(
      pageRef.current,
      { y: -100, opacity: 0 }, // Starting position
      { y: 0, opacity: 1, duration: 1.4, ease: "power2.out" } // Final position
    );
  }, []);

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!query) {
      alert("Please enter a product name");
      return;
    }

    setLoading(true); // Show loader
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/scraper/amazon-product`,
        { query: query }
      );

      setQuery("");

      if (response.status === 200) {
        const data = response.data.products;
        setProducts(data); // Store the fetched product data
      }
    } catch (err) {
      console.log(err);
      alert("Failed to fetch data from Amazon");
    }
    setLoading(false); // Hide loader
  };

  return (
    <div className="insta-Home-container" ref={pageRef}>
      <nav className="navbar">
        <h1>Web Scraper</h1>
        <div className="nav-link">
          <a href="/">Home</a>
          <button className="nav-btn">Get Started</button>
        </div>
      </nav>
      <p className="title">Amazon Web Scraper</p>
      <div className="input-container">
        <p>Enter Product Name</p>
        <div>
          <input
            className="insta-input"
            onChange={(e) => setQuery(e.target.value)}
            value={query}
            type="text"
            placeholder="samsung phone"
          />
          <button onClick={submitHandler} className="input-button">
            Get Data
          </button>
        </div>
      </div>

      {/* Loader */}
      {loading && (
        <div className="loader-container">
          <MutatingDots
            visible={true}
            height="100"
            width="100"
            color="#fff"
            secondaryColor="#fff"
            radius="12.5"
            ariaLabel="mutating-dots-loading"
            wrapperStyle={{}}
          />
        </div>
      )}

      {/* Product Data */}
      {!loading && (
        <div className="product-data">
          {products && products.length > 0 ? (
            products.map((product, index) => (
              <div key={index} className="product-item">
                <div className="product-code">
                  <span>
                    {`"name": "`}
                    <code>{product.name}</code>`,
                  </span>
                  <br />
                  <span>
                    {`"price": "`}
                    <code>{product.price}</code>`,
                  </span>
                  <br />
                </div>
              </div>
            ))
          ) : (
            <p>No products found</p>
          )}
        </div>
      )}
    </div>
  );
};

export default AmazonPage;
