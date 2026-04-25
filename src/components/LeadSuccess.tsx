import type { Channel } from '@/config/site';

const channelText: Record<Channel, string> = {
  whatsapp: 'в WhatsApp',
  telegram: 'в Telegram',
  call: 'звонком',
  any: 'удобным способом',
};

export function LeadSuccess({ masterName, channel }: { masterName: string; channel: Channel }) {
  return (
    <div className="border-2 border-bg bg-bg/10 p-8 text-center">
      <div className="text-4xl">✓</div>
      <h3 className="mt-4 font-display uppercase text-2xl">Спасибо!</h3>
      <p className="mt-3 opacity-90">
        {masterName} свяжется в течение 15 минут {channelText[channel]}.
      </p>
    </div>
  );
}
