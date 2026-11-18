import { useNavigate } from 'react-router-dom';
import { ArrowRight, CalendarDays, Gift, Sparkles } from 'lucide-react';
import Carousel from '../components/Carousel';
import '../css/Home.css';
import Calendar from '../components/Calendar';

export default function Home() {
  const navigate = useNavigate();
  const today = new Intl.DateTimeFormat('vi-VN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date());

  return (
    <main className="home-page-container">
      <header className="home-brand-header">
        <div className="home-brand-mark" aria-hidden="true">
          <Sparkles size={21} strokeWidth={2.2} />
        </div>
        <div className="home-brand-copy">
          <p className="home-brand-name">Chú Hề Đây Nè!</p>
          <p className="home-brand-caption">Cùng tạo nên ngày vui</p>
        </div>
        <div className="home-date-chip">
          <CalendarDays size={15} aria-hidden="true" />
          <span>{today}</span>
        </div>
      </header>

      <section className="home-welcome-card" aria-labelledby="home-title">
        <div className="home-welcome-copy">
          <p className="home-eyebrow"><span /> LỊCH HOẠT ĐỘNG</p>
          <h1 id="home-title">Sẵn sàng cho ngày vui?</h1>
          <p className="home-welcome-description">
            Xem lịch tập trung và cùng đội ngũ chuẩn bị cho những khoảnh khắc đáng nhớ.
          </p>
        </div>
        <div className="home-welcome-decoration" aria-hidden="true">
          <span className="welcome-orbit welcome-orbit-one" />
          <span className="welcome-orbit welcome-orbit-two" />
          <Sparkles className="welcome-sparkle welcome-sparkle-one" size={27} />
          <Sparkles className="welcome-sparkle welcome-sparkle-two" size={15} />
        </div>
      </section>

      <section className="home-calendar-section" aria-label="Lịch tập trung">
        <div className="home-section-heading">
          <div>
            <p className="home-section-eyebrow">KẾ HOẠCH CỦA ĐỘI NGŨ</p>
            <h2>Lịch tập trung</h2>
          </div>
          <span className="home-live-indicator"><span /> Cập nhật trực tiếp</span>
        </div>
        <Calendar isAdmin={false} />
      </section>

      <section className="home-moments-section" aria-labelledby="home-moments-title">
        <div className="home-section-heading home-moments-heading">
          <div>
            <p className="home-section-eyebrow">LƯU GIỮ NIỀM VUI</p>
            <h2 id="home-moments-title">Khoảnh khắc đáng nhớ</h2>
          </div>
        </div>
        <div className="home-carousel-wrapper">
          <Carousel />
        </div>
      </section>

      <button className="home-spin-teaser" type="button" onClick={() => navigate('/spin')}>
        <span className="home-spin-icon"><Gift size={21} aria-hidden="true" /></span>
        <span className="home-spin-content">
          <span className="home-spin-kicker">MỘT CHÚT MAY MẮN</span>
          <span className="home-spin-title">Vòng quay may mắn</span>
          <span className="home-spin-subtitle">Thử vận may và nhận quà nhé</span>
        </span>
        <span className="home-spin-arrow" aria-hidden="true"><ArrowRight size={19} /></span>
      </button>
    </main>
  );
}
