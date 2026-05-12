import React from 'react';
import SocialLinks from './SocialLinks';

/**
 * SocialLinks Demo Page
 * 
 * Demo component social links với đầy đủ variants
 */
const SocialLinksDemo = () => {
  // Custom links example
  const customLinks = [
    { type: 'facebook', url: 'https://facebook.com/dhtravinh', label: 'Facebook TVU' },
    { type: 'youtube', url: 'https://youtube.com/@dhtravinh', label: 'YouTube TVU' },
    { type: 'email', url: 'mailto:dhtravinh@tvu.edu.vn', label: 'Email' },
  ];

  const allSocialLinks = [
    { type: 'facebook', url: 'https://facebook.com', label: 'Facebook' },
    { type: 'youtube', url: 'https://youtube.com', label: 'YouTube' },
    { type: 'twitter', url: 'https://twitter.com', label: 'Twitter' },
    { type: 'instagram', url: 'https://instagram.com', label: 'Instagram' },
    { type: 'linkedin', url: 'https://linkedin.com', label: 'LinkedIn' },
    { type: 'tiktok', url: 'https://tiktok.com', label: 'TikTok' },
    { type: 'zalo', url: 'https://zalo.me', label: 'Zalo' },
    { type: 'email', url: 'mailto:contact@example.com', label: 'Email' },
    { type: 'phone', url: 'tel:+842943855246', label: 'Hotline' },
    { type: 'website', url: 'https://tvu.edu.vn', label: 'Website' },
  ];

  return (
    <div style={{ padding: '40px', background: '#f5f7fa', minHeight: '100vh' }}>
      <h1 style={{ marginBottom: '40px', color: '#0F172A' }}>SocialLinks Component Demo</h1>

      {/* Sizes */}
      <section style={{ marginBottom: '60px' }}>
        <h2 style={{ marginBottom: '24px', color: '#334155' }}>📏 Sizes</h2>
        
        <div style={{ background: 'white', padding: '32px', borderRadius: '12px', marginBottom: '16px' }}>
          <p style={{ fontSize: '12px', color: '#64748B', marginBottom: '12px' }}>Small</p>
          <SocialLinks size="sm" />
        </div>

        <div style={{ background: 'white', padding: '32px', borderRadius: '12px', marginBottom: '16px' }}>
          <p style={{ fontSize: '12px', color: '#64748B', marginBottom: '12px' }}>Medium (Default)</p>
          <SocialLinks size="md" />
        </div>

        <div style={{ background: 'white', padding: '32px', borderRadius: '12px' }}>
          <p style={{ fontSize: '12px', color: '#64748B', marginBottom: '12px' }}>Large</p>
          <SocialLinks size="lg" />
        </div>
      </section>

      {/* Variants */}
      <section style={{ marginBottom: '60px' }}>
        <h2 style={{ marginBottom: '24px', color: '#334155' }}>🎨 Variants</h2>
        
        <div style={{ background: 'white', padding: '32px', borderRadius: '12px', marginBottom: '16px' }}>
          <p style={{ fontSize: '12px', color: '#64748B', marginBottom: '12px' }}>Default (No Background)</p>
          <SocialLinks variant="default" size="lg" />
        </div>

        <div style={{ background: 'white', padding: '32px', borderRadius: '12px', marginBottom: '16px' }}>
          <p style={{ fontSize: '12px', color: '#64748B', marginBottom: '12px' }}>Rounded</p>
          <SocialLinks variant="rounded" size="lg" />
        </div>

        <div style={{ background: 'white', padding: '32px', borderRadius: '12px', marginBottom: '16px' }}>
          <p style={{ fontSize: '12px', color: '#64748B', marginBottom: '12px' }}>Square</p>
          <SocialLinks variant="square" size="lg" />
        </div>

        <div style={{ background: 'white', padding: '32px', borderRadius: '12px' }}>
          <p style={{ fontSize: '12px', color: '#64748B', marginBottom: '12px' }}>Circle</p>
          <SocialLinks variant="circle" size="lg" />
        </div>
      </section>

      {/* Color Themes */}
      <section style={{ marginBottom: '60px' }}>
        <h2 style={{ marginBottom: '24px', color: '#334155' }}>🌈 Color Themes</h2>
        
        <div style={{ background: 'white', padding: '32px', borderRadius: '12px', marginBottom: '16px' }}>
          <p style={{ fontSize: '12px', color: '#64748B', marginBottom: '12px' }}>Default (Gray)</p>
          <SocialLinks color="default" variant="circle" size="lg" />
        </div>

        <div style={{ background: 'white', padding: '32px', borderRadius: '12px', marginBottom: '16px' }}>
          <p style={{ fontSize: '12px', color: '#64748B', marginBottom: '12px' }}>Brand Colors</p>
          <SocialLinks color="brand" variant="circle" size="lg" />
        </div>

        <div style={{ background: 'white', padding: '32px', borderRadius: '12px', marginBottom: '16px' }}>
          <p style={{ fontSize: '12px', color: '#64748B', marginBottom: '12px' }}>Monochrome</p>
          <SocialLinks color="monochrome" variant="circle" size="lg" />
        </div>

        <div style={{ background: '#1a2f5e', padding: '32px', borderRadius: '12px' }}>
          <p style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '12px' }}>White (Dark Background)</p>
          <SocialLinks color="white" variant="circle" size="lg" />
        </div>
      </section>

      {/* With Labels */}
      <section style={{ marginBottom: '60px' }}>
        <h2 style={{ marginBottom: '24px', color: '#334155' }}>🏷️ With Labels</h2>
        
        <div style={{ background: 'white', padding: '32px', borderRadius: '12px', marginBottom: '16px' }}>
          <p style={{ fontSize: '12px', color: '#64748B', marginBottom: '12px' }}>Horizontal with Labels</p>
          <SocialLinks showLabel variant="rounded" size="md" links={customLinks} />
        </div>

        <div style={{ background: 'white', padding: '32px', borderRadius: '12px' }}>
          <p style={{ fontSize: '12px', color: '#64748B', marginBottom: '12px' }}>Vertical with Labels</p>
          <SocialLinks showLabel layout="vertical" variant="rounded" size="md" links={customLinks} />
        </div>
      </section>

      {/* All Icons */}
      <section style={{ marginBottom: '60px' }}>
        <h2 style={{ marginBottom: '24px', color: '#334155' }}>🎯 All Available Icons</h2>
        
        <div style={{ background: 'white', padding: '32px', borderRadius: '12px' }}>
          <SocialLinks 
            links={allSocialLinks} 
            variant="circle" 
            color="brand" 
            size="lg" 
          />
        </div>
      </section>

      {/* Use Cases */}
      <section style={{ marginBottom: '60px' }}>
        <h2 style={{ marginBottom: '24px', color: '#334155' }}>💼 Use Cases</h2>
        
        {/* Footer */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '14px', color: '#64748B', marginBottom: '12px' }}>1. Footer</h3>
          <div style={{ background: '#1a2f5e', padding: '32px', borderRadius: '12px' }}>
            <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <h4 style={{ color: 'white', marginBottom: '8px' }}>Kết nối với chúng tôi</h4>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px' }}>
                  Theo dõi để cập nhật thông tin mới nhất
                </p>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <SocialLinks 
                  color="white" 
                  variant="circle" 
                  size="lg" 
                  links={customLinks}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Contact Card */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '14px', color: '#64748B', marginBottom: '12px' }}>2. Contact Card</h3>
          <div style={{ background: 'white', padding: '32px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <h4 style={{ color: '#0F172A', marginBottom: '8px' }}>Liên hệ với chúng tôi</h4>
            <p style={{ color: '#64748B', fontSize: '14px', marginBottom: '16px' }}>
              Đại học Trà Vinh - Số 126 Nguyễn Thiện Thành, Khóm 4, Phường 5, TP. Trà Vinh
            </p>
            <SocialLinks 
              showLabel 
              layout="vertical" 
              variant="default" 
              size="md"
              links={[
                { type: 'phone', url: 'tel:+842943855246', label: '(0294) 3855246' },
                { type: 'email', url: 'mailto:dhtravinh@tvu.edu.vn', label: 'dhtravinh@tvu.edu.vn' },
                { type: 'website', url: 'https://tvu.edu.vn', label: 'www.tvu.edu.vn' },
              ]}
            />
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '14px', color: '#64748B', marginBottom: '12px' }}>3. Sidebar</h3>
          <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', width: '200px' }}>
            <h4 style={{ color: '#0F172A', marginBottom: '16px', fontSize: '14px' }}>Mạng xã hội</h4>
            <SocialLinks 
              layout="vertical" 
              variant="rounded" 
              size="md"
              links={customLinks}
            />
          </div>
        </div>
      </section>

      {/* Props Table */}
      <section style={{ marginBottom: '60px' }}>
        <h2 style={{ marginBottom: '24px', color: '#334155' }}>📋 Props</h2>
        <div style={{ background: 'white', padding: '32px', borderRadius: '12px', overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #E2E8F0' }}>
                <th style={{ padding: '12px', textAlign: 'left', color: '#64748B' }}>Prop</th>
                <th style={{ padding: '12px', textAlign: 'left', color: '#64748B' }}>Type</th>
                <th style={{ padding: '12px', textAlign: 'left', color: '#64748B' }}>Default</th>
                <th style={{ padding: '12px', textAlign: 'left', color: '#64748B' }}>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                <td style={{ padding: '12px', color: '#334155', fontFamily: 'monospace' }}>links</td>
                <td style={{ padding: '12px', color: '#64748B' }}>Array</td>
                <td style={{ padding: '12px', color: '#64748B' }}>TVU default</td>
                <td style={{ padding: '12px', color: '#64748B' }}>Mảng social links</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                <td style={{ padding: '12px', color: '#334155', fontFamily: 'monospace' }}>size</td>
                <td style={{ padding: '12px', color: '#64748B' }}>sm | md | lg</td>
                <td style={{ padding: '12px', color: '#64748B' }}>md</td>
                <td style={{ padding: '12px', color: '#64748B' }}>Kích thước icons</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                <td style={{ padding: '12px', color: '#334155', fontFamily: 'monospace' }}>variant</td>
                <td style={{ padding: '12px', color: '#64748B' }}>default | rounded | square | circle</td>
                <td style={{ padding: '12px', color: '#64748B' }}>default</td>
                <td style={{ padding: '12px', color: '#64748B' }}>Kiểu hiển thị</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                <td style={{ padding: '12px', color: '#334155', fontFamily: 'monospace' }}>color</td>
                <td style={{ padding: '12px', color: '#64748B' }}>default | brand | monochrome | white</td>
                <td style={{ padding: '12px', color: '#64748B' }}>default</td>
                <td style={{ padding: '12px', color: '#64748B' }}>Theme màu</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                <td style={{ padding: '12px', color: '#334155', fontFamily: 'monospace' }}>layout</td>
                <td style={{ padding: '12px', color: '#64748B' }}>horizontal | vertical</td>
                <td style={{ padding: '12px', color: '#64748B' }}>horizontal</td>
                <td style={{ padding: '12px', color: '#64748B' }}>Bố cục</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                <td style={{ padding: '12px', color: '#334155', fontFamily: 'monospace' }}>showLabel</td>
                <td style={{ padding: '12px', color: '#64748B' }}>boolean</td>
                <td style={{ padding: '12px', color: '#64748B' }}>false</td>
                <td style={{ padding: '12px', color: '#64748B' }}>Hiện label text</td>
              </tr>
              <tr>
                <td style={{ padding: '12px', color: '#334155', fontFamily: 'monospace' }}>animated</td>
                <td style={{ padding: '12px', color: '#64748B' }}>boolean</td>
                <td style={{ padding: '12px', color: '#64748B' }}>true</td>
                <td style={{ padding: '12px', color: '#64748B' }}>Hiệu ứng animation</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default SocialLinksDemo;
