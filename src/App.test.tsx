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

describe('App', () => {
  describe('Ingredient Tooltips', () => {
    it('shows a tooltip with the description when hovering over the help icon', async () => {
      render(<App />);
      
      // Wait for specials to load
      await screen.findByText('Organic Hass Avocados');
      
      // Find the help icon (using aria-label for accessibility)
      const helpIcon = screen.getByLabelText(/more information/i);
      
      // Simulate hover
      fireEvent.mouseOver(helpIcon);
      
      // Check for tooltip description
      const description = screen.getByText(/Creamy, nutrient-dense avocados/i);
      expect(description).toBeInTheDocument();
    });
  });

  describe('Dark Mode', () => {
    it('toggles dark mode when the toggle button is clicked', () => {
      render(<App />);
      
      // Check for the toggle button
      const toggleButton = screen.getByLabelText(/toggle dark mode/i);
      expect(toggleButton).toBeInTheDocument();

      // The root div should have the initial light mode colors
      const rootDiv = screen.getByTestId('app-root');
      expect(rootDiv).not.toHaveClass('dark');

      // Click the toggle
      fireEvent.click(toggleButton);

      // Check if it now has the dark class
      expect(rootDiv).toHaveClass('dark');
      
      // Click again to toggle back
      fireEvent.click(toggleButton);
      expect(rootDiv).not.toHaveClass('dark');
    });
  });
});
