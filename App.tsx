import React from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import { Home } from './pages/Home';
import { ProductDetail } from './pages/ProductDetail';
import { CaseDetail } from './pages/CaseDetail';
import { AdminLogin } from './pages/AdminLogin';
import { AdminDashboard } from './pages/AdminDashboard';

// Wrapper to conditionally render Layout (don't show nav/footer on admin login)
const LayoutWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const location = useLocation();
    const isAdmin = location.pathname.startsWith('/admin');
    
    // For Dashboard, we might want a different layout, but for now we'll strip the main layout
    // For Login, definitely strip it.
    if (isAdmin) {
        return <>{children}</>;
    }
    return <Layout>{children}</Layout>;
};

function App() {
  return (
    <Router>
      <LayoutWrapper>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/cases/:id" element={<CaseDetail />} />
          <Route path="/products" element={<Home />} /> {/* Redirect/Alias for demo */}
          <Route path="/cases" element={<Home />} />    {/* Redirect/Alias for demo */}
          
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </LayoutWrapper>
    </Router>
  );
}

export default App;
