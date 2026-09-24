// src/components/ComingSoon.jsx
import React from 'react';

export default function ComingSoon() {
  return (
    <div
      style={{
        minHeight: '60vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '24px',
      }}
    >
      <div>
        <div style={{ fontSize: '40px', marginBottom: '12px' }}>🎈</div>
        <div style={{ fontSize: '20px', fontWeight: 600 }}>
          Coming Soon
        </div>
        <div style={{ marginTop: '6px', opacity: 0.6 }}>
          Nội dung đang được chuẩn bị.
        </div>
      </div>
    </div>
  );
}