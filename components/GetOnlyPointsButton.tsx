'use client';

import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export function GetOnlyPointsButton() {
  const { data: session } = useSession();
  const router = useRouter();

  const handleClick = () => {
    if (!session) {
      void signIn('google', { callbackUrl: '/shop' });
      return;
    }

    router.push('/account');
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="neon-border-pink glass-dark rounded-3xl p-12 transform hover:scale-110 transition duration-300 cursor-pointer text-center flex flex-col items-center justify-center min-h-[300px] border-2 border-neon-pink w-full"
    >
      <div className="text-6xl mb-6 animate-pulse">💳</div>
      <h2 className="text-3xl md:text-4xl font-black mb-4 text-neon-pink">GET YOUR</h2>
      <h2 className="text-3xl md:text-4xl font-black text-neon-yellow">ONLYPOINT$</h2>
      {!session && <p className="text-sm text-gray-400 mt-6">Sign in to proceed</p>}
    </button>
  );
}
