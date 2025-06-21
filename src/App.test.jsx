import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom'; // 導入 Jest DOM 擴展
import App from './App';

describe('App', () => {
  test('renders learn react link', () => {
    render(<App />);
    const linkElement = screen.getByText(/learn react/i);
    expect(linkElement).toBeInTheDocument();
  });
});