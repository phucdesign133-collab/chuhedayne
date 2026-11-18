import { useLocation, useNavigate } from 'react-router-dom';
import { EMOJI_ICONS } from '../datas/icons';
import '../css/Footer.css';

const tabs = [
  { label: 'Trang chủ', path: '/home', icon: EMOJI_ICONS.home },
  { label: 'Thư viện', path: '/gallery', icon: EMOJI_ICONS.gallery },
  { label: 'Bong bóng', path: '/balloon', icon: EMOJI_ICONS.balloon },
  { label: 'Vòng quay', path: '/spin', icon: EMOJI_ICONS.spin },
  { label: 'Tiện ích', path: '/tools', icon: EMOJI_ICONS.tools },
];

export default function Footer() {
  const location = useLocation();
  const navigate = useNavigate();
  const activeIndex = tabs.findIndex(({ path }) =>
    path === '/home' ? location.pathname === '/' || location.pathname === '/home' : location.pathname.startsWith(path),
  );

  return (
    <nav className="mobile-bottom-nav user-footer" aria-label="Điều hướng chính">
      {tabs.map(({ label, path, icon }, index) => {
        const isActive = index === activeIndex;
        return (
          <button
            className={`nav-item ${isActive ? 'active' : ''}`}
            key={path}
            type="button"
            onClick={() => navigate(path)}
            aria-label={label}
            aria-current={isActive ? 'page' : undefined}
          >
            <span className="nav-icon" aria-hidden="true">{icon}</span>
            <span className="nav-text">{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
