/**
 * Tests for OAuth error page
 */

import { render, screen, waitFor } from '@testing-library/react';
import { useSearchParams, useRouter } from 'next/navigation';
import AuthErrorPage from '../page';

jest.mock('next/navigation');

const mockPush = jest.fn();
const mockReplace = jest.fn();

describe('AuthErrorPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      replace: mockReplace,
    });
  });

  test('should display access_denied error message', async () => {
    (useSearchParams as jest.Mock).mockReturnValue({
      get: jest.fn((key: string) => {
        if (key === 'message') return 'access_denied';
        return null;
      }),
    });

    render(<AuthErrorPage />);

    await waitFor(() => {
      expect(screen.getByText('Acesso Negado')).toBeInTheDocument();
      expect(screen.getByText(/Você negou o acesso à aplicação/)).toBeInTheDocument();
    });
  });

  test('should display authentication_failed error message', async () => {
    (useSearchParams as jest.Mock).mockReturnValue({
      get: jest.fn((key: string) => {
        if (key === 'message') return 'authentication_failed';
        return null;
      }),
    });

    render(<AuthErrorPage />);

    await waitFor(() => {
      expect(screen.getByText('Falha na Autenticação')).toBeInTheDocument();
    });
  });

  test('should display unknown_error as fallback', async () => {
    (useSearchParams as jest.Mock).mockReturnValue({
      get: jest.fn(() => null),
    });

    render(<AuthErrorPage />);

    await waitFor(() => {
      expect(screen.getByText('Erro Desconhecido')).toBeInTheDocument();
    });
  });

  test('should show sanitized error code when message is invalid', async () => {
    (useSearchParams as jest.Mock).mockReturnValue({
      get: jest.fn((key: string) => {
        if (key === 'message') return 'test_error';
        return null;
      }),
    });

    render(<AuthErrorPage />);

    await waitFor(() => {
      // Invalid codes fallback to unknown_error
      expect(screen.getByText('unknown_error')).toBeInTheDocument();
    });
  });

  test('should have Try Again button that redirects to calendar', async () => {
    (useSearchParams as jest.Mock).mockReturnValue({
      get: jest.fn(() => 'access_denied'),
    });

    render(<AuthErrorPage />);

    await waitFor(() => {
      const tryAgainButton = screen.getByText('Tentar Novamente');
      expect(tryAgainButton).toBeInTheDocument();
    });

    const tryAgainButton = screen.getByText('Tentar Novamente');
    tryAgainButton.click();

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/calendar');
    });
  });

  test('should have Go Home button', async () => {
    (useSearchParams as jest.Mock).mockReturnValue({
      get: jest.fn(() => 'access_denied'),
    });

    render(<AuthErrorPage />);

    await waitFor(() => {
      const goHomeButton = screen.getByText('Voltar para Início');
      expect(goHomeButton).toBeInTheDocument();
    });
  });

  test('should show helpful tip for access_denied', async () => {
    (useSearchParams as jest.Mock).mockReturnValue({
      get: jest.fn(() => 'access_denied'),
    });

    render(<AuthErrorPage />);

    await waitFor(() => {
      expect(screen.getByText(/Dica:/)).toBeInTheDocument();
      expect(screen.getByText(/Permitir/)).toBeInTheDocument();
    });
  });
});

