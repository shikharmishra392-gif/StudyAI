import { useEffect, useMemo, useState } from 'react';
import { api } from "./api.js";

const Icon = ({ name, size = 20 }) => {
  const paths = {
    sparkles: <><path d="M12 3l1.2 3.2L16.5 7.5l-3.3 1.3L12 12l-1.2-3.2-3.3-1.3 3.3-1.3L12 3Z"/><path d="M18 13l.8 2.2L21 16l-2.2.8L18 19l-.8-2.2L15 16l2.2-.8L18 13Z"/></>,
    plus: <path d="M12 5v14M5 12h14"/>,
    history: <><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5M12 7v5l3 2"/></>,
    link: <><path d="M10 13a5 5 0 0 0 7.5.5l2-2a5 5 0 0 0-7-7l-1.1 1.1"/><path d="M14 11a5 5 0 0 0-7.5-.5l-2 2a5 5 0 0 0 7 7l1.1-1.1"/></>,
    arrow: <path d="M5 12h14M13 6l6 6-6 6"/>,
    summary: <path d="M4 5h16M4 12h16M4 19h10"/>,
    notes: <><path d="M6 3h9l3 3v15H6z"/><path d="M14 3v4h4M9 11h6M9 15h6"/></>,
    quiz: <><circle cx="12" cy="12" r="9"/><path d="M9.8 9a2.5 2.5 0 1 1 3.6 2.2c-.9.5-1.4 1-1.4 2M12 17h.01"/></>,
    chat: <path d="M4 5h16v11H8l-4 4z"/>,
    send: <><path d="M22 2 11 13"/><path d="m22 2-7 20-4-9-9-4z"/></>,
    user: <><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></>,
    menu: <path d="M4 6h16M4 12h16M4 18h16"/>,
    close: <path d="M6 6l12 12M18 6 6 18"/>,
    logout: <><path d="M10 17l5-5-5-5M15 12H3"/><path d="M14 3h7v18h-7"/></>,
    play: <path d="m8 5 11 7-11 7z"/>,
    check: <path d="m5 12 4 4L19 6"/>,
  };

  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
};

function getStoredUser() {
  try { return JSON.parse(sessionStorage.getItem('currentUser') || 'null'); }
  catch { return null; }
}

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

function isYouTubeUrl(value) {
  try {
    const url = new URL(value);
    return url.hostname.includes('youtube.com') || url.hostname.includes('youtu.be');
  } catch { return false; }
}

function getVideoLabel(video) {
  if (!video?.videoUrl) return `Study #${video?.id ?? ''}`;
  try {
    const url = new URL(video.videoUrl);
    const id = url.searchParams.get('v') || (url.hostname.includes('youtu.be') ? url.pathname.replace('/', '') : null);
    return id ? `YouTube · ${id}` : 'Saved video';
  } catch { return 'Saved video'; }
}

function renderInline(text) {
  const parts = String(text).split(/(\*\*.*?\*\*|`.*?`|\*[^*]+?\*)/g);
  return parts.filter(Boolean).map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) return <strong key={index}>{part.slice(2, -2)}</strong>;
    if (part.startsWith('`') && part.endsWith('`')) return <code key={index}>{part.slice(1, -1)}</code>;
    if (part.startsWith('*') && part.endsWith('*') && !part.startsWith('**')) return <em key={index}>{part.slice(1, -1)}</em>;
    return <span key={index}>{part}</span>;
  });
}

