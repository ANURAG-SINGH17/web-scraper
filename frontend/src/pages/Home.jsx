import React, { useEffect, useState } from "react";
import "./home.css";
import { useNavigate } from "react-router-dom"; // Use useNavigate for React Router v6
import { gsap } from "gsap";

const Home = () => {
  const navigate = useNavigate();

  const [circleAnim1, setCircleAnim1] = useState(false);
  const [circleAnim2, setCircleAnim2] = useState(false);
  const [circleAnim3, setCircleAnim3] = useState(false);
  const [circleAnim4, setCircleAnim4] = useState(false);

  const handleAnimationAndNavigate = (circleClass, setCircleAnim, route) => {
    // Trigger animation and navigate after it's done
    gsap.to(circleClass, {
      duration: 0.5,
      height: "2000",
      width: "2000",
      onComplete: () => {
        navigate(route); // Navigate to the desired route after animation completes
      },
    });
    setCircleAnim(true); // Set animation state (if needed)
  };

  return (
    <div className="home">
      <nav>
        <h1>Web Scraper</h1>
        <div className="nav-link-2">
          <a href="/">Home</a>
          <button className="nav-btn">Get Started</button>
        </div>
      </nav>

      <div className="hero">
        <div className="hero-content">
          <p>Get Data from Your Favorite Platforms</p>
          <div>
            <p className="hero-content2">
              Scrape Instagram, YouTube, Amazon, and Movies.
            </p>
          </div>
        </div>
      </div>

      <div className="hero-button">
        <div className="r1">
          <button
            onClick={() =>
              handleAnimationAndNavigate(".circle1", setCircleAnim1, "/instagram-scraper")
            }
          >
            Instagram
          </button>
          <div className="circle1"></div>
        </div>

        <div className="r1">
          <button
            onClick={() =>
              handleAnimationAndNavigate(".circle2", setCircleAnim2, "/YouTubeChannel")
            }
          >
            YouTube
          </button>
          <div className="circle2"></div>
        </div>

        <div className="r1">
          <button
            onClick={() =>
              handleAnimationAndNavigate(".circle3", setCircleAnim3, "/amazon-product")
            }
          >
            Amazon
          </button>
          <div className="circle3"></div>
        </div>

        <div className="r1">
          <button
            onClick={() =>
              handleAnimationAndNavigate(".circle4", setCircleAnim4, "/movie")
            }
          >
            IBDM
          </button>
          <div className="circle4"></div>
        </div>
      </div>
    </div>
  );
};

export default Home;
