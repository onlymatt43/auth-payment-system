'use client';

import { useRouter } from 'next/navigation';

export function PlayTheSlotButton() {
  const router = useRouter();

  const handleClick = () => {
    router.push('/slots');
  };

  return (
    <button
      onClick={handleClick}
      className="neon-border-blue glass-dark rounded-3xl p-12 transform hover:scale-110 transition duration-300 cursor-pointer text-center flex flex-col items-center justify-center min-h-[300px] border-2 border-neon-blue w-full"
    >
      <div className="text-6xl mb-6 animate-bounce">🎰</div>
      <h2 className="text-3xl md:text-4xl font-black mb-4 text-neon-blue">PLAY THE</h2>
      <h2 className="text-3xl md:text-4xl font-black text-neon-yellow">SLOT</h2>
      <p className="text-sm text-gray-400 mt-6">Win free points daily</p>
    </button>
  );
}