function RichText({ text, emptyText = 'Nothing here yet.' }) {
  if (!text?.trim()) return <p className="empty-copy">{emptyText}</p>;
  const lines = text.split(/\r?\n/).map((line) => line.trim());

  return <div className="rich-text">
    {lines.map((line, index) => {
      if (!line) return <div className="rich-gap" key={index}/>;
      const heading = line.match(/^(#{1,4})\s+(.*)$/);
      if (heading) {
        const Tag = heading[1].length === 1 ? 'h2' : 'h3';
        return <Tag className="rich-heading" key={index}>{renderInline(heading[2])}</Tag>;
      }
      const bullet = line.match(/^[-•]\s+(.*)$/);
      if (bullet) return <div className="rich-point" key={index}><span className="point-dot"/><div>{renderInline(bullet[1])}</div></div>;
      const numbered = line.match(/^(\d+)[.)]\s+(.*)$/);
      if (numbered) return <div className="rich-point" key={index}><span className="point-number">{numbered[1]}</span><div>{renderInline(numbered[2])}</div></div>;
      if (/^answer\s*:/i.test(line)) return <div className="answer-chip" key={index}><Icon name="check" size={16}/>{renderInline(line)}</div>;
      return <p className="rich-paragraph" key={index}>{renderInline(line)}</p>;
    })}
  </div>;
}

function AuthPage({ mode, onBack, onSuccess }) {
  const isLogin = mode === 'login';
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  async function submit(event) {
    event.preventDefault();
    setMessage('');
    const name = form.name.trim();
    const email = form.email.trim();
    const password = form.password.trim();

    if (!isLogin && !name) return setMessage('Please enter your name.');
    if (!isValidEmail(email)) return setMessage('Please enter a valid email address.');
    if (password.length < 6) return setMessage('Password must be at least 6 characters.');

    setBusy(true);
    try {
      if (isLogin) {
        const data = await api.login({ email, password });
        sessionStorage.setItem('loggedIn', 'true');
        sessionStorage.setItem('currentUser', JSON.stringify(data));
        onSuccess(data);
      } else {
        await api.register({ name, email, password });
        setMessage('Account created. You can sign in now.');
      }
    } catch (error) {
      setMessage(error.message || 'Something went wrong.');
    } finally { setBusy(false); }
  }

  return <div className="auth-screen">
    <div className="ambient ambient-one"/><div className="ambient ambient-two"/>
    <button className="back-link" onClick={() => onBack('home')}>← Back to home</button>

    <div className="auth-shell">
      <section className="auth-story">
        <div className="brand-mark"><span className="brand-icon"><Icon name="sparkles" size={21}/></span><span>StudyAI</span></div>
        <div><span className="eyebrow">YOUR VIDEO STUDY WORKSPACE</span><h1>Turn watch time into study time.</h1><p>Extract captions, generate structured notes, revise with quizzes, and return to any saved lecture later.</p></div>
        <div className="auth-proof"><span><Icon name="check" size={16}/> Caption-based learning</span><span><Icon name="check" size={16}/> Saved study history</span><span><Icon name="check" size={16}/> AI notes and quizzes</span></div>
      </section>

      <section className="auth-card">
        <div className="auth-card-head"><span className="auth-orb"><Icon name="user" size={22}/></span><h2>{isLogin ? 'Welcome back' : 'Create your account'}</h2><p>{isLogin ? 'Continue where you left off.' : 'Start building your personal study library.'}</p></div>
        <form onSubmit={submit}>
          {!isLogin && <label><span>Name</span><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your full name" autoComplete="name"/></label>}
          <label><span>Email</span><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" autoComplete="email"/></label>
          <label><span>Password</span><input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Minimum 6 characters" autoComplete={isLogin ? 'current-password' : 'new-password'}/></label>
          {message && <div className="form-message">{message}</div>}
          <button className="primary-btn auth-submit" disabled={busy}>{busy ? 'Please wait...' : isLogin ? 'Sign in' : 'Create account'}{!busy && <Icon name="arrow" size={18}/>}</button>
        </form>
        <button className="auth-switch" onClick={() => onBack(isLogin ? 'register' : 'login')}>{isLogin ? 'New here? Create an account' : 'Already have an account? Sign in'}</button>
      </section>
    </div>
  </div>;
}

function LandingPage({ onNavigate }) {
  return <div className="landing-page">
    <div className="ambient ambient-one"/><div className="ambient ambient-two"/><div className="noise-layer"/>
    <header className="landing-nav">
      <div className="brand-mark"><span className="brand-icon"><Icon name="sparkles" size={20}/></span><span>StudyAI</span></div>
      <nav><a href="#about">About</a><a href="#features">Features</a></nav>
      <div className="nav-cta"><button className="ghost-btn" onClick={() => onNavigate('login')}>Sign in</button><button className="primary-btn small" onClick={() => onNavigate('register')}>Get started</button></div>
    </header>

    <main>
      <section className="hero-section">
        <div className="hero-copy">
          <div className="status-pill"><span className="live-dot"/> AI-powered video learning</div>
          <h1>Study videos.<span>Remember more.</span></h1>
          <p>Paste a YouTube lecture and turn it into clear summaries, structured notes, revision quizzes, and a reusable study workspace.</p>
          <div className="hero-actions"><button className="primary-btn hero-btn" onClick={() => onNavigate('register')}>Start learning <Icon name="arrow" size={19}/></button><button className="soft-btn" onClick={() => onNavigate('login')}>Open workspace</button></div>
          <div className="hero-trust"><span><Icon name="check" size={15}/> Caption extraction</span><span><Icon name="check" size={15}/> AI study material</span><span><Icon name="check" size={15}/> Saved history</span></div>
        </div>

        <div className="hero-visual">
          <div className="demo-window">
            <div className="window-top"><span className="window-dots"><i/><i/><i/></span><span className="window-label">Study workspace</span><span className="mini-avatar">S</span></div>
            <div className="demo-body">
              <div className="demo-side"><div className="demo-new"/><div className="demo-line w80"/><div className="demo-line w60"/><div className="demo-line w70"/></div>
              <div className="demo-main">
                <div className="demo-input"><Icon name="link" size={16}/> youtube.com/watch?v=... <span><Icon name="arrow" size={15}/></span></div>
                <div className="demo-tabs"><b>Summary</b><span>Notes</span><span>Quiz</span></div>
                <div className="demo-card"><span className="demo-kicker">KEY IDEA</span><div className="demo-title"/><div className="demo-copy w90"/><div className="demo-copy w75"/></div>
                <div className="demo-grid"><div className="demo-small-card"><Icon name="notes" size={20}/><div className="demo-copy w75"/><div className="demo-copy w55"/></div><div className="demo-small-card"><Icon name="quiz" size={20}/><div className="demo-copy w70"/><div className="demo-copy w50"/></div></div>
              </div>
            </div>
          </div>
          <div className="floating-card float-one"><span className="float-icon"><Icon name="summary" size={18}/></span><div><b>Summary ready</b><small>Saved to your library</small></div></div>
          <div className="floating-card float-two"><span className="float-icon green"><Icon name="check" size={18}/></span><div><b>Captions found</b><small>Processing lecture</small></div></div>
        </div>
      </section>

      <section className="about-strip" id="about"><span className="eyebrow">ABOUT STUDYAI</span><h2>Built to make video learning less tiring.</h2><p>We created StudyAI so students can turn online lectures into useful study material without spending hours making notes manually. One link becomes a summary, clean notes, quizzes, and saved revision content.</p></section>

      <section className="feature-section" id="features">
        <div className="section-heading"><span className="eyebrow">ONE WORKFLOW</span><h2>From video link to revision-ready.</h2></div>
        <div className="feature-grid">
          {[["link","Paste a lecture","Start with a public YouTube video link."],["summary","Get the key ideas","Read a concise summary before revising details."],["notes","Review clean notes","Structured content stays easy to scan and revisit."],["quiz","Test yourself","Use AI-generated questions to check understanding."]].map(([icon,title,copy], index) => <article className="feature-card" key={title}><span className="feature-number">0{index + 1}</span><span className="feature-icon"><Icon name={icon} size={22}/></span><h3>{title}</h3><p>{copy}</p></article>)}
        </div>
      </section>
    </main>
  </div>;
}

function Dashboard({ user, onLogout }) {
  const [history, setHistory] = useState([]);
  const [activeVideo, setActiveVideo] = useState(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [activeTab, setActiveTab] = useState('summary');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [chatBusy, setChatBusy] = useState(false);
  const [messages, setMessages] = useState([{ role: 'assistant', text: 'Generate or open a saved study first. Then ask me about that video.' }]);

  async function loadHistory() {
    if (!user?.email) return;
    setHistoryLoading(true);
    try {
      const videos = await api.getUserVideos(user.email);
      setHistory(Array.isArray(videos) ? videos : []);
    } catch (error) { setStatus(error.message || 'Could not load history.'); }
    finally { setHistoryLoading(false); }
  }

  useEffect(() => { loadHistory(); }, [user?.email]);

  async function analyzeVideo() {
    const cleanUrl = videoUrl.trim();
    if (!isYouTubeUrl(cleanUrl)) return setStatus('Please paste a valid YouTube URL.');
    setLoading(true); setStatus('Saving video…');
    try {
      const savedVideo = await api.saveVideo({ email: user.email, videoUrl: cleanUrl });
      setStatus('Captions found. Creating your study material…');
      const generatedVideo = await api.generateFromUrl(savedVideo.id);
      setActiveVideo(generatedVideo); setActiveTab('summary'); setStatus('Study material is ready.');
      setMessages([{ role: 'assistant', text: 'Your study material is ready. Ask me anything about this video.' }]);
      await loadHistory();
    } catch (error) { setStatus(error.message || 'Generation failed.'); }
    finally { setLoading(false); }
  }

  async function openSavedVideo(videoId) {
    setStatus('Loading saved study…'); setSidebarOpen(false);
    try {
      const video = await api.getVideo(videoId);
      setActiveVideo(video); setVideoUrl(video.videoUrl || ''); setActiveTab('summary'); setStatus('Saved study loaded.');
      setMessages([{ role: 'assistant', text: 'Saved study loaded. Ask me anything about this video.' }]);
    } catch (error) { setStatus(error.message || 'Could not open this study.'); }
  }

  function newStudy() {
    setActiveVideo(null); setVideoUrl(''); setStatus(''); setActiveTab('summary');
    setMessages([{ role: 'assistant', text: 'Paste a YouTube lecture above to create a new study.' }]);
    setSidebarOpen(false);
  }

  async function askQuestion(event) {
    event.preventDefault();
    const cleanQuestion = question.trim();
    if (!cleanQuestion) return;
    if (!activeVideo?.id) return setMessages((current) => [...current, { role: 'assistant', text: 'Open or generate a study first.' }]);

    setMessages((current) => [...current, { role: 'user', text: cleanQuestion }]);
    setQuestion(''); setChatBusy(true);
    try {
      const data = await api.chat(activeVideo.id, cleanQuestion);
      setMessages((current) => [...current, { role: 'assistant', text: data?.answer || 'I could not generate an answer.' }]);
    } catch {
      setMessages((current) => [...current, { role: 'assistant', text: 'The chat backend is not connected yet. Your notes, summary, quiz, and saved history still work.' }]);
    } finally { setChatBusy(false); }
  }

  const tabContent = useMemo(() => {
    if (!activeVideo) return null;
    if (activeTab === 'summary') return <RichText text={activeVideo.summary} emptyText="No summary was saved for this video."/>;
    if (activeTab === 'notes') return <RichText text={activeVideo.notes} emptyText="No notes were saved for this video."/>;
    return <RichText text={activeVideo.quiz} emptyText="No quiz was saved for this video."/>;
  }, [activeVideo, activeTab]);

  return <div className="app-shell">
    <div className="app-ambient app-ambient-one"/><div className="app-ambient app-ambient-two"/>
    <header className="app-topbar">
      <button className="mobile-menu" onClick={() => setSidebarOpen((value) => !value)} aria-label="Toggle sidebar"><Icon name={sidebarOpen ? 'close' : 'menu'} size={20}/></button>
      <div className="brand-mark"><span className="brand-icon"><Icon name="sparkles" size={19}/></span><span>StudyAI</span></div>
      <div className="topbar-center"><span className="workspace-dot"/> Study workspace</div>
      <div className="profile-area">
        <button className="profile-button" onClick={() => setProfileOpen((value) => !value)}><span className="profile-avatar">{(user?.name || 'U').charAt(0).toUpperCase()}</span><span className="profile-name">{user?.name || 'User'}</span></button>
        {profileOpen && <div className="profile-menu"><div><b>{user?.name || 'User'}</b><small>{user?.email || ''}</small></div><button onClick={onLogout}><Icon name="logout" size={17}/> Log out</button></div>}
      </div>
    </header>

    <div className="workspace-layout">
      <aside className={`workspace-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <button className="new-study-button" onClick={newStudy}><Icon name="plus" size={18}/> New study</button>
        <div className="sidebar-section-title"><span><Icon name="history" size={16}/> Recent studies</span><small>{history.length}</small></div>
        <div className="history-list">
          {historyLoading && <><div className="history-skeleton"/><div className="history-skeleton"/><div className="history-skeleton"/></>}
          {!historyLoading && history.length === 0 && <div className="sidebar-empty"><Icon name="history" size={23}/><p>Your saved studies will appear here.</p></div>}
          {!historyLoading && history.map((video) => <button className={`history-item ${activeVideo?.id === video.id ? 'active' : ''}`} key={video.id} onClick={() => openSavedVideo(video.id)}><span className="history-icon"><Icon name="play" size={14}/></span><span className="history-copy"><b>{getVideoLabel(video)}</b><small>{video.status || 'Saved'}</small></span></button>)}
        </div>
        <div className="sidebar-footer"><span className="mini-status-dot"/> Spring Boot connected</div>
      </aside>

      {sidebarOpen && <button className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} aria-label="Close sidebar"/>}

      <main className="workspace-main">
        <section className="workspace-intro"><span className="eyebrow">AI VIDEO LEARNING</span><h1>What do you want to <span>study today?</span></h1><p>Paste a YouTube lecture. We’ll turn its captions into a study workspace.</p></section>
        <section className="url-composer"><span className="composer-icon"><Icon name="link" size={19}/></span><input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !loading) analyzeVideo(); }} placeholder="Paste a YouTube video URL…"/><button className="generate-button" onClick={analyzeVideo} disabled={loading}>{loading ? <><span className="spinner"/> Working</> : <>Generate <Icon name="arrow" size={17}/></>}</button></section>
        {status && <div className={`status-bar ${loading ? 'working' : ''}`}>{loading && <span className="pulse-dot"/>}{status}</div>}

        {!activeVideo ? <section className="empty-workspace"><div className="empty-orbit"><span><Icon name="sparkles" size={27}/></span></div><h2>Your study space is ready.</h2><p>Add a YouTube lecture above or open a saved study from the sidebar.</p><div className="empty-feature-row"><span><Icon name="summary" size={17}/> Summary</span><span><Icon name="notes" size={17}/> Notes</span><span><Icon name="quiz" size={17}/> Quiz</span><span><Icon name="chat" size={17}/> AI chat</span></div></section> :
        <section className="study-workspace">
          <div className="study-header"><div><span className="study-ready"><span className="ready-dot"/> AI READY</span><h2>{getVideoLabel(activeVideo)}</h2><p className="study-url">{activeVideo.videoUrl}</p></div></div>
          <div className="study-grid">
            <section className="content-panel">
              <div className="tab-row">{[['summary','summary','Summary'],['notes','notes','Notes'],['quiz','quiz','Quiz']].map(([tab,icon,label]) => <button key={tab} className={activeTab === tab ? 'active' : ''} onClick={() => setActiveTab(tab)}><Icon name={icon} size={17}/>{label}</button>)}</div>
              <div className="content-paper"><div className="content-paper-head"><span className={`paper-icon ${activeTab}`}><Icon name={activeTab} size={20}/></span><div><span>{activeTab.toUpperCase()}</span><h3>{activeTab === 'summary' ? 'Quick understanding' : activeTab === 'notes' ? 'Structured study notes' : 'Test your understanding'}</h3></div></div><div className="content-scroll">{tabContent}</div></div>
            </section>

            <aside className="chat-panel">
              <div className="chat-head"><span className="chat-orb"><Icon name="sparkles" size={19}/></span><div><h3>Ask StudyAI</h3><small>Based on this video</small></div><span className="online-badge">ONLINE</span></div>
              <div className="message-list">{messages.map((message,index) => <div className={`message ${message.role}`} key={`${message.role}-${index}`}>{message.role === 'assistant' && <span className="message-avatar"><Icon name="sparkles" size={14}/></span>}<div>{message.text}</div></div>)}{chatBusy && <div className="message assistant"><span className="message-avatar"><Icon name="sparkles" size={14}/></span><div className="typing"><i/><i/><i/></div></div>}</div>
              <form className="chat-composer" onSubmit={askQuestion}><input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Ask about this video…"/><button aria-label="Send question" disabled={chatBusy}><Icon name="send" size={17}/></button></form>
            </aside>
          </div>
        </section>}
      </main>
    </div>
  </div>;
}

export default function App() {
  const [user, setUser] = useState(getStoredUser);
  const [view, setView] = useState(() => getStoredUser() ? 'dashboard' : 'home');

  function navigate(nextView) { setView(nextView); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  function handleAuthSuccess(data) { setUser(data); setView('dashboard'); }
  function logout() { sessionStorage.removeItem('loggedIn'); sessionStorage.removeItem('currentUser'); setUser(null); setView('home'); }

  if (view === 'login' || view === 'register') return <AuthPage mode={view} onBack={navigate} onSuccess={handleAuthSuccess}/>;
  if (view === 'dashboard' && user) return <Dashboard user={user} onLogout={logout}/>;
  return <LandingPage onNavigate={navigate}/>;
}

