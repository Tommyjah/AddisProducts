import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { Header } from './components/Layout/Header';
import { Footer } from './components/Layout/Footer';
import { Home } from './pages/Home';
import { Products } from './pages/Products';
import { Government } from './pages/Government';
import { Submit } from './pages/Submit';
import { Login } from './pages/Login';
import { ProductDetail } from './pages/ProductDetail';
import { GovernmentSubmit } from './pages/GovernmentSubmit';
import { GovernmentProposalDetail } from './pages/GovernmentProposalDetail';
import { About } from './pages/About';
import { Contact } from './pages/Contact';
import { Privacy } from './pages/Privacy';
import { Terms } from './pages/Terms';
import { Guidelines } from './pages/Guidelines';
import { Pledge } from './pages/Pledge';
import { Collaborate } from './pages/Collaborate';

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<Products />} />
                <Route path="/products/:id" element={<ProductDetail />} />
                <Route path="/government" element={<Government />} />
                <Route path="/government-submit" element={<GovernmentSubmit />} />
                <Route path="/government/:id" element={<GovernmentProposalDetail />} />
                <Route path="/submit" element={<Submit />} />
                <Route path="/login" element={<Login />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/guidelines" element={<Guidelines />} />
                <Route path="/pledge/:id" element={<Pledge />} />
                <Route path="/collaborate/:id" element={<Collaborate />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;