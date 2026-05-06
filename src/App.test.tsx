import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import App from './App';
import * as mockSpecials from './services/mockSpecials';

// Mock the specials service to have a controlled environment
vi.mock('./services/mockSpecials', () => ({
  getSpecials: vi.fn().mockResolvedValue([
    { id: '1', name: 'Item 1', salePrice: 1, originalPrice: 2, category: 'Cat' },
    { id: '2', name: 'Item 2', salePrice: 1, originalPrice: 2, category: 'Cat' },
    { id: '3', name: 'Item 3', salePrice: 1, originalPrice: 2, category: 'Cat' },
    { id: '4', name: 'Item 4', salePrice: 1, originalPrice: 2, category: 'Cat' },
    { id: '5', name: 'Item 5', salePrice: 1, originalPrice: 2, category: 'Cat' },
  ])
}));

describe('App "I feel lucky" feature', () => {
  it('renders an "I feel lucky" button', async () => {
    render(<App />);
    const luckyButton = await screen.findByRole('button', { name: /i feel lucky/i });
    expect(luckyButton).toBeInTheDocument();
  });

  it('selects 3 random items when the "I feel lucky" button is clicked', async () => {
    render(<App />);
    const luckyButton = await screen.findByRole('button', { name: /i feel lucky/i });
    
    fireEvent.click(luckyButton);
    
    // Check if "Inspire Me (3)" button appears or the count is updated
    const inspireButton = await screen.findByRole('button', { name: /inspire me \(3\)/i });
    expect(inspireButton).toBeInTheDocument();
  });
});
