
import React, { useState, useCallback, useEffect } from 'react';
import { SubmissionStatus } from './types';
import { GoogleGenAI } from "@google/genai";
import { Sparkles, ArrowRight, Loader2, X, Cookie, Globe, ShieldAlert, CheckCircle2 } from 'lucide-react';

type ModalType = 'LEGAL' | 'PRIVACY' | 'COOKIES' | null;
type CookieConsentStatus = 'UNDECIDED' | 'ACCEPTED' | 'REJECTED';
type Language = 'en' | 'es' | 'de';

const translations = {
  en: {
    comingSoon: "Coming Soon",
    title1: "The space to talk.",
    title2: "The support to grow.",
    subtitle: "Connect with empathetic mentors for affordable, personalized well-being support and emotional growth.",
    priceTag: "Growth sessions for just €20.",
    namePlaceholder: "Your full name",
    emailPlaceholder: "Your email",
    notice: "Notice: Pluravita is a coaching and well-being connection platform. We do not provide clinical therapy or medical services.",
    button: "Join the Waitlist",
    successTitle: "You're in!",
    registerAnother: "Register another person",
    legalNotice: "Legal Notice",
    privacyPolicy: "Privacy Policy",
    cookiesPolicy: "Cookies Policy",
    cookieTitle: "We use cookies",
    cookieDesc: "To provide a safe and supportive coaching experience, we use cookies. Acceptance is required to access Pluravita.",
    cookieBtnAccept: "Accept & Continue",
    cookieBtnReject: "Reject All",
    restrictedTitle: "Access Restricted",
    restrictedDesc: "To ensure your safety and the platform's security, we require cookie usage. You cannot access Pluravita without accepting our policy.",
    restrictedAction: "I've changed my mind, accept cookies",
    aiPrompt: (name: string) => `Generate a very short, warm, and supportive thank you message in English for someone named "${name}" who has just joined a waitlist for a well-being and coaching community called Pluravita. Emphasize growth and personalized support. DO NOT mention therapy, clinical care, medical diagnosis, or psychological treatment. Focus on well-being.`,
    footerRights: "All rights reserved.",
    brandName: "Pluravita Community",
  },
  es: {
    comingSoon: "Próximamente",
    title1: "El espacio para hablar.",
    title2: "El apoyo para crecer.",
    subtitle: "Conecta con mentores empáticos para obtener apoyo en bienestar y crecimiento emocional de forma asequible y personalizada.",
    priceTag: "Sesiones de apoyo por solo 20€.",
    namePlaceholder: "Tu nombre completo",
    emailPlaceholder: "Tu correo electrónico",
    notice: "Aviso: Pluravita es una plataforma de conexión de bienestar. No proporcionamos terapia clínica ni servicios médicos.",
    button: "Unirse a la lista",
    successTitle: "¡Ya estás dentro!",
    registerAnother: "Registrar a otra persona",
    legalNotice: "Aviso Legal",
    privacyPolicy: "Privacidad",
    cookiesPolicy: "Cookies",
    cookieTitle: "Usamos cookies",
    cookieDesc: "Para ofrecerte una experiencia segura, utilizamos cookies. Es necesario aceptarlas para acceder a Pluravita.",
    cookieBtnAccept: "Aceptar y continuar",
    cookieBtnReject: "Rechazar todo",
    restrictedTitle: "Acceso Restringido",
    restrictedDesc: "Para garantizar tu seguridad y la del servicio, necesitamos usar cookies. No puedes acceder a Pluravita sin aceptar nuestra política.",
    restrictedAction: "He cambiado de opinión, aceptar cookies",
    aiPrompt: (name: string) => `Genera un mensaje de agradecimiento muy corto, cálido y de apoyo en español para alguien llamado "${name}" que acaba de unirse a una lista de espera para una comunidad de bienestar y coaching llamada Pluravita. Enfatiza el crecimiento y el apoyo personalizado. NO menciones terapia, atención clínica, diagnóstico médico o tratamiento psicológico. Enfócate en el bienestar.`,
    footerRights: "Todos los derechos reservados.",
    brandName: "Comunidad Pluravita",
  },
  de: {
    comingSoon: "Demnächst verfügbar",
    title1: "Raum zum Reden.",
    title2: "Unterstützung zum Wachsen.",
    subtitle: "Verbinden Sie sich mit empathischen Mentoren für erschwingliche, personalisierte Wohlfühl-Unterstützung und emotionales Wachstum.",
    priceTag: "Sitzungen für nur 20€.",
    namePlaceholder: "Ihr vollständiger Name",
    emailPlaceholder: "Ihre E-Mail-Adresse",
    notice: "Hinweis: Pluravita ist eine Coaching-Plattform. Wir bieten keine klinische Therapie oder medizinische Dienstleistungen an.",
    button: "Auf die Warteliste",
    successTitle: "Willkommen!",
    registerAnother: "Weitere Person anmelden",
    legalNotice: "Impressum",
    privacyPolicy: "Datenschutz",
    cookiesPolicy: "Cookies",
    cookieTitle: "Wir verwenden Cookies",
    cookieDesc: "Um ein sicheres Coaching-Erlebnis zu bieten, verwenden wir Cookies. Die Zustimmung ist für den Zugriff auf Pluravita erforderlich.",
    cookieBtnAccept: "Akzeptieren & Weiter",
    cookieBtnReject: "Ablehnen",
    restrictedTitle: "Zugriff eingeschränkt",
    restrictedDesc: "Um Ihre Sicherheit und die der Plattform zu gewährleisten, benötigen wir Cookies. Sie können Pluravita ohne Zustimmung nicht betreten.",
    restrictedAction: "Ich habe meine Meinung geändert, Cookies akzeptieren",
    aiPrompt: (name: string) => `Erzeuge eine sehr kurze, herzliche und unterstützende Dankesnachricht auf Deutsch für eine Person namens "${name}", die sich gerade auf die Warteliste für eine Wohlfühl-Community namens Pluravita gesetzt hat. Betone Wachstum und persönliche Unterstützung. Erwähne KEINE Therapie, klinische Versorgung, medizinische Diagnose oder psychologische Behandlung. Fokus auf Wohlbefinden.`,
    footerRights: "Alle Rechte vorbehalten.",
    brandName: "Pluravita Community",
  }
};

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('en');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [status, setStatus] = useState<SubmissionStatus>(SubmissionStatus.IDLE);
  const [welcomeMessage, setWelcomeMessage] = useState<string>('');
  const [cookieStatus, setCookieStatus] = useState<CookieConsentStatus>('UNDECIDED');

  const t = translations[lang];

  useEffect(() => {
    const detectLang = async () => {
      try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        const country = data.country_code?.toLowerCase();
        
        const spanishCountries = ['es', 'mx', 'ar', 'co', 'cl', 'pe', 've', 'ec'];
        const germanCountries = ['de', 'at', 'ch'];

        if (spanishCountries.includes(country)) setLang('es');
        else if (germanCountries.includes(country)) setLang('de');
        else {
          const browserLang = navigator.language.split('-')[0];
          if (['en', 'es', 'de'].includes(browserLang)) {
            setLang(browserLang as Language);
          } else {
            setLang('en');
          }
        }
      } catch (err) {
        const browserLang = navigator.language.split('-')[0];
        setLang(['en', 'es', 'de'].includes(browserLang) ? browserLang as Language : 'en');
      }
    };
    
    detectLang();

    const savedConsent = localStorage.getItem('pluravita_cookie_consent');
    if (savedConsent === 'ACCEPTED') setCookieStatus('ACCEPTED');
    else if (savedConsent === 'REJECTED') setCookieStatus('REJECTED');
  }, []);

  const handleAcceptCookies = () => {
    localStorage.setItem('pluravita_cookie_consent', 'ACCEPTED');
    setCookieStatus('ACCEPTED');
  };

  const handleRejectCookies = () => {
    localStorage.setItem('pluravita_cookie_consent', 'REJECTED');
    setCookieStatus('REJECTED');
  };

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name) return;
    setStatus(SubmissionStatus.LOADING);

    try {
      await fetch("https://formspree.io/f/xldqwnej", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, language: lang, source: 'Pluravita' })
      });
      
      let apiKey = process.env.API_KEY || '';
      const ai = new GoogleGenAI({ apiKey });
      const prompt = t.aiPrompt(name);
      const aiResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      setWelcomeMessage(aiResponse.text || "Thank you.");
      setStatus(SubmissionStatus.SUCCESS);
    } catch (error) {
      setStatus(SubmissionStatus.ERROR);
    }
  }, [email, name, lang, t]);

  if (cookieStatus === 'REJECTED') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-stone-50 font-sans relative overflow-hidden">
        <div className="ocean"><div className="wave"></div><div className="wave"></div></div>
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center animate-fade-in border border-stone-200 relative z-10">
          <ShieldAlert className="w-16 h-16 text-rose-500 mx-auto mb-6" />
          <h1 className="text-3xl font-serif font-bold text-stone-900 mb-4">{t.restrictedTitle}</h1>
          <p className="text-stone-600 mb-8 leading-relaxed">
            {t.restrictedDesc}
          </p>
          <button 
            onClick={handleAcceptCookies}
            className="w-full py-4 bg-teal-700 hover:bg-teal-800 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 animate-vibrate-jump"
          >
            <CheckCircle2 className="w-5 h-5" />
            {t.restrictedAction}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-sans relative bg-stone-50 overflow-x-hidden">
      <div className="ocean"><div className="wave"></div><div className="wave"></div></div>

      {cookieStatus === 'UNDECIDED' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/95 backdrop-blur-md">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8 text-center animate-fade-in border border-stone-200">
            <Cookie className="w-12 h-12 text-teal-600 mx-auto mb-4" />
            <h2 className="text-2xl font-serif font-bold text-stone-900 mb-2">{t.cookieTitle}</h2>
            <p className="text-stone-600 mb-6 text-sm leading-relaxed">{t.cookieDesc}</p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={handleAcceptCookies} 
                className="w-full py-3 bg-teal-700 text-white rounded-lg shadow-lg font-medium transition-transform hover:scale-[1.02]"
              >
                {t.cookieBtnAccept}
              </button>
              <button 
                onClick={handleRejectCookies} 
                className="w-full py-3 bg-white text-stone-400 border border-stone-200 rounded-lg text-sm hover:text-stone-600 hover:border-stone-400 transition-colors"
              >
                {t.cookieBtnReject}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-teal-900 text-teal-50 py-3 overflow-hidden relative z-10">
        <div className="animate-marquee inline-block">
          <span className="mx-8 text-sm font-bold tracking-widest uppercase">• {t.comingSoon}</span>
          <span className="mx-8 text-sm font-bold tracking-widest uppercase">• {t.comingSoon}</span>
          <span className="mx-8 text-sm font-bold tracking-widest uppercase">• {t.comingSoon}</span>
          <span className="mx-8 text-sm font-bold tracking-widest uppercase">• {t.comingSoon}</span>
        </div>
      </div>

      <nav className="w-full py-6 px-4 sm:px-8 max-w-7xl mx-auto flex justify-between items-center relative z-10">
        <div className="flex items-center gap-2">
          <svg viewBox="0 0 200 200" className="h-12 w-12" aria-label="Pluravita Logo">
            <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{stopColor:'#0f766e', stopOpacity:1}} />
              <stop offset="100%" style={{stopColor:'#2dd4bf', stopOpacity:1}} />
            </linearGradient>
            <circle cx="100" cy="100" r="80" fill="none" stroke="url(#g1)" strokeWidth="4" opacity="0.2" />
            <g transform="translate(60, 55) scale(0.8)">
              <circle cx="45" cy="60" r="24" fill="none" stroke="#0f766e" strokeWidth="6" />
              <path d="M36 60l6 6l12-12" fill="none" stroke="#2dd4bf" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
            </g>
          </svg>
          <span className="text-xl font-serif font-bold tracking-widest text-teal-900">PLURAVITA</span>
        </div>
        <div className="flex items-center gap-2 text-stone-400 text-xs font-medium uppercase tracking-tighter bg-white/50 px-3 py-1.5 rounded-full border border-stone-100 backdrop-blur-sm">
          <Globe className="w-3 h-3" />
          <button onClick={() => setLang('en')} className={`${lang === 'en' ? 'text-teal-700 font-bold' : ''}`}>EN</button>
          <span>/</span>
          <button onClick={() => setLang('es')} className={`${lang === 'es' ? 'text-teal-700 font-bold' : ''}`}>ES</button>
          <span>/</span>
          <button onClick={() => setLang('de')} className={`${lang === 'de' ? 'text-teal-700 font-bold' : ''}`}>DE</button>
        </div>
      </nav>

      <main className="flex-grow flex items-center relative z-10 min-h-[60vh]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 text-center w-full">
          <h1 className="text-4xl sm:text-6xl font-serif font-bold text-stone-900 mb-6 leading-tight">
            {t.title1} <br/><span className="text-teal-700">{t.title2}</span>
          </h1>
          <p className="text-lg text-stone-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            {t.subtitle}
            <span className="block mt-2 font-medium text-teal-800">{t.priceTag}</span>
          </p>

          <div className="max-w-md mx-auto">
            {status === SubmissionStatus.SUCCESS ? (
              <div className="bg-teal-50 border border-teal-100 p-8 rounded-2xl text-left shadow-sm animate-fade-in">
                <div className="flex items-center gap-3 text-teal-800 font-semibold mb-4">
                  <Sparkles className="w-5 h-5" />
                  <span>{t.successTitle}</span>
                </div>
                <p className="text-teal-700 text-sm italic leading-relaxed">"{welcomeMessage}"</p>
                <button 
                  onClick={() => setStatus(SubmissionStatus.IDLE)} 
                  className="mt-6 text-xs text-teal-600 hover:text-teal-800 underline font-medium"
                >
                  {t.registerAnother}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <input 
                  type="text" 
                  placeholder={t.namePlaceholder} 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  required 
                  className="px-4 py-4 rounded-xl border border-stone-200 outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-500 transition-all bg-white/80 backdrop-blur-sm" 
                />
                <input 
                  type="email" 
                  placeholder={t.emailPlaceholder} 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  required 
                  className="px-4 py-4 rounded-xl border border-stone-200 outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-500 transition-all bg-white/80 backdrop-blur-sm" 
                />
                <div className="bg-stone-100/60 p-4 rounded-xl text-[11px] text-stone-500 text-left border border-stone-200 leading-normal">
                  <strong>Notice:</strong> {t.notice}
                </div>
                <button 
                  type="submit" 
                  disabled={status === SubmissionStatus.LOADING} 
                  className="py-4 bg-teal-700 hover:bg-teal-800 text-white rounded-xl flex justify-center items-center gap-2 font-bold transition-all shadow-lg shadow-teal-700/20 active:scale-95 disabled:opacity-70 animate-vibrate-jump"
                >
                  {status === SubmissionStatus.LOADING ? (
                    <Loader2 className="animate-spin w-5 h-5" />
                  ) : (
                    <>{t.button} <ArrowRight className="w-5 h-5" /></>
                  )}
                </button>
              </form>
            )}
            <p className="mt-6 text-[11px] text-stone-400 uppercase tracking-widest font-medium">{t.brandName}</p>
          </div>
        </div>
      </main>

      <footer className="py-12 px-8 border-t border-stone-200 flex flex-col md:flex-row justify-between items-center text-stone-500 text-sm bg-white/30 backdrop-blur-sm relative z-10">
        <p>© 2025 Pluravita. {t.footerRights}</p>
        <div className="flex gap-8 mt-6 md:mt-0 font-medium">
          <button className="hover:text-teal-700 transition-colors">{t.legalNotice}</button>
          <button className="hover:text-teal-700 transition-colors">{t.privacyPolicy}</button>
          <button className="hover:text-teal-700 transition-colors">{t.cookiesPolicy}</button>
        </div>
      </footer>
    </div>
  );
};

export default App;
