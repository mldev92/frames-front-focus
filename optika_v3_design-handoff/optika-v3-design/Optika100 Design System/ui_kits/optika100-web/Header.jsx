const Header = ({ active = 'eyeglasses', city = 'СПб', onNav }) => {
  const items = [
    { id: 'eyeglasses', label: 'Очки' },
    { id: 'sunglasses', label: 'Солнцезащитные' },
    { id: 'lenses', label: 'Линзы' },
    { id: 'brands', label: 'Бренды' },
    { id: 'fitting', label: 'Подбор' },
  ];
  return (
    <header className="o100-header">
      <div className="o100-mark" onClick={() => onNav?.('home')}>
        OPTIKA100<span className="dot">.</span>
      </div>
      <nav className="o100-nav">
        {items.map(it => (
          <a key={it.id} className={active === it.id ? 'active' : ''} onClick={() => onNav?.(it.id)}>{it.label}</a>
        ))}
      </nav>
      <div className="o100-actions">
        <span className="o100-city"><span className="pulse"></span>{city}</span>
        <ThemeToggle/>
        <button className="ico-btn"><Ico.Search/></button>
        <button className="ico-btn"><Ico.Heart/></button>
        <button className="ico-btn"><Ico.User/></button>
        <button className="ico-btn cart"><Ico.Cart/><span className="cart-count">2</span></button>
      </div>
    </header>
  );
};

Object.assign(window, { Header });
