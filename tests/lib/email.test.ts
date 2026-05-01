import { beforeEach, describe, it, expect, vi } from 'vitest';

const sendMail = vi.fn();
vi.mock('nodemailer', () => ({
  default: { createTransport: () => ({ sendMail }) },
}));

import { sendEmail } from '@/lib/email';

describe('sendEmail', () => {
  beforeEach(() => {
    sendMail.mockReset();
    vi.unstubAllGlobals();
    delete process.env.RESEND_API_KEY;
    delete process.env.RESEND_FROM;
    delete process.env.RESEND_TO;
    delete process.env.SMTP_HOST;
    delete process.env.SMTP_PORT;
    delete process.env.SMTP_USER;
    delete process.env.SMTP_PASS;
    delete process.env.SMTP_FROM;
    delete process.env.SMTP_TO;
  });

  it('sends mail through SMTP when Resend is not configured', async () => {
    process.env.SMTP_HOST = 'smtp.x'; process.env.SMTP_PORT = '465';
    process.env.SMTP_USER = 'u'; process.env.SMTP_PASS = 'p';
    process.env.SMTP_FROM = 'from@x'; process.env.SMTP_TO = 'to@x';

    await sendEmail({ subject: 'Тест', html: '<b>hi</b>' });
    expect(sendMail).toHaveBeenCalledWith(expect.objectContaining({
      from: 'from@x', to: 'to@x', subject: 'Тест', html: '<b>hi</b>',
    }));
  });

  it('sends mail through Resend when RESEND_API_KEY is configured', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ id: 'email-id' }),
    });
    vi.stubGlobal('fetch', fetchMock);
    process.env.RESEND_API_KEY = 're_test';
    process.env.RESEND_FROM = 'Screed Master <leads@example.com>';
    process.env.RESEND_TO = 'owner@example.com, manager@example.com';

    await sendEmail({ subject: 'Тест', html: '<b>hi</b>' });

    expect(fetchMock).toHaveBeenCalledWith('https://api.resend.com/emails', expect.objectContaining({
      method: 'POST',
      headers: expect.objectContaining({
        authorization: 'Bearer re_test',
        'content-type': 'application/json',
      }),
      body: JSON.stringify({
        from: 'Screed Master <leads@example.com>',
        to: ['owner@example.com', 'manager@example.com'],
        subject: 'Тест',
        html: '<b>hi</b>',
      }),
    }));
    expect(sendMail).not.toHaveBeenCalled();
  });
});
