import React, { useEffect, useState } from 'react';
import './insta.css';
import axios from 'axios';
import { MutatingDots } from 'react-loader-spinner';
import { useRef } from 'react';
import { gsap } from "gsap";

const YoutubePage = () => {
  const [channelUrl, setChannelUrl] = useState('');
  const [channelData, setChannelData] = useState(null);
  const [loading, setLoading] = useState(false); // State for loading
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
    if (!channelUrl) {
      alert('Please enter a channel link');
      return;
    }

    setLoading(true); // Show loader

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/scraper/YouTubeChannel`,
        { channelUrl: channelUrl }
      );

      setChannelUrl('');

      if (response.status === 200) {
        const data = response.data.data;
        setChannelData(data); // Set the fetched data to state
      }
    } catch (err) {
      console.log(err);
      alert('Failed to fetch data from YouTube');
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
      <p className="title">YouTube Web Scraper</p>
      <div className="input-container">
        <p>Enter Channel Link</p>
        <div>
          <input
            onChange={(e) => setChannelUrl(e.target.value)}
            value={channelUrl}
            className="insta-input"
            type="text"
            placeholder="https://www.youtube.com/yourchannelname"
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

      {/* YouTube Data */}
      {!loading && channelData ? (
        <div className="youtube-data">
          <div className="channel-info">
            <h3>Channel Information</h3>
            <pre>{`{
  "channelName": "${channelData.channelData.channelName}",
  "subscribers": "${channelData.channelData.subscribers}",
  "videoCount": "${channelData.channelData.videoCount}"
}`}</pre>
          </div>

          <div className="video-details">
            <h3>Video Details</h3>
            {channelData.videoDetails.map((video, index) => (
              <div key={index} className="video-item">
                <pre>{`{
  "title": "${video.title}",
  "url": "${video.url}",
  "views": "${video.views}"
}`}</pre>
              </div>
            ))}
          </div>
        </div>
      ) : (
        !loading && <p>No data available</p>
      )}
    </div>
  );
};

export default YoutubePage;
