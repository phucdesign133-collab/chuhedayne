import React from 'react';
import { useNavigate } from 'react-router-dom';
import Carousel from '../components/Carousel';
import '../css/Home.css';
import Calendar from '../components/Calendar';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-page-container">

      {/* COMPONENT 1 — CAROUSEL */}
      <div className="home-carousel-wrapper">
        <Carousel />
      </div>

      {/* COMPONENT 2 — CALENDAR */}
      <Calendar isAdmin={false} />

      {/* COMPONENT 3 — LUCKY SPIN */}
      <div
        className="home-spin-teaser"
        onClick={() => navigate('/spin')}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            navigate('/spin');
          }
        }}
      >
        <div className="home-spin-icon">🎁</div>

        <div className="home-spin-content">
          <div className="home-spin-title">
            VÒNG QUAY MAY MẮN
          </div>

          <div className="home-spin-subtitle">
            Thử vận may của bạn
          </div>
        </div>

        <div className="home-spin-arrow">
          →
        </div>
      </div>

    </div>
  );
}