import React, { useEffect, useState } from 'react';
import './insta.css';
import axios from 'axios';
import { MutatingDots } from 'react-loader-spinner';
import { useRef } from 'react';
import { gsap } from "gsap";


const MoviesPage = () => {
  const [movieUrl, setMovieUrl] = useState('');
  const [movieData, setMovieData] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // State for loading spinner
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
    if (!movieUrl) {
      alert('Please enter a movie link');
      return;
    }

    setIsLoading(true); // Start loading spinner

    try {
      const response = await axios.post( `${import.meta.env.VITE_BASE_URL}/scraper/movie`, {
        movieUrl: movieUrl,
      });

      setMovieUrl('');
      if (response.status === 200) {
        const data = response.data.movie;
        setMovieData(data); // Store fetched data in state
      }
    } catch (err) {
      console.log(err);
      alert('Failed to fetch data from the movie URL');
    } finally {
      setIsLoading(false); // Stop loading spinner
    }
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
      <p className="title">Movies Web Scraper</p>
      <div className="input-container">
        <p>Enter movie link</p>
        <div>
          <input
            onChange={(e) => {
              setMovieUrl(e.target.value);
            }}
            value={movieUrl}
            className="insta-input"
            type="text"
            placeholder="https://www.imdb.com/title/tt10919420/"
          />
          <button
            onClick={(e) => {
              submitHandler(e);
            }}
            className="input-button"
          >
            Get Data
          </button>
        </div>
      </div>

      {/* Show loader when loading */}
      {isLoading && (
        <div className="loader">
          <MutatingDots
            visible={true}
            height="100"
            width="100"
            color="#fff"
            secondaryColor="#ffff"
            radius="12.5"
            ariaLabel="mutating-dots-loading"
            wrapperStyle={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}
          />
        </div>
      )}

      {/* Movie Data Section */}
      {!isLoading && movieData && (
        <div className="movie-data">
          <h2>Title: {movieData.title}</h2>
          <p>
            <strong>Rating:</strong> {movieData.rating}
          </p>
          <p>
            <strong>Release Date:</strong> {movieData.releaseDate}
          </p>
          <p>
            <strong>Plot:</strong> {movieData.plot}
          </p>
          <p>
            <strong>Cast:</strong>
          </p>
          <ul>
            {movieData.cast.map((actor, index) => (
              <li key={index}>{actor}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Show no data message */}
      {!isLoading && !movieData && <p>No data to display</p>}
    </div>
  );
};

export default MoviesPage;
