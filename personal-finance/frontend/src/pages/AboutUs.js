import React, { useState } from 'react';
import './AboutUs.css';
import FounderCard from '../components/FounderCard';
import FounderModal from '../components/FounderModal';

const founders = [
    {
    name: 'Nguyễn Ngọc Thiện',
    role: 'Co-Founder & UX/UI Developer',
    desc: 'Định hình trải nghiệm người dùng, thiết kế giao diện trực quan, hiện đại.',
    skills: ['UX/UI Development', 'Branding', 'Figma'],
    projects: ['ViSmart', 'Fintech Việt App', 'BrandKit'],
    portfolio: 'https://portfolio.lthong.com',
    socials: {
      facebook: '#',
      github: '#',
      linkedin: '#',
    },
    photoClass: 'founder-photo-1',
    photoUrl: '/assets/thien.jpg',
  },
  {
    name: 'Nguyễn Thị Quỳnh Như',
    role: 'Co-Founder & CTO',
    desc: 'Chịu trách nhiệm kỹ thuật, kiến trúc hệ thống và bảo mật.',
    skills: ['Fullstack Dev', 'Cloud', 'Security'],
    projects: ['Personal Finance Manager', 'Viettel Money', 'OpenBank API'],
    portfolio: 'https://portfolio.tmtuan.com',
    socials: {
      facebook: '#',
      github: '#',
      linkedin: '#',
    },
    photoClass: 'founder-photo-2',
    photoUrl: '/assets/nhu.jpg',
  },
  {
    name: 'Nguyễn Quốc Hùng',
    role: 'Founder & CEO',
    desc: 'Định hướng chiến lược, phát triển sản phẩm và xây dựng đội ngũ.',
    skills: ['Leadership', 'Product Management', 'Business Strategy'],
    projects: ['ViSmart', 'Fintech Việt', 'ACB Digital'],
    portfolio: 'https://portfolio.nquynhnhu.com',
    socials: {
      facebook: '#',
      github: '#',
      linkedin: '#',
    },
    photoClass: 'founder-photo-3',
    photoUrl: '/assets/hung.jpg',
  },
  {
    name: 'Võ Anh Kiệt',
    role: 'Co-Founder & UX/UI Designer',
    desc: 'Thiết kế trải nghiệm người dùng và giao diện hiện đại.',
    skills: ['UX/UI Design', 'Branding', 'Figma'],
    projects: ['ViSmart', 'Fintech Việt App', 'BrandKit'],
    portfolio: 'https://portfolio.lthong.com',
    socials: {
      facebook: '#',
      github: '#',
      linkedin: '#',
    },
    photoClass: 'founder-photo-4',
    photoUrl: '/assets/kiet.jpg',
  },
];

export default function AboutUs() {
  const [selectedFounder, setSelectedFounder] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleCardClick = (founder) => {
    setSelectedFounder(founder);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedFounder(null);
  };

  return (
    <div className="aboutus-container">
      <div className="aboutus-left aboutus-left-card">
        <h1 className="aboutus-title">Về chúng tôi</h1>
        <p className="aboutus-desc"><b>ViSmart</b> là dự án quản lý chi tiêu cá nhân hiện đại, giúp người dùng kiểm soát tài chính, lập kế hoạch tiết kiệm, đầu tư và đạt được mục tiêu tài chính cá nhân một cách thông minh.</p>
        <div className="aboutus-section">
          <h2><span className="aboutus-icon">🎯</span> Sứ mệnh</h2>
          <p>Đồng hành cùng người Việt trên hành trình tự do tài chính, cung cấp công cụ minh bạch, dễ dùng và bảo mật cao.</p>
        </div>
        <div className="aboutus-section">
          <h2><span className="aboutus-icon">👁️</span> Tầm nhìn</h2>
          <p>Trở thành nền tảng quản lý tài chính cá nhân hàng đầu tại Việt Nam và khu vực Đông Nam Á.</p>
        </div>
        <div className="aboutus-section">
          <h2><span className="aboutus-icon">⭐</span> Giá trị cốt lõi</h2>
          <ul>
            <li>✔️ Minh bạch & Bảo mật</li>
            <li>💡 Đổi mới sáng tạo</li>
            <li>👤 Lấy người dùng làm trung tâm</li>
            <li>🤝 Hợp tác & Phát triển bền vững</li>
          </ul>
        </div>
        <div className="aboutus-section">
          <h2><span className="aboutus-icon">🤝</span> Đối tác</h2>
          <ul>
            <li>🏦 Ngân hàng ACB</li>
            <li>💳 Fintech Việt</li>
            <li>💸 Viettel Money</li>
          </ul>
        </div>
        <div className="aboutus-section aboutus-contact">
          <h2><span className="aboutus-icon">📞</span> Liên hệ</h2>
          <p>📧 support@vismart.vn</p>
          <p>☎️ 1900 9999</p>
          <p>📍 89 Tân Lập 1, Thủ Đức, TP.HCM</p>
        </div>
      </div>
      <div className="aboutus-right">
        <h2>Đội ngũ sáng lập</h2>
        <div className="founders-list">
          {founders.map((f, idx) => (
            <FounderCard key={idx} {...f} onClick={() => handleCardClick(f)} />
          ))}
        </div>
      </div>
      {showModal && selectedFounder && (
        <FounderModal founder={selectedFounder} onClose={handleCloseModal} />
      )}
    </div>
  );
} 