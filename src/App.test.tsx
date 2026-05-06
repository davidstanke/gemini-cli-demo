import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import App from './App';

// Mock the specials service
vi.mock('./services/mockSpecials', () => ({
  getSpecials: vi.fn().mockResolvedValue([
    { 
      id: '1', 
      name: 'Organic Hass Avocados', 
      originalPrice: 2.50, 
      salePrice: 1.25, 
      category: 'Produce',
      description: 'Creamy, nutrient-dense avocados perfect for toast or guacamole.'
    }
  ])
}));

describe('Ingredient Tooltips', () => {
  it('shows a tooltip with the description when hovering over an ingredient name', async () => {
    render(<App />);
    
    // Wait for specials to load
    const ingredientName = await screen.findByText('Organic Hass Avocados');
    
    // Simulate hover
    fireEvent.mouseOver(ingredientName);
    
    // Check for tooltip description
    const description = screen.getByText(/Creamy, nutrient-dense avocados/i);
    expect(description).toBeInTheDocument();
  });
});
