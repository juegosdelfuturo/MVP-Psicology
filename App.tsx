
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { SubmissionStatus } from './types';
import { GoogleGenAI } from "@google/genai";
import { 
  Sparkles, ArrowRight, Loader2, X, Cookie, Globe, 
  ShieldAlert, CheckCircle2, ChevronDown, Heart, 
  ShieldCheck, Coins, MessageSquare, Timer, Zap
} from 'lucide-react';

type ModalType = 'LEGAL' | 'PRIVACY' | 'COOKIES' | null;
type CookieConsentStatus = 'UNDECIDED' | 'ACCEPTED' | 'REJECTED';
type Language = 'en' | 'es' | 'de';

const translations = {
  en: {
    comingSoon: "Coming Soon",
    title1: "The space to talk.",
    title2: "The support to grow.",
    subtitle: "Connect with empathetic mentors for affordable, personalized well-being support and emotional growth.",
    priceTag: "Growth sessions for just €20/hour.",
    namePlaceholder: "Your full name",
    emailPlaceholder: "Your email",
    notice: "Notice: Pluravita is a coaching and well-being connection platform. We do not provide clinical therapy or medical services.",
    button: "Join the Waitlist",
    successTitle: "You're in!",
    defaultWelcome: "Thank you for joining our community! We are excited to support your growth journey.",
    registerAnother: "Register another person",
    legalNotice: "Legal Notice",
    privacyPolicy: "Privacy Policy",
    cookiesPolicy: "Cookies Policy",
    cookieTitle: "Privacy & Cookies",
    cookieDesc: "To ensure a safe environment, we use essential cookies. Acceptance is required to access the Pluravita platform.",
    cookieBtnAccept: "I accept",
    cookieBtnReject: "Decline",
    restrictedTitle: "Access Restricted",
    restrictedDesc: "For safety reasons, cookie acceptance is required to explore Pluravita.",
    restrictedAction: "Accept and proceed",
    aiPrompt: (name: string) => `Generate a very short, warm, and supportive thank you message in English for someone named "${name}" who has just joined a waitlist for a well-being and coaching community called Pluravita. Focus on well-being and growth. Max 25 words.`,
    footerRights: "All rights reserved.",
    brandName: "Pluravita Community",
    errorMsg: "Submission failed. Please check your connection.",
    visionTitle: "A new paradigm for well-being.",
    visionText: "We believe mental support shouldn't be a privilege. Pluravita is being built to bridge the gap between self-care and clinical therapy, offering a third space for human connection.",
    pillar1Title: "Human Connection",
    pillar1Text: "No algorithms, just real people. Connect with mentors who share your language and life context.",
    pillar2Title: "Absolute Privacy",
    pillar2Text: "Your conversations are sacred. We prioritize security and anonymity from the ground up.",
    pillar3Title: "Radical Access",
    pillar3Text: "By keeping costs at €20/hour, we make quality emotional support accessible to anyone, anywhere.",
    faqTitle: "F.A.Q.",
    faq1Q: "Is this therapy?",
    faq1A: "No. Our mentors provide emotional support and life coaching. We do not provide medical diagnosis or psychiatric treatment.",
    faq2Q: "How are mentors selected?",
    faq2A: "We vet our community for empathy, active listening skills, and verified life experience.",
    legalContent: "This website is operated by the Pluravita Community. All content is for informational purposes. For inquiries, please contact our support team. The provider reserves the right to modify services and terms at any time without prior notice.",
    privacyContent: "We value your privacy. Your data is collected solely for waitlist management and service updates. We do not sell your personal information to third parties. You may request data deletion at any time.",
    cookiesContent: "We use strictly necessary cookies to manage session security and user preferences. Analytical cookies may be used to improve site performance. You can manage your preferences through your browser settings.",
    close: "Close",
    earlyBirdTitle: "Early Bird Offer",
    earlyBirdDesc: "25% OFF forever for the next 15 members.",
    earlyBirdSpots: "Only {n} spots left!",
    earlyBirdCTA: "Claim discount"
  },
  es: {
    comingSoon: "Próximamente",
    title1: "El espacio para hablar.",
    title2: "El apoyo para crecer.",
    subtitle: "Conecta con mentores empáticos para obtener apoyo en bienestar y crecimiento emocional de forma asequible y personalizada.",
    priceTag: "Sesiones de apoyo por solo 20€/hora.",
    namePlaceholder: "Nombre completo",
    emailPlaceholder: "Correo electrónico",
    notice: "Aviso: Pluravita es una plataforma de bienestar. No proporcionamos terapia clínica ni servicios médicos.",
    button: "Unirse a la lista",
    successTitle: "¡Ya estás dentro!",
    defaultWelcome: "¡Gracias por unirte! Estamos emocionados de acompañarte en tu crecimiento.",
    registerAnother: "Registrar a otra persona",
    legalNotice: "Aviso Legal",
    privacyPolicy: "Privacidad",
    cookiesPolicy: "Cookies",
    cookieTitle: "Privacidad y Cookies",
    cookieDesc: "Para garantizar un entorno seguro, utilizamos cookies esenciales. Se requiere su aceptación para acceder.",
    cookieBtnAccept: "Acepto",
    cookieBtnReject: "Rechazar",
    restrictedTitle: "Acceso Restringido",
    restrictedDesc: "Por motivos de seguridad, es necesario aceptar las cookies para explorar Pluravita.",
    restrictedAction: "Aceptar y continuar",
    aiPrompt: (name: string) => `Genera un mensaje de agradecimiento corto y cálido en español para ${name} por unirse a Pluravita. Máximo 25 palabras.`,
    footerRights: "Todos los derechos reservados.",
    brandName: "Comunidad Pluravita",
    errorMsg: "Error en el envío.",
    visionTitle: "Un nuevo paradigma de bienestar.",
    visionText: "Creemos que el apoyo mental no debe ser un privilegio. Pluravita nace para cerrar la brecha entre el autocuidado y la terapia clínica.",
    pillar1Title: "Conexión Humana",
    pillar1Text: "Sin algoritmos, solo personas reales. Conecta con mentores que comparten tu idioma y contexto de vida.",
    pillar2Title: "Privacidad Absoluta",
    pillar2Text: "Tus conversaciones son sagradas. Priorizamos la seguridad y el anonimato desde el primer día.",
    pillar3Title: "Acceso Radical",
    pillar3Text: "Al mantener el coste en 20€/hora, hacemos que el apoyo emocional de calidad sea accesible para todos.",
    faqTitle: "P.F.",
    faq1Q: "¿Es esto terapia?",
    faq1A: "No. Nuestros mentores ofrecen apoyo emocional y coaching. No realizamos diagnósticos médicos ni tratamientos psiquiátricos.",
    faq2Q: "¿Cómo se eligen los mentores?",
    faq2A: "Evaluamos la empatía, la capacidad de escucha activa y la experiencia de vida verificada.",
    legalContent: "Este sitio es operado por la Comunidad Pluravita. Todo el contenido tiene fines informativos. El proveedor se reserva el derecho de modificar los términos en cualquier momento.",
    privacyContent: "Valoramos tu privacidad. Tus datos se utilizan solo para la lista de espera y actualizaciones del servicio. Puedes solicitar su eliminación cuando desees.",
    cookiesContent: "Utilizamos cookies necesarias para la seguridad y preferencias del usuario. Puedes gestionarlas en la configuración de tu navegador.",
    close: "Cerrar",
    earlyBirdTitle: "Oferta Lanzamiento",
    earlyBirdDesc: "25% de DESCUENTO de por vida para los próximos 15 miembros.",
    earlyBirdSpots: "¡Solo quedan {n} plazas!",
    earlyBirdCTA: "Conseguir descuento"
  },
  de: {
    comingSoon: "Demnächst",
    title1: "Raum zum Reden.",
    title2: "Unterstützung zum Wachsen.",
    subtitle: "Verbinden Sie sich mit empathischen Mentoren für erschwingliche, personalisierte Wohlfühl-Unterstützung.",
    priceTag: "Sitzungen für nur 20€/Stunde.",
    namePlaceholder: "Vollständiger Name",
    emailPlaceholder: "E-Mail-Adresse",
    notice: "Hinweis: Keine klinische Therapie oder medizinische Dienste.",
    button: "Auf die Warteliste",
    successTitle: "Willkommen!",
    defaultWelcome: "Vielen Dank für Ihre Anmeldung!",
    registerAnother: "Noch jemanden anmelden",
    legalNotice: "Impressum",
    privacyPolicy: "Datenschutz",
    cookiesPolicy: "Cookies",
    cookieTitle: "Privatsphäre & Cookies",
    cookieDesc: "Um eine sichere Umgebung zu gewährleisten, verwenden wir Cookies. Akzeptanz ist für den Zugriff erforderlich.",
    cookieBtnAccept: "Akzeptieren",
    cookieBtnReject: "Ablehnen",
    restrictedTitle: "Zugriff eingeschränkt",
    restrictedDesc: "Aus Sicherheitsgründen ist die Cookie-Akzeptanz erforderlich.",
    restrictedAction: "Akzeptieren und fortfahren",
    aiPrompt: (name: string) => `Erzeuge eine kurze, herzliche Dankesnachricht auf Deutsch für ${name} von Pluravita. Max 25 Wörter.`,
    footerRights: "Alle Rechte vorbehalten.",
    brandName: "Pluravita Community",
    errorMsg: "Fehler beim Senden.",
    visionTitle: "Ein neues Paradigma für Wohlbefinden.",
    visionText: "Wir glauben, dass mentale Unterstützung kein Privileg sein sollte. Pluravita schließt die Lücke zwischen Selbstfürsorge und klinischer Therapie.",
    pillar1Title: "Menschliche Verbindung",
    pillar1Text: "Keine Algorithmen, nur echte Menschen. Finden Sie Mentoren in Ihrer Sprache.",
    pillar2Title: "Absolute Privatsphäre",
    pillar2Text: "Ihre Gespräche sind heilig. Wir priorisieren Sicherheit von Anfang an.",
    pillar3Title: "Radikaler Zugang",
    pillar3Text: "Mit 20€ pro Stunde machen wir hochwertige emotionale Unterstützung für jeden zugänglich.",
    faqTitle: "F.A.Q.",
    faq1Q: "Ist das Therapie?",
    faq1A: "Nein. Unsere Mentoren bieten Coaching und emotionale Unterstützung, keine medizinische Behandlung.",
    faq2Q: "Wie werden Mentoren ausgewählt?",
    faq2A: "Wir prüfen Empathie, Zuhörfähigkeit und verifizierte Lebenserfahrung.",
    legalContent: "Impressum der Pluravita Community. Alle Inhalte dienen der Information. Der Anbieter behält sich Änderungen vor.",
    privacyContent: "Ihre Daten werden nur für die Warteliste verwendet. Wir geben keine Informationen an Dritte weiter.",
    cookiesContent: "Wir verwenden Cookies für Sicherheit und Präferenzen. Sie können diese im Browser verwalten.",
    close: "Schließen",
    earlyBirdTitle: "Early Bird Angebot",
    earlyBirdDesc: "25% RABATT lebenslang für die nächsten 15 Mitglieder.",
    earlyBirdSpots: "Nur noch {n} Plätze frei!",
    earlyBirdCTA: "Rabatt sichern"
  }
};

