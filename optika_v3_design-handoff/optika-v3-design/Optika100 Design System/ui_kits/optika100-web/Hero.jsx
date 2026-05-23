const Hero = ({ onCta }) => (
  <section className="o100-hero">
    <div className="o100-hero-bg"></div>
    <div className="o100-hero-inner">
      <Eyebrow>Новая коллекция · Осень 2026</Eyebrow>
      <h1 className="o100-hero-h1">
        Очки,<br/>
        <em>которые Вам идут.</em>
      </h1>
      <p className="o100-hero-lead">
        Более 11 000 оправ, ручная подгонка в наших салонах в&nbsp;Санкт-Петербурге и&nbsp;Новокузнецке. Виртуальная примерка — за&nbsp;30&nbsp;секунд.
      </p>
      <div className="o100-hero-ctas">
        <Button variant="primary" size="lg" onClick={onCta}>Подобрать оправу</Button>
        <Button variant="secondary" size="lg" leading={<Ico.Camera/>}>Виртуальная примерка</Button>
      </div>
      <div className="o100-hero-meta">
        <div><strong>11 000+</strong><span>оправ от 120 брендов</span></div>
        <div><strong>2 города</strong><span>СПб · Новокузнецк</span></div>
        <div><strong>4.9 ★</strong><span>1840 отзывов</span></div>
      </div>
    </div>
    <div className="o100-hero-visual">
      <div className="o100-hero-frame">
        <Glasses frame="#fff" tint="rgba(255,255,255,0.04)"/>
      </div>
    </div>
  </section>
);

Object.assign(window, { Hero });
