import { type Language, translateHeadsetStatus, translations } from '../i18n';
import type { GameDto, HeadsetDto, RigDto, SteamGameDetailsDto } from '../types';
import {
    DEFAULT_HEADSET_IMG,
    DEFAULT_RIG_IMG,
    formatHuf,
    getGameCoverUrl,
} from '../utils/formatters';

interface GameSteamModalProps {
    readonly game: GameDto;
    readonly steamDetails: SteamGameDetailsDto | null;
    readonly steamLoading: boolean;
    readonly steamError: string | null;
    readonly lang: Language;
    readonly onClose: () => void;
    readonly onBookNow: () => void;
}

export function GameSteamModal({
                                   game,
                                   steamDetails,
                                   steamLoading,
                                   steamError,
                                   lang,
                                   onClose,
                                   onBookNow,
                               }: Readonly<GameSteamModalProps>) {
    const t = translations[lang].modals;

    return (
        <div className="modal-backdrop">
            <button
                type="button"
                className="modal-backdrop-btn"
                aria-label={t.close}
                onClick={onClose}
            />
            <dialog open className="modal-card steam-modal card">
                <div className="modal-banner-wrap">
                    <img
                        src={steamDetails?.headerImage || getGameCoverUrl(game)}
                        alt={game.title}
                        className="modal-banner-img"
                    />
                    <button type="button" className="modal-close-icon" onClick={onClose} aria-label={t.close}>
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
                                {t.openOnSteam}
                            </a>
                        )}
                    </div>

                    <p className="modal-description">
                        {steamDetails?.shortDescription || game.description}
                    </p>

                    {steamLoading && <div className="steam-loading-box">{t.syncingSteam}</div>}

                    {steamError && (
                        <p className="small-text" style={{ color: '#f87171' }}>
                            {t.steamApiNote} {steamError}
                        </p>
                    )}

                    {steamDetails && (
                        <div className="steam-extra-details">
                            <div className="steam-meta-grid">
                                <div>
                                    <strong>{t.developers}</strong> {steamDetails.developers?.join(', ') || 'N/A'}
                                </div>
                                <div>
                                    <strong>{t.publishers}</strong> {steamDetails.publishers?.join(', ') || 'N/A'}
                                </div>
                                <div>
                                    <strong>{t.releaseDate}</strong> {steamDetails.releaseDate || 'N/A'}
                                </div>
                                {steamDetails.metacriticScore != null && (
                                    <div>
                                        <strong>{t.metacritic}</strong>{' '}
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
                            {t.bookForThisGame}
                        </button>
                        <button type="button" className="secondary-btn" onClick={onClose}>
                            {t.close}
                        </button>
                    </div>
                </div>
            </dialog>
        </div>
    );
}

interface HeadsetModalProps {
    readonly headset: HeadsetDto;
    readonly lang: Language;
    readonly onClose: () => void;
    readonly onBookHeadset?: (headsetId: number) => void;
}

export function HeadsetModal({
                                 headset,
                                 lang,
                                 onClose,
                                 onBookHeadset,
                             }: Readonly<HeadsetModalProps>) {
    const t = translations[lang].modals;
    const tc = translations[lang].catalog;

    return (
        <div className="modal-backdrop">
            <button
                type="button"
                className="modal-backdrop-btn"
                aria-label={t.close}
                onClick={onClose}
            />
            <dialog open className="modal-card card">
                <div className="modal-banner-wrap">
                    <img
                        src={headset.imageUrl || DEFAULT_HEADSET_IMG}
                        alt={headset.name}
                        className="modal-banner-img"
                    />
                    <button type="button" className="modal-close-icon" onClick={onClose} aria-label={t.close}>
                        ✕
                    </button>
                </div>
                <div className="modal-content-body">
                    <div className="card-header">
                        <h2>{headset.name}</h2>
                        <span className={`badge badge-${headset.status.replace(/[^a-zA-Z]/g, '')}`}>
                            {translateHeadsetStatus(headset.status, lang)}
                        </span>
                    </div>
                    <p className="price-tag">
                        {formatHuf(headset.hourlyPrice)} {tc.perHour}
                    </p>
                    <p className="modal-description">{headset.description}</p>
                    <h4>{t.installedGamesCount(headset.installedGames?.length || 0)}</h4>
                    <div className="installed-tags">
                        {headset.installedGames?.map((g) => (
                            <span key={g.id} className="game-chip">
                                {g.title}
                            </span>
                        ))}
                        {(!headset.installedGames || headset.installedGames.length === 0) && (
                            <span className="muted-text">{tc.noGamesListed}</span>
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
                                {t.bookThisHeadset}
                            </button>
                        )}
                        <button type="button" className="secondary-btn" onClick={onClose}>
                            {t.close}
                        </button>
                    </div>
                </div>
            </dialog>
        </div>
    );
}

interface RigModalProps {
    readonly rig: RigDto;
    readonly lang: Language;
    readonly onClose: () => void;
}

export function RigModal({ rig, lang, onClose }: Readonly<RigModalProps>) {
    const t = translations[lang].modals;

    return (
        <div className="modal-backdrop">
            <button
                type="button"
                className="modal-backdrop-btn"
                aria-label={t.close}
                onClick={onClose}
            />
            <dialog open className="modal-card card">
                <div className="modal-banner-wrap">
                    <img
                        src={rig.imageUrl || DEFAULT_RIG_IMG}
                        alt={rig.name}
                        className="modal-banner-img"
                    />
                    <button type="button" className="modal-close-icon" onClick={onClose} aria-label={t.close}>
                        ✕
                    </button>
                </div>
                <div className="modal-content-body">
                    <h2>{rig.name}</h2>
                    <ul className="spec-list">
                        <li>
                            <strong>{t.cpu}</strong> {rig.cpu}
                        </li>
                        <li>
                            <strong>{t.gpu}</strong> {rig.gpu}
                        </li>
                        <li>
                            <strong>{t.ram}</strong> {rig.ram}
                        </li>
                        <li>
                            <strong>{t.os}</strong> {rig.os || 'Windows 11 Pro'}
                        </li>
                    </ul>
                    <p className="modal-description">{rig.description}</p>
                    <div className="btn-group" style={{ marginTop: '20px' }}>
                        <button type="button" className="secondary-btn" onClick={onClose}>
                            {t.close}
                        </button>
                    </div>
                </div>
            </dialog>
        </div>
    );
}