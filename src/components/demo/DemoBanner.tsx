import { Sparkles } from "lucide-react";

interface DemoBannerProps {
  onWaitlistClick: () => void;
}

export const DemoBanner = ({ onWaitlistClick }: DemoBannerProps) => {
  return (
    <div className="bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-950 px-6 py-3 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <Sparkles className="w-5 h-5" />
        <span className="text-sm font-bold tracking-wider uppercase">
          You're exploring Cynda in demo mode — all data is simulated.
        </span>
      </div>
      <button
        onClick={onWaitlistClick}
        className="text-amber-950 font-black text-sm uppercase tracking-widest hover:text-amber-800 transition-colors underline underline-offset-2"
      >
        Join the Waitlist →
      </button>
    </div>
  );
};
