import React from 'react';
import './FounderModal.css';

export default function FounderModal({ founder, onClose }) {
  if (!founder) return null;
  return (
    <div className="founder-modal-overlay" onClick={onClose}>
      <div className="founder-modal" onClick={e => e.stopPropagation()}>
        <button className="founder-modal-close" onClick={onClose}>&times;</button>
        {founder.photoUrl ? (
          <img src={founder.photoUrl} alt={founder.name} className={`card-photo founder-modal-photo founder-photo-img ${founder.photoClass}`} />
        ) : (
          <div className={`card-photo founder-modal-photo ${founder.photoClass}`}></div>
        )}
        <h2>{founder.name}</h2>
        <h4>{founder.role}</h4>
        <p className="founder-modal-desc">{founder.desc}</p>
        <div className="founder-modal-section">
          <strong>Kỹ năng:</strong>
          <ul>
            {founder.skills && founder.skills.map((skill, idx) => <li key={idx}>{skill}</li>)}
          </ul>
        </div>
        <div className="founder-modal-section">
          <strong>Dự án:</strong>
          <ul>
            {founder.projects && founder.projects.map((pj, idx) => <li key={idx}>{pj}</li>)}
          </ul>
        </div>
        <a className="founder-modal-portfolio" href={founder.portfolio} target="_blank" rel="noopener noreferrer">Xem portfolio cá nhân</a>
      </div>
    </div>
  );
} 