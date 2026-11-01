import { useState } from 'react';
import { HeadsetModal, RigModal } from '../components/Modals';
import { type Language, translateHeadsetStatus, translations } from '../i18n';
import type { GameDto, HeadsetDto, RigDto } from '../types';
import {
    DEFAULT_HEADSET_IMG,
    DEFAULT_RIG_IMG,
    formatHuf,
    getGameCoverUrl,
} from '../utils/formatters';

interface GamesPageProps {
    games: GameDto[];
    lang: Language;
    onOpenGameDetails: (game: GameDto) => void;
}

export function GamesPage({ games, lang, onOpenGameDetails }: Readonly<GamesPageProps>) {
    const t = translations[lang].catalog;

    return (
        <section className="page-transition">
            <div className="section-header-row">
                <div>
                    <h1>{t.gamesTitle}</h1>
                    <p className="subtitle">{t.gamesSub}</p>
                </div>
            </div>

            <div className="card-grid">
                {games.map((g) => (
                    <div key={g.id} className="card media-card">
                        <div className="card-image-wrap">
                            <img src={getGameCoverUrl(g)} alt={g.title} />
                            {g.steamAppId && <span className="steam-pill">Steam App #{g.steamAppId}</span>}
                        </div>
                        <div className="card-body">
                            <h3>{g.title}</h3>
                            <p className="muted-text">{g.description}</p>
                            <button
                                type="button"
                                className="primary-btn full-btn"
                                onClick={() => onOpenGameDetails(g)}
                            >
                                {t.viewSteamDetails}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

interface HeadsetsPageProps {
    headsets: HeadsetDto[];
    lang: Language;
    onBookHeadset: (headsetId: number) => void;
}

export function HeadsetsPage({ headsets, lang, onBookHeadset }: Readonly<HeadsetsPageProps>) {
    const [selectedHeadset, setSelectedHeadset] = useState<HeadsetDto | null>(null);
    const t = translations[lang].catalog;

    return (
        <section className="page-transition">
            <div className="section-header-row">
                <div>
                    <h1>{t.headsetsTitle}</h1>
                    <p className="subtitle">{t.headsetsSub}</p>
                </div>
            </div>

            <div className="card-grid">
                {headsets.map((h) => (
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
                                {formatHuf(h.hourlyPrice)} {t.perHour}
                            </p>
                            <p className="muted-text">{h.description}</p>
                            <div className="installed-tags">
                                {(h.installedGames || []).map((g) => (
                                    <span key={g.id} className="game-chip">
                                        {g.title}
                                    </span>
                                ))}
                                {(!h.installedGames || h.installedGames.length === 0) && (
                                    <span className="muted-text">{t.noGamesListed}</span>
                                )}
                            </div>
                            <div className="btn-group" style={{ marginTop: '16px' }}>
                                <button
                                    type="button"
                                    className="secondary-btn"
                                    onClick={() => setSelectedHeadset(h)}
                                >
                                    {t.specsAndGames}
                                </button>
                                {h.status === 'Available' && h.id !== undefined && (
                                    <button
                                        type="button"
                                        className="primary-btn"
                                        onClick={() => onBookHeadset(h.id!)}
                                    >
                                        {t.bookNow}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {selectedHeadset && (
                <HeadsetModal
                    headset={selectedHeadset}
                    lang={lang}
                    onClose={() => setSelectedHeadset(null)}
                    onBookHeadset={onBookHeadset}
                />
            )}
        </section>
    );
}

interface RigsPageProps {
    rigs: RigDto[];
    lang: Language;
}

export function RigsPage({ rigs, lang }: Readonly<RigsPageProps>) {
    const [selectedRig, setSelectedRig] = useState<RigDto | null>(null);
    const t = translations[lang].catalog;

    return (
        <section className="page-transition">
            <div className="section-header-row">
                <div>
                    <h1>{t.rigsTitle}</h1>
                    <p className="subtitle">{t.rigsSub}</p>
                </div>
            </div>

            <div className="card-grid">
                {rigs.map((r) => (
                    <div key={r.id} className="card media-card">
                        <div className="card-image-wrap">
                            <img src={r.imageUrl || DEFAULT_RIG_IMG} alt={r.name} />
                            {r.os && <span className="steam-pill">{r.os}</span>}
                        </div>
                        <div className="card-body">
                            <h3>{r.name}</h3>
                            <ul className="spec-list">
                                <li>
                                    <strong>CPU:</strong> {r.cpu}
                                </li>
                                <li>
                                    <strong>GPU:</strong> {r.gpu}
                                </li>
                                <li>
                                    <strong>RAM:</strong> {r.ram}
                                </li>
                                <li>
                                    <strong>OS:</strong> {r.os || 'Windows 11 Pro'}
                                </li>
                            </ul>
                            <p className="muted-text">{r.description}</p>
                            <button
                                type="button"
                                className="secondary-btn full-btn"
                                onClick={() => setSelectedRig(r)}
                            >
                                {t.inspectFullBuild}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {selectedRig && <RigModal rig={selectedRig} lang={lang} onClose={() => setSelectedRig(null)} />}
        </section>
    );
}