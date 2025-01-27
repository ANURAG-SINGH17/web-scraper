import React from 'react'
import { Route, Routes } from 'react-router-dom'
import InstagramPage from './pages/InstagramPage'
import Home from './pages/Home'
import Amazonpage from './pages/Amazonpage'
import YoutubePage from './pages/YoutubePage'
import MoviesPage from './pages/MoviesPage'

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Home/>} />
      <Route path="/instagram-scraper" element={<InstagramPage/>} />
      <Route path='/amazon-product' element={<Amazonpage/>} />
      <Route path='/YouTubeChannel' element={<YoutubePage/>} />
      <Route path='/movie' element={<MoviesPage/>}/>
    </Routes>
  )
}

export default App
