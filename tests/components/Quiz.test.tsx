import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Quiz from '@/components/Quiz';

vi.mock('@/lib/lead', () => ({
  postLead: vi.fn(async () => ({ ok: true, delivered: ['tg'] })),
}));
import { postLead } from '@/lib/lead';

describe('Quiz', () => {
  beforeEach(() => (postLead as any).mockClear());

  it('progresses step 1→5 and submits with collected answers', async () => {
    const user = userEvent.setup();
    render(<Quiz />);

    await user.click(screen.getByRole('radio', { name: /квартира/i }));
    await user.click(await screen.findByRole('radio', { name: /30–60/ }));
    await user.click(await screen.findByRole('radio', { name: /^полусухая$/i }));
    await user.click(await screen.findByRole('radio', { name: /в этом месяце/i }));

    await user.type(await screen.findByLabelText(/телефон/i), '+79991234567');
    await user.click(screen.getByRole('button', { name: /получить расчёт/i }));

    await waitFor(() => {
      expect(postLead).toHaveBeenCalledWith(expect.objectContaining({
        type: 'quiz',
        answers: expect.objectContaining({
          roomType: 'apartment', area: '30-60', screedType: 'semidry', timing: 'thisMonth',
        }),
      }));
    });
    expect(await screen.findByText(/спасибо/i)).toBeInTheDocument();
  });
});
