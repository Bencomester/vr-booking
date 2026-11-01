import { type Language, translateHeadsetStatus, translations } from '../i18n';
import type { GameDto, HeadsetDto, PageRoute, RigDto } from '../types';
import { DEFAULT_HEADSET_IMG, formatHuf, getGameCoverUrl } from '../utils/formatters';

interface HomePageProps {
    headsets: HeadsetDto[];
    games: GameDto[];
    rigs: RigDto[];
    lang: Language;
    onNavigate: (route: PageRoute) => void;
    onSelectHeadsetForBooking: (headsetId: number) => void;
    onOpenGameDetails: (game: GameDto) => void;
}

export function HomePage({
                             headsets,
                             games,
                             rigs,
                             lang,
                             onNavigate,
                             onSelectHeadsetForBooking,
                             onOpenGameDetails,
                         }: HomePageProps) {
    const t = translations[lang].home;

    return (
        <div className="page-transition">
            <section className="hero-section">
                <div className="hero-copy">
                    <div className="eyebrow-pill">{t.eyebrow}</div>
                    <h1 className="hero-title">
                        {t.heroTitlePrefix}
                        <span className="gradient-text">{t.heroTitleHighlight}</span>
                    </h1>
                    <p className="hero-description">{t.heroDesc}</p>
                    <div className="hero-cta-row">
                        <button
                            type="button"
                            className="primary-btn glow-btn large"
                            onClick={() => onNavigate('TIMETABLE')}
                        >
                            {t.ctaReserve}
                        </button>
                        <button
                            type="button"
                            className="secondary-btn large"
                            onClick={() => onNavigate('GAMES')}
                        >
                            {t.ctaExploreGames}
                        </button>
                    </div>

                    <div className="stats-strip">
                        <div className="stat-item">
                            <span className="stat-value">
                                {headsets.filter((h) => h.status === 'Available').length} / {headsets.length}
                            </span>
                            <span className="stat-label">{t.statActiveHeadsets}</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-value">{games.length}+</span>
                            <span className="stat-label">{t.statSteamTitles}</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-value">{rigs.length}</span>
                            <span className="stat-label">{t.statCustomRigs}</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-value">00–24h</span>
                            <span className="stat-label">{t.statLiveBooking}</span>
                        </div>
                    </div>
                </div>

                <div className="hero-visual">
                    <div className="floating-showcase-card">
                        <img
                            src={headsets[0]?.imageUrl || DEFAULT_HEADSET_IMG}
                            alt="Featured VR Headset"
                            className="hero-img"
                        />
                        <div className="hero-card-overlay">
                            <span className="badge badge-Available">{t.liveTelemetry}</span>
                            <h3>{headsets[0]?.name || 'Valve Index'}</h3>
                            <p className="hero-price-tag">
                                {t.fromPriceHour(formatHuf(headsets[0]?.hourlyPrice || 5500))}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="home-section">
                <div className="section-header-row">
                    <div>
                        <h2>{t.featuredFleetTitle}</h2>
                        <p className="subtitle">{t.featuredFleetSub}</p>
                    </div>
                    <button type="button" className="secondary-btn" onClick={() => onNavigate('HEADSETS')}>
                        {t.viewAllHeadsets}
                    </button>
                </div>
                <div className="card-grid">
                    {headsets.slice(0, 3).map((h) => (
                        <div key={h.id} className="card media-card">
                            <div className="card-image-wrap">
                                <img src={h.imageUrl || DEFAULT_HEADSET_IMG} alt={h.name} />
                                <span className={`badge floating-badge badge-${h.status.replace(/[^a-zA-Z]/g, '')}`}>
                                    {translateHeadsetStatus(h.status, lang)}
                                </span>
                            </div>
                            <div className="card-body">
                                <h3>{h.name}</h3>
                                <p className="price-tag">
                                    {formatHuf(h.hourlyPrice)} / {t.hourShort}
                                </p>
                                <p className="muted-text">{h.description}</p>
                                <button
                                    type="button"
                                    className="primary-btn full-btn"
                                    onClick={() => {
                                        if (h.id !== undefined && h.status === 'Available') {
                                            onSelectHeadsetForBooking(h.id);
                                        } else {
                                            onNavigate('HEADSETS');
                                        }
                                    }}
                                >
                                    {h.status === 'Available' ? t.checkWeeklySlots : t.inspectSpecs}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section className="home-section">
                <div className="section-header-row">
                    <div>
                        <h2>{t.blockbustersTitle}</h2>
                        <p className="subtitle">{t.blockbustersSub}</p>
                    </div>
                    <button type="button" className="secondary-btn" onClick={() => onNavigate('GAMES')}>
                        {t.fullGameLibrary}
                    </button>
                </div>
                <div className="card-grid">
                    {games.slice(0, 3).map((g) => (
                        <div key={g.id} className="card media-card">
                            <div className="card-image-wrap">
                                <img src={getGameCoverUrl(g)} alt={g.title} />
                                {g.steamAppId && <span className="steam-pill">STEAM #{g.steamAppId}</span>}
                            </div>
                            <div className="card-body">
                                <h3>{g.title}</h3>
                                <p className="muted-text">{g.description}</p>
                                <button
                                    type="button"
                                    className="secondary-btn full-btn"
                                    onClick={() => onOpenGameDetails(g)}
                                >
                                    {t.inspectLiveSteam}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
