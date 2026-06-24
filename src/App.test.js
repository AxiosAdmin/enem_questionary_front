import { act, fireEvent, render, screen } from '@testing-library/react';
import App from './App';
import {
  AUTH_USER_STORAGE_KEY,
  TOKEN_STORAGE_KEY,
  TOKEN_TYPE_STORAGE_KEY,
  notifySessionExpired,
} from './helpers/auth';

beforeEach(() => {
  window.localStorage.clear();
  window.history.replaceState({}, '', '/login');
});

test('renders login heading when there is no token', () => {
  render(<App />);
  const headingElement = screen.getByText(/login/i);
  expect(headingElement).toBeInTheDocument();
});

test('shows session expired flag and returns to login after auth expiration', () => {
  window.localStorage.setItem(TOKEN_STORAGE_KEY, 'expired-token');
  window.localStorage.setItem(TOKEN_TYPE_STORAGE_KEY, 'bearer');
  window.localStorage.setItem(
    AUTH_USER_STORAGE_KEY,
    JSON.stringify({ nickname: 'Pedro' }),
  );
  window.history.replaceState({}, '', '/subjects');

  render(<App />);
  expect(screen.getByText(/escolha uma materia/i)).toBeInTheDocument();

  act(() => {
    notifySessionExpired();
  });

  expect(
    screen.getByRole('heading', { name: /login/i }),
  ).toBeInTheDocument();
  expect(
    screen.getByText(/sua sessao expirou, faca login novamente/i),
  ).toBeInTheDocument();
});

test('renders register screen when route is /register', () => {
  window.history.replaceState({}, '', '/register');

  render(<App />);

  expect(
    screen.getByRole('heading', { name: /cadastro/i }),
  ).toBeInTheDocument();
  expect(screen.getByLabelText(/nome/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/cpf/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/nickname/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
});

test('navigates from subjects home to support materials creation', () => {
  window.localStorage.setItem(TOKEN_STORAGE_KEY, 'valid-token');
  window.localStorage.setItem(TOKEN_TYPE_STORAGE_KEY, 'bearer');
  window.localStorage.setItem(
    AUTH_USER_STORAGE_KEY,
    JSON.stringify({ nickname: 'Pedro' }),
  );
  window.history.replaceState({}, '', '/subjects');

  render(<App />);

  fireEvent.click(screen.getByRole('button', { name: /criar materiais de apoio/i }));

  expect(
    screen.getByRole('heading', { name: /criar materiais de apoio/i }),
  ).toBeInTheDocument();
});

test('navigates from subjects home to question generation with support material', () => {
  window.localStorage.setItem(TOKEN_STORAGE_KEY, 'valid-token');
  window.localStorage.setItem(TOKEN_TYPE_STORAGE_KEY, 'bearer');
  window.localStorage.setItem(
    AUTH_USER_STORAGE_KEY,
    JSON.stringify({ nickname: 'Pedro' }),
  );
  window.history.replaceState({}, '', '/subjects');

  render(<App />);

  fireEvent.click(screen.getByRole('button', { name: /gerar questao com material/i }));

  expect(
    screen.getByRole('heading', { name: /gerar questao com material de apoio/i }),
  ).toBeInTheDocument();
});
