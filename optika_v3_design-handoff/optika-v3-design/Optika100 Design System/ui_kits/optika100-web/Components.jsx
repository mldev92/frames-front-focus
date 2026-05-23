// Reusable atoms — buttons, chips, badges
const Button = ({ variant = 'primary', size = 'md', children, leading, onClick, full }) => (
  <button className={`btn btn-${variant} btn-${size} ${full ? 'btn-full' : ''}`} onClick={onClick}>
    {leading && <span className="btn-ico">{leading}</span>}
    {children}
  </button>
);

const Chip = ({ active, dot, children, onClick }) => (
  <button className={`chip ${active ? 'chip-active' : ''}`} onClick={onClick}>
    {dot && <span className="chip-dot" style={{ background: dot }}></span>}
    {children}
  </button>
);

const Badge = ({ tone = 'muted', children, pulse }) => (
  <span className={`badge badge-${tone}`}>
    {pulse && <span className="badge-pulse"></span>}
    {children}
  </span>
);

const Eyebrow = ({ children }) => <span className="eyebrow">{children}</span>;

const Ico = {
  Search: () => <svg viewBox="0 0 24 24" className="ico"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>,
  Heart: () => <svg viewBox="0 0 24 24" className="ico"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
  Cart: () => <svg viewBox="0 0 24 24" className="ico"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>,
  User: () => <svg viewBox="0 0 24 24" className="ico"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>,
  Camera: () => <svg viewBox="0 0 24 24" className="ico"><circle cx="12" cy="13" r="4"/><path d="M23 19V8a2 2 0 0 0-2-2h-3.17a2 2 0 0 1-1.41-.59l-1.83-1.83A2 2 0 0 0 13.17 3h-2.34a2 2 0 0 0-1.42.59L7.58 5.41A2 2 0 0 1 6.17 6H3a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2z"/></svg>,
  Arrow: () => <svg viewBox="0 0 24 24" className="ico"><path d="M5 12h14M13 6l6 6-6 6"/></svg>,
  Check: () => <svg viewBox="0 0 24 24" className="ico"><path d="M20 6 9 17l-5-5"/></svg>,
  Star: () => <svg viewBox="0 0 24 24" className="ico"><polygon points="12 2 15 8.5 22 9.3 17 14 18.5 21 12 17.5 5.5 21 7 14 2 9.3 9 8.5 12 2"/></svg>,
  Pin: () => <svg viewBox="0 0 24 24" className="ico"><circle cx="12" cy="11" r="3"/><path d="M12 22s8-7 8-13a8 8 0 0 0-16 0c0 6 8 13 8 13z"/></svg>,
  Chevron: () => <svg viewBox="0 0 24 24" className="ico"><path d="m6 9 6 6 6-6"/></svg>,
};

// Stylized SVG glasses placeholder — used in product photos
const Glasses = ({ frame = '#1a1a1a', tint = 'transparent' }) => (
  <svg viewBox="0 0 200 80" style={{ width: '70%', height: 'auto', maxWidth: 220 }}>
    <circle cx="50" cy="40" r="30" fill={tint} stroke={frame} strokeWidth="4"/>
    <circle cx="150" cy="40" r="30" fill={tint} stroke={frame} strokeWidth="4"/>
    <path d="M80 40 Q 100 28, 120 40" fill="none" stroke={frame} strokeWidth="4" strokeLinecap="round"/>
    <path d="M20 38 L 8 30" stroke={frame} strokeWidth="4" strokeLinecap="round"/>
    <path d="M180 38 L 192 30" stroke={frame} strokeWidth="4" strokeLinecap="round"/>
  </svg>
);

Object.assign(window, { Button, Chip, Badge, Eyebrow, Ico, Glasses });
