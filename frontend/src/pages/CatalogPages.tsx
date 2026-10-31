import { useState } from 'react';
import { HeadsetModal, RigModal } from '../components/Modals';
import type { GameDto, HeadsetDto, RigDto } from '../types';
import {
    DEFAULT_HEADSET_IMG,
    DEFAULT_RIG_IMG,
    formatHuf,
    getGameCoverUrl,
} from '../utils/formatters';

interface GamesPageProps {
    games: GameDto[];
    onOpenGameDetails: (game: GameDto) => void;
}

export function GamesPage({ games, onOpenGameDetails }: GamesPageProps) {
    return (
        <section className="page-transition">
            <div className="section-header-row">
                <div>
                    <h1>Steam VR Games Library</h1>
                    <p className="subtitle">
                        Every game includes cover artwork and live Steam Store API telemetry lookup.
                    </p>
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
                                View Steam API Details
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
    onBookHeadset: (headsetId: number) => void;
}

export function HeadsetsPage({ headsets, onBookHeadset }: HeadsetsPageProps) {
    const [selectedHeadset, setSelectedHeadset] = useState<HeadsetDto | null>(null);

    return (
        <section className="page-transition">
            <div className="section-header-row">
                <div>
                    <h1>VR Headsets Fleet</h1>
                    <p className="subtitle">Compare optics, installed Steam games, and hourly HUF rates.</p>
                </div>
            </div>

            <div className="card-grid">
                {headsets.map((h) => (
                    <div key={h.id} className="card media-card">
                        <div className="card-image-wrap">
                            <img src={h.imageUrl || DEFAULT_HEADSET_IMG} alt={h.name} />
                            <span className={`badge floating-badge badge-${h.status.replace(/[^a-zA-Z]/g, '')}`}>
                {h.status}
              </span>
                        </div>
                        <div className="card-body">
                            <h3>{h.name}</h3>
                            <p className="price-tag">{formatHuf(h.hourlyPrice)} / hour</p>
                            <p className="muted-text">
                                {h.description || 'High-fidelity VR headset ready for room-scale experiences.'}
                            </p>
                            <div className="installed-tags">
                                {(h.installedGames || []).map((g) => (
                                    <span key={g.id} className="game-chip">
                    {g.title}
                  </span>
                                ))}
                                {(!h.installedGames || h.installedGames.length === 0) && (
                                    <span className="muted-text">No pre-installed games listed</span>
                                )}
                            </div>
                            <div className="btn-group" style={{ marginTop: '16px' }}>
                                <button
                                    type="button"
                                    className="secondary-btn"
                                    onClick={() => setSelectedHeadset(h)}
                                >
                                    Specs & Games
                                </button>
                                {h.status === 'Available' && h.id !== undefined && (
                                    <button
                                        type="button"
                                        className="primary-btn"
                                        onClick={() => onBookHeadset(h.id!)}
                                    >
                                        Book Now
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
                    onClose={() => setSelectedHeadset(null)}
                    onBookHeadset={onBookHeadset}
                />
            )}
        </section>
    );
}

interface RigsPageProps {
    rigs: RigDto[];
}

export function RigsPage({ rigs }: RigsPageProps) {
    const [selectedRig, setSelectedRig] = useState<RigDto | null>(null);

    return (
        <section className="page-transition">
            <div className="section-header-row">
                <div>
                    <h1>High-Performance VR PC Rigs</h1>
                    <p className="subtitle">
                        Custom liquid-cooled workstations engineered for zero-latency VR rendering.
                    </p>
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
                                Inspect Full Build
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {selectedRig && <RigModal rig={selectedRig} onClose={() => setSelectedRig(null)} />}
        </section>
    );
}