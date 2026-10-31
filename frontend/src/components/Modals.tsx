import type { GameDto, HeadsetDto, RigDto, SteamGameDetailsDto } from '../types';
import {
    DEFAULT_HEADSET_IMG,
    DEFAULT_RIG_IMG,
    formatHuf,
    getGameCoverUrl,
} from '../utils/formatters';

interface GameSteamModalProps {
    game: GameDto;
    steamDetails: SteamGameDetailsDto | null;
    steamLoading: boolean;
    steamError: string | null;
    onClose: () => void;
    onBookNow: () => void;
}

export function GameSteamModal({
                                   game,
                                   steamDetails,
                                   steamLoading,
                                   steamError,
                                   onClose,
                                   onBookNow,
                               }: GameSteamModalProps) {
    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-card steam-modal card" onClick={(e) => e.stopPropagation()}>
                <div className="modal-banner-wrap">
                    <img
                        src={steamDetails?.headerImage || getGameCoverUrl(game)}
                        alt={game.title}
                        className="modal-banner-img"
                    />
                    <button type="button" className="modal-close-icon" onClick={onClose} aria-label="Close">
                        ✕
                    </button>
                </div>
                <div className="modal-content-body">
                    <div className="card-header">
                        <h2>{steamDetails?.name || game.title}</h2>
                        {game.steamAppId && (
                            <a
                                href={`https://store.steampowered.com/app/${game.steamAppId}`}
                                target="_blank"
                                rel="noreferrer"
                                className="steam-store-link"
                            >
                                Open on Steam Store ↗
                            </a>
                        )}
                    </div>

                    <p className="modal-description">
                        {steamDetails?.shortDescription || game.description}
                    </p>

                    {steamLoading && (
                        <div className="steam-loading-box">
                            Syncing live telemetry from public Steam Store API...
                        </div>
                    )}

                    {steamError && (
                        <p className="small-text" style={{ color: '#f87171' }}>
                            Steam API note: {steamError}
                        </p>
                    )}

                    {steamDetails && (
                        <div className="steam-extra-details">
                            <div className="steam-meta-grid">
                                <div>
                                    <strong>Developers:</strong> {steamDetails.developers?.join(', ') || 'N/A'}
                                </div>
                                <div>
                                    <strong>Publishers:</strong> {steamDetails.publishers?.join(', ') || 'N/A'}
                                </div>
                                <div>
                                    <strong>Release Date:</strong> {steamDetails.releaseDate || 'N/A'}
                                </div>
                                {steamDetails.metacriticScore != null && (
                                    <div>
                                        <strong>Metacritic:</strong>{' '}
                                        <span className="metacritic-badge">{steamDetails.metacriticScore}</span>
                                    </div>
                                )}
                            </div>

                            {steamDetails.genres && steamDetails.genres.length > 0 && (
                                <div className="installed-tags" style={{ marginTop: '14px' }}>
                                    {steamDetails.genres.map((genre) => (
                                        <span key={genre} className="game-chip">
                      {genre}
                    </span>
                                    ))}
                                </div>
                            )}

                            {steamDetails.screenshots && steamDetails.screenshots.length > 0 && (
                                <div className="steam-screenshots-grid">
                                    {steamDetails.screenshots.map((shotUrl) => (
                                        <a key={shotUrl} href={shotUrl} target="_blank" rel="noreferrer">
                                            <img src={shotUrl} alt="Steam Screenshot" />
                                        </a>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="btn-group" style={{ marginTop: '24px' }}>
                        <button type="button" className="primary-btn" onClick={onBookNow}>
                            Book a VR Headset for This Game
                        </button>
                        <button type="button" className="secondary-btn" onClick={onClose}>
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

interface HeadsetModalProps {
    headset: HeadsetDto;
    onClose: () => void;
    onBookHeadset?: (headsetId: number) => void;
}

export function HeadsetModal({ headset, onClose, onBookHeadset }: HeadsetModalProps) {
    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-card card" onClick={(e) => e.stopPropagation()}>
                <div className="modal-banner-wrap">
                    <img
                        src={headset.imageUrl || DEFAULT_HEADSET_IMG}
                        alt={headset.name}
                        className="modal-banner-img"
                    />
                    <button type="button" className="modal-close-icon" onClick={onClose} aria-label="Close">
                        ✕
                    </button>
                </div>
                <div className="modal-content-body">
                    <div className="card-header">
                        <h2>{headset.name}</h2>
                        <span className={`badge badge-${headset.status.replace(/[^a-zA-Z]/g, '')}`}>
              {headset.status}
            </span>
                    </div>
                    <p className="price-tag">{formatHuf(headset.hourlyPrice)} / hour</p>
                    <p className="modal-description">
                        {headset.description || 'No additional description provided.'}
                    </p>
                    <h4>Installed Games ({headset.installedGames?.length || 0}):</h4>
                    <div className="installed-tags">
                        {headset.installedGames?.map((g) => (
                            <span key={g.id} className="game-chip">
                {g.title}
              </span>
                        ))}
                        {(!headset.installedGames || headset.installedGames.length === 0) && (
                            <span className="muted-text">No pre-installed games listed</span>
                        )}
                    </div>
                    <div className="btn-group" style={{ marginTop: '24px' }}>
                        {headset.status === 'Available' && headset.id !== undefined && onBookHeadset && (
                            <button
                                type="button"
                                className="primary-btn"
                                onClick={() => {
                                    onClose();
                                    onBookHeadset(headset.id!);
                                }}
                            >
                                Book This Headset →
                            </button>
                        )}
                        <button type="button" className="secondary-btn" onClick={onClose}>
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

interface RigModalProps {
    rig: RigDto;
    onClose: () => void;
}

export function RigModal({ rig, onClose }: RigModalProps) {
    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-card card" onClick={(e) => e.stopPropagation()}>
                <div className="modal-banner-wrap">
                    <img
                        src={rig.imageUrl || DEFAULT_RIG_IMG}
                        alt={rig.name}
                        className="modal-banner-img"
                    />
                    <button type="button" className="modal-close-icon" onClick={onClose} aria-label="Close">
                        ✕
                    </button>
                </div>
                <div className="modal-content-body">
                    <h2>{rig.name}</h2>
                    <ul className="spec-list">
                        <li>
                            <strong>Processor (CPU):</strong> {rig.cpu}
                        </li>
                        <li>
                            <strong>Graphics (GPU):</strong> {rig.gpu}
                        </li>
                        <li>
                            <strong>Memory (RAM):</strong> {rig.ram}
                        </li>
                        <li>
                            <strong>Operating System:</strong> {rig.os || 'Windows 11 Pro'}
                        </li>
                    </ul>
                    <p className="modal-description">{rig.description}</p>
                    <div className="btn-group" style={{ marginTop: '20px' }}>
                        <button type="button" className="secondary-btn" onClick={onClose}>
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}