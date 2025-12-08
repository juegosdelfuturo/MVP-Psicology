import React, { useState, useCallback, useEffect } from 'react';
import { SubmissionStatus } from './types';
import { generateWelcomeMessage } from './services/geminiService';
import { CheckCircle, ArrowRight, Loader2, X, Cookie, Shield, Scale, FileText } from 'lucide-react';

type ModalType = 'LEGAL' | 'PRIVACY' | 'COOKIES' | null;
type CookieConsentStatus = 'UNDECIDED' | 'ACCEPTED' | 'REJECTED';

const App: React.FC = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<SubmissionStatus>(SubmissionStatus.IDLE);
  const [welcomeMessage, setWelcomeMessage] = useState<string>('');
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [cookieStatus, setCookieStatus] = useState<CookieConsentStatus>('UNDECIDED');

  // Check for existing cookie consent on mount
  useEffect(() => {
    const savedConsent = localStorage.getItem('nexio_cookie_consent');
    if (savedConsent === 'ACCEPTED') {
      setCookieStatus('ACCEPTED');
    } else if (savedConsent === 'REJECTED') {
      setCookieStatus('REJECTED');
    }
    // Default is UNDECIDED
  }, []);

  const handleAcceptCookies = () => {
    localStorage.setItem('nexio_cookie_consent', 'ACCEPTED');
    setCookieStatus('ACCEPTED');
  };

  const handleRejectCookies = () => {
    // We do not save rejection to local storage immediately to ensure the 'blocked' state 
    // is temporary for the session or until they accept, as requested. 
    // Or we can save it, but the UI must remain blocked.
    // Setting state to REJECTED triggers the blocking view.
    setCookieStatus('REJECTED');
  };

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus(SubmissionStatus.LOADING);

    try {
      // Send email to Formspree
      const response = await fetch("https://formspree.io/f/xpwyojap", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      if (!response.ok) {
        throw new Error("Form submission failed");
      }
      
      // Call Gemini for a dynamic welcome message
      const aiMessage = await generateWelcomeMessage();
      setWelcomeMessage(aiMessage);
      
      setStatus(SubmissionStatus.SUCCESS);
      setEmail('');
    } catch (error) {
      console.error(error);
      setStatus(SubmissionStatus.ERROR);
    }
  }, [email]);

  const closeModal = () => setActiveModal(null);

  const renderModalContent = () => {
    switch (activeModal) {
      case 'LEGAL':
        return (
          <>
            <h2 className="text-2xl font-serif font-bold text-stone-900 mb-6 flex items-center gap-2">
              <Scale className="w-6 h-6 text-teal-700" />
              Legal Notice
            </h2>
            <div className="space-y-4 text-stone-600 text-sm leading-relaxed">
              <p>
                Welcome to the website of <strong>ASOCIACION ESTUDIANTIL JUNIOR NEXIO</strong> (hereinafter NEXIO) with Tax Identification Number <strong>G75579508</strong> and address at <strong>PS/ URIBITARTE, 6 48001 BILBAO (BIZKAIA)</strong>. Contact by mail at <a href="mailto:contact@team-nexio.com" className="text-teal-600 underline">contact@team-nexio.com</a> and registered in the Registry of Associations of Bizkaia with the number AS/B/26060/2025.
              </p>
              
              <h3 className="font-bold text-stone-800 text-lg mt-4">Intellectual Property</h3>
              <p>
                The contents of this website, texts, images, sounds, animations, etc. as well as its graphic design and its source code are protected by Spanish legislation on intellectual and industrial property rights in favor of the companies that make up NEXIO. It is therefore prohibited its reproduction, distribution or public communication, totally or partially, without the express authorization of NEXIO.
              </p>

              <h3 className="font-bold text-stone-800 text-lg mt-4">Web content and links</h3>
              <p>
                At NEXIO we are not responsible for the misuse made of the contents of our website, being exclusive responsibility of the person who accesses them or uses them. We neither assume responsibility for the information contained on the third party´s web pages that can be accessed by links or search engines from this Web site.
              </p>

              <h3 className="font-bold text-stone-800 text-lg mt-4">Update and modification of the website</h3>
              <p>
                NEXIO, reserves the right to modify or remove, without prior notice, both the information contained on your website and its configuration and presentation, without assuming any responsibility for it.
              </p>

              <h3 className="font-bold text-stone-800 text-lg mt-4">Indications on technical aspects</h3>
              <p>
                NEXIO assumes no responsibility that can be derived from technical problems or failures in computer equipment that occur during connection to the Internet network, as well as damages that could be caused by third parties through illegitimate intrusions outside the control of NEXIO. We are also exempt from any responsibility for possible damages that the user may suffer as a result of errors, defects or omissions in the information we provide when coming from sources outside us.
              </p>
            </div>
          </>
        );
      case 'PRIVACY':
        return (
          <>
            <h2 className="text-2xl font-serif font-bold text-stone-900 mb-6 flex items-center gap-2">
              <Shield className="w-6 h-6 text-teal-700" />
              Privacy Policy
            </h2>
            <div className="space-y-5 text-stone-600 text-sm leading-relaxed">
              <div className="bg-stone-50 p-4 rounded-lg border border-stone-200">
                <p><strong>Identification of the data controller:</strong></p>
                <p>Asociación Estudiantil Junior Empresa NEXIO (hereinafter “NEXIO”)</p>
                <p>NIF ID: G75579508</p>
                <p>Domicile: Paseo Uribitarte 6, 48001 Bilbao (Bizkaia)</p>
                <p>Contact: <a href="mailto:contact@team-nexio.com" className="text-teal-600 underline">contact@team-nexio.com</a></p>
              </div>

              <h3 className="font-bold text-stone-800 text-lg">Who is responsible for the processing of your data?</h3>
              <p>
                This privacy policy applies to all personal data that the data subject provides to NEXIO, as well as to any natural person interested in the activities and services that NEXIO offers through its web pages and through any other means of communication. The purpose of NEXIO’s Privacy Policy is to give transparency to information on how we process your personal data in compliance with the current data protection regulations.
              </p>

              <h3 className="font-bold text-stone-800 text-lg">For what purpose do we process your personal data and with what legitimacy?</h3>
              <p>NEXIO has a Record of Processing Activities where each of the following processing carried out as the data controller are detailed:</p>
              
              <div className="overflow-x-auto border border-stone-200 rounded-lg">
                <table className="min-w-full divide-y divide-stone-200">
                  <thead className="bg-stone-100">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-bold text-stone-700 uppercase">Processing GDPR</th>
                      <th className="px-3 py-2 text-left text-xs font-bold text-stone-700 uppercase">Purpose GDPR</th>
                      <th className="px-3 py-2 text-left text-xs font-bold text-stone-700 uppercase">Legitimate Basis</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-stone-200 text-xs">
                    <tr>
                      <td className="px-3 py-2 font-medium">MEMBERS</td>
                      <td className="px-3 py-2">Management of personal data of members</td>
                      <td className="px-3 py-2">Art. 6.1 b) processing is necessary for the performance of a contract to which the data subject is party...</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 font-medium">CONTACT PEOPLE</td>
                      <td className="px-3 py-2">Management of the contacts database...</td>
                      <td className="px-3 py-2">Art. 6.1 f) processing is necessary for the purposes of the legitimate interests...</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 font-medium">MANAGEMENT OF EVENTS</td>
                      <td className="px-3 py-2">Registering and management of personal data...</td>
                      <td className="px-3 py-2">Art. 6.1 a) consent; Art. 6.1 f) legitimate interests (advertising)...</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 font-medium">ACCOUNTABILITY</td>
                      <td className="px-3 py-2">Administrative and accounting management...</td>
                      <td className="px-3 py-2">Art. 6.1 b) processing is necessary for the performance of a contract...</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="font-bold text-stone-800 text-lg">How long do we store your personal data?</h3>
              <p>
                NEXIO will store the data of the data subjects during their relationship with the organization and thereafter, the data will be preserved according to the provisions of the archive and documentation regulations established by each applicable law.
              </p>

              <h3 className="font-bold text-stone-800 text-lg">What are the rights of those affected?</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Right of access to your personal data.</li>
                <li>Right of rectification of inaccurate data.</li>
                <li>Right to delete your personal data.</li>
                <li>Right to request limitation of processing.</li>
                <li>Right to object to the processing.</li>
                <li>Right to the portability of your data.</li>
              </ul>
              <p>
                Such rights may be exercised free of charge by written request addressed to <a href="mailto:nexiocoop@gmail.com" className="text-teal-600 underline">nexiocoop@gmail.com</a>.
              </p>

              <h3 className="font-bold text-stone-800 text-lg">Links</h3>
              <p>
                The website of NEXIO may include hyperlinks to other sites. NEXIO does not guarantee nor is responsible for the lawfulness, reliability, utility, veracity and actuality of the contents of such websites or their privacy practices.
              </p>

              <p className="text-xs text-stone-400 mt-4">Latest update of the NEXIO Privacy Policy: 27 March 2025.</p>
            </div>
          </>
        );
      case 'COOKIES':
        return (
          <>
            <h2 className="text-2xl font-serif font-bold text-stone-900 mb-6 flex items-center gap-2">
              <Cookie className="w-6 h-6 text-teal-700" />
              Cookies Policy
            </h2>
            <div className="space-y-4 text-stone-600 text-sm leading-relaxed">
              <p>
                The JUNIOR ENTERPRISE STUDENT ASSOCIATION Nexio (hereinafter, Nexio) would like to inform you about the use of cookies on its websites.
              </p>
              <p>
                Cookies are files that can be downloaded onto your device through web pages. They are essential tools for providing many services in the information society.
              </p>

              <h3 className="font-bold text-stone-800 text-lg mt-4">Cookies Used on the Website</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>cookillian_opt_*:</strong> Stores your preferences regarding the use of cookies.</li>
                <li><strong>wordpress_test_cookie:</strong> Determines if cookies can be stored.</li>
                <li><strong>wp-settings-*:</strong> Remembers personal preferences within WordPress.</li>
                <li><strong>wordpress_*:</strong> Authentication cookie for WordPress details.</li>
              </ul>

              <h3 className="font-bold text-stone-800 text-lg mt-4">Acceptance of the Cookie Policy</h3>
              <p>
                Nexio assumes that you accept the use of cookies. However, it displays information about its Cookie Policy at the bottom of any page on the website with each login so that you remain aware.
              </p>

              <h3 className="font-bold text-stone-800 text-lg mt-4">How to Modify Cookie Settings</h3>
              <p>
                You can restrict, block, or delete Nexio’s cookies through your browser. Each browser has different settings.
              </p>
              <ul className="list-disc pl-5 space-y-1 text-teal-600">
                <li><a href="#" className="hover:underline">Internet Explorer: Microsoft Support</a></li>
                <li><a href="#" className="hover:underline">Firefox: Mozilla Support</a></li>
                <li><a href="#" className="hover:underline">Chrome: Google Support</a></li>
                <li><a href="#" className="hover:underline">Safari: Apple Support</a></li>
              </ul>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans relative bg-stone-50">
      
      {/* Background Ocean Waves */}
      <div className="ocean">
        <div className="wave"></div>
        <div className="wave"></div>
      </div>

      {/* MANDATORY COOKIE OVERLAY */}
      {cookieStatus !== 'ACCEPTED' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/95 backdrop-blur-md">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8 text-center animate-fade-in border border-stone-200">
            <Cookie className="w-12 h-12 text-teal-600 mx-auto mb-4" />
            
            {cookieStatus === 'UNDECIDED' ? (
              <>
                <h2 className="text-2xl font-serif font-bold text-stone-900 mb-2">We use cookies</h2>
                <p className="text-stone-600 mb-6 text-sm leading-relaxed">
                  We use cookies to improve your experience and analyze website traffic. You must accept our cookie policy to access the Nexio platform.
                </p>
                <div className="flex flex-col gap-3">
                  <button 
                    onClick={handleAcceptCookies}
                    className="w-full py-3 bg-teal-700 hover:bg-teal-800 text-white font-medium rounded-lg transition-colors shadow-lg"
                  >
                    Accept Cookies
                  </button>
                  <button 
                    onClick={handleRejectCookies}
                    className="w-full py-3 bg-white border border-stone-300 text-stone-600 hover:bg-stone-50 font-medium rounded-lg transition-colors"
                  >
                    Do not accept
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <X className="w-8 h-8 text-red-500" />
                </div>
                <h2 className="text-2xl font-serif font-bold text-stone-900 mb-2">Access Restricted</h2>
                <p className="text-stone-600 mb-6 text-sm leading-relaxed">
                  You have chosen not to accept cookies. Unfortunately, you cannot access the Nexio website without accepting our cookie policy.
                </p>
                <button 
                  onClick={handleAcceptCookies}
                  className="w-full py-3 bg-teal-700 hover:bg-teal-800 text-white font-medium rounded-lg transition-colors shadow-lg"
                >
                  I changed my mind, Accept Cookies
                </button>
              </>
            )}
            
            <button 
              onClick={() => setActiveModal('COOKIES')}
              className="mt-6 text-xs text-stone-400 underline hover:text-stone-600"
            >
              Read Cookie Policy
            </button>
          </div>
        </div>
      )}

      {/* Marquee Banner */}
      <div className="bg-teal-900 text-teal-50 py-3 overflow-hidden whitespace-nowrap relative z-10">
        <div className="animate-marquee inline-block">
          <span className="mx-4 text-sm font-bold tracking-widest uppercase">• Coming Soon</span>
          <span className="mx-4 text-sm font-bold tracking-widest uppercase">• Coming Soon</span>
          <span className="mx-4 text-sm font-bold tracking-widest uppercase">• Coming Soon</span>
          <span className="mx-4 text-sm font-bold tracking-widest uppercase">• Coming Soon</span>
          <span className="mx-4 text-sm font-bold tracking-widest uppercase">• Coming Soon</span>
          <span className="mx-4 text-sm font-bold tracking-widest uppercase">• Coming Soon</span>
          <span className="mx-4 text-sm font-bold tracking-widest uppercase">• Coming Soon</span>
          <span className="mx-4 text-sm font-bold tracking-widest uppercase">• Coming Soon</span>
          <span className="mx-4 text-sm font-bold tracking-widest uppercase">• Coming Soon</span>
          <span className="mx-4 text-sm font-bold tracking-widest uppercase">• Coming Soon</span>
          <span className="mx-4 text-sm font-bold tracking-widest uppercase">• Coming Soon</span>
          <span className="mx-4 text-sm font-bold tracking-widest uppercase">• Coming Soon</span>
        </div>
        <div className="animate-marquee inline-block absolute top-3 left-0">
          <span className="mx-4 text-sm font-bold tracking-widest uppercase">• Coming Soon</span>
          <span className="mx-4 text-sm font-bold tracking-widest uppercase">• Coming Soon</span>
          <span className="mx-4 text-sm font-bold tracking-widest uppercase">• Coming Soon</span>
          <span className="mx-4 text-sm font-bold tracking-widest uppercase">• Coming Soon</span>
          <span className="mx-4 text-sm font-bold tracking-widest uppercase">• Coming Soon</span>
          <span className="mx-4 text-sm font-bold tracking-widest uppercase">• Coming Soon</span>
          <span className="mx-4 text-sm font-bold tracking-widest uppercase">• Coming Soon</span>
          <span className="mx-4 text-sm font-bold tracking-widest uppercase">• Coming Soon</span>
          <span className="mx-4 text-sm font-bold tracking-widest uppercase">• Coming Soon</span>
          <span className="mx-4 text-sm font-bold tracking-widest uppercase">• Coming Soon</span>
          <span className="mx-4 text-sm font-bold tracking-widest uppercase">• Coming Soon</span>
          <span className="mx-4 text-sm font-bold tracking-widest uppercase">• Coming Soon</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="w-full py-6 px-4 sm:px-8 max-w-7xl mx-auto flex justify-between items-center relative z-10">
        <div className="flex items-center gap-2">
          {/* Logo updated to inline SVG matching the requested design */}
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" className="h-16 w-16" aria-label="The Next Step Logo">
            <defs>
              <path id="textPath" d="M 40,100 A 60,60 0 0,1 160,100" />
              <linearGradient id="tealGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor:'#0f766e', stopOpacity:1 }} />
                <stop offset="100%" style={{ stopColor:'#2dd4bf', stopOpacity:1 }} />
              </linearGradient>
            </defs>
            <circle cx="100" cy="100" r="90" fill="none" stroke="url(#tealGradient)" strokeWidth="2" opacity="0.1" />
            <text fill="#0f766e" fontFamily="Inter, sans-serif" fontWeight="700" fontSize="18" letterSpacing="2">
              <textPath href="#textPath" textAnchor="middle" startOffset="50%">
                THE NEXT STEP
              </textPath>
            </text>
            <g transform="translate(60, 55) scale(0.8)">
              <path d="M48 96c-24 0-38-16-38-36c0-20 12-32 32-32c12 0 20 6 24 14c2 4 3 8 3 12c0 20-14 42-21 42z" fill="none" stroke="#0f766e" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M48 96c10 0 16-6 16-16" fill="none" stroke="#0f766e" strokeWidth="6" strokeLinecap="round" />
              <circle cx="45" cy="60" r="18" fill="none" stroke="#0f766e" strokeWidth="4" />
              <path d="M38 60l5 5l10-10" fill="none" stroke="#2dd4bf" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
            </g>
          </svg>
          <span className="sr-only">Nexio</span>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-grow flex items-center relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 lg:py-20 w-full">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-stone-900 leading-tight mb-6">
              Launch your career in <span className="text-teal-700">Psychology.</span>
            </h1>
            
            <p className="text-lg text-stone-600 mb-10 leading-relaxed max-w-2xl">
              Join the program to gain practical therapy experience, earn recognized hours, and help reduce waiting times for patients in Germany.
            </p>

            {/* Centered Form */}
            <div className="w-full max-w-md mx-auto">
              {status === SubmissionStatus.SUCCESS ? (
                <div className="bg-teal-50 border border-teal-100 rounded-xl p-6 animate-fade-in text-left">
                  <div className="flex items-center gap-3 text-teal-800 font-semibold mb-2">
                    <CheckCircle className="w-5 h-5" />
                    <span>Application Interest Received</span>
                  </div>
                  <p className="text-teal-700 text-sm italic">
                    "{welcomeMessage}"
                  </p>
                  <button 
                    onClick={() => setStatus(SubmissionStatus.IDLE)}
                    className="mt-4 text-xs text-teal-600 hover:text-teal-800 underline"
                  >
                    Register another email
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    name="email"
                    placeholder="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    pattern="[^@\s]+@[^@\s]+\.[^@\s]+"
                    title="Please enter a valid email address"
                    disabled={status === SubmissionStatus.LOADING}
                    className="flex-grow px-4 py-3 rounded-lg border border-stone-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-all disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={status === SubmissionStatus.LOADING}
                    className="px-6 py-3 bg-teal-700 hover:bg-teal-800 text-white font-medium rounded-lg transition-colors shadow-sm hover:shadow flex items-center justify-center gap-2 disabled:opacity-70 whitespace-nowrap animate-vibrate-jump"
                  >
                    {status === SubmissionStatus.LOADING ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <span>Join Waitlist</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}
              <p className="mt-4 text-xs text-stone-500">
                Join other psychology students looking forward to making a change.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-stone-50 border-t border-stone-200 py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-stone-500 text-sm">
            © 2025 Nexio. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-stone-600">
            <button onClick={() => setActiveModal('LEGAL')} className="hover:text-teal-700 transition-colors">Legal Notice</button>
            <button onClick={() => setActiveModal('PRIVACY')} className="hover:text-teal-700 transition-colors">Privacy Policy</button>
            <button onClick={() => setActiveModal('COOKIES')} className="hover:text-teal-700 transition-colors">Cookies Policy</button>
          </div>
        </div>
      </footer>

      {/* Modal Overlay */}
      {activeModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm" onClick={closeModal}>
          <div 
            className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden relative flex flex-col max-h-[90vh]" 
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-end p-4 border-b border-stone-100 bg-white sticky top-0 z-10">
               <button 
                onClick={closeModal}
                className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-full transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto">
              {renderModalContent()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;