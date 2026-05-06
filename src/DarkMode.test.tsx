import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import App from './App';

// Mock the services to avoid network requests
vi.mock('./services/mockSpecials', () => ({
  getSpecials: vi.fn().mockResolvedValue([])
}));

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
