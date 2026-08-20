import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { EMOJI_ICONS } from '../datas/icons';
import '../css/Footer.css';

export default function FooterAdmin() {
  const location = useLocation();

  return (
    <div className="mobile-bottom-nav">
      <Link 
        to="/admin/posts" 
        className={location.pathname === '/admin/posts' ? 'nav-item active' : 'nav-item'}
      >
        <div className="nav-icon text-lg">{EMOJI_ICONS.home}</div>
        <span>Quản lý bài đăng</span>
      </Link>

      <Link 
        to="/admin/finance" 
        className={location.pathname === '/admin/finance' ? 'nav-item active' : 'nav-item'}
      >
        <div className="nav-icon text-lg">{EMOJI_ICONS.tools}</div>
        <span>Quản lý tài chính</span>
      </Link>

      <Link 
        to="/admin/info" 
        className={location.pathname === '/admin/info' ? 'nav-item active' : 'nav-item'}
      >
        <div className="nav-icon text-lg">{EMOJI_ICONS.balloon}</div>
        <span>Quản lý thông tin</span>
      </Link>
    </div>
  );
}