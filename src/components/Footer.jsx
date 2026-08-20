import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { EMOJI_ICONS } from '../datas/icons';
import '../css/Footer.css';

export default function Footer() {
  const location = useLocation();

  return (
    <div className="mobile-bottom-nav">
      <Link 
        to="/home" 
        className={location.pathname === '/home' || location.pathname === '/' ? 'nav-item active' : 'nav-item'}
      >
        <div className="nav-icon text-lg">{EMOJI_ICONS.home}</div>
        <span>Home</span>
      </Link>

      <Link 
        to="/gallery" 
        className={location.pathname === '/gallery' ? 'nav-item active' : 'nav-item'}
      >
        <div className="nav-icon text-lg">{EMOJI_ICONS.gallery}</div>
        <span>Gallery</span>
      </Link>

      <Link 
        to="/balloon" 
        className={location.pathname === '/balloon' ? 'nav-item active' : 'nav-item'}
      >
        <div className="nav-icon text-lg">{EMOJI_ICONS.balloon}</div>
        <span>Balloon</span>
      </Link>

      <Link 
        to="/spin" 
        className={location.pathname === '/spin' ? 'nav-item active' : 'nav-item'}
      >
        <div className="nav-icon text-lg">{EMOJI_ICONS.spin}</div>
        <span>Spin</span>
      </Link>

      <Link 
        to="/tools" 
        className={location.pathname === '/tools' ? 'nav-item active' : 'nav-item'}
      >
        <div className="nav-icon text-lg">{EMOJI_ICONS.tools}</div>
        <span>Tools</span>
      </Link>
    </div>
  );
}