'use client';

import { FormEvent, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'request' | 'verify'>('request');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const handleRequestCode = async (event: FormEvent) => {
    event.preventDefault();
    if (!email) return;

    try {
      setLoading(true);
      setError(null);
      setInfo(null);

      const response = await fetch('/api/auth/email/request-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Impossible de générer le code');
      }

      setStep('verify');
      setInfo('Code envoyé! Vérifie ta boîte de réception.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inattendue');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (event: FormEvent) => {
    event.preventDefault();
    if (!code) return;

    try {
      setLoading(true);
      setError(null);

      const result = await signIn('email-code', {
        email,
        code,
        redirect: false,
        callbackUrl: '/shop',
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      router.push('/shop');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Code invalide');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = () => {
    signIn('google', { callbackUrl: '/shop' });
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-dark-darker via-dark-navy to-dark-blue text-white p-6 md:p-12 flex items-center justify-center">
      <div className="glass-dark rounded-3xl p-8 md:p-12 w-full max-w-3xl border border-white/10 space-y-10">
        <div className="text-center space-y-4">
          <p className="text-sm uppercase tracking-[0.4em] text-neon-yellow">Connexion</p>
          <h1 className="text-4xl md:text-5xl font-black">Accède à ONLYPOINT$</h1>
          <p className="text-gray-400">Valide ton email pour recevoir un code à usage unique. Google reste disponible en option secondaire.</p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <div className="space-y-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-gray-400 mb-2">Étape 1</p>
              <h2 className="text-2xl font-bold mb-4">Valide ton email</h2>
              <form onSubmit={handleRequestCode} className="space-y-4">
                <input
                  type="email"
                  required
                  placeholder="email@exemple.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-2xl bg-dark-blue/60 border border-white/10 px-4 py-3 focus:outline-none focus:border-neon-yellow"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-neon w-full"
                >
                  {loading && step === 'request' ? 'Envoi...' : 'Recevoir le code'}
                </button>
              </form>
            </div>
            {step === 'verify' && (
              <div className="space-y-4">
                <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Étape 2</p>
                <h2 className="text-2xl font-bold">Entre ton code</h2>
                <form onSubmit={handleVerifyCode} className="space-y-4">
                  <input
                    type="text"
                    required
                    placeholder="123456"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full rounded-2xl bg-dark-blue/60 border border-white/10 px-4 py-3 text-2xl tracking-[0.5em] text-center focus:outline-none focus:border-neon-blue"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-neon w-full"
                  >
                    {loading && step === 'verify' ? 'Validation...' : 'Se connecter'}
                  </button>
                </form>
              </div>
            )}
          </div>

          <div className="space-y-6 p-6 rounded-3xl bg-dark-navy/60 border border-white/5">
            <p className="text-sm text-gray-400">Option #2</p>
            <h3 className="text-2xl font-bold text-white">Connexion Google</h3>
            <p className="text-gray-400">Tu peux toujours utiliser Google si tu préfères l'OAuth classique.</p>
            <button
              type="button"
              onClick={handleGoogle}
              className="w-full py-3 rounded-2xl border border-white/20 hover:border-neon-pink transition"
            >
              Continuer avec Google
            </button>
          </div>
        </div>

        {(error || info) && (
          <div className={`text-center rounded-2xl p-4 ${error ? 'bg-red-500/10 text-red-300' : 'bg-green-500/10 text-green-300'}`}>
            {error || info}
          </div>
        )}
      </div>
    </main>
  );
}
