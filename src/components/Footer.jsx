import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaWallet, FaBullseye, FaAddressBook, FaShareAlt, FaBoxes } from 'react-icons/fa';
import '../css/Footer.css';

export default function Footer() {
  const location = useLocation();

  return (
    <div className="mobile-bottom-nav">
      <Link to="/finance" className={location.pathname === '/finance' || location.pathname === '/' ? 'nav-item active' : 'nav-item'}>
        <FaWallet className="nav-icon" />
        <span>Tài chính</span>
      </Link>
      <Link to="/goal" className={location.pathname === '/goal' ? 'nav-item active' : 'nav-item'}>
        <FaBullseye className="nav-icon" />
        <span>Kế hoạch</span>
      </Link>
      <Link to="/client" className={location.pathname === '/client' ? 'nav-item active' : 'nav-item'}>
        <FaAddressBook className="nav-icon" />
        <span>Khách hàng</span>
      </Link>
      <Link to="/social" className={location.pathname === '/social' ? 'nav-item active' : 'nav-item'}>
        <FaShareAlt className="nav-icon" />
        <span>MXH</span>
      </Link>
      <Link to="/supplies" className={location.pathname === '/supplies' ? 'nav-item active' : 'nav-item'}>
        <FaBoxes className="nav-icon" />
        <span>Vật tư</span>
      </Link>
    </div>
  );
}