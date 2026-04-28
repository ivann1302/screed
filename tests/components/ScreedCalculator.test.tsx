import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ScreedCalculator from '@/components/ScreedCalculator';

vi.mock('@/lib/lead', () => ({
  postLead: vi.fn(async () => ({ ok: true, delivered: ['tg'] })),
}));
import { postLead } from '@/lib/lead';

describe('ScreedCalculator', () => {
  beforeEach(() => (postLead as any).mockClear());

  it('collects params and sends calculator lead', async () => {
    const user = userEvent.setup();
    render(<ScreedCalculator minAreaM2={50} />);

    await user.clear(screen.getByLabelText(/площадь объекта/i));
    await user.type(screen.getByLabelText(/площадь объекта/i), '75');
    await user.click(screen.getByRole('button', { name: /дальше/i }));

    await user.click(screen.getByRole('radio', { name: /мокрая/i }));
    await user.click(screen.getByRole('button', { name: /дальше/i }));

    await user.click(screen.getByRole('radio', { name: /другая/i }));
    await user.type(screen.getByLabelText(/другая толщина слоя/i), '85');
    await user.click(screen.getByRole('button', { name: /дальше/i }));

    await user.click(screen.getByLabelText(/тёплый пол/i));
    await user.click(screen.getByRole('button', { name: /показать форму/i }));

    await user.type(await screen.findByLabelText(/телефон/i), '+79991234567');
    await user.click(screen.getByRole('button', { name: /отправить параметры/i }));

    await waitFor(() => {
      expect(postLead).toHaveBeenCalledWith(expect.objectContaining({
        type: 'calculator',
        params: expect.objectContaining({
          area: 75,
          type: 'wet',
          thickness: 85,
          extras: expect.arrayContaining(['reinforcement', 'overUnderfloor']),
          materialsIncluded: true,
        }),
      }));
    });
  });
});
