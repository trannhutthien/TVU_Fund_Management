/**
 * Bug Condition Exploration Tests for NewsDetailPage
 * 
 * These tests are designed to FAIL on unfixed code to demonstrate the bug exists.
 * They encode the expected behavior and will validate the fix when they pass.
 * 
 * **Validates: Requirements 1.1, 1.2, 1.3, 1.4**
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, useParams, useNavigate } from 'react-router-dom';
import NewsDetailPage from '../NewsDetailPage';
import newsService from '@services/newsService';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: vi.fn(),
    useNavigate: vi.fn(),
  };
});

vi.mock('@services/newsService');

vi.mock('@components/layout/PublicHeader/PublicHeader', () => ({
  default: () => <div data-testid="public-header">Header</div>,
}));

vi.mock('@components/layout/PublicFooter/PublicFooter', () => ({
  default: () => <div data-testid="public-footer">Footer</div>,
}));

vi.mock('@components/forms/LoginForm', () => ({
  default: () => <div>Login Form</div>,
}));

vi.mock('@components/forms/RegisterForm', () => ({
  default: () => <div>Register Form</div>,
}));

vi.mock('@components/common/Button', () => ({
  default: ({ children, ...props }) => <button {...props}>{children}</button>,
}));

vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('NewsDetailPage - Bug Condition Exploration Test', () => {
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useParams.mockReturnValue({ id: '123' });
    useNavigate.mockReturnValue(mockNavigate);

    newsService.getPublicNews.mockResolvedValue({
      success: true,
      news: [],
    });
  });

  describe('Property 1: Bug Condition - Text Overflow in Article Body', () => {
    it('should NOT allow horizontal overflow when article body contains very long unbreakable text', async () => {
      // **Validates: Requirements 1.1, 1.2**
      
      // Create a very long unbreakable string (200+ characters without spaces)
      const longUnbreakableText = 'A'.repeat(250);
      
      const mockNews = {
        id: '123',
        title: 'Test Long Text Overflow',
        content: `<p>${longUnbreakableText}</p>`,
        category: 'Thong bao',
        publishDate: '2024-01-15',
        creatorName: 'Test Author',
        avatar: 'https://example.com/image.jpg',
        phanloai: 'normal',
      };

      newsService.getNewsById.mockResolvedValue({
        success: true,
        news: mockNews,
      });

      const { container } = render(
        <MemoryRouter>
          <NewsDetailPage />
        </MemoryRouter>
      );

      // Wait for the article to be rendered
      await waitFor(() => {
        const titles = screen.getAllByText('Test Long Text Overflow');
        expect(titles.length).toBeGreaterThan(0);
      });

      // Find the article body element
      const articleBody = container.querySelector('[class*="articleBody"]');
      expect(articleBody).toBeTruthy();

      // CRITICAL TEST: The expected behavior is NO horizontal overflow
      // The CSS should have word-wrap and overflow-wrap to break long words
      // This test WILL FAIL on unfixed code (proving the bug exists)
      
      const computedStyle = window.getComputedStyle(articleBody);
      
      console.log(`[Bug Condition Test] word-wrap: ${computedStyle.wordWrap}, overflow-wrap: ${computedStyle.overflowWrap}, overflow-x: ${computedStyle.overflowX}`);
      
      // Expected behavior: word-wrap should be 'break-word'
      // OR overflow-wrap should be 'break-word' or 'anywhere'
      // AND overflow-x should be 'hidden' or 'clip' (not 'visible')
      const hasWordWrap = computedStyle.wordWrap === 'break-word' || 
                          computedStyle.overflowWrap === 'break-word' || 
                          computedStyle.overflowWrap === 'anywhere';
      const hasOverflowControl = computedStyle.overflowX === 'hidden' || 
                                  computedStyle.overflowX === 'clip';
      
      // This test WILL FAIL on unfixed code
      expect(hasWordWrap).toBe(true);
      expect(hasOverflowControl).toBe(true);
    });

    it('should break long words when they exceed container width', async () => {
      // **Validates: Requirements 1.2**
      
      // Create multiple long unbreakable words
      const longWord1 = 'Supercalifragilisticexpialidocious'.repeat(10);
      const longWord2 = 'Pneumonoultramicroscopicsilicovolcanoconiosis'.repeat(8);
      
      const mockNews = {
        id: '123',
        title: 'Test Multiple Long Words Overflow',
        content: `<p>${longWord1} ${longWord2}</p>`,
        category: 'Thong bao',
        publishDate: '2024-01-15',
        creatorName: 'Test Author',
        phanloai: 'normal',
      };

      newsService.getNewsById.mockResolvedValue({
        success: true,
        news: mockNews,
      });

      const { container } = render(
        <MemoryRouter>
          <NewsDetailPage />
        </MemoryRouter>
      );

      await waitFor(() => {
        const titles = screen.getAllByText('Test Multiple Long Words Overflow');
        expect(titles.length).toBeGreaterThan(0);
      });

      const articleBody = container.querySelector('[class*="articleBody"]');
      expect(articleBody).toBeTruthy();

      // Expected behavior: words should break to prevent overflow
      const computedStyle = window.getComputedStyle(articleBody);
      
      console.log(`[Word Break Test] word-wrap: ${computedStyle.wordWrap}, overflow-wrap: ${computedStyle.overflowWrap}`);
      
      // This test WILL FAIL on unfixed code
      const hasWordBreaking = computedStyle.wordWrap === 'break-word' || 
                               computedStyle.overflowWrap === 'break-word' || 
                               computedStyle.overflowWrap === 'anywhere';
      expect(hasWordBreaking).toBe(true);
    });

    it('should handle extremely long URLs without horizontal overflow', async () => {
      // **Validates: Requirements 1.1, 1.2**
      
      // URLs are common sources of unbreakable strings
      const longUrl = 'https://example.com/very/long/path/that/goes/on/and/on/' + 'segment/'.repeat(30) + '?param=value&another=param&more=data';
      
      const mockNews = {
        id: '123',
        title: 'Test Article Long URL',
        content: `<p>Check out this link: <a href="${longUrl}">${longUrl}</a></p>`,
        category: 'Thong bao',
        publishDate: '2024-01-15',
        creatorName: 'Test Author',
        phanloai: 'normal',
      };

      newsService.getNewsById.mockResolvedValue({
        success: true,
        news: mockNews,
      });

      const { container } = render(
        <MemoryRouter>
          <NewsDetailPage />
        </MemoryRouter>
      );

      await waitFor(() => {
        const titles = screen.getAllByText('Test Article Long URL');
        expect(titles.length).toBeGreaterThan(0);
      });

      const articleBody = container.querySelector('[class*="articleBody"]');
      expect(articleBody).toBeTruthy();

      // Expected behavior: URL should break or wrap
      const computedStyle = window.getComputedStyle(articleBody);
      
      console.log(`[URL Overflow Test] word-wrap: ${computedStyle.wordWrap}, overflow-wrap: ${computedStyle.overflowWrap}, overflow-x: ${computedStyle.overflowX}`);
      
      // This test WILL FAIL on unfixed code
      const hasWordWrap = computedStyle.wordWrap === 'break-word' || 
                          computedStyle.overflowWrap === 'break-word' || 
                          computedStyle.overflowWrap === 'anywhere';
      const hasOverflowControl = computedStyle.overflowX === 'hidden' || 
                                  computedStyle.overflowX === 'clip';
      
      expect(hasWordWrap).toBe(true);
      expect(hasOverflowControl).toBe(true);
    });
  });

  describe('Property 2: Bug Condition - Blurry Featured Images When Upscaled', () => {
    it('should NOT upscale small featured images beyond their native resolution', async () => {
      // **Validates: Requirements 1.3, 1.4**
      
      // Create a small test image URL (100x100px)
      // This simulates a low-resolution featured image
      const smallImageUrl = 'https://via.placeholder.com/100x100';
      
      const mockNews = {
        id: '123',
        title: 'Test Small Featured Image',
        content: '<p>Test article content with small featured image.</p>',
        category: 'Thong bao',
        publishDate: '2024-01-15',
        creatorName: 'Test Author',
        avatar: smallImageUrl,
        phanloai: 'normal',
      };

      newsService.getNewsById.mockResolvedValue({
        success: true,
        news: mockNews,
      });

      const { container } = render(
        <MemoryRouter>
          <NewsDetailPage />
        </MemoryRouter>
      );

      // Wait for the article to be rendered
      await waitFor(() => {
        const titles = screen.getAllByText('Test Small Featured Image');
        expect(titles.length).toBeGreaterThan(0);
      });

      // Find the featured image element
      const featuredImage = container.querySelector('[class*="articleImage"]');
      expect(featuredImage).toBeTruthy();

      // CRITICAL TEST: The expected behavior is NO upscaling beyond native resolution
      // The current CSS uses object-fit: cover with width: 100% and max-height: 480px
      // This WILL cause small images to be upscaled to fill the container (causing blur)
      
      const computedStyle = window.getComputedStyle(featuredImage);
      
      console.log(`[Blurry Image Test] object-fit: ${computedStyle.objectFit}, width: ${computedStyle.width}, height: ${computedStyle.height}, max-height: ${computedStyle.maxHeight}`);
      
      // Expected behavior: CSS should prevent upscaling
      // Option 1: object-fit should be 'contain' or 'scale-down' (not 'cover')
      // Option 2: OR should have max-width/max-height constraints that respect native dimensions
      
      const objectFit = computedStyle.objectFit;
      
      // This test WILL FAIL on unfixed code because object-fit is 'cover'
      // 'cover' will scale the image to fill the container, upscaling small images
      // Expected values: 'contain', 'scale-down', or 'none'
      
      console.log(`[Blurry Image Test] Current object-fit value: ${objectFit}`);
      
      // This test WILL FAIL on unfixed code
      const preventUpscaling = 
        objectFit === 'contain' || 
        objectFit === 'scale-down' || 
        objectFit === 'none';
      
      expect(preventUpscaling).toBe(true);
    });

    it('should use CSS that prevents image stretching for small images', async () => {
      // **Validates: Requirements 1.3, 1.4**
      
      // Test with a very small portrait image (50x150px)
      const smallPortraitImage = 'https://via.placeholder.com/50x150';
      
      const mockNews = {
        id: '123',
        title: 'Test Small Portrait Image',
        content: '<p>Test article content.</p>',
        category: 'Thong bao',
        publishDate: '2024-01-15',
        creatorName: 'Test Author',
        avatar: smallPortraitImage,
        phanloai: 'normal',
      };

      newsService.getNewsById.mockResolvedValue({
        success: true,
        news: mockNews,
      });

      const { container } = render(
        <MemoryRouter>
          <NewsDetailPage />
        </MemoryRouter>
      );

      await waitFor(() => {
        const titles = screen.getAllByText('Test Small Portrait Image');
        expect(titles.length).toBeGreaterThan(0);
      });

      const featuredImage = container.querySelector('[class*="articleImage"]');
      expect(featuredImage).toBeTruthy();

      const computedStyle = window.getComputedStyle(featuredImage);
      
      console.log(`[Portrait Image Test] object-fit: ${computedStyle.objectFit}, width: ${computedStyle.width}, max-height: ${computedStyle.maxHeight}`);
      
      // Expected behavior: CSS should not force image to fill container
      // The CSS 'width: 100%' combined with 'object-fit: cover' will cause upscaling
      
      const objectFit = computedStyle.objectFit;
      const width = computedStyle.width;
      
      console.log(`[Portrait Image Test] Current CSS - object-fit: ${objectFit}, width: ${width}`);
      
      // This test WILL FAIL on unfixed code
      // object-fit: cover will stretch/upscale the small image to fill the container
      // Expected: object-fit should NOT be 'cover' for preventing blur
      expect(objectFit).not.toBe('cover');
    });

    it('should have CSS properties that maintain image quality for small images', async () => {
      // **Validates: Requirements 1.3, 1.4**
      
      // Test with an extremely small image (30x30px)
      const tinyImage = 'https://via.placeholder.com/30x30';
      
      const mockNews = {
        id: '123',
        title: 'Test Tiny Image',
        content: '<p>Test article content with tiny image.</p>',
        category: 'Thong bao',
        publishDate: '2024-01-15',
        creatorName: 'Test Author',
        avatar: tinyImage,
        phanloai: 'normal',
      };

      newsService.getNewsById.mockResolvedValue({
        success: true,
        news: mockNews,
      });

      const { container } = render(
        <MemoryRouter>
          <NewsDetailPage />
        </MemoryRouter>
      );

      await waitFor(() => {
        const titles = screen.getAllByText('Test Tiny Image');
        expect(titles.length).toBeGreaterThan(0);
      });

      const featuredImage = container.querySelector('[class*="articleImage"]');
      expect(featuredImage).toBeTruthy();

      const computedStyle = window.getComputedStyle(featuredImage);
      
      console.log(`[Tiny Image Test] Complete CSS - object-fit: ${computedStyle.objectFit}, width: ${computedStyle.width}, height: ${computedStyle.height}, max-height: ${computedStyle.maxHeight}`);
      
      // Expected behavior: CSS should prevent aggressive upscaling
      // Current CSS: width: 100%, object-fit: cover, max-height: 480px
      // This combination will upscale a 30x30px image dramatically (causing severe blur)
      
      // Expected fix: Use object-fit: contain, scale-down, or none
      // These values will NOT upscale images beyond native resolution
      
      const objectFit = computedStyle.objectFit;
      const hasHeightAuto = computedStyle.height === 'auto';
      
      console.log(`[Tiny Image Test] object-fit: ${objectFit}, height: ${computedStyle.height}`);
      
      // This test WILL FAIL on unfixed code
      // The current CSS (object-fit: cover) will cause severe blur on tiny images
      const preventsUpscaling = 
        objectFit === 'contain' || 
        objectFit === 'scale-down' || 
        (objectFit === 'none' && hasHeightAuto);
      
      expect(preventsUpscaling).toBe(true);
    });
  });
});
