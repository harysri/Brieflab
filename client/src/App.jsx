import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./Components/Navbar";
import Footer from "./Components/Footer";
import ScrollToTop from "./Components/Scrolltotop";
import Home from "./Pages/Home";
import Ask from "./Pages/Ask";
function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="app">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/ask" element={<Ask />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
