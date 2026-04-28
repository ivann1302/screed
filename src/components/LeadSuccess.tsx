import { uiText, type Channel } from '@/config/site';

export function LeadSuccess({ masterName, channel }: { masterName: string; channel: Channel }) {
  return (
    <div className="border-2 border-bg bg-bg/10 p-8 text-center">
      <div className="text-4xl">✓</div>
      <h3 className="mt-4 font-display uppercase text-2xl">{uiText.leadSuccess.title}</h3>
      <p className="mt-3 opacity-90">
        {masterName} {uiText.leadSuccess.messageSuffix} {uiText.leadSuccess.channelText[channel]}.
      </p>
    </div>
  );
}
