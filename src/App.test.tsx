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
  it('shows a tooltip with the description when hovering over the help icon', async () => {
    render(<App />);
    
    // Wait for specials to load
    await screen.findByText('Organic Hass Avocados');
    
    // Find the help icon (using aria-label for accessibility)
    const helpIcon = screen.getAllByLabelByText ? null : screen.getByLabelText(/more information/i);
    
    // Simulate hover
    fireEvent.mouseOver(helpIcon);
    
    // Check for tooltip description
    const description = screen.getByText(/Creamy, nutrient-dense avocados/i);
    expect(description).toBeInTheDocument();
  });
});
