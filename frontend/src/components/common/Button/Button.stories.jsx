import React from 'react';
import Button from './Button';

/**
 * Button Examples / Stories
 * File này để demo các variants của Button component
 * Có thể dùng với Storybook hoặc chạy standalone
 */

// Icon examples (dùng SVG đơn giản)
const PlusIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const TrashIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

const ButtonExamples = () => {
  const handleClick = () => {
    alert('Button clicked!');
  };

  return (
    <div style={{ padding: '40px', background: '#EEF0F5' }}>
      <h1 style={{ marginBottom: '32px', fontFamily: 'Plus Jakarta Sans' }}>
        Button Component Examples
      </h1>

      {/* Variants */}
      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ marginBottom: '16px', fontSize: '18px' }}>Variants</h2>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Button variant="primary" onClick={handleClick}>
            Primary Button
          </Button>
          <Button variant="secondary" onClick={handleClick}>
            Secondary Button
          </Button>
          <Button variant="ghost" onClick={handleClick}>
            Ghost Button
          </Button>
          <Button variant="danger" onClick={handleClick}>
            Danger Button
          </Button>
        </div>
      </section>

      {/* Sizes */}
      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ marginBottom: '16px', fontSize: '18px' }}>Sizes</h2>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <Button variant="primary" size="sm" onClick={handleClick}>
            Small Button
          </Button>
          <Button variant="primary" size="md" onClick={handleClick}>
            Medium Button
          </Button>
          <Button variant="primary" size="lg" onClick={handleClick}>
            Large Button
          </Button>
        </div>
      </section>

      {/* With Icons */}
      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ marginBottom: '16px', fontSize: '18px' }}>With Icons</h2>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Button variant="primary" leftIcon={<PlusIcon />} onClick={handleClick}>
            Create New
          </Button>
          <Button variant="secondary" rightIcon={<ArrowRightIcon />} onClick={handleClick}>
            Continue
          </Button>
          <Button variant="danger" leftIcon={<TrashIcon />} onClick={handleClick}>
            Delete
          </Button>
        </div>
      </section>

      {/* Loading State */}
      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ marginBottom: '16px', fontSize: '18px' }}>Loading State</h2>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Button variant="primary" loading>
            Loading...
          </Button>
          <Button variant="secondary" loading>
            Processing
          </Button>
          <Button variant="danger" loading>
            Deleting...
          </Button>
        </div>
      </section>

      {/* Disabled State */}
      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ marginBottom: '16px', fontSize: '18px' }}>Disabled State</h2>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Button variant="primary" disabled>
            Disabled Primary
          </Button>
          <Button variant="secondary" disabled>
            Disabled Secondary
          </Button>
          <Button variant="ghost" disabled>
            Disabled Ghost
          </Button>
        </div>
      </section>

      {/* Full Width */}
      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ marginBottom: '16px', fontSize: '18px' }}>Full Width</h2>
        <Button variant="primary" className="w-full" onClick={handleClick}>
          Full Width Button
        </Button>
      </section>

      {/* Button Group */}
      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ marginBottom: '16px', fontSize: '18px' }}>Button Group</h2>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Button variant="secondary" onClick={handleClick}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleClick}>
            Save Changes
          </Button>
        </div>
      </section>

      {/* Form Buttons */}
      <section>
        <h2 style={{ marginBottom: '16px', fontSize: '18px' }}>Form Buttons</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            alert('Form submitted!');
          }}
          style={{ display: 'flex', gap: '12px' }}
        >
          <Button type="submit" variant="primary">
            Submit Form
          </Button>
          <Button type="reset" variant="secondary">
            Reset Form
          </Button>
          <Button type="button" variant="ghost" onClick={() => alert('Cancel')}>
            Cancel
          </Button>
        </form>
      </section>
    </div>
  );
};

export default ButtonExamples;
