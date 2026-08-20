import React from 'react';
import '../css/CreditCardIconGrid.css';

export default function CreditCardIconGrid({ onSelectCard, selectedCard, allCardsData = {} }) {
  const cards = [
    { id: 'techcombank', name: 'Techcombank' },
    { id: 'vib', name: 'VIB' },
    { id: 'tpbank', name: 'TPBank' },
    { id: 'vpbank', name: 'VPBank' },
    { id: 'seasy', name: 'Seasy' },
    { id: 'slater', name: 'Slater' }
  ];

  let totalLimit = 0;
  let totalDebt = 0;

  Object.values(allCardsData).forEach(data => {
    if (data) {
      totalLimit += Number(data.limit || 0);
      totalDebt += Number(data.debt || 0);
    }
  });

  const totalPercent = totalLimit > 0 ? Math.min(100, Math.max(0, (totalDebt / totalLimit) * 100)).toFixed(1) : 0;

  let progressColor = 'var(--primary-green)';
  if (totalPercent >= 80) {
    progressColor = 'var(--primary-dark-red)';
  } else if (totalPercent >= 60) {
    progressColor = 'var(--primary-orange)';
  } else if (totalPercent >= 30) {
    progressColor = 'var(--primary-blue)';
  }

  return (
    <div className="credit-icon-grid-container">
      <div className="total-debt-overview">
        <div className="overview-header">
          {/* Bên trái: Hiển thị tổng dư nợ / tổng hạn mức bằng tiền */}
          <span className="overview-title">
            {Number(totalDebt).toLocaleString('vi-VN')} đ / {Number(totalLimit).toLocaleString('vi-VN')} đ
          </span>
          {/* Bên phải: Hiển thị % / 100% */}
          <span className="overview-percent" style={{ color: progressColor }}>
            {totalPercent}% / 100%
          </span>
        </div>
        <div className="overview-progress-bg">
          <div 
            className="overview-progress-fill" 
            style={{ 
              width: `${totalPercent}%`, 
              backgroundColor: progressColor 
            }}
          ></div>
        </div>
      </div>

      <div className="credit-icon-rows">
        {cards.map((card) => (
          <div 
            key={card.id} 
            className={`credit-icon-item ${selectedCard === card.id ? 'active' : ''}`}
            onClick={() => onSelectCard && onSelectCard(card.id)}
          >
            <span className="icon-label">{card.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}