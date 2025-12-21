
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
    priceTag: "Growth sessions for just €20/hour.",
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
    legalContent: `Welcome to the website of ASOCIACION ESTUDIANTIL JUNIOR NEXIO (hereinafter NEXIO) with Tax Identification Number G75579508 and address at PS/ URIBITARTE, 6 48001 BILBAO (BIZKAIA). Contact by mail at contact@team-nexio.com and registered in the Registry of Associations of Bizkaia with the number AS/B/26060/2025.

Intellectual Property
The contents of this website, texts, images, sounds, animations, etc. as well as its graphic design and its source code are protected by Spanish legislation on intellectual and industrial property rights in favor of the companies that make up NEXIO. It is therefore prohibited its reproduction, distribution or public communication, totally or partially, without the express authorization of NEXIO.

Web content and links
At NEXIO we are not responsible for the misuse made of the contents of our website, being exclusive responsibility of the person who accesses them or uses them. We neither assume responsibility for the information contained on the third party´s web pages that can be accessed by links or search engines from this Web site.

Update and modification of the website
NEXIO, reserves the right to modify or remove, without prior notice, both the information contained on your website and its configuration and presentation, without assuming any responsibility for it.

Indications on technical aspects
NEXIO assumes no responsibility that can be derived from technical problems or failures in computer equipment that occur during connection to the Internet network, as well as damages that could be caused by third parties through illegitimate intrusions outside the control of NEXIO. We are also exempt from any responsibility for possible damages that the user may suffer as a result of errors, defects or omissions in the information we provide when coming from sources outside us.`,
    privacyContent: `Identification of the data controller:
Asociación Estudiantil Junior Empresa NEXIO (hereinafter “NEXIO”) with NIF ID G75579508 and domicile in Paseo Uribitarte 6, 48001 Bilbao (Bizkaia). Contact: contact@team-nexio.com

Who is responsible for the processing of your data?
This privacy policy applies to all personal data that the data subject provides to NEXIO. The purpose of NEXIO’s Privacy Policy is to give transparency to information on how we process your personal data in compliance with the current data protection regulations.

For what purpose do we process your personal data and with what legitimacy?
NEXIO has a Record of Processing Activities where each of the following processing are detailed:

• MEMBERS: Management of personal data of members. (Legitimacy: Art. 6.1 b GDPR - Performance of a contract).
• CONTACT PEOPLE: Management of the contacts database. (Legitimacy: Art. 6.1 f GDPR - Legitimate interest).
• MANAGEMENT OF EVENTS: Registering and management of participants. (Legitimacy: Art. 6.1 a GDPR - Consent / Art. 6.1 f GDPR - Legitimate interest for promotion).
• ACCOUNTABILITY: Administrative and accounting management. (Legitimacy: Art. 6.1 b GDPR - Performance of a contract).

How long do we store your personal data?
NEXIO will store the data during the relationship with the organization and thereafter according to archive and documentation regulations.

Who has access to your personal data?
NEXIO may make transfers to Public Administrations in cases required by law.

What are the rights of those affected?
You may exercise rights of: Access, Rectification, Deletion, Limitation, Objection, and Portability. Requests can be sent to contact@team-nexio.com.

Unsubscribe from commercial communications
Revoke consent at any time via the link in communications or by emailing contact@team-nexio.com.

Security measures
NEXIO has implemented technical and organizational security measures necessary to guarantee the safety of your personal data.

Modification of the Privacy Policy
NEXIO may modify this policy. Last update: 27, March of 2025.`,
    cookiesContent: `The JUNIOR ENTERPRISE STUDENT ASSOCIATION Nexio (hereinafter, Nexio) would like to inform you about the use of cookies on its websites.

Cookies allow a website to store and retrieve information about a user’s or device’s browsing habits.

Types of Cookies:
• Technical cookies
• Personalization cookies
• Analytical cookies
• Advertising cookies
• Behavioral advertising cookies

Cookies Exempt from Consent:
Under Article 22.2 of Law 34/2002 (LSSI), certain technical cookies (user input, authentication, security, load balancing, UI customization) are exempt from explicit consent.

Cookies Used:
• WordPress (cookillian_opt_*, wordpress_test_cookie, wp-settings-*, comment_author_*, wordpress_*): Strictly necessary for functionality and preference storage.
• Web analytics: Measures user numbers, page views, and frequency.

Acceptance:
By continuing, you accept the use of cookies.
• Accept: Notice hidden.
• Do not accept: Website may not function correctly.

Modify Settings:
You can restrict or block cookies through your browser settings (Chrome, Firefox, Safari, Edge) or tools like Ghostery.`,
    close: "Close"
  },
  es: {
    comingSoon: "Próximamente",
    title1: "El espacio para hablar.",
    title2: "El apoyo para crecer.",
    subtitle: "Conecta con mentores empáticos para obtener apoyo en bienestar y crecimiento emocional de forma asequible y personalizada.",
    priceTag: "Sesiones de apoyo por solo 20€/hora.",
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
    legalContent: `Bienvenido al sitio web de la ASOCIACIÓN ESTUDIANTIL JUNIOR NEXIO (en adelante NEXIO) con Número de Identificación Fiscal G75579508 y domicilio en PS/ URIBITARTE, 6 48001 BILBAO (BIZKAIA). Contacto por correo en contact@team-nexio.com e inscrita en el Registro de Asociaciones de Bizkaia con el número AS/B/26060/2025.

Propiedad Intelectual
Los contenidos de este sitio web, textos, imágenes, sonidos, animaciones, etc., así como su diseño gráfico y su código fuente están protegidos por la legislación española sobre los derechos de propiedad intelectual e industrial a favor de las empresas que forman NEXIO. Queda, por tanto, prohibida su reproducción, distribución o comunicación pública, total o parcial, sin la autorización expresa de NEXIO.

Contenido de la web y enlaces
En NEXIO no nos responsabilizamos del mal uso que se realice de los contenidos de nuestra página web, siendo responsabilidad exclusiva de la persona que accede a ellos o los utiliza. Tampoco asumimos ninguna responsabilidad por la información contenida en las páginas web de terceros a las que se pueda acceder por enlaces o buscadores desde este sitio Web.

Actualización y modificación del sitio web
NEXIO, se reserva el derecho de modificar o eliminar, sin previo aviso, tanto la información contenida en su sitio web como su configuración y presentación, sin asumir ninguna responsabilidad por ello.

Indicaciones sobre aspectos técnicos
NEXIO no asume ninguna responsabilidad que se pueda derivar de problemas técnicos o fallos en los equipos informáticos que se produzcan durante la conexión a la red de Internet, así como de los daños que pudieran ser causados por terceras personas mediante intromisiones ilegítimas fuera del control de NEXIO. También quedamos exonerados de cualquier responsabilidad ante posibles daños o perjuicios que pueda sufrir el usuario a consecuencia de errores, defectos u omisiones en la información que facilitemos cuando proceda de fuentes ajenas a nosotros.`,
    privacyContent: `Identificación del responsable del tratamiento:
Asociación Estudiantil Junior Empresa NEXIO (en adelante “NEXIO”) con NIF G75579508 y domicilio en Paseo Uribitarte 6, 48001 Bilbao (Bizkaia). Contacto: contact@team-nexio.com

¿Quién es el responsable del tratamiento de sus datos?
Esta política de privacidad se aplica a todos los datos personales que el interesado facilite a NEXIO. El objetivo es dar transparencia a la información sobre cómo tratamos sus datos personales en cumplimiento de la normativa vigente.

¿Con qué finalidad tratamos sus datos personales y con qué legitimación?
NEXIO dispone de un Registro de Actividades de Tratamiento:

• MIEMBROS: Gestión de datos personales de miembros. (Legitimación: Art. 6.1 b RGPD - Ejecución de contrato).
• PERSONAS DE CONTACTO: Gestión de la base de datos de contactos. (Legitimación: Art. 6.1 f RGPD - Interés legítimo).
• GESTIÓN DE EVENTOS: Registro y gestión de participantes. (Legitimación: Art. 6.1 a RGPD - Consentimiento / Art. 6.1 f RGPD - Interés legítimo para promoción).
• CONTABILIDAD: Gestión administrativa y contable. (Legitimación: Art. 6.1 b RGPD - Ejecución de contrato).

¿Cuánto tiempo conservamos sus datos?
Se conservarán durante la relación con la organización y posteriormente según las normativas de archivo y documentación.

Derechos de los afectados:
Puede ejercer sus derechos de Acceso, Rectificación, Supresión, Limitación, Oposición y Portabilidad enviando un correo a contact@team-nexio.com.

Baja de comunicaciones comerciales:
Puede revocar su consentimiento en cualquier momento a través del enlace en las comunicaciones o escribiendo a contact@team-nexio.com.

Medidas de seguridad:
NEXIO ha implementado las medidas técnicas y organizativas necesarias para garantizar la seguridad de sus datos personales.

Última actualización: 27 de marzo de 2025.`,
    cookiesContent: `La ASOCIACIÓN ESTUDIANTIL JUNIOR Nexio (en adelante, Nexio) desea informarle sobre el uso de cookies en sus sitios web.

Las cookies permiten almacenar y recuperar información sobre los hábitos de navegación de un usuario o de su equipo.

Tipos de Cookies:
• Técnicas
• De personalización
• Analíticas
• Publicitarias
• De publicidad comportamental

Cookies exentas de consentimiento:
Según el Art. 22.2 de la Ley 34/2002 (LSSI), las cookies técnicas (entrada del usuario, autenticación, seguridad, equilibrio de carga, personalización de la interfaz) no requieren consentimiento explícito.

Cookies utilizadas:
• WordPress (cookillian_opt_*, wordpress_test_cookie, wp-settings-*, comment_author_*, wordpress_*): Estrictamente necesarias para el funcionamiento y preferencias.
• Analítica web: Mide número de usuarios y frecuencia de visitas.

Aceptación:
Al continuar, acepta el uso de cookies.
• Aceptar: El aviso no se mostrará más en la sesión.
• No aceptar: La web no funcionará correctamente.

Configuración:
Puede restringir o bloquear las cookies a través de la configuración de su navegador o herramientas como Ghostery.`,
    close: "Cerrar"
  },
  de: {
    comingSoon: "Demnächst verfügbar",
    title1: "Raum zum Reden.",
    title2: "Unterstützung zum Wachsen.",
    subtitle: "Verbinden Sie sich mit empathischen Mentoren für erschwingliche, personalisierte Wohlfühl-Unterstützung und emotionales Wachstum.",
    priceTag: "Sitzungen für nur 20€/Stunde.",
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
    aiPrompt: (name: string) => `Erzeuge eine sehr kurze, herzliche und unterstützende Dankesnachricht auf Deutsch für eine person namens "${name}", die sich gerade auf die Warteliste für eine Wohlfühl-Community namens Pluravita gesetzt hat. Betone Wachstum und persönliche Unterstützung. Erwähne KEINE Therapie, klinische Versorgung, medizinische Diagnose oder psychologische Behandlung. Fokus auf Wohlbefinden.`,
    footerRights: "Alle Rechte vorbehalten.",
    brandName: "Pluravita Community",
    legalContent: `Willkommen auf der Website der ASOCIACION ESTUDIANTIL JUNIOR NEXIO (im Folgenden NEXIO) mit der Steuernummer G75579508 und Sitz in PS/ URIBITARTE, 6 48001 BILBAO (BIZKAIA). Kontakt per E-Mail unter contact@team-nexio.com, eingetragen im Vereinsregister von Bizkaia unter der Nummer AS/B/26060/2025.

Geistiges Eigentum
Die Inhalte dieser Website, Texte, Bilder, Töne, Animationen usw. sowie das grafische Design und der Quellcode sind durch die spanische Gesetzgebung über geistige und gewerbliche Eigentumsrechte zugunsten der Unternehmen, aus denen NEXIO besteht, geschützt. Eine Vervielfältigung, Verbreitung oder öffentliche Wiedergabe, ganz oder teilweise, ohne ausdrückliche Genehmigung von NEXIO ist daher untersagt.

Webinhalte und Links
Wir bei NEXIO sind nicht verantwortlich für den Missbrauch der Inhalte unserer Website; dieser liegt in der ausschließlichen Verantwortung der Person, die darauf zugreift oder sie nutzt. Wir übernehmen auch keine Verantwortung für Informationen auf Webseiten Dritter, auf die über Links oder Suchmaschinen von dieser Website aus zugegriffen werden kann.

Aktualisierung und Änderung der Website
NEXIO behält sich das Recht vor, die auf der Website enthaltenen Informationen sowie deren Konfiguration und Präsentation ohne vorherige Ankündigung zu ändern oder zu entfernen, ohne dafür eine Verantwortung zu übernehmen.

Hinweise zu technischen Aspekten
NEXIO übernimmt keine Verantwortung für technische Probleme oder Ausfälle an Computergeräten, die während der Verbindung mit dem Internet auftreten, sowie für Schäden, die durch Dritte durch unrechtmäßige Eingriffe außerhalb der Kontrolle von NEXIO verursacht werden könnten. Wir sind auch von jeglicher Verantwortung für mögliche Schäden befreit, die dem Benutzer durch Fehler, Defekte oder Auslassungen in den von uns bereitgestellten Informationen entstehen könnten, wenn diese aus Quellen außerhalb unseres Unternehmens stammen.`,
    privacyContent: `Identifizierung des Verantwortlichen:
Asociación Estudiantil Junior Empresa NEXIO (nachfolgend „NEXIO“) mit NIF G75579508 und Sitz in Paseo Uribitarte 6, 48001 Bilbao (Bizkaia). Kontakt: contact@team-nexio.com

Wer ist für die Verarbeitung Ihrer Daten verantwortlich?
Diese Datenschutzrichtlinie gilt für alle personenbezogenen Daten, die NEXIO zur Verfügung gestellt werden. Ziel ist die Transparenz über die Verarbeitung Ihrer Daten gemäß den geltenden Vorschriften.

Zu welchem Zweck und mit welcher Legitimation verarbeiten wir Ihre Daten?
NEXIO führt ein Verzeichnis von Verarbeitungstätigkeiten:

• MITGLIEDER: Verwaltung von Mitgliederdaten. (Rechtmäßigkeit: Art. 6.1 b DSGVO - Vertragserfüllung).
• KONTAKTPERSONEN: Verwaltung der Kontaktdatenbank. (Rechtmäßigkeit: Art. 6.1 f DSGVO - Berechtigtes Interesse).
• EVENT-MANAGEMENT: Registrierung und Verwaltung von Teilnehmern. (Rechtmäßigkeit: Art. 6.1 a DSGVO - Einwilligung / Art. 6.1 f DSGVO - Berechtigtes Interesse für Promotion).
• BUCHHALTUNG: Administrative und buchhalterische Verwaltung. (Rechtmäßigkeit: Art. 6.1 b DSGVO - Vertragserfüllung).

Wie lange speichern wir Ihre Daten?
Daten werden während der Beziehung zur Organisation und danach gemäß den Archivierungsvorschriften gespeichert.

Rechte der Betroffenen:
Sie können Ihre Rechte auf Auskunft, Berichtigung, Löschung, Einschränkung, Widerspruch und Übertragbarkeit unter contact@team-nexio.com ausüben.

Abmeldung von Werbe-Kommunikation:
Widerrufen Sie Ihre Einwilligung jederzeit über den Link in den Nachrichten oder per E-Mail an contact@team-nexio.com.

Sicherheitsmaßnahmen:
NEXIO hat technische und organisatorische Sicherheitsmaßnahmen implementiert, um den Schutz Ihrer Daten zu gewährleisten.

Letzte Aktualisierung: 27. März 2025.`,
    cookiesContent: `Die JUNIOR ENTERPRISE STUDENT ASSOCIATION Nexio (nachfolgend Nexio) informiert Sie über die Verwendung von Cookies auf ihren Websites.

Cookies ermöglichen das Speichern und Abrufen von Informationen über Surfgewohnheiten eines Nutzers oder Geräts.

Arten von Cookies:
• Technische Cookies
• Personalisierungs-Cookies
• Analyse-Cookies
• Werbe-Cookies
• Verhaltensbasierte Werbe-Cookies

Einwilligungsfreie Cookies:
Gemäß Art. 22.2 LSSI sind technische Cookies (Nutzereingaben, Authentifizierung, Sicherheit, Lastausgleich, UI-Anpassung) von der ausdrücklichen Einwilligung befreit.

Verwendete Cookies:
• WordPress (cookillian_opt_*, wordpress_test_cookie, wp-settings-*, comment_author_*, wordpress_*): Notwendig für Funktionen und Einstellungen.
• Web-Analyse: Misst Nutzerzahlen und Besuchshäufigkeit.

Akzeptanz:
Durch Fortfahren akzeptieren Sie die Cookie-Verwendung.
• Akzeptieren: Hinweis wird ausgeblendet.
• Nicht akzeptieren: Die Website funktioniert möglicherweise nicht korrekt.

Einstellungen ändern:
Sie können Cookies über Ihre Browsereinstellungen (Chrome, Firefox, Safari) oder Tools wie Ghostery blockieren.`,
    close: "Close"
  }
};

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('en');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [status, setStatus] = useState<SubmissionStatus>(SubmissionStatus.IDLE);
  const [welcomeMessage, setWelcomeMessage] = useState<string>('');
  const [cookieStatus, setCookieStatus] = useState<CookieConsentStatus>('UNDECIDED');
  const [activeModal, setActiveModal] = useState<ModalType>(null);

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
        if (['en', 'es', 'de'].includes(browserLang)) {
          setLang(browserLang as Language);
        } else {
          setLang('en');
        }
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
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });
      setWelcomeMessage(aiResponse.text || "Thank you.");
      setStatus(SubmissionStatus.SUCCESS);
    } catch (error) {
      console.error(error);
      setStatus(SubmissionStatus.ERROR);
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
          <div className="text-stone-600 leading-relaxed mb-8 whitespace-pre-wrap text-sm sm:text-base">
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
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-stone-50 font-sans relative overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none opacity-50">
          <div className="ocean"><div className="wave"></div><div className="wave"></div></div>
        </div>
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

  const MarqueeItem = () => (
    <div className="flex items-center">
      <span className="mx-8 text-sm font-bold tracking-widest uppercase flex items-center gap-4">
        <span className="w-2 h-2 rounded-full bg-teal-400"></span>
        {t.comingSoon}
      </span>
      <span className="mx-8 text-sm font-bold tracking-widest uppercase flex items-center gap-4">
        <span className="w-2 h-2 rounded-full bg-teal-400"></span>
        {t.comingSoon}
      </span>
      <span className="mx-8 text-sm font-bold tracking-widest uppercase flex items-center gap-4">
        <span className="w-2 h-2 rounded-full bg-teal-400"></span>
        {t.comingSoon}
      </span>
      <span className="mx-8 text-sm font-bold tracking-widest uppercase flex items-center gap-4">
        <span className="w-2 h-2 rounded-full bg-teal-400"></span>
        {t.comingSoon}
      </span>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col font-sans relative bg-stone-50 overflow-x-hidden">
      {/* Fixed Background Layer */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden select-none">
        <div className="ocean"><div className="wave"></div><div className="wave"></div></div>
      </div>

      {renderModal()}

      {cookieStatus === 'UNDECIDED' && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-stone-900/95 backdrop-blur-md">
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

      {/* Marquee Banner */}
      <div className="bg-teal-900 text-teal-50 py-3 overflow-hidden relative z-[50] flex">
        <div className="animate-marquee whitespace-nowrap flex">
          <MarqueeItem />
          <MarqueeItem />
        </div>
      </div>

      {/* Navigation */}
      <nav className="w-full py-6 px-4 sm:px-8 max-w-7xl mx-auto flex justify-between items-center relative z-[60]">
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
          <span className="text-xl font-serif font-bold tracking-widest text-teal-900 text-shadow-sm">PLURAVITA</span>
        </div>
        <div className="flex items-center gap-2 text-stone-400 text-xs font-medium uppercase tracking-tighter bg-white/70 px-3 py-1.5 rounded-full border border-stone-100 backdrop-blur-sm shadow-sm">
          <Globe className="w-3 h-3" />
          <button onClick={() => setLang('en')} className={`${lang === 'en' ? 'text-teal-700 font-bold' : ''} hover:text-stone-600 transition-colors`}>EN</button>
          <span>/</span>
          <button onClick={() => setLang('es')} className={`${lang === 'es' ? 'text-teal-700 font-bold' : ''} hover:text-stone-600 transition-colors`}>ES</button>
          <span>/</span>
          <button onClick={() => setLang('de')} className={`${lang === 'de' ? 'text-teal-700 font-bold' : ''} hover:text-stone-600 transition-colors`}>DE</button>
        </div>
      </nav>

      {/* Hero / Form Section */}
      <main className="flex-grow flex flex-col justify-center items-center relative z-[100] min-h-[60vh] pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 text-center w-full">
          <h1 className="text-4xl sm:text-6xl font-serif font-bold text-stone-900 mb-6 leading-tight">
            {t.title1} <br/><span className="text-teal-700">{t.title2}</span>
          </h1>
          <p className="text-lg text-stone-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            {t.subtitle}
            <span className="block mt-2 font-medium text-teal-800">{t.priceTag}</span>
          </p>

          <div className="max-w-md mx-auto relative z-[110]">
            {status === SubmissionStatus.SUCCESS ? (
              <div className="bg-teal-50 border border-teal-100 p-8 rounded-2xl text-left shadow-sm animate-fade-in">
                <div className="flex items-center gap-3 text-teal-800 font-semibold mb-4">
                  <Sparkles className="w-5 h-5" />
                  <span>{t.successTitle}</span>
                </div>
                <p className="text-teal-700 text-sm italic leading-relaxed">"{welcomeMessage}"</p>
                <button 
                  onClick={() => {
                    setStatus(SubmissionStatus.IDLE);
                    setName('');
                    setEmail('');
                  }} 
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
                  className="px-4 py-4 rounded-xl border border-stone-200 outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-500 transition-all bg-white text-stone-900 placeholder:text-stone-400 block w-full shadow-sm" 
                />
                <input 
                  type="email" 
                  placeholder={t.emailPlaceholder} 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  required 
                  className="px-4 py-4 rounded-xl border border-stone-200 outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-500 transition-all bg-white text-stone-900 placeholder:text-stone-400 block w-full shadow-sm" 
                />
                <div className="bg-stone-100/80 p-4 rounded-xl text-[11px] text-stone-500 text-left border border-stone-200 leading-normal select-none">
                  <strong>Notice:</strong> {t.notice}
                </div>
                <button 
                  type="submit" 
                  disabled={status === SubmissionStatus.LOADING} 
                  className="py-4 bg-teal-700 hover:bg-teal-800 text-white rounded-xl flex justify-center items-center gap-2 font-bold transition-all shadow-lg shadow-teal-700/20 active:scale-95 disabled:opacity-70 animate-vibrate-jump w-full"
                >
                  {status === SubmissionStatus.LOADING ? (
                    <Loader2 className="animate-spin w-5 h-5" />
                  ) : (
                    <>{t.button} <ArrowRight className="w-5 h-5" /></>
                  )}
                </button>
              </form>
            )}
            <p className="mt-6 text-[11px] text-stone-400 uppercase tracking-widest font-medium select-none">{t.brandName}</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-12 px-8 border-t border-stone-200 flex flex-col md:flex-row justify-between items-center text-stone-500 text-sm bg-white/50 backdrop-blur-sm relative z-[120]">
        <p>© 2025 Pluravita. {t.footerRights}</p>
        <div className="flex gap-8 mt-6 md:mt-0 font-medium">
          <button onClick={() => setActiveModal('LEGAL')} className="hover:text-teal-700 transition-colors">{t.legalNotice}</button>
          <button onClick={() => setActiveModal('PRIVACY')} className="hover:text-teal-700 transition-colors">{t.privacyPolicy}</button>
          <button onClick={() => setActiveModal('COOKIES')} className="hover:text-teal-700 transition-colors">{t.cookiesPolicy}</button>
        </div>
      </footer>
    </div>
  );
};

export default App;