const FAQItem: React.FC<{ q: string; a: string }> = ({ q, a }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-stone-200 py-4">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center text-left group"
      >
        <span className="text-lg font-serif font-semibold text-stone-800 group-hover:text-teal-700 transition-colors">{q}</span>
        <ChevronDown className={`w-5 h-5 text-stone-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-48 mt-4 opacity-100' : 'max-h-0 opacity-0'}`}>
        <p className="text-stone-600 leading-relaxed pb-2">{a}</p>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('en');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [status, setStatus] = useState<SubmissionStatus>(SubmissionStatus.IDLE);
  const [welcomeMessage, setWelcomeMessage] = useState<string>('');
  const [cookieStatus, setCookieStatus] = useState<CookieConsentStatus>('UNDECIDED');
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [spotsLeft, setSpotsLeft] = useState(7);
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
        }
      } catch (err) {
        const browserLang = navigator.language.split('-')[0];
        if (['en', 'es', 'de'].includes(browserLang)) setLang(browserLang as Language);
        else setLang('en');
      }
    };
    detectLang();

    const savedConsent = localStorage.getItem('pluravita_cookie_consent');
    if (savedConsent === 'ACCEPTED') setCookieStatus('ACCEPTED');
    else if (savedConsent === 'REJECTED') setCookieStatus('REJECTED');
    
    // Random spot decrement simulation for urgency
    const interval = setInterval(() => {
      setSpotsLeft(prev => prev > 1 ? prev - (Math.random() > 0.9 ? 1 : 0) : 1);
    }, 15000);
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
        body: JSON.stringify({ name, email, language: lang, source: 'Pluravita', offer: 'Early Bird 25% OFF' })
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
      <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fade-in">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 border border-stone-200 overflow-y-auto max-h-[90vh]">
          <div className="flex justify-between items-center mb-6 sticky top-0 bg-white pb-4 border-b border-stone-100">
            <h2 className="text-2xl font-serif font-bold text-stone-900">{title}</h2>
            <button onClick={() => setActiveModal(null)} className="p-2 hover:bg-stone-100 rounded-full transition-colors">
              <X className="w-6 h-6 text-stone-400" />
            </button>
          </div>
          <div className="text-stone-600 leading-relaxed mb-8 whitespace-pre-wrap">
            {content}
          </div>
          <button 
            onClick={() => setActiveModal(null)}
            className="w-full py-3 bg-stone-100 text-stone-900 font-bold rounded-xl hover:bg-stone-200 transition-colors"
          >
            {t.close}
          </button>
        </div>
      </div>
    );
  };

  if (cookieStatus === 'REJECTED') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 p-6">
        <div className="max-w-md bg-white rounded-2xl shadow-2xl p-8 text-center border border-stone-200">
          <ShieldAlert className="w-16 h-16 text-rose-500 mx-auto mb-6" />
          <h1 className="text-2xl font-serif font-bold text-stone-900 mb-4">{t.restrictedTitle}</h1>
          <p className="text-stone-600 mb-8">{t.restrictedDesc}</p>
          <button onClick={handleAcceptCookies} className="w-full py-4 bg-teal-700 text-white rounded-xl font-bold transition-all hover:bg-teal-800">{t.restrictedAction}</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-sans relative bg-stone-50 overflow-x-hidden">
      {/* Visual background layers */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-50">
        <div className="ocean"><div className="wave"></div><div className="wave"></div></div>
      </div>

      {renderModal()}

      {/* Discount Widget */}
      {status !== SubmissionStatus.SUCCESS && cookieStatus === 'ACCEPTED' && (
        <div className="fixed bottom-6 right-6 left-6 sm:left-auto z-[400] animate-fade-in sm:max-w-xs w-full">
          <div className="bg-teal-900 text-white p-5 rounded-3xl shadow-2xl border-t-2 border-teal-400/30 overflow-hidden relative group">
            <div className="absolute -top-4 -right-4 bg-teal-400/10 w-24 h-24 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
            <div className="flex items-start gap-4 relative z-10">
              <div className="bg-teal-400/20 p-2.5 rounded-2xl">
                <Zap className="w-6 h-6 text-teal-300 animate-pulse" />
              </div>
              <div className="flex-1">
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-teal-400 mb-1">{t.earlyBirdTitle}</h4>
                <p className="text-sm font-medium leading-snug mb-3 text-teal-50/90">{t.earlyBirdDesc}</p>
                <div className="flex items-center gap-2 mb-4">
                   <div className="flex-1 h-1.5 bg-teal-950 rounded-full overflow-hidden">
                      <div className="h-full bg-teal-400 transition-all duration-1000" style={{ width: `${(spotsLeft/15)*100}%` }}></div>
                   </div>
                   <span className="text-[10px] font-bold text-teal-400 whitespace-nowrap">{t.earlyBirdSpots.replace('{n}', spotsLeft.toString())}</span>
                </div>
                <button 
                  onClick={scrollToForm}
                  className="w-full py-2.5 bg-white text-teal-950 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-teal-50 active:scale-95 transition-all shadow-lg flex justify-center items-center gap-2"
                >
                  {t.earlyBirdCTA} <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {cookieStatus === 'UNDECIDED' && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-stone-900/95 backdrop-blur-md">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center border border-stone-200 animate-fade-in">
            <Cookie className="w-12 h-12 text-teal-600 mx-auto mb-4" />
            <h2 className="text-2xl font-serif font-bold text-stone-900 mb-2">{t.cookieTitle}</h2>
            <p className="text-stone-600 mb-6 leading-relaxed">{t.cookieDesc}</p>
            <div className="flex flex-col gap-3">
              <button onClick={handleAcceptCookies} className="w-full py-3 bg-teal-700 text-white rounded-xl font-bold transition-transform active:scale-95">{t.cookieBtnAccept}</button>
              <button onClick={handleRejectCookies} className="w-full py-3 text-stone-400 text-sm hover:text-stone-600 transition-colors">{t.cookieBtnReject}</button>
            </div>
          </div>
        </div>
      )}

      {/* Editorial Navigation */}
      <nav className="w-full py-8 px-6 sm:px-12 max-w-7xl mx-auto flex justify-between items-center relative z-[60]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-teal-800 rounded-full flex items-center justify-center text-white font-serif font-bold text-lg">P</div>
          <span className="text-xl font-serif font-bold tracking-widest text-teal-900 uppercase">PLURAVITA</span>
        </div>
        <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-stone-400">
          <button onClick={() => setLang('en')} className={`${lang === 'en' ? 'text-teal-700 border-b-2 border-teal-700' : ''} transition-all pb-1`}>EN</button>
          <button onClick={() => setLang('es')} className={`${lang === 'es' ? 'text-teal-700 border-b-2 border-teal-700' : ''} transition-all pb-1`}>ES</button>
          <button onClick={() => setLang('de')} className={`${lang === 'de' ? 'text-teal-700 border-b-2 border-teal-700' : ''} transition-all pb-1`}>DE</button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="relative z-[100]">
        
        {/* HERO SECTION - Editorial Style */}
        <section className="min-h-[70vh] flex flex-col justify-center px-6 sm:px-12 max-w-7xl mx-auto pt-12 pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase mb-8">
                <Sparkles className="w-3 h-3" />
                {t.comingSoon}
              </div>
              <h1 className="text-6xl sm:text-8xl font-serif font-bold text-stone-900 mb-8 leading-[0.9] tracking-tight">
                {t.title1} <br/>
                <span className="text-teal-700 italic">{t.title2}</span>
              </h1>
              <p className="text-xl text-stone-600 mb-12 max-w-lg leading-relaxed font-light">
                {t.subtitle}
              </p>
              
              <div className="max-w-md" ref={formRef}>
                {status === SubmissionStatus.SUCCESS ? (
                  <div className="bg-white border border-teal-100 p-8 rounded-3xl shadow-xl animate-fade-in">
                    <div className="flex items-center gap-3 text-teal-800 font-bold mb-4">
                      <CheckCircle2 className="w-6 h-6" />
                      <span>{t.successTitle}</span>
                    </div>
                    <p className="text-stone-700 italic leading-relaxed">"{welcomeMessage}"</p>
                    <button 
                      onClick={() => { setStatus(SubmissionStatus.IDLE); setName(''); setEmail(''); }} 
                      className="mt-6 text-xs text-teal-600 hover:text-teal-800 underline font-medium"
                    >
                      {t.registerAnother}
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <input 
                        type="text" placeholder={t.namePlaceholder} value={name} onChange={e => setName(e.target.value)} required 
                        className="flex-1 px-6 py-4 rounded-2xl border-none shadow-sm focus:ring-2 focus:ring-teal-200 outline-none transition-all font-medium placeholder:text-stone-300" 
                      />
                      <input 
                        type="email" placeholder={t.emailPlaceholder} value={email} onChange={e => setEmail(e.target.value)} required 
                        className="flex-1 px-6 py-4 rounded-2xl border-none shadow-sm focus:ring-2 focus:ring-teal-200 outline-none transition-all font-medium placeholder:text-stone-300" 
                      />
                    </div>
                    <button 
                      type="submit" disabled={status === SubmissionStatus.LOADING} 
                      className="w-full py-5 bg-teal-900 hover:bg-teal-950 text-white rounded-2xl flex justify-center items-center gap-2 font-bold text-lg shadow-lg active:scale-[0.98] transition-all disabled:opacity-50"
                    >
                      {status === SubmissionStatus.LOADING ? <Loader2 className="animate-spin w-6 h-6" /> : <>{t.button} <ArrowRight className="w-6 h-6" /></>}
                    </button>
                    <p className="text-[10px] text-stone-400 italic leading-relaxed">{t.notice}</p>
                  </form>
                )}
              </div>
            </div>
            
            <div className="hidden lg:block relative">
              <div className="w-[450px] h-[550px] bg-stone-200 rounded-[4rem] overflow-hidden relative rotate-2 shadow-2xl transition-transform hover:rotate-0 duration-700">
                <img 
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop" 
                  alt="Well-being connection" 
                  className="w-full h-full object-cover grayscale opacity-80 hover:grayscale-0 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-teal-900/20 mix-blend-multiply"></div>
              </div>
              <div className="absolute -bottom-8 -left-8 bg-white p-8 rounded-3xl shadow-2xl max-w-xs -rotate-2">
                <p className="text-stone-900 font-serif font-bold text-xl mb-2">{t.priceTag}</p>
                <p className="text-stone-500 text-sm italic">Making high-quality emotional support a standard, not a luxury.</p>
              </div>
            </div>
          </div>
        </section>

        {/* VISION SECTION */}
        <section className="bg-stone-900 text-stone-50 py-32 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-24 items-center">
              <div>
                <h2 className="text-4xl sm:text-6xl font-serif font-bold mb-8 leading-tight">{t.visionTitle}</h2>
                <div className="w-24 h-1 bg-teal-500 mb-8"></div>
              </div>
              <p className="text-2xl font-light text-stone-400 leading-relaxed italic">
                {t.visionText}
              </p>
            </div>
          </div>
        </section>

        {/* PILLARS SECTION - Unique Layout */}
        <section className="py-32 px-6 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { icon: <MessageSquare className="w-8 h-8" />, title: t.pillar1Title, text: t.pillar1Text },
              { icon: <ShieldCheck className="w-8 h-8" />, title: t.pillar2Title, text: t.pillar2Text },
              { icon: <Coins className="w-8 h-8" />, title: t.pillar3Title, text: t.pillar3Text },
            ].map((pillar, i) => (
              <div key={i} className="group relative">
                <div className="p-10 bg-white rounded-3xl shadow-sm border border-stone-100 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                  <div className="text-teal-700 mb-8">{pillar.icon}</div>
                  <h3 className="text-2xl font-serif font-bold text-stone-900 mb-4">{pillar.title}</h3>
                  <p className="text-stone-600 leading-relaxed">{pillar.text}</p>
                </div>
                {/* Visual decoration */}
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-teal-50 rounded-full -z-10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ SECTION */}
        <section className="py-32 px-6 max-w-3xl mx-auto">
          <h2 className="text-4xl font-serif font-bold text-stone-900 mb-16 text-center">{t.faqTitle}</h2>
          <div className="space-y-4">
            <FAQItem q={t.faq1Q} a={t.faq1A} />
            <FAQItem q={t.faq2Q} a={t.faq2A} />
          </div>
        </section>

      </main>

      {/* Editorial Footer */}
      <footer className="bg-white border-t border-stone-200 py-24 px-6 sm:px-12 relative z-[120]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16">
          <div>
            <div className="flex items-center gap-2 mb-8">
              <div className="w-6 h-6 bg-stone-900 rounded-full"></div>
              <span className="text-xl font-serif font-bold tracking-widest text-stone-900 uppercase">PLURAVITA</span>
            </div>
            <p className="text-stone-500 text-sm leading-relaxed max-w-xs">
              A human-centric community reimagining emotional growth through empathy and transparency.
            </p>
          </div>
          
          <div className="flex flex-col gap-4 text-sm font-bold uppercase tracking-[0.2em] text-stone-400">
            <span className="text-stone-900 text-xs mb-2">Legal</span>
            <button onClick={() => setActiveModal('LEGAL')} className="hover:text-teal-700 text-left transition-colors">{t.legalNotice}</button>
            <button onClick={() => setActiveModal('PRIVACY')} className="hover:text-teal-700 text-left transition-colors">{t.privacyPolicy}</button>
            <button onClick={() => setActiveModal('COOKIES')} className="hover:text-teal-700 text-left transition-colors">{t.cookiesPolicy}</button>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto mt-24 pt-8 border-t border-stone-100 flex justify-between items-center text-[10px] font-bold uppercase tracking-[0.3em] text-stone-300">
          <span>© 2025 Pluravita. {t.footerRights}</span>
          <span>Designed with Empathy</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
