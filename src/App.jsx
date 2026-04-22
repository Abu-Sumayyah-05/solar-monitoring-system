import React from 'react';
import Dashboard from './pages/Dashboard';

/**
 * App.jsx
 *
 * Currently renders the Dashboard directly.
 * When you add more pages (e.g. Settings, History), wrap this
 * with BrowserRouter and add <Routes> here.
 *
 * Example:
 *   import { BrowserRouter, Routes, Route } from 'react-router-dom';
 *   import Settings from './pages/Settings';
 *
 *   function App() {
 *     return (
 *       <BrowserRouter>
 *         <Routes>
 *           <Route path="/" element={<Dashboard />} />
 *           <Route path="/settings" element={<Settings />} />
 *         </Routes>
 *       </BrowserRouter>
 *     );
 *   }
 */

function App() {
  return <Dashboard />;
}

export default App;