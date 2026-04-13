import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Paperclip, Mic, MicOff, X, Shield, CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { usePolicy } from '../contexts/PolicyContext';
import { ChatMessage, PolicySummary } from '../types';


const STORAGE_KEY = 'policyclear_chat_history';
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const QUICK_CHIPS = [
  'Is dental covered?',
  "What's my waiting period?",
  'Explain my co-pay',
  'What happens if I get surgery?',
];

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      {[0, 1, 2].map(i => (
        <motion.span
          key={i}
          className="w-2 h-2 rounded-full bg-[#D4AF37]"
          animate={{ y: [0, -6, 0] }}
          transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }}
        />
      ))}
    </div>
  );
}

function PolicySummaryCard({ data }: { data: PolicySummary }) {
  const verdictCfg = data.verdict?.toLowerCase().includes('fully')
    ? 'bg-green-500/15 text-green-400 border-green-500/30'
    : data.verdict?.toLowerCase().includes('not')
    ? 'bg-red-500/15 text-red-400 border-red-500/30'
    : 'bg-amber-500/15 text-amber-400 border-amber-500/30';

  return (
    <div className="space-y-3 max-w-xs">
      <div className="flex items-center gap-2">
        <Shield size={16} className="text-[#D4AF37]" />
        <span className="font-playfair text-base text-[#D4AF37]">Policy Summary</span>
      </div>
      {data.policyName && <p className="font-poppins text-sm text-[#F5F1E8] font-medium">{data.policyName} — {data.insurer}</p>}
      {(data.sumInsured > 0 || data.premium > 0) && (
        <div className="flex gap-4">
          {data.sumInsured > 0 && <div><p className="font-poppins text-xs text-[#A89070]">Sum Insured</p><p className="font-poppins text-sm text-[#D4AF37]">₹{(data.sumInsured / 100000).toFixed(1)}L</p></div>}
          {data.premium > 0 && <div><p className="font-poppins text-xs text-[#A89070]">Premium</p><p className="font-poppins text-sm text-[#D4AF37]">₹{data.premium.toLocaleString('en-IN')}</p></div>}
        </div>
      )}
      {data.coverages?.length > 0 && (
        <div>
          <div className="flex items-center gap-1 mb-1"><CheckCircle size={12} className="text-green-400" /><span className="font-poppins text-xs text-green-400 font-medium">Coverage</span></div>
          <ul className="space-y-0.5">
            {data.coverages.slice(0, 4).map((c, i) => <li key={i} className="font-poppins text-xs text-[#A89070]">✓ {c}</li>)}
          </ul>
        </div>
      )}
      {data.exclusions?.length > 0 && (
        <div>
          <div className="flex items-center gap-1 mb-1"><AlertCircle size={12} className="text-red-400" /><span className="font-poppins text-xs text-red-400 font-medium">Exclusions</span></div>
          <ul className="space-y-0.5">
            {data.exclusions.slice(0, 3).map((e, i) => <li key={i} className="font-poppins text-xs text-[#A89070]">✗ {e}</li>)}
          </ul>
        </div>
      )}
      {data.conditions?.length > 0 && (
        <div>
          <div className="flex items-center gap-1 mb-1"><AlertTriangle size={12} className="text-amber-400" /><span className="font-poppins text-xs text-amber-400 font-medium">Conditions</span></div>
          <ul className="space-y-0.5">
            {data.conditions.slice(0, 2).map((c, i) => <li key={i} className="font-poppins text-xs text-[#A89070]">⚠ {c}</li>)}
          </ul>
        </div>
      )}
      {data.verdict && (
        <span className={`inline-flex px-3 py-1 rounded-full border text-xs font-poppins font-medium ${verdictCfg}`}>
          {data.verdict}
        </span>
      )}
    </div>
  );
}

function MessageBubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === 'user';
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          isUser
            ? 'bg-[#D4AF37] text-[#1A0F0A] rounded-tr-sm'
            : 'bg-[#2D1810] text-[#F5F1E8] rounded-tl-sm border-l-2 border-[#D4AF37]'
        }`}
        style={isUser ? {} : { boxShadow: 'inset 0 1px 0 rgba(212,175,55,0.1)' }}
      >
        {msg.type === 'policy-summary' && msg.policyData ? (
          <PolicySummaryCard data={msg.policyData} />
        ) : (
          <p className={`font-poppins text-sm leading-relaxed whitespace-pre-wrap ${isUser ? 'text-[#1A0F0A]' : 'text-[#F5F1E8]'}`}>
            {msg.content}
          </p>
        )}
        <p className={`font-poppins text-[10px] mt-1 ${isUser ? 'text-[#1A0F0A]/60 text-right' : 'text-[#A89070]'}`}>
          {new Date(msg.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </motion.div>
  );
}

export default function Chat() {
  const { session } = useAuth();
  const { activePolicy, savePolicy } = usePolicy();
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-50)));
  }, [messages]);

  const addMsg = (msg: Omit<ChatMessage, 'id'>) => {
    const fullMsg = { ...msg, id: Date.now().toString() };
    setMessages(prev => [...prev, fullMsg]);
    return fullMsg;
  };

  // Add this at the top of sendToAI function temporarily:


const sendToAI = async (userMessage: string, policyContext?: string) => {
  setIsTyping(true);
  try {
    const response = await fetch(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: `You are PolicyClear AI, a friendly insurance expert who explains insurance policies in plain English. Be concise and helpful. ${policyContext ? `User's active policy: ${policyContext}` : ''}`,
            },
            {
              role: 'user',
              content: userMessage,
            },
          ],
          max_tokens: 1024,
          temperature: 0.7,
        }),
      }
    );
if (!response.ok) {
  const err = await response.json();
  console.error('Groq error in analyzeDocument:', err);
  throw new Error(err.error?.message || 'Groq failed');
}
  

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || 'I could not process that request.';
    addMsg({ role: 'assistant', content: reply, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('sendToAI error:', error);
    addMsg({ role: 'assistant', content: `Error: ${error}`, timestamp: new Date().toISOString() });
  } finally {
    setIsTyping(false);
  }
};

// Replace your entire analyzeDocument function:
const analyzeDocument = async (text: string, fileName: string) => {
  setIsTyping(true);
  try {
    const response = await fetch(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: `You are an insurance policy analyzer. Extract structured data from insurance policy text and return ONLY valid JSON, no markdown, no explanation. Return exactly this structure:
{
  "policyName": "string",
  "insurer": "string", 
  "policyNumber": "string",
  "sumInsured": number,
  "premium": number,
  "policyYear": number,
  "members": ["string"],
  "coverages": {
    "hospitalization": { "limit": number, "roomRent": "string", "coPay": number },
    "daycare": { "procedures": number },
    "preHospitalization": { "days": number },
    "postHospitalization": { "days": number },
    "maternity": { "normal": number, "cesarean": number, "waitingMonths": number },
    "mentalHealth": { "limit": number },
    "ambulance": { "perEvent": number }
  },
  "exclusions": ["string"],
  "waitingPeriods": [{ "condition": "string", "months": number }],
  "coverageList": ["string"],
  "verdict": "string"
}
If a value is not found in the document, use 0 for numbers and empty arrays for lists.`
            },
            {
              role: 'user',
              content: `Analyze this insurance policy document and extract all details:\n\n${text.slice(0, 8000)}`
            }
          ],
          max_tokens: 2048,
          temperature: 0.1,
        }),
      }
    );

    const data = await response.json();
    const rawReply = data.choices?.[0]?.message?.content || '{}';
    
    // Clean and parse JSON
    const cleaned = rawReply.replace(/```json|```/g, '').trim();
    let parsed: any = {};
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      parsed = {
        policyName: fileName,
        insurer: 'Unknown',
        policyNumber: '',
        sumInsured: 0,
        premium: 0,
        policyYear: 1,
        members: [],
        coverages: {},
        exclusions: [],
        waitingPeriods: [],
        coverageList: [],
      };
    }

    // Show summary card in chat
    addMsg({
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
      type: 'policy-summary',
      policyData: {
        policyName: parsed.policyName || fileName,
        insurer: parsed.insurer || 'Unknown',
        sumInsured: parsed.sumInsured || 0,
        premium: parsed.premium || 0,
        coverages: parsed.coverageList || [],
        exclusions: parsed.exclusions?.slice(0, 5) || [],
        conditions: parsed.waitingPeriods?.map((w: any) => `${w.condition}: ${w.months} months`) || [],
        verdict: `Policy analyzed successfully`,
      },
    });

    // Save to Supabase via PolicyContext
    if (session) {
      await savePolicy({
        policy_name: parsed.policyName || fileName,
        insurer: parsed.insurer || 'Unknown',
        policy_number: parsed.policyNumber || '',
        sum_insured: parsed.sumInsured || 0,
        premium: parsed.premium || 0,
        policy_year: parsed.policyYear || 1,
        raw_text: text,
        ocr_source: 'upload',
        summary: parsed,
        coverages: parsed.coverages || {},
        exclusions: parsed.exclusions || [],
        members: parsed.members || [],
      });

      addMsg({
        role: 'assistant',
        content: `✅ Policy saved! Your dashboard, coverage, exclusions and simulator pages are now updated with your real policy data. Go to Dashboard to see your personalized analysis.`,
        timestamp: new Date().toISOString(),
      });
    }

  } catch (error) {
    console.error('analyzeDocument error:', error);
    addMsg({
      role: 'assistant',
      content: 'Failed to analyze the document. Please try again.',
      timestamp: new Date().toISOString(),
    });
  } finally {
    setIsTyping(false);
  }
};

  const handleSend = async () => {
    const text = input.trim();
    if (!text && !uploadedFile) return;

    if (uploadedFile) {
      addMsg({ role: 'user', content: `📎 ${uploadedFile.name}`, timestamp: new Date().toISOString(), type: 'document' });
      const file = uploadedFile;
      setUploadedFile(null);
      setInput('');
      addMsg({ role: 'assistant', content: 'Reading your document...', timestamp: new Date().toISOString() });

       if (file.type === 'application/pdf') {
  try {
    // Read PDF using PDF.js directly in browser
    const pdfjsLib = await import('pdfjs-dist');
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += pageText + '\n';
    }

    // setMessages(prev => prev.filter(m => m.content !== 'Reading your document...'));
    
    if (fullText.trim().length < 50) {
      // PDF has no readable text (scanned image), use Tesseract
      addMsg({ 
        role: 'assistant', 
        content: 'This PDF appears to be a scanned image. Trying OCR...', 
        timestamp: new Date().toISOString() 
      });
      const { createWorker } = await import('tesseract.js');
      const worker = await createWorker('eng');
      const { data: { text } } = await worker.recognize(file);
      await worker.terminate();
      await analyzeDocument(text, file.name);
    } else {
      await analyzeDocument(fullText, file.name);
    }
  } catch (error) {
    console.error('PDF error:', error);
    setMessages(prev => prev.filter(m => m.content !== 'Reading your document...'));
    addMsg({ 
      role: 'assistant', 
      content: 'Failed to read PDF. Please try uploading as an image (JPG/PNG) instead.', 
      timestamp: new Date().toISOString() 
    });
  }
}else {
        const { createWorker } = await import('tesseract.js');
        const worker = await createWorker('eng');
        const { data: { text } } = await worker.recognize(file);
        await worker.terminate();
        setMessages(prev => prev.filter(m => m.content !== 'Reading your document...'));
        await analyzeDocument(text, file.name);
      }
      return;
    }

    addMsg({ role: 'user', content: text, timestamp: new Date().toISOString() });
    setInput('');
    const policyCtx = activePolicy ? JSON.stringify(activePolicy.summary || activePolicy.coverages) : undefined;
    await sendToAI(text, policyCtx);
  };

  const handleVoice = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert('Speech recognition not supported in your browser.'); return; }
    const rec = new SR();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = 'en-IN';
    rec.onstart = () => setIsListening(true);
    rec.onresult = (e: SpeechRecognitionEvent) => {
      setInput(e.results[0][0].transcript);
      setIsListening(false);
    };
    rec.onerror = () => setIsListening(false);
    rec.onend = () => setIsListening(false);
    recognitionRef.current = rec;
    rec.start();
  };

  const inputClass = "flex-1 bg-transparent text-[#F5F1E8] placeholder-[#A89070]/50 focus:outline-none font-poppins text-sm";

  return (
    <div className="flex flex-col h-screen bg-[#1A0F0A] pt-16">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[#D4AF37]/10 flex items-center gap-3" style={{ background: '#2D1810' }}>
        <div className="w-9 h-9 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center">
          <Shield size={18} className="text-[#D4AF37]" />
        </div>
        <div>
          <p className="font-playfair text-base text-[#F5F1E8]">PolicyClear AI</p>
          <p className="font-poppins text-xs text-green-400">● Online</p>
        </div>
        {messages.length > 0 && (
          <button
            onClick={() => { setMessages([]); localStorage.removeItem(STORAGE_KEY); }}
            className="ml-auto text-xs text-[#A89070] hover:text-[#F5F1E8] font-poppins flex items-center gap-1"
          >
            <X size={12} /> Clear
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 scrollbar-thin">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-6">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center mx-auto mb-4">
                <Shield size={28} className="text-[#D4AF37]" />
              </div>
              <h2 className="font-playfair text-2xl text-[#F5F1E8] mb-2">PolicyClear AI</h2>
              <p className="font-poppins text-sm text-[#A89070] max-w-sm text-center">
                Ask me anything about your insurance policy, or upload a document for instant analysis.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              {QUICK_CHIPS.map(chip => (
                <button
                  key={chip}
                  onClick={() => { setInput(chip); }}
                  className="px-4 py-2 border border-[#D4AF37]/20 rounded-full text-xs font-poppins text-[#A89070] hover:text-[#F5F1E8] hover:border-[#D4AF37]/40 transition-all"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map(msg => <MessageBubble key={msg.id} msg={msg} />)}

        {isTyping && (
          <div className="flex justify-start mb-4">
            <div className="bg-[#2D1810] border-l-2 border-[#D4AF37] rounded-2xl rounded-tl-sm">
              <TypingIndicator />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick chips when messages exist */}
      {messages.length > 0 && (
        <div className="px-4 py-2 flex gap-2 overflow-x-auto scrollbar-thin border-t border-[#D4AF37]/5">
          {QUICK_CHIPS.map(chip => (
            <button
              key={chip}
              onClick={() => setInput(chip)}
              className="shrink-0 px-3 py-1.5 border border-[#D4AF37]/15 rounded-full text-xs font-poppins text-[#A89070] hover:text-[#F5F1E8] hover:border-[#D4AF37]/30 transition-all"
            >
              {chip}
            </button>
          ))}
        </div>
      )}

      {/* Uploaded file preview */}
      <AnimatePresence>
        {uploadedFile && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="px-4 overflow-hidden">
            <div className="flex items-center gap-2 bg-[#2D1810] rounded-lg px-3 py-2 mb-2">
              <Paperclip size={14} className="text-[#D4AF37]" />
              <span className="font-poppins text-xs text-[#F5F1E8] flex-1 truncate">{uploadedFile.name}</span>
              <button onClick={() => setUploadedFile(null)} className="text-[#A89070] hover:text-[#F5F1E8]"><X size={14} /></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input bar */}
      <div className="px-4 pb-4">
        <div
          className="flex items-center gap-2 bg-[#2D1810] border border-[#A89070]/20 rounded-xl px-4 py-3 focus-within:border-[#D4AF37]/50 transition-colors"
        >
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-[#A89070] hover:text-[#D4AF37] transition-colors shrink-0"
            title="Upload document"
          >
            <Paperclip size={18} />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) setUploadedFile(f); e.target.value = ''; }}
          />
          <input
            type="text"
            value={isListening ? 'Listening...' : input}
            onChange={e => !isListening && setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Ask about your policy..."
            className={inputClass}
          />
          <button
            onClick={handleVoice}
            className={`shrink-0 transition-colors ${isListening ? 'text-red-400 animate-pulse' : 'text-[#A89070] hover:text-[#D4AF37]'}`}
            title="Voice input"
          >
            {isListening ? <MicOff size={18} /> : <Mic size={18} />}
          </button>
          <button
            onClick={handleSend}
            disabled={!input.trim() && !uploadedFile}
            className="shrink-0 w-9 h-9 rounded-lg bg-[#D4AF37] flex items-center justify-center text-[#1A0F0A] hover:shadow-[0_0_12px_rgba(212,175,55,0.4)] transition-all disabled:opacity-40"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
