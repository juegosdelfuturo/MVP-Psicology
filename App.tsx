
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { SubmissionStatus } from './types';
import { GoogleGenAI } from "@google/genai";
import { 
  Sparkles, ArrowRight, Loader2, X, Cookie, ShieldAlert, CheckCircle2, ChevronDown, ShieldCheck, Coins, MessageSquare, Zap, Heart
} from 'lucide-react';

type ModalType = 'LEGAL' | 'PRIVACY' | 'COOKIES' | null;
type CookieConsentStatus = 'UNDECIDED' | 'ACCEPTED' | 'REJECTED';
type Language = 'en' | 'es' | 'de';

const translations = {
  en: {
    comingSoon: "Join the Future",
    title1: "Feel better.",
    title2: "Live better.",
    subtitle: "Professional emotional support and life coaching designed for your well-being. Affordable, human, and secure.",
    priceTag: "Sessions from €20/hour.",
    priceNotice: "Better connection leads to a better life. We make it simple.",
    namePlaceholder: "Full Name",
    emailPlaceholder: "Email address",
    notice: "Pluravita: Emotional support, not a medical clinic.",
    button: "Get Early Access",
    successTitle: "Welcome home!",
    defaultWelcome: "Your journey to well-being starts today.",
    registerAnother: "Join with another account",
    legalNotice: "Legal Information",
    privacyPolicy: "Privacy Policy",
    cookiesPolicy: "Cookies Policy",
    legalContent: "Pluravita is a wellness platform. We provide emotional support and coaching services. We are not a medical clinic or emergency service provider.",
    privacyContent: "Your data is treated with the utmost care. We use industry-standard encryption to protect your personal information and never share it without consent.",
    cookiesContent: "We only use essential cookies necessary for the website's security and basic functionality. No tracking cookies are used without your permission.",
    cookieTitle: "Privacy First",
    cookieDesc: "We use essential cookies to ensure your safety and a seamless experience.",
    cookieBtnAccept: "I Accept",
    cookieBtnReject: "Decline",
    restrictedTitle: "Access Restricted",
    restrictedDesc: "We need your consent to provide a secure environment.",
    restrictedAction: "Accept and continue",
    aiPrompt: (name: string) => `Generate a very short, warm, and professional thank you message in English for someone named "${name}" who has just joined a waitlist for a well-being community called Pluravita. Use a friendly therapist-like tone. Max 18 words.`,
    footerRights: "Pluravita. All rights reserved.",
    brandName: "Pluravita",
    visionTitle: "A new standard in emotional health.",
    visionText: "Quality mental support shouldn't be a luxury. We provide a safe haven for human connection and emotional growth.",
    pillar1Title: "Verified Empathy",
    pillar1Text: "Our mentors are selected for their human quality and life experience.",
    pillar2Title: "Safe & Private",
    pillar2Text: "End-to-end security. Your peace of mind is our absolute priority.",
    pillar3Title: "Accessible Support",
    pillar3Text: "Flat rates that allow you to focus on growing, not on the invoice.",
    faqTitle: "Common Questions",
    faq1Q: "Is this professional therapy?",
    faq1A: "No. Pluravita connects you with emotional mentors and life coaches. We complement clinical therapy but do not replace psychiatric treatments.",
    faq2Q: "How soon can I start?",
    faq2A: "We are currently in private beta. Joining the waitlist gives you priority access and exclusive benefits.",
    close: "Close",
    earlyBirdTitle: "Welcome Offer",
    earlyBirdDesc: "25% OFF your first session for the next 15 members.",
    earlyBirdSpots: "Only {n} spots left!",
    earlyBirdCTA: "Claim my discount",
    footerDesc: "Designing clarity. Building connections. Promoting human well-being for a better tomorrow.",
    empathyStandard: "Empathy as a Standard"
  },
  es: {
    comingSoon: "Próximamente",
    title1: "Siéntete mejor.",
    title2: "Vive mejor.",
    subtitle: "Apoyo emocional profesional y coaching diseñado para tu bienestar. Accesible, humano y seguro.",
    priceTag: "Sesiones desde 20€/hora.",
    priceNotice: "Una mejor conexión conduce a una vida mejor. Lo hacemos simple.",
    namePlaceholder: "Nombre completo",
    emailPlaceholder: "Correo electrónico",
    notice: "Aviso: Pluravita es apoyo emocional, no una clínica médica.",
    button: "Unirse a la lista",
    successTitle: "¡Bienvenido/a!",
    defaultWelcome: "Tu camino hacia el bienestar comienza hoy.",
    registerAnother: "Registrar otra cuenta",
    legalNotice: "Información Legal",
    privacyPolicy: "Privacidad",
    cookiesPolicy: "Cookies",
    legalContent: "Pluravita es una plataforma de bienestar. Ofrecemos apoyo emocional y coaching. No somos una clínica médica ni servicio de emergencias.",
    privacyContent: "Tus datos son tratados con el mayor cuidado. Usamos cifrado estándar para proteger tu información y nunca la compartimos sin consentimiento.",
    cookiesContent: "Solo usamos cookies esenciales para la seguridad y funcionalidad básica del sitio. No usamos cookies de rastreo sin permiso.",
    cookieTitle: "Privacidad",
    cookieDesc: "Utilizamos cookies esenciales para garantizar un entorno seguro.",
    cookieBtnAccept: "Aceptar",
    cookieBtnReject: "Rechazar",
    restrictedTitle: "Acceso Restringido",
    restrictedDesc: "Necesitamos tu consentimiento para garantizar la seguridad del sitio.",
    restrictedAction: "Aceptar y continuar",
    aiPrompt: (name: string) => `Genera un mensaje de agradecimiento muy corto, cálido y profesional en español para ${name} por unirse a Pluravita. Usa un tono empático. Máximo 18 palabras.`,
    footerRights: "Pluravita. Todos los derechos reservados.",
    brandName: "Pluravita",
    visionTitle: "Un nuevo estándar en salud emocional.",
    visionText: "El apoyo mental no debe ser un lujo. Creamos un espacio seguro para la conexión humana y el crecimiento.",
    pillar1Title: "Empatía Verificada",
    pillar1Text: "Mentores seleccionados por su calidad humana y experiencia de vida real.",
    pillar2Title: "Seguro y Privado",
    pillar2Text: "Seguridad de extremo a extremo. Tu tranquilidad es nuestra prioridad.",
    pillar3Title: "Apoyo Accesible",
    pillar3Text: "Tarifas claras que te permiten enfocarte en crecer, no en la factura.",
    faqTitle: "Preguntas frecuentes",
    faq1Q: "¿Es esto terapia profesional?",
    faq1A: "No. Pluravita te conecta con mentores emocionales y coaches. Complementamos la terapia clínica pero no sustituimos tratamientos psiquiátricos.",
    faq2Q: "¿Cuándo puedo empezar?",
    faq2A: "Estamos en fase beta privada. Unirte a la lista te da acceso prioritario y beneficios exclusivos.",
    close: "Cerrar",
    earlyBirdTitle: "Oferta de Bienvenida",
    earlyBirdDesc: "25% de DESCUENTO en tu primera sesión para los próximos 15 miembros.",
    earlyBirdSpots: "¡Solo quedan {n}!",
    earlyBirdCTA: "Reclamar mi descuento",
    footerDesc: "Diseñando claridad. Construyendo conexiones. Promoviendo el bienestar humano para un mejor mañana.",
    empathyStandard: "La empatía como estándar"
  },
  de: {
    comingSoon: "Demnächst",
    title1: "Besser fühlen.",
    title2: "Besser leben.",
    subtitle: "Professionelle emotionale Unterstützung und Coaching für Ihr Wohlbefinden. Erschwinglich, menschlich und sicher.",
    priceTag: "Sitzungen ab 20€/Std.",
    priceNotice: "Eine bessere Verbindung führt zu einem besseren Leben. Wir machen es einfach.",
    namePlaceholder: "Vollständiger Name",
    emailPlaceholder: "E-Mail-Adresse",
    notice: "Hinweis: Emotionale Unterstützung, keine medizinische Klinik.",
    button: "Auf die Liste",
    successTitle: "Willkommen!",
    defaultWelcome: "Ihre Reise zum Wohlbefinden beginnt heute.",
    registerAnother: "Weiteres Konto anmelden",
    legalNotice: "Impressum",
    privacyPolicy: "Datenschutz",
    cookiesPolicy: "Cookies",
    legalContent: "Pluravita ist eine Plattform für emotionales Wohlbefinden. Wir sind keine medizinische Einrichtung und bieten keine psychiatrische Hilfe.",
    privacyContent: "Ihre Daten werden mit größter Sorgfalt behandelt. Wir nutzen Verschlüsselung, um Ihre Informationen zu schützen.",
    cookiesContent: "Wir verwenden nur notwendige Cookies für die Sicherheit der Webseite. Keine Werbecookies ohne Zustimmung.",
    cookieTitle: "Datenschutz",
    cookieDesc: "Wir verwenden Cookies für Ihre Sicherheit und ein optimales Erlebnis.",
    cookieBtnAccept: "Akzeptieren",
    cookieBtnReject: "Ablehnen",
    restrictedTitle: "Zugriff eingeschränkt",
    restrictedDesc: "Wir benötigen Ihre Zustimmung für eine sichere Umgebung.",
    restrictedAction: "Akzeptieren",
    aiPrompt: (name: string) => `Erzeuge eine sehr kurze, herzliche und professionelle Dankesnachricht auf Deutsch für ${name} von Pluravita. Max 18 Wörter.`,
    footerRights: "Pluravita. Alle Rechte vorbehalten.",
    brandName: "Pluravita",
    visionTitle: "Ein neuer Standard.",
    visionText: "Mentale Unterstützung sollte kein Luxus sein. Wir schaffen einen sicheren Hafen für menschliche Verbindungen.",
    pillar1Title: "Echte Empathie",
    pillar1Text: "Unsere Mentoren werden nach ihrer menschlichen Qualität ausgewählt.",
    pillar2Title: "Sicher & Privat",
    pillar2Text: "Ihre Privatsphäre ist unsere absolute Priorität.",
    pillar3Title: "Fairer Zugang",
    pillar3Text: "Klare Tarife, damit Sie sich auf Ihr Wachstum konzentrieren können.",
    faqTitle: "Häufige Fragen",
    faq1Q: "Ist das professionelle Therapie?",
    faq1A: "No. Pluravita verbindet Sie mit Mentoren und Coaches, ersetzt aber keine psychiatrische Behandlung.",
    faq2Q: "Wann geht es los?",
    faq2A: "Wir befinden uns in der Beta-Phase. Wartelisten-Mitglieder erhalten bevorzugten Zugang.",
    close: "Schließen",
    earlyBirdTitle: "Willkommensangebot",
    earlyBirdDesc: "25% RABATT auf deine erste Sitzung für die nächsten 15 Mitglieder.",
    earlyBirdSpots: "Nur noch {n} frei!",
    earlyBirdCTA: "Rabatt sichern",
    footerDesc: "Klarheit gestalten. Verbindungen aufbauen. Menschliches Wohlbefinden für ein besseres Morgen fördern.",
    empathyStandard: "Empathie als Standard"
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
  const [spotsLeft, setSpotsLeft] = useState(12);
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
    
    const interval = setInterval(() => {
      setSpotsLeft(prev => prev > 1 ? prev - (Math.random() > 0.97 ? 1 : 0) : 1);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleAcceptCookies = () => {
    localStorage.setItem('pluravita_cookie_consent', 'ACCEPTED');
    setCookieStatus('ACCEPTED');
  };

  const handleRejectCookies = () => {
    localStorage.setItem('pluravita_cookie_consent', 'REJECTED');
    setCookieStatus('REJECTED');
  };

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name) return;
    setStatus(SubmissionStatus.LOADING);

    try {
      const formResponse = await fetch("https://formspree.io/f/xldqwnej", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, language: lang, source: 'Pluravita', offer: 'Early Bird 25% OFF FIRST SESSION' })
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
      case 'LEGAL': 
        title = t.legalNotice; 
        content = t.legalContent; 
        break;
      case 'PRIVACY': 
        title = t.privacyPolicy; 
        content = t.privacyContent; 
        break;
      case 'COOKIES': 
        title = t.cookiesPolicy; 
        content = t.cookiesContent; 
        break;
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

      {/* Floating Welcome Offer */}
      {status !== SubmissionStatus.SUCCESS && cookieStatus === 'ACCEPTED' && (
        <div className="fixed bottom-6 right-6 left-6 sm:left-auto z-[400] animate-fade-in sm:max-w-[320px] w-auto">
          <div className="bg-white text-black p-6 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.12)] border border-gray-100 overflow-hidden group">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-brand-50 p-2 rounded-xl shrink-0">
                  <Zap className="w-4 h-4 text-brand-primary" />
                </div>
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-primary">{t.earlyBirdTitle}</h4>
              </div>
              <p className="text-sm font-semibold leading-relaxed text-black">{t.earlyBirdDesc}</p>
              <div className="flex items-center gap-2">
                 <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-primary transition-all duration-[3000ms]" style={{ width: `${(spotsLeft/15)*100}%` }}></div>
                 </div>
                 <span className="text-[10px] font-bold text-brand-primary uppercase tracking-tighter">{t.earlyBirdSpots.replace('{n}', spotsLeft.toString())}</span>
              </div>
              <button 
                onClick={scrollToForm}
                className="w-full py-3 bg-brand-primary text-white rounded-2xl text-[11px] font-bold uppercase tracking-widest hover:bg-brand-dark active:scale-95 transition-all shadow-lg shadow-brand-primary/10"
              >
                {t.earlyBirdCTA}
              </button>
            </div>
          </div>
        </div>
      )}

      {cookieStatus === 'UNDECIDED' && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-black/5 backdrop-blur-xl">
          <div className="bg-white rounded-[3rem] shadow-2xl max-w-md w-full p-12 text-center border border-white animate-fade-in">
            <Cookie className="w-10 h-10 text-brand-primary mx-auto mb-8" />
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
        <section className="min-h-[75vh] flex flex-col justify-center px-6 sm:px-12 max-w-7xl mx-auto pt-8 pb-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-32 items-center">
            <div className="text-left animate-fade-in">
              <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-brand-50 text-brand-primary rounded-full text-[10px] font-bold tracking-widest uppercase mb-10">
                <Sparkles className="w-3.5 h-3.5" />
                {t.comingSoon}
              </div>
              <h1 className="text-6xl sm:text-7xl lg:text-[100px] font-display font-extrabold text-black mb-8 leading-[1.0] tracking-tighter">
                {t.title1} <br/>
                <span className="text-brand-primary italic font-medium">{t.title2}</span>
              </h1>
              <p className="text-xl sm:text-2xl text-black mb-16 max-w-lg leading-relaxed font-light">
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
                      onClick={() => { setStatus(SubmissionStatus.IDLE); setName(''); setEmail(''); }} 
                      className="mt-10 text-[10px] text-gray-500 hover:text-brand-primary uppercase tracking-widest font-black transition-colors"
                    >
                      {t.registerAnother}
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <input 
                        type="text" placeholder={t.namePlaceholder} value={name} onChange={e => setName(e.target.value)} required 
                        className="flex-1 px-8 py-5 rounded-3xl border border-gray-100 bg-gray-50/30 focus:bg-white focus:border-brand-primary/30 shadow-sm outline-none transition-all font-light text-base placeholder:text-gray-400" 
                      />
                      <input 
                        type="email" placeholder={t.emailPlaceholder} value={email} onChange={e => setEmail(e.target.value)} required 
                        className="flex-1 px-8 py-5 rounded-3xl border border-gray-100 bg-gray-50/30 focus:bg-white focus:border-brand-primary/30 shadow-sm outline-none transition-all font-light text-base placeholder:text-gray-400" 
                      />
                    </div>
                    <button 
                      type="submit" disabled={status === SubmissionStatus.LOADING} 
                      className={`w-full py-5 bg-brand-primary hover:bg-brand-dark text-white rounded-3xl flex justify-center items-center gap-3 font-bold text-lg shadow-xl shadow-brand-primary/10 transition-all disabled:opacity-50 ${status === SubmissionStatus.IDLE ? 'animate-vibrate-jump' : ''}`}
                    >
                      {status === SubmissionStatus.LOADING ? <Loader2 className="animate-spin w-6 h-6" /> : <>{t.button} <ArrowRight className="w-6 h-6" /></>}
                    </button>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest text-center mt-3 font-bold">{t.notice}</p>
                  </form>
                )}
              </div>
            </div>
            
            <div className="hidden lg:block relative animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <div className="w-[500px] h-[640px] bg-brand-50 rounded-[4rem] overflow-hidden relative shadow-2xl shadow-gray-200">
                <img 
                  src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=2040&auto=format&fit=crop" 
                  alt="Well-being" 
                  className="w-full h-full object-cover transition-all duration-1000"
                />
              </div>
              <div className="absolute -bottom-10 -left-10 bg-white p-12 rounded-[3.5rem] shadow-2xl max-w-xs border border-gray-50 ring-1 ring-gray-100">
                <p className="text-black font-display font-extrabold text-3xl mb-4 tracking-tighter">{t.priceTag}</p>
                <p className="text-black text-sm font-light leading-relaxed">{t.priceNotice}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Vision Section */}
        <section className="bg-gray-50/50 py-32 sm:py-48 px-6 border-y border-gray-100">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
              <div>
                <h2 className="text-4xl sm:text-6xl font-display font-extrabold mb-10 leading-tight text-black tracking-tighter">{t.visionTitle}</h2>
                <div className="w-12 h-1.5 bg-brand-primary rounded-full"></div>
              </div>
              <p className="text-2xl sm:text-3xl font-light text-black leading-relaxed pr-10">
                {t.visionText}
              </p>
            </div>
          </div>
        </section>

        {/* Pillars Section */}
        <section className="py-32 sm:py-48 px-6 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            {[
              { icon: <MessageSquare className="w-6 h-6" />, title: t.pillar1Title, text: t.pillar1Text },
              { icon: <ShieldCheck className="w-6 h-6" />, title: t.pillar2Title, text: t.pillar2Text },
              { icon: <Coins className="w-6 h-6" />, title: t.pillar3Title, text: t.pillar3Text },
            ].map((pillar, i) => (
              <div key={i} className="flex flex-col items-start group">
                <div className="bg-brand-50 p-5 rounded-3xl text-brand-primary mb-10 group-hover:scale-110 transition-transform duration-500">
                  {pillar.icon}
                </div>
                <h3 className="text-2xl font-display font-extrabold text-black mb-5 tracking-tight">{pillar.title}</h3>
                <p className="text-black font-light leading-relaxed">{pillar.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
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
        
        <div className="max-w-7xl mx-auto mt-24 pt-10 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-6 text-[8px] font-bold uppercase tracking-[0.5em] text-black">
          <span>© 2025 {t.brandName}. {t.footerRights}</span>
          <span className="hidden sm:inline uppercase">{t.empathyStandard}</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
