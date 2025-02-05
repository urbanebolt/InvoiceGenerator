import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { TypeAnimation } from 'react-type-animation';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';
import { DocumentTextIcon } from '@heroicons/react/24/outline';
import InvoiceGenerator from './pages/InvoiceGenerator';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <main className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center justify-center space-y-8">
          <DocumentTextIcon className="h-24 w-24 text-primary animate-bounce" />
          
          <h1 className="text-4xl md:text-6xl font-extrabold text-center bg-gradient-to-b from-indigo-600 to-purple-600 bg-clip-text text-transparent drop-shadow-lg hover:scale-105 transition-transform duration-300">
            Urbanebolt Finance Module
          </h1>
          
          <div className="text-xl md:text-2xl font-semibold text-gray-700 text-center drop-shadow-md">
            <TypeAnimation
              sequence={[
                'Generate Professional Invoices ✨',
                2000,
                'Manage Your Billing Efficiently 💼',
                2000,
                'Track Your Finances Seamlessly 📊',
                2000,
              ]}
              wrapper="span"
              speed={50}
              repeat={Infinity}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
            />
          </div>
          {/* Background Banner (fits screen) */}
          <div className="fixed inset-0 w-full h-screen z-0 overflow-hidden">
            <img 
              src="/logo/background.jpg" 
              alt="Background Logo"
              className="w-full h-full object-cover opacity-15"
              style={{ objectFit: 'cover' }}
            />
          </div>
          
          <Link
            to="/generate"
            className="mt-8 px-8 py-4 bg-primary hover:bg-secondary rounded-full font-semibold transition-all duration-300 transform hover:scale-105"
          >
            Invoice generator
          </Link>
        </div>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <ToastContainer position="top-right" theme="dark" />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/generate" element={<InvoiceGenerator />} />
      </Routes>
    </Router>
  );
};

export default App; 