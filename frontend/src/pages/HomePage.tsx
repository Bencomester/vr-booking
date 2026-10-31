import type { GameDto, HeadsetDto, PageRoute, RigDto } from '../types';
import { DEFAULT_HEADSET_IMG, formatHuf, getGameCoverUrl } from '../utils/formatters';

interface HomePageProps {
    headsets: HeadsetDto[];
    games: GameDto[];
    rigs: RigDto[];
    onNavigate: (route: PageRoute) => void;
    onSelectHeadsetForBooking: (headsetId: number) => void;
    onOpenGameDetails: (game: GameDto) => void;
}

export function HomePage({
                             headsets,
                             games,
                             rigs,
                             onNavigate,
                             onSelectHeadsetForBooking,
                             onOpenGameDetails,
                         }: HomePageProps) {
    return (
        <div className="page-transition">
            <section className="hero-section">
                <div className="hero-copy">
                    <div className="eyebrow-pill">NEXT-GEN SPATIAL GAMING ARENA • DEBRECEN</div>
                    <h1 className="hero-title">
                        Step Beyond Reality Into <span className="gradient-text">Hyper-Immersion.</span>
                    </h1>
                    <p className="hero-description">
                        Experience untethered micro-OLED clarity, full-body finger tracking, and RTX 5090
                        liquid-cooled rigs. Inspect real-time weekly 24-hour availability and reserve your
                        station in seconds.
                    </p>
                    <div className="hero-cta-row">
                        <button
                            type="button"
                            className="primary-btn glow-btn large"
                            onClick={() => onNavigate('TIMETABLE')}
                        >
                            Reserve Your VR Pod →
                        </button>
                        <button
                            type="button"
                            className="secondary-btn large"
                            onClick={() => onNavigate('GAMES')}
                        >
                            Explore Steam VR Library
                        </button>
                    </div>

                    <div className="stats-strip">
                        <div className="stat-item">
              <span className="stat-value">
                {headsets.filter((h) => h.status === 'Available').length} / {headsets.length}
              </span>
                            <span className="stat-label">Active VR Headsets</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-value">{games.length}+</span>
                            <span className="stat-label">Steam VR Titles</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-value">{rigs.length}</span>
                            <span className="stat-label">Custom Liquid Rigs</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-value">00–24h</span>
                            <span className="stat-label">Live Weekly Booking</span>
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
                            <span className="badge badge-Available">LIVE TELEMETRY READY</span>
                            <h3>{headsets[0]?.name || 'Valve Index Pro'}</h3>
                            <p className="hero-price-tag">
                                From {formatHuf(headsets[0]?.hourlyPrice || 5500)} / hour
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="home-section">
                <div className="section-header-row">
                    <div>
                        <h2>Featured VR Fleet</h2>
                        <p className="subtitle">Precision optics and sub-millimeter tracking.</p>
                    </div>
                    <button type="button" className="secondary-btn" onClick={() => onNavigate('HEADSETS')}>
                        View All Headsets →
                    </button>
                </div>
                <div className="card-grid">
                    {headsets.slice(0, 3).map((h) => (
                        <div key={h.id} className="card media-card">
                            <div className="card-image-wrap">
                                <img src={h.imageUrl || DEFAULT_HEADSET_IMG} alt={h.name} />
                                <span className={`badge floating-badge badge-${h.status.replace(/[^a-zA-Z]/g, '')}`}>
                  {h.status}
                </span>
                            </div>
                            <div className="card-body">
                                <h3>{h.name}</h3>
                                <p className="price-tag">{formatHuf(h.hourlyPrice)} / hr</p>
                                <p className="muted-text">
                                    {h.description || 'High-refresh spatial display with precision motion controllers.'}
                                </p>
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
                                    {h.status === 'Available' ? 'Check Weekly Slots' : 'Inspect Specs'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section className="home-section">
                <div className="section-header-row">
                    <div>
                        <h2>Steam VR Blockbusters</h2>
                        <p className="subtitle">
                            Synced directly with the official Steam Store API for live ratings & screenshots.
                        </p>
                    </div>
                    <button type="button" className="secondary-btn" onClick={() => onNavigate('GAMES')}>
                        Full Game Library →
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
                                    Inspect Live Steam Data
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}