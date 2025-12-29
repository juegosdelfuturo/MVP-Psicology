
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { SubmissionStatus } from './types';
import { GoogleGenAI } from "@google/genai";
import { 
  Sparkles, ArrowRight, Loader2, X, Cookie, ShieldAlert, CheckCircle2, ChevronDown, ShieldCheck, Heart, GraduationCap, Users, Globe, BookOpen, Wallet
} from 'lucide-react';

type ModalType = 'LEGAL' | 'PRIVACY' | 'COOKIES' | null;
type CookieConsentStatus = 'UNDECIDED' | 'ACCEPTED' | 'REJECTED';
type Language = 'en' | 'es' | 'de';

const translations = {
  en: {
    title1: "Stop putting off your well-being due to the cost of therapy.",
    subtitle: "A private psychologist shouldn't be a luxury. Pluravita offers ethical support for just €20/h.",
    leadMagnet: "Get our 'Ethics Guide' + Priority Access.",
    priceTag: "Support for €20/h.",
    namePlaceholder: "Name",
    emailPlaceholder: "Email",
    notice: "Emotional mentoring, not a clinic.",
    button: "Get support for €20",
    successTitle: "You're on the list!",
    defaultWelcome: "We hear you. Check your email for the guide.",
    registerAnother: "Use another account",
    legalNotice: "Legal",
    privacyPolicy: "Privacy",
    cookiesPolicy: "Cookies",
    legalContent: "Pluravita is a wellness platform. We provide emotional support and coaching services. We are not a medical clinic.",
    privacyContent: "Your data is treated with the utmost care.",
    cookiesContent: "We only use essential cookies.",
    cookieTitle: "Privacy First",
    cookieDesc: "We use essential cookies for a safe experience.",
    cookieBtnAccept: "I Accept",
    cookieBtnReject: "Decline",
    restrictedTitle: "Access Restricted",
    restrictedDesc: "Consent is required for safety.",
    restrictedAction: "Accept and continue",
    aiPrompt: (name: string) => `Generate a short, warm welcome in English for ${name}. Emphasize affordable emotional support. Max 15 words.`,
    brandName: "Pluravita",
    visionTitle: "Mental health isn't a privilege.",
    visionSubtitle: "No one should struggle alone because they can't afford clinical rates.",
    pillar1Title: "Accessibility",
    pillar1Text: "Human sessions for a flat rate of €20.",
    pillar2Title: "Ethical Mentors",
    pillar2Text: "Formed professionals who know the limits.",
    pillar3Title: "Safe Space",
    pillar3Text: "Rigor and empathy for your growth.",
    whyNowTitle: "The change starts now.",
    whyNowText: "The first 100 members get founder rates. Secure your spot.",
    faqTitle: "F.A.Q.",
    faq1Q: "Why €20?",
    faq1A: "We focus on mentoring, not clinical pathology, allowing us to keep costs fair.",
    faq2Q: "How do I start?",
    faq2A: "Join the list. We'll invite you soon.",
    close: "Close",
    footerDesc: "Democratizing empathy.",
    empathyStandard: "Affordable Support"
  },
  es: {
    title1: "Tu bienestar no puede esperar a que puedas pagar 70€.",
    subtitle: "Un psicólogo no debería ser un lujo. Pluravita ofrece apoyo ético y humano por solo 20€/h.",
    leadMagnet: "Recibe la 'Guía de Ética' + Acceso prioritario.",
    priceTag: "Apoyo por 20€/h.",
    namePlaceholder: "Nombre",
    emailPlaceholder: "Email",
    notice: "Mentoría emocional, no clínica.",
    button: "Apoyo por 20€",
    successTitle: "¡Ya estás dentro!",
    defaultWelcome: "Te escuchamos. Revisa tu email para la guía.",
    registerAnother: "Registrar otro correo",
    legalNotice: "Legal",
    privacyPolicy: "Privacidad",
    cookiesPolicy: "Cookies",
    legalContent: "Pluravita es una plataforma de bienestar. Ofrecemos apoyo emocional y coaching. No somos una clínica médica.",
    privacyContent: "Tus datos son tratados con el mayor cuidado.",
    cookiesContent: "Solo usamos cookies esenciales.",
    cookieTitle: "Privacidad",
    cookieDesc: "Usamos cookies esenciales para tu seguridad.",
    cookieBtnAccept: "Aceptar",
    cookieBtnReject: "Rechazar",
    restrictedTitle: "Acceso Restringido",
    restrictedDesc: "Necesitamos tu consentimiento para continuar.",
    restrictedAction: "Aceptar y continuar",
    aiPrompt: (name: string) => `Genera un mensaje corto y empático para ${name}. El bienestar no tiene por qué ser caro con Pluravita. Máximo 15 palabras.`,
    brandName: "Pluravita",
    visionTitle: "La salud mental no es un privilegio.",
    visionSubtitle: "Nadie debería estar solo por no poder pagar tarifas de lujo.",
    pillar1Title: "Accesibilidad",
    pillar1Text: "Sesiones humanas por una tarifa plana de 20€.",
    pillar2Title: "Ética",
    pillar2Text: "Claridad entre acompañamiento y clínica.",
    pillar3Title: "Seguridad",
    pillar3Text: "Comunidad basada en rigor y empatía.",
    whyNowTitle: "Empieza ahora.",
    whyNowText: "Los primeros 100 miembros aseguran precio de fundador.",
    faqTitle: "Preguntas",
    faq1Q: "¿Por qué 20€?",
    faq1A: "Optimizamos la red de mentoría para ofrecer precios justos sin comprometer la ética.",
    faq2Q: "¿Cómo empiezo?",
    faq2A: "Únete a la lista y te avisaremos para la beta privada.",
    close: "Cerrar",
    footerDesc: "Democratizando la empatía.",
    empathyStandard: "Apoyo para todos"
  },
  de: {
    title1: "Warten Sie nicht länger auf Ihr Wohlbefinden.",
    subtitle: "Psychologische Hilfe sollte kein Luxus sein. Ethisches Mentoring für nur 20€/Std.",
    leadMagnet: "Erhalten Sie den 'Ethik-Leitfaden' + Priorität.",
    priceTag: "Hilfe für 20€/Std.",
    namePlaceholder: "Name",
    emailPlaceholder: "E-Mail",
    notice: "Mentoring, keine Klinik.",
    button: "Hilfe für 20€ erhalten",
    successTitle: "Willkommen!",
    defaultWelcome: "Wir haben Sie gehört. Prüfen Sie Ihre E-Mails.",
    registerAnother: "Anderes Konto",
    legalNotice: "Impressum",
    privacyPolicy: "Datenschutz",
    cookiesPolicy: "Cookies",
    legalContent: "Pluravita ist eine Wellness-Plattform.",
    privacyContent: "Ihre Daten sind sicher.",
    cookiesContent: "Nur notwendige Cookies.",
    cookieTitle: "Datenschutz",
    cookieDesc: "Essenzielle Cookies für Ihre Sicherheit.",
    cookieBtnAccept: "Akzeptieren",
    cookieBtnReject: "Ablehnen",
    restrictedTitle: "Eingeschränkt",
    restrictedDesc: "Zustimmung erforderlich.",
    restrictedAction: "Akzeptieren",
    aiPrompt: (name: string) => `Kurze Begrüßung für ${name}. Betone faire Preise bei Pluravita. Max 15 Wörter.`,
    brandName: "Pluravita",
    visionTitle: "Kein Privileg.",
    visionSubtitle: "Niemand sollte allein sein, nur weil Geld fehlt.",
    pillar1Title: "Fairness",
    pillar1Text: "Sitzungen zum Pauschalpreis von 20€.",
    pillar2Title: "Ethik",
    pillar2Text: "Klare Grenzen zwischen Mentoring und Klinik.",
    pillar3Title: "Sicherheit",
    pillar3Text: "Empathie und Fachkenntnis.",
    whyNowTitle: "Jetzt starten.",
    whyNowText: "Die ersten 100 Mitglieder erhalten Sonderkonditionen.",
    faqTitle: "Fragen",
    faq1Q: "Warum 20€?",
    faq1A: "Mentoring ermöglicht faire Preise ohne klinischen Overhead.",
    faq2Q: "Wie fange ich an?",
    faq2A: "Tragen Sie sich ein, wir melden uns.",
    close: "Schließen",
    footerDesc: "Demokratisierung der Empathie.",
    empathyStandard: "Faire Hilfe"
  }
};

