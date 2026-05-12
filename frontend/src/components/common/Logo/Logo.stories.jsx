import React from 'react';
import Logo from './Logo';

/**
 * Logo Demo Page
 * 
 * Demo tất cả variants và sizes của Logo component
 */
const LogoDemo = () => {
  const handleLogoClick = () => {
    alert('Logo clicked!');
  };

  return (
    <div style={{ padding: '40px', background: '#f5f7fa', minHeight: '100vh' }}>
      <h1 style={{ marginBottom: '40px', color: '#0F172A' }}>Logo Component Demo</h1>

      {/* Sizes */}
      <section style={{ marginBottom: '60px' }}>
        <h2 style={{ marginBottom: '24px', color: '#334155' }}>📏 Sizes</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '32px', alignItems: 'center', background: 'white', padding: '32px', borderRadius: '12px' }}>
          <div>
            <p style={{ fontSize: '12px', color: '#64748B', marginBottom: '8px' }}>XS</p>
            <Logo size="xs" />
          </div>
          <div>
            <p style={{ fontSize: '12px', color: '#64748B', marginBottom: '8px' }}>SM</p>
            <Logo size="sm" />
          </div>
          <div>
            <p style={{ fontSize: '12px', color: '#64748B', marginBottom: '8px' }}>MD (Default)</p>
            <Logo size="md" />
          </div>
          <div>
            <p style={{ fontSize: '12px', color: '#64748B', marginBottom: '8px' }}>LG</p>
            <Logo size="lg" />
          </div>
          <div>
            <p style={{ fontSize: '12px', color: '#64748B', marginBottom: '8px' }}>XL</p>
            <Logo size="xl" />
          </div>
          <div>
            <p style={{ fontSize: '12px', color: '#64748B', marginBottom: '8px' }}>2XL</p>
            <Logo size="2xl" />
          </div>
        </div>
      </section>

      {/* Variants */}
      <section style={{ marginBottom: '60px' }}>
        <h2 style={{ marginBottom: '24px', color: '#334155' }}>🎨 Variants</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '32px', alignItems: 'center', background: 'white', padding: '32px', borderRadius: '12px' }}>
          <div>
            <p style={{ fontSize: '12px', color: '#64748B', marginBottom: '8px' }}>Full (Default)</p>
            <Logo size="lg" variant="full" />
          </div>
          <div>
            <p style={{ fontSize: '12px', color: '#64748B', marginBottom: '8px' }}>Icon Only</p>
            <Logo size="lg" variant="icon-only" />
          </div>
          <div>
            <p style={{ fontSize: '12px', color: '#64748B', marginBottom: '8px' }}>Text Only</p>
            <Logo size="lg" variant="text-only" />
          </div>
        </div>
      </section>

      {/* Image Variants */}
      <section style={{ marginBottom: '60px' }}>
        <h2 style={{ marginBottom: '24px', color: '#334155' }}>🖼️ Image Variants</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '32px', alignItems: 'center', background: 'white', padding: '32px', borderRadius: '12px' }}>
          <div>
            <p style={{ fontSize: '12px', color: '#64748B', marginBottom: '8px' }}>Circular (Default)</p>
            <Logo size="lg" imageVariant="circular" />
          </div>
          <div>
            <p style={{ fontSize: '12px', color: '#64748B', marginBottom: '8px' }}>Rounded</p>
            <Logo size="lg" imageVariant="rounded" />
          </div>
          <div>
            <p style={{ fontSize: '12px', color: '#64748B', marginBottom: '8px' }}>Square</p>
            <Logo size="lg" imageVariant="square" />
          </div>
        </div>
      </section>

      {/* Layouts */}
      <section style={{ marginBottom: '60px' }}>
        <h2 style={{ marginBottom: '24px', color: '#334155' }}>📐 Layouts</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '32px', alignItems: 'flex-start', background: 'white', padding: '32px', borderRadius: '12px' }}>
          <div>
            <p style={{ fontSize: '12px', color: '#64748B', marginBottom: '8px' }}>Horizontal (Default)</p>
            <Logo size="lg" layout="horizontal" />
          </div>
          <div>
            <p style={{ fontSize: '12px', color: '#64748B', marginBottom: '8px' }}>Vertical</p>
            <Logo size="lg" layout="vertical" />
          </div>
        </div>
      </section>

      {/* Themes */}
      <section style={{ marginBottom: '60px' }}>
        <h2 style={{ marginBottom: '24px', color: '#334155' }}>🎨 Color Themes</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '32px', alignItems: 'center' }}>
          <div style={{ background: 'white', padding: '32px', borderRadius: '12px' }}>
            <p style={{ fontSize: '12px', color: '#64748B', marginBottom: '8px' }}>Light (Default)</p>
            <Logo size="lg" theme="light" />
          </div>
          <div style={{ background: '#0F172A', padding: '32px', borderRadius: '12px' }}>
            <p style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '8px' }}>Dark</p>
            <Logo size="lg" theme="dark" />
          </div>
          <div style={{ background: 'white', padding: '32px', borderRadius: '12px' }}>
            <p style={{ fontSize: '12px', color: '#64748B', marginBottom: '8px' }}>Primary</p>
            <Logo size="lg" theme="primary" />
          </div>
        </div>
      </section>

      {/* Animations */}
      <section style={{ marginBottom: '60px' }}>
        <h2 style={{ marginBottom: '24px', color: '#334155' }}>✨ Animations</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '32px', alignItems: 'center', background: 'white', padding: '32px', borderRadius: '12px' }}>
          <div>
            <p style={{ fontSize: '12px', color: '#64748B', marginBottom: '8px' }}>Animated (Fade In)</p>
            <Logo size="lg" animated />
          </div>
          <div>
            <p style={{ fontSize: '12px', color: '#64748B', marginBottom: '8px' }}>Pulse</p>
            <Logo size="lg" pulse />
          </div>
          <div>
            <p style={{ fontSize: '12px', color: '#64748B', marginBottom: '8px' }}>Spin</p>
            <Logo size="lg" spin variant="icon-only" />
          </div>
        </div>
      </section>

      {/* Interactive */}
      <section style={{ marginBottom: '60px' }}>
        <h2 style={{ marginBottom: '24px', color: '#334155' }}>🖱️ Interactive</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '32px', alignItems: 'center', background: 'white', padding: '32px', borderRadius: '12px' }}>
          <div>
            <p style={{ fontSize: '12px', color: '#64748B', marginBottom: '8px' }}>Clickable (with onClick)</p>
            <Logo size="lg" clickable onClick={handleLogoClick} />
          </div>
          <div>
            <p style={{ fontSize: '12px', color: '#64748B', marginBottom: '8px' }}>As Link (with href)</p>
            <Logo size="lg" href="/" />
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section style={{ marginBottom: '60px' }}>
        <h2 style={{ marginBottom: '24px', color: '#334155' }}>💼 Use Cases</h2>
        
        {/* Header Logo */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '14px', color: '#64748B', marginBottom: '12px' }}>Header (Desktop)</h3>
          <div style={{ background: 'white', padding: '16px 24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <Logo size="md" href="/" />
          </div>
        </div>

        {/* Header Collapsed */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '14px', color: '#64748B', marginBottom: '12px' }}>Header (Collapsed/Mobile)</h3>
          <div style={{ background: 'white', padding: '16px 24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', width: 'fit-content' }}>
            <Logo size="sm" variant="icon-only" href="/" />
          </div>
        </div>

        {/* Login Page */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '14px', color: '#64748B', marginBottom: '12px' }}>Login Page</h3>
          <div style={{ background: 'white', padding: '32px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', display: 'flex', justifyContent: 'center' }}>
            <Logo size="xl" layout="vertical" animated />
          </div>
        </div>

        {/* Profile Card */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '14px', color: '#64748B', marginBottom: '12px' }}>Profile Card</h3>
          <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', display: 'flex', justifyContent: 'center' }}>
            <Logo size="lg" layout="vertical" />
          </div>
        </div>

        {/* Loading State */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '14px', color: '#64748B', marginBottom: '12px' }}>Loading State</h3>
          <div style={{ background: 'white', padding: '32px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', display: 'flex', justifyContent: 'center' }}>
            <Logo size="lg" variant="icon-only" spin />
          </div>
        </div>
      </section>

      {/* Custom Text */}
      <section style={{ marginBottom: '60px' }}>
        <h2 style={{ marginBottom: '24px', color: '#334155' }}>✏️ Custom Text</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '32px', alignItems: 'center', background: 'white', padding: '32px', borderRadius: '12px' }}>
          <Logo 
            size="lg" 
            title="Trường ĐH Trà Vinh"
            subtitle="Tra Vinh University"
          />
          <Logo 
            size="lg" 
            title="TVU"
            showSubtitle={false}
          />
        </div>
      </section>
    </div>
  );
};

export default LogoDemo;
