import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ConsultationBanner from '@/components/ConsultationBanner';

vi.mock('@/lib/lead', () => ({
  postLead: vi.fn(async () => ({ ok: true, delivered: ['tg'] })),
}));
import { postLead } from '@/lib/lead';

describe('ConsultationBanner', () => {
  beforeEach(() => {
    sessionStorage.clear();
    (postLead as any).mockClear();
    Object.defineProperty(document.documentElement, 'scrollHeight', { value: 2000, writable: true, configurable: true });
    Object.defineProperty(window, 'innerHeight', { value: 800, writable: true, configurable: true });
    Object.defineProperty(window, 'scrollY', { value: 0, writable: true, configurable: true });
  });

  function setScroll(y: number) {
    Object.defineProperty(window, 'scrollY', { value: y, writable: true, configurable: true });
    fireEvent.scroll(window);
  }

  it('shows FAB after scroll > 200px', async () => {
    render(<ConsultationBanner />);
    expect(screen.queryByRole('button', { name: /консультац/i })).not.toBeInTheDocument();
    act(() => setScroll(300));
    expect(await screen.findByRole('button', { name: /консультац/i })).toBeInTheDocument();
  });

  it('opens auto-card at 50% scroll, only once per session', async () => {
    render(<ConsultationBanner />);
    act(() => setScroll(720)); // 720 / 1200 = 0.6
    expect(await screen.findByRole('dialog')).toBeInTheDocument();

    const user = userEvent.setup();
    const closes = screen.getAllByRole('button', { name: /закрыть/i });
    await user.click(closes[0]);
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());

    act(() => setScroll(900));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('Esc closes the open card', async () => {
    render(<ConsultationBanner />);
    act(() => setScroll(720));
    await screen.findByRole('dialog');
    fireEvent.keyDown(window, { key: 'Escape' });
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('does not auto-show if leadSubmitted is set', () => {
    sessionStorage.setItem('leadSubmitted', '1');
    render(<ConsultationBanner />);
    act(() => setScroll(720));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
