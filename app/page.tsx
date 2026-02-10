"use client";

import { useState } from 'react';
import Image from 'next/image';

const links = [
  { title: '🌐 SITE OFFICIEL', url: 'https://onlymatt.ca' },
  { title: '🛒 PROFIL AMAZON', url: 'https://www.amazon.ca/gp/profile/amzn1.account.AGKXJLNXARH2FYTIX4ZHRC6B2K3Q' },
  { title: '💬 WHATSAPP', url: 'https://wa.me/15147120578' },
  { title: '💳 PAYPAL', url: 'https://paypal.me/onlymatt43' },
  { title: '💸 WISE', url: 'https://wise.com/pay/me/mathieuc571' },
];

export default function Home() {
  const [email, setEmail] = useState('');
  const [payhipEmail, setPayhipEmail] = useState('');
  const [payhipCode, setPayhipCode] = useState('');
  const [message, setMessage] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [accessGranted, setAccessGranted] = useState(false);

  // 1. Gestion du formulaire "Subscribe / Access" existant
  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/generate-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setMessage(data.message || data.error);
    } catch (err) {
      setMessage("Erreur de connexion.");
    } finally {
      setLoading(false);
    }
  };

  // 2. Gestion du formulaire Payhip (Validation réelle)
  const handlePayhipValidate = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalLoading(true);
    setModalMessage('');
    
    try {
      const res = await fetch('/api/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: payhipCode, email: payhipEmail }),
      });
      
      const data = await res.json();
      
      if (res.ok && data.valid) {
        setAccessGranted(true);
        setModalMessage("✅ Code valide ! Accès autorisé.");
        // Sauvegarde locale comme sur le widget externe
        localStorage.setItem('accessGranted', 'true');
        localStorage.setItem('userEmail', payhipEmail);
        localStorage.setItem('payhipCode', payhipCode);
      } else {
        setModalMessage(`❌ ${data.message || 'Code invalide'}`);
      }
    } catch (err) {
      setModalMessage("❌ Erreur de connexion au serveur.");
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center px-6 py-12 font-sans">
      
      {/* --- HEADER --- */}
      <div className="mb-12 flex flex-col items-center">
        <div className="w-28 h-28 rounded-full overflow-hidden border border-zinc-800 mb-6 shadow-2xl shadow-zinc-900/50 relative">
          <Image 
            src="https://onlymatt-media.b-cdn.net/Untitled-7.png" 
            alt="ONLYMATT" 
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover grayscale hover:grayscale-0 transition-all duration-700 ease-in-out"
          />
        </div>
        <h1 className="text-xl font-light tracking-[0.3em] uppercase">ONLYMATT</h1>
        <div className="h-[1px] w-12 bg-zinc-700 my-4"></div>
        <p className="text-zinc-500 text-xs uppercase tracking-widest font-medium">UNIVERSAL CONNECT</p>
      </div>

      <div className="w-full max-w-md space-y-12">
        
        {/* --- SECTION 1: SUBSCRIBE / ACCESS FORM (Legacy) --- */}
        <section className="bg-zinc-900/30 border border-zinc-800 p-6 rounded-2xl backdrop-blur-sm">
          <h2 className="text-xs font-bold tracking-widest uppercase mb-4 text-zinc-400 text-center">
            🔐 Demander un Accès (QR/OTP)
          </h2>
          <form onSubmit={handleSubscribe} className="flex flex-col gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.com"
              required
              className="bg-black/50 border border-zinc-700 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-zinc-500 transition-colors placeholder-zinc-600 outline-none text-white"
            />
            <button 
              type="submit" 
              disabled={loading}
              className="bg-white text-black font-bold uppercase tracking-widest text-xs py-3 rounded-lg hover:bg-zinc-200 transition-colors disabled:opacity-50"
            >
              {loading ? '...' : 'Envoyer'}
            </button>
          </form>
          {message && (
            <p className="mt-4 text-xs text-center text-zinc-400 border-t border-zinc-800 pt-3 animate-pulse">
              {message}
            </p>
          )}
        </section>

        {/* --- SECTION 2: LIENS RAPIDES --- */}
        <section className="space-y-3">
            {links.map((link, index) => (
            <a
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative block w-full py-4 px-6 text-center border border-zinc-800 bg-zinc-950 hover:border-zinc-500 transition-all duration-300 rounded-sm text-[11px] font-bold tracking-[0.15em] uppercase hover:bg-zinc-900"
            >
                <span className="relative z-10">{link.title}</span>
            </a>
            ))}
        </section>

        {/* --- SECTION 3: BOUTON DE PAIEMENT (EXEMPLE / WIDGET) --- */}
        <section className="flex justify-center pt-8">
            <button 
                onClick={() => setShowModal(true)}
                className="relative group w-48 h-14 rounded-full overflow-hidden shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:shadow-[0_0_50px_rgba(255,255,255,0.2)] transition-all duration-500 border border-white/10"
            >
                {/* Simulation Vidéo Background */}
                <div className="absolute inset-0 bg-gradient-to-r from-teal-900 to-emerald-900 opacity-80 group-hover:scale-110 transition-transform duration-700"></div>
                
                <span className="relative z-10 flex items-center justify-center gap-2 text-white font-bold tracking-wider text-sm">
                    <span>🗝️</span> UNLOCK
                </span>
            </button>
        </section>

      </div>

      {/* --- FOOTER --- */}
      <footer className="mt-auto pt-16 text-zinc-700 text-[9px] uppercase tracking-[0.3em] font-light">
        OM43 DIGITAL © {new Date().getFullYear()}
      </footer>

        {/* --- MODAL EXEMPLE (PAYHIP) --- */}
        {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={(e) => {
                if(e.target === e.currentTarget) setShowModal(false);
            }}>
                <div className="bg-zinc-950 border border-zinc-800 w-full max-w-sm rounded-2xl p-8 relative shadow-2xl">
                    <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-white text-xl">&times;</button>
                    
                    <h3 className="text-xl font-light tracking-widest text-center mb-8 uppercase text-white">Accès Premium</h3>
                    
                    <div className="space-y-6">
                        <div className="text-center">
                            <p className="text-zinc-500 text-xs mb-3 uppercase tracking-wider">Pas de code ?</p>
                            <a href="https://payhip.com" target="_blank" className="block w-full py-3 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-emerald-900/10 transition-colors text-center">
                                Acheter une licence →
                            </a>
                        </div>
                        
                        <div className="relative flex items-center gap-4">
                            <div className="h-[1px] bg-zinc-800 flex-1"></div>
                            <span className="text-zinc-600 text-[10px] uppercase">OU</span>
                            <div className="h-[1px] bg-zinc-800 flex-1"></div>
                        </div>

                        <form className="space-y-3" onSubmit={handlePayhipValidate}>
                            <input 
                                type="email" 
                                placeholder="Email" 
                                value={payhipEmail}
                                onChange={(e) => setPayhipEmail(e.target.value)}
                                required
                                className="w-full bg-black border border-zinc-800 rounded-lg px-4 py-3 text-sm focus:border-emerald-500 outline-none text-white placeholder-zinc-700" 
                            />
                            <input 
                                type="text" 
                                placeholder="Code Licence" 
                                value={payhipCode}
                                onChange={(e) => setPayhipCode(e.target.value)}
                                required
                                className="w-full bg-black border border-zinc-800 rounded-lg px-4 py-3 text-sm focus:border-emerald-500 outline-none text-white placeholder-zinc-700" 
                            />
                            
                            <button 
                                type="submit"
                                disabled={modalLoading || accessGranted}
                                className={`w-full py-3 font-bold text-xs uppercase tracking-widest rounded-lg transition-all ${
                                    accessGranted 
                                    ? 'bg-emerald-500 text-black cursor-default'
                                    : 'bg-white text-black hover:bg-zinc-200 active:scale-95'
                                }`}
                            >
                                {modalLoading ? 'Vérification...' : (accessGranted ? 'Accès Autorisé' : 'Valider')}
                            </button>

                            {/* Message de statut */}
                            {modalMessage && (
                                <p className={`text-center text-xs mt-2 ${modalMessage.includes('✅') ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {modalMessage}
                                </p>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        )}

    </div>
  );
}
