import { describe, it, expect, vi } from 'vitest';

const sendMail = vi.fn();
vi.mock('nodemailer', () => ({
  default: { createTransport: () => ({ sendMail }) },
}));

import { sendEmail } from '@/lib/email';

describe('sendEmail', () => {
  it('sends mail with subject and html', async () => {
    process.env.SMTP_HOST = 'smtp.x'; process.env.SMTP_PORT = '465';
    process.env.SMTP_USER = 'u'; process.env.SMTP_PASS = 'p';
    process.env.SMTP_FROM = 'from@x'; process.env.SMTP_TO = 'to@x';

    await sendEmail({ subject: 'Тест', html: '<b>hi</b>' });
    expect(sendMail).toHaveBeenCalledWith(expect.objectContaining({
      from: 'from@x', to: 'to@x', subject: 'Тест', html: '<b>hi</b>',
    }));
  });
});
