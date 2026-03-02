'use client';

import { useRouter } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';

export function CTAButtons() {
  const router = useRouter();
  const { data: session } = useSession();

  const handleGetPoints = async () => {
    if (!session) {
      await signIn('google');
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-8 w-full max-w-2xl mx-auto">
      {/* GET YOUR ONLYPOINTS Button */}
      <button
        onClick={handleGetPoints}
        className="neon-border-pink glass-dark rounded-3xl p-12 transform hover:scale-110 transition duration-300 cursor-pointer text-center flex flex-col items-center justify-center min-h-[300px] border-2 border-neon-pink"
      >
        <div className="text-6xl mb-6 animate-pulse">💳</div>
        <h2 className="text-3xl md:text-4xl font-black mb-4 text-neon-pink">GET YOUR</h2>
        <h2 className="text-3xl md:text-4xl font-black text-neon-yellow">ONLYPOINT$</h2>
        {!session && <p className="text-sm text-gray-400 mt-6">Sign in to proceed</p>}
      </button>

      {/* PLAY THE SLOT Button */}
      <button
        onClick={() => router.push('/slots')}
        className="neon-border-blue glass-dark rounded-3xl p-12 transform hover:scale-110 transition duration-300 cursor-pointer text-center flex flex-col items-center justify-center min-h-[300px] border-2 border-neon-blue"
      >
        <div className="text-6xl mb-6 animate-bounce">🎰</div>
        <h2 className="text-3xl md:text-4xl font-black mb-4 text-neon-blue">PLAY THE</h2>
        <h2 className="text-3xl md:text-4xl font-black text-neon-yellow">SLOT</h2>
        <p className="text-sm text-gray-400 mt-6">Win free points daily</p>
      </button>
    </div>
  );
}