const FAQItem: React.FC<{ q: string; a: string }> = ({ q, a }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="bg-white border border-gray-100 rounded-2xl mb-4 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center text-left p-6 sm:p-8"
      >
        <span className="text-lg font-semibold text-black pr-4">{q}</span>
        <ChevronDown className={`w-5 h-5 text-brand-primary transition-all duration-500 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <div className={`transition-all duration-700 ease-in-out ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="px-6 sm:px-8 pb-8 text-black font-light leading-relaxed">
          {a}
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('es');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [status, setStatus] = useState<SubmissionStatus>(SubmissionStatus.IDLE);
  const [welcomeMessage, setWelcomeMessage] = useState<string>('');
  const [cookieStatus, setCookieStatus] = useState<CookieConsentStatus>('UNDECIDED');
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const t = translations[lang];

  useEffect(() => {
    const detectLang = async () => {
      try {
        const response = await fetch('https://ipapi.co/json/');
        if (response.ok) {
          const data = await response.json();
          const country = data.country_code?.toLowerCase();
          const spanishCountries = ['es', 'mx', 'ar', 'co', 'cl', 'pe', 've', 'ec'];
          const germanCountries = ['de', 'at', 'ch'];
          if (spanishCountries.includes(country)) setLang('es');
          else if (germanCountries.includes(country)) setLang('de');
          else setLang('en');
        }
      } catch (err) {
        setLang('en');
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
      const formResponse = await fetch("https://formspree.io/f/xldqwnej", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, language: lang, source: 'Pluravita Bold Form', offer: 'Ethics Guide + Founder Rate' })
      });

      if (!formResponse.ok) throw new Error("Formspree Error");

      setWelcomeMessage(t.defaultWelcome);
      setStatus(SubmissionStatus.SUCCESS);

      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const aiResponse = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: t.aiPrompt(name),
        });
        if (aiResponse.text) {
          setWelcomeMessage(aiResponse.text);
        }
      } catch (aiError) {
        console.warn("AI generation failed", aiError);
      }
    } catch (error) {
      console.error("Submission error:", error);
      setStatus(SubmissionStatus.ERROR);
      setTimeout(() => setStatus(SubmissionStatus.IDLE), 4000);
    }
  }, [email, name, lang, t]);

  const renderModal = () => {
    if (!activeModal) return null;
    let title = "";
    let content = "";
    switch (activeModal) {
      case 'LEGAL': title = t.legalNotice; content = t.legalContent; break;
      case 'PRIVACY': title = t.privacyPolicy; content = t.privacyContent; break;
      case 'COOKIES': title = t.cookiesPolicy; content = t.cookiesContent; break;
    }

    return (
      <div className="fixed inset-0 z-[600] flex items-center justify-center p-6 bg-black/10 backdrop-blur-md animate-fade-in">
        <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-xl w-full p-8 sm:p-12 border border-gray-50 overflow-y-auto max-h-[80vh]">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-display font-bold text-black tracking-tight">{title}</h2>
            <button onClick={() => setActiveModal(null)} className="p-2 hover:bg-gray-50 rounded-full transition-colors">
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
          <div className="text-black leading-relaxed mb-10 text-sm sm:text-base font-light">
            {content}
          </div>
          <button 
            onClick={() => setActiveModal(null)}
            className="w-full py-4 bg-black text-white font-bold rounded-2xl hover:bg-gray-900 transition-colors"
          >
            {t.close}
          </button>
        </div>
      </div>
    );
  };

  if (cookieStatus === 'REJECTED') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-8">
        <div className="max-w-md bg-white rounded-[3rem] shadow-xl p-12 text-center border border-gray-100 animate-fade-in">
          <ShieldAlert className="w-12 h-12 text-brand-primary mx-auto mb-8" />
          <h1 className="text-2xl font-display font-bold text-black mb-4">{t.restrictedTitle}</h1>
          <p className="text-black font-light mb-10 text-sm leading-relaxed">{t.restrictedDesc}</p>
          <button onClick={handleAcceptCookies} className="w-full py-4 bg-brand-primary text-white rounded-2xl font-bold transition-all hover:bg-brand-dark shadow-xl shadow-brand-primary/20 uppercase tracking-widest text-xs">{t.restrictedAction}</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-sans bg-white relative">
      <div className="bg-grid absolute inset-0 z-0 pointer-events-none opacity-40"></div>

      {renderModal()}

      {cookieStatus === 'UNDECIDED' && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-black/5 backdrop-blur-xl">
          <div className="bg-white rounded-[3rem] shadow-2xl max-w-md w-full p-12 text-center border border-white animate-fade-in">
            <Wallet className="w-10 h-10 text-brand-primary mx-auto mb-8" />
            <h2 className="text-2xl font-display font-bold text-black mb-3">{t.cookieTitle}</h2>
            <p className="text-black mb-10 leading-relaxed text-sm font-light">{t.cookieDesc}</p>
            <div className="flex flex-col gap-3">
              <button onClick={handleAcceptCookies} className="w-full py-4 bg-brand-primary text-white rounded-2xl font-bold transition-transform active:scale-95 shadow-xl shadow-brand-primary/10 uppercase tracking-widest text-xs">{t.cookieBtnAccept}</button>
              <button onClick={handleRejectCookies} className="w-full py-4 text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em] hover:text-black transition-colors">{t.cookieBtnReject}</button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="w-full py-10 px-6 sm:px-12 max-w-7xl mx-auto flex justify-between items-center relative z-[60]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand-primary/20">
            <Heart className="w-6 h-6 fill-current" />
          </div>
          <span className="text-lg font-display font-bold tracking-tight text-black">{t.brandName}</span>
        </div>
        <div className="flex items-center gap-5 text-[10px] font-bold uppercase tracking-widest text-black">
          <button onClick={() => setLang('en')} className={`${lang === 'en' ? 'text-brand-primary' : 'hover:text-gray-500'} transition-all`}>EN</button>
          <button onClick={() => setLang('es')} className={`${lang === 'es' ? 'text-brand-primary' : 'hover:text-gray-500'} transition-all`}>ES</button>
          <button onClick={() => setLang('de')} className={`${lang === 'de' ? 'text-brand-primary' : 'hover:text-gray-500'} transition-all`}>DE</button>
        </div>
      </nav>

      <main className="relative z-[10]">
        
        {/* HERO SECTION */}
        <section className="min-h-[85vh] flex flex-col justify-center px-6 sm:px-12 max-w-7xl mx-auto pt-8 pb-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-32 items-center">
            <div className="text-left animate-fade-in">
              <h1 className="text-5xl sm:text-6xl lg:text-[72px] font-display font-extrabold text-black mb-6 leading-[1.1] tracking-tighter">
                {t.title1}
              </h1>
              <p className="text-lg sm:text-xl text-black/80 mb-10 max-w-lg leading-relaxed font-light">
                {t.subtitle}
              </p>

              <div className="max-w-md w-full" ref={formRef}>
                {status === SubmissionStatus.SUCCESS ? (
                  <div className="bg-white border border-brand-50 p-10 rounded-[3rem] shadow-2xl animate-fade-in ring-1 ring-brand-100">
                    <div className="flex items-center gap-4 text-brand-primary font-bold mb-6">
                      <div className="bg-brand-50 p-2 rounded-full">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <span className="text-sm uppercase tracking-widest">{t.successTitle}</span>
                    </div>
                    <p className="text-black italic leading-relaxed text-lg font-light">"{welcomeMessage}"</p>
                    <button 
                      onClick={() => { setStatus(SubmissionStatus.IDLE); setEmail(''); setName(''); }} 
                      className="mt-10 text-[10px] text-gray-500 hover:text-brand-primary uppercase tracking-widest font-black transition-colors"
                    >
                      {t.registerAnother}
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-6">
                    {/* BOLD DIRECT FORM */}
                    <div className="bg-white rounded-[2.5rem] p-1 shadow-2xl shadow-brand-primary/5 ring-4 ring-black/5 overflow-hidden">
                      <form onSubmit={handleSubmit} className="flex flex-col">
                        <input 
                          type="text" placeholder={t.namePlaceholder} value={name} onChange={e => setName(e.target.value)} required 
                          className="w-full px-8 py-5 border-b border-gray-100 bg-white focus:bg-gray-50 outline-none transition-all font-bold text-lg placeholder:text-gray-300" 
                        />
                        <input 
                          type="email" placeholder={t.emailPlaceholder} value={email} onChange={e => setEmail(e.target.value)} required 
                          className="w-full px-8 py-5 bg-white focus:bg-gray-50 outline-none transition-all font-bold text-lg placeholder:text-gray-300" 
                        />
                        <button 
                          type="submit" disabled={status === SubmissionStatus.LOADING} 
                          className={`m-2 py-5 bg-brand-primary hover:bg-brand-dark text-white rounded-[1.5rem] flex justify-center items-center gap-3 font-extrabold text-lg shadow-lg shadow-brand-primary/10 transition-all disabled:opacity-50 ${status === SubmissionStatus.IDLE ? 'animate-vibrate-jump' : ''}`}
                        >
                          {status === SubmissionStatus.LOADING ? <Loader2 className="animate-spin w-6 h-6" /> : <>{t.button} <ArrowRight className="w-6 h-6" /></>}
                        </button>
                      </form>
                    </div>

                    <div className="flex items-center gap-3 px-6 py-4 bg-brand-50/50 rounded-2xl border border-brand-100/30">
                      <BookOpen className="w-5 h-5 text-brand-primary shrink-0" />
                      <p className="text-sm font-bold text-brand-dark leading-tight italic">
                        {t.leadMagnet}
                      </p>
                    </div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest text-center font-black">{t.notice}</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="hidden lg:block relative animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <div className="w-[500px] h-[640px] bg-brand-50 rounded-[4rem] overflow-hidden relative shadow-2xl shadow-gray-200">
                <img 
                  src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=2040&auto=format&fit=crop" 
                  alt="Accessible support" 
                  className="w-full h-full object-cover grayscale opacity-90"
                />
              </div>
              <div className="absolute -bottom-10 -left-10 bg-white p-12 rounded-[3.5rem] shadow-2xl max-w-xs border border-gray-50 ring-2 ring-black/5">
                <p className="text-black font-display font-extrabold text-3xl mb-4 tracking-tighter">{t.priceTag}</p>
                <p className="text-black text-sm font-light leading-relaxed">{t.whyNowText}</p>
              </div>
            </div>
          </div>
        </section>

        {/* VISION SECTION */}
        <section className="bg-black py-32 sm:py-48 px-6 overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-start mb-24">
              <div>
                <h2 className="text-4xl sm:text-6xl font-display font-extrabold mb-10 leading-tight text-white tracking-tighter">{t.visionTitle}</h2>
                <div className="w-16 h-2 bg-brand-primary rounded-full"></div>
              </div>
              <p className="text-2xl sm:text-3xl font-light text-white/60 leading-relaxed pr-10">
                {t.visionSubtitle}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {[
                { icon: <Wallet className="w-8 h-8" />, title: t.pillar1Title, text: t.pillar1Text },
                { icon: <ShieldCheck className="w-8 h-8" />, title: t.pillar2Title, text: t.pillar2Text },
                { icon: <Globe className="w-8 h-8" />, title: t.pillar3Title, text: t.pillar3Text },
              ].map((pillar, i) => (
                <div key={i} className="bg-white/5 p-10 rounded-[2.5rem] border border-white/10 hover:bg-white/10 transition-all group">
                  <div className="text-brand-primary mb-8 group-hover:scale-110 transition-transform">{pillar.icon}</div>
                  <h3 className="text-2xl font-display font-bold text-white mb-4 tracking-tight">{pillar.title}</h3>
                  <p className="text-white/40 font-light leading-relaxed">{pillar.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* WHY NOW */}
        <section className="py-32 sm:py-48 px-6 max-w-7xl mx-auto border-b border-gray-100">
           <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
              <Sparkles className="w-12 h-12 text-brand-primary mb-8" />
              <h2 className="text-4xl sm:text-5xl font-display font-extrabold text-black mb-10 tracking-tighter">{t.whyNowTitle}</h2>
              <p className="text-xl sm:text-2xl text-gray-700 font-light leading-relaxed">
                {t.whyNowText}
              </p>
           </div>
        </section>

        {/* FAQ SECTION */}
        <section className="py-32 sm:py-48 px-6 max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-black mb-20 text-center tracking-tighter">{t.faqTitle}</h2>
          <div className="space-y-2">
            <FAQItem q={t.faq1Q} a={t.faq1A} />
            <FAQItem q={t.faq2Q} a={t.faq2A} />
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="py-24 px-6 sm:px-12 relative z-[120] border-t border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-20">
          <div className="text-left">
            <div className="flex items-center gap-3 mb-10">
              <div className="w-5 h-5 bg-brand-primary rounded-md"></div>
              <span className="text-lg font-display font-extrabold tracking-tight text-black uppercase">{t.brandName}</span>
            </div>
            <p className="text-black text-sm leading-relaxed max-w-xs font-light">
              {t.footerDesc}
            </p>
          </div>
          
          <div className="flex flex-wrap gap-x-12 gap-y-6 text-[10px] font-black uppercase tracking-[0.3em] text-black items-start">
            <button onClick={() => setActiveModal('LEGAL')} className="hover:text-brand-primary transition-colors">{t.legalNotice}</button>
            <button onClick={() => setActiveModal('PRIVACY')} className="hover:text-brand-primary transition-colors">{t.privacyPolicy}</button>
            <button onClick={() => setActiveModal('COOKIES')} className="hover:text-brand-primary transition-colors">{t.cookiesPolicy}</button>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto mt-24 pt-10 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-6 text-[8px] font-bold uppercase tracking-[0.5em] text-black/60">
          <span>© 2025 {t.brandName}. Democratizando el bienestar humano.</span>
          <span className="hidden sm:inline uppercase">{t.empathyStandard}</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
