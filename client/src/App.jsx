import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import Home from './pages/Home';
import Submit from './pages/Submit';
import Track from './pages/Track';
import Dashboard from './pages/Dashboard';
import RequestDetail from './pages/RequestDetail';

function Nav() {
  return (
    <nav>
      <div className="nav-inner">
        <NavLink to="/" className="nav-logo" style={{ textDecoration: 'none' }}>
          Gunaso
        </NavLink>
        <ul className="nav-links">
          <li><NavLink to="/submit">Submit</NavLink></li>
          <li><NavLink to="/track">Track</NavLink></li>
          <li><NavLink to="/dashboard">Dashboard</NavLink></li>
        </ul>
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Nav />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/submit" element={<Submit />} />
        <Route path="/track" element={<Track />} />
        <Route path="/track/:trackingId" element={<Track />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/:id" element={<RequestDetail />} />
      </Routes>
    </BrowserRouter>
  );
}
