import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 bg-slate-950 border-b border-slate-800/50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center">
          <Link
            to="/"
            className="text-2xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500"
          >
            Brieflab
          </Link>
        </div>

        {/* Minimalist Routes */}
        <div className="flex items-center gap-x-8">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-cyan-400 ring-1 ring-inset ring-cyan-400/20 hover:bg-slate-800 hover:text-cyan-300 transition-all duration-200"
          >
            Home
          </Link>
          <Link
            to="/ask"
            className="inline-flex items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-cyan-400 ring-1 ring-inset ring-cyan-400/20 hover:bg-slate-800 hover:text-cyan-300 transition-all duration-200"
          >
            Ask
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
