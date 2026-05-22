import { render, screen } from '@testing-library/react';
import App from './App';

beforeEach(() => {
  window.localStorage.clear();
});

test('renders login heading when there is no token', () => {
  render(<App />);
  const headingElement = screen.getByText(/login/i);
  expect(headingElement).toBeInTheDocument();
});
