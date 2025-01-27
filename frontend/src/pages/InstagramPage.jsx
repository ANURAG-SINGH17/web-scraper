import React, { useState, useEffect, useRef } from "react";
import "./insta.css";
import axios from "axios";
import { MutatingDots } from "react-loader-spinner";
import { gsap } from "gsap";

const InstagramPage = () => {
  const [profileUrl, setProfileUrl] = useState("");
  const [profileData, setProfileData] = useState(null);
  const [postDetails, setPostDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  const pageRef = useRef(null); // Reference for the page container

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
    if (!profileUrl || !profileUrl.startsWith("https://www.instagram.com/")) {
      alert("Please enter a valid Instagram profile URL");
      return;
    }

    setLoading(true);
    setProfileData(null);

    try {
      const response = await axios.post(
        "http://localhost:4000/scraper/instagram-profile",
        { profileUrl: profileUrl }
      );

      if (response.status === 200) {
        const data = response.data;
        setProfileData(data.profileData);
        setPostDetails(data.postDetails);
      }
    } catch (err) {
      console.log(err);
      alert("Failed to fetch data from Instagram");
    } finally {
      setLoading(false);
    }

    setProfileUrl("");
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
      <p className="title">Instagram Web Scraper</p>
      <div className="input-container">
        <p>Enter Instagram URL</p>
        <div>
          <input
            onChange={(e) => setProfileUrl(e.target.value)}
            value={profileUrl}
            className="insta-input"
            type="text"
            placeholder="https://www.instagram.com/yourusername/"
          />
          <button onClick={submitHandler} className="input-button">
            Get Data
          </button>
        </div>
      </div>

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
            wrapperClass=""
          />
        </div>
      )}

      {!loading && profileData && (
        <div className="instaProfileData-Container">
          <div className="profile-data">
            <p>Followers: {profileData.followers}</p>
            <p>Following: {profileData.following}</p>
            <h3>Posts:{profileData.posts}</h3>
            <div className="posts-container">
              {postDetails.map((post, index) => (
                <div className="post-card" key={index}>
                  <a
                    href={post.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img
                      src={post.image}
                      alt="Instagram post"
                      className="post-image"
                    />
                  </a>
                  <p className="post-caption">{post.caption}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {!loading && !profileData && (
        <p style={{ textAlign: "center", marginTop: "20px" }}>
          No data to display. Please enter a URL and fetch the data.
        </p>
      )}
    </div>
  );
};

export default InstagramPage;
