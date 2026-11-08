import { type SyntheticEvent, useState } from 'react';
import { apiFetch } from '../api';
import { Time24Picker } from '../components/TimePicker';
import {
    type Language,
    translateHeadsetStatus,
    translateReservationStatus,
    translations,
} from '../i18n';
import type {
    AvailabilityDto,
    GameDto,
    HeadsetDto,
    HeadsetStatus,
    HeadsetUpdateDto,
    PageRoute,
    ReservationDto,
    ReservationStatus,
    RigDto,
    SteamGameDetailsDto,
    WeekDayInfo,
} from '../types';
import {
    DEFAULT_HEADSET_IMG,
    DEFAULT_RIG_IMG,
    formatDateTime24,
    formatHuf,
    getGameCoverUrl,
    toIsoDateString,
} from '../utils/formatters';
import { logger } from '../utils/logger';

interface AdminStudioPageProps {
    route: PageRoute;
    lang: Language;
    onNavigate: (route: PageRoute) => void;
    games: GameDto[];
    headsets: HeadsetDto[];
    rigs: RigDto[];
    adminAvailabilities: AvailabilityDto[];
    adminReservations: ReservationDto[];
    weekDays: WeekDayInfo[];
    onRefreshAll: () => Promise<void>;
    onCancelReservation: (id: number) => Promise<void>;
    onShowSuccess: (msg: string) => void;
    onShowError: (msg: string) => void;
}

export function AdminStudioPage({
                                    route,
                                    lang,
                                    onNavigate,
                                    games,
                                    headsets,
                                    rigs,
                                    adminAvailabilities,
                                    adminReservations,
                                    weekDays,
                                    onRefreshAll,
                                    onCancelReservation,
                                    onShowSuccess,
                                    onShowError,
                                }: Readonly<AdminStudioPageProps>) {
    const t = translations[lang].admin;

    const [availForm, setAvailForm] = useState<{
        id?: number;
        startDate: string;
        startTime: string;
        endDate: string;
        endTime: string;
    }>(() => {
        const today = toIsoDateString(new Date());
        return { startDate: today, startTime: '10:00', endDate: today, endTime: '22:00' };
    });

    const [gameForm, setGameForm] = useState<GameDto>({
        title: '',
        description: '',
        steamAppId: 0,
        imageUrl: '',
    });
    const [fetchingSteamForm, setFetchingSteamForm] = useState<boolean>(false);

    const [headsetForm, setHeadsetForm] = useState<HeadsetUpdateDto>({
        name: '',
        hourlyPrice: 5500,
        status: 'Available',
        description: '',
        imageUrl: '',
        gameIds: [],
    });

    const [rigForm, setRigForm] = useState<RigDto>({
        name: '',
        cpu: '',
        gpu: '',
        ram: '',
        os: '',
        imageUrl: '',
        description: '',
    });

    const handleSaveAvailability = async (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const payload: AvailabilityDto = {
                startTime: `${availForm.startDate}T${availForm.startTime}:00`,
                endTime: `${availForm.endDate}T${availForm.endTime}:00`,
            };
            if (availForm.id !== undefined) {
                logger.info('ADMIN', `Updating availability window #${availForm.id}`, payload);
                await apiFetch<AvailabilityDto>(`/availability/${availForm.id}`, {
                    method: 'PUT',
                    body: JSON.stringify(payload),
                });
                onShowSuccess(`Availability window #${availForm.id} updated!`);
            } else {
                logger.info('ADMIN', 'Creating new availability window', payload);
                await apiFetch<AvailabilityDto>('/availability', {
                    method: 'POST',
                    body: JSON.stringify(payload),
                });
                onShowSuccess('New availability window added!');
            }
            const today = toIsoDateString(new Date());
            setAvailForm({
                id: undefined,
                startDate: today,
                startTime: '10:00',
                endDate: today,
                endTime: '22:00',
            });
            await onRefreshAll();
        } catch (err) {
            onShowError((err as Error).message);
        }
    };

    const handleGenerateCurrentWeekAvailability = async () => {
        try {
            const missingDays = weekDays.filter(
                (day) => !adminAvailabilities.some((a) => a.startTime.startsWith(day.iso))
            );
            await Promise.all(
                missingDays.map((day) =>
                    apiFetch<AvailabilityDto>('/availability', {
                        method: 'POST',
                        body: JSON.stringify({
                            startTime: `${day.iso}T10:00:00`,
                            endTime: `${day.iso}T22:00:00`,
                        }),
                    })
                )
            );
            const createdCount = missingDays.length;
            logger.info('ADMIN', `Auto-filled ${createdCount} missing availability days`);
            onShowSuccess(
                createdCount > 0
                    ? `Generated 10:00–22:00 availability for ${createdCount} missing day(s) of the week!`
                    : 'All 7 days of the selected week already have availability windows.'
            );
            await onRefreshAll();
        } catch (err) {
            onShowError((err as Error).message);
        }
    };

    const handleDeleteAvailability = async (id: number) => {
        try {
            logger.info('ADMIN', `Deleting availability window #${id}`);
            await apiFetch<void>(`/availability/${id}`, { method: 'DELETE' });
            onShowSuccess('Availability window deleted.');
            await onRefreshAll();
        } catch (err) {
            onShowError((err as Error).message);
        }
    };

    const handleFetchSteamForAdminForm = async () => {
        const appId = gameForm.steamAppId;
        if (!appId || appId <= 0) {
            onShowError('Enter a numeric Steam App ID first.');
            return;
        }
        setFetchingSteamForm(true);
        try {
            logger.info('STEAM', `Pulling Steam Store metadata for appId=${appId}`);
            const details = await apiFetch<SteamGameDetailsDto>(
                `/game/steam/${encodeURIComponent(appId)}`
            );
            setGameForm((prev) => ({
                ...prev,
                title: details.name || prev.title,
                description: details.shortDescription || prev.description,
                imageUrl: details.headerImage || prev.imageUrl,
                steamAppId: Number(details.appId) || prev.steamAppId,
            }));
            onShowSuccess(`Loaded "${details.name}" from Steam API!`);
        } catch (err) {
            onShowError((err as Error).message);
        } finally {
            setFetchingSteamForm(false);
        }
    };

    const handleSaveGame = async (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            if (gameForm.id !== undefined) {
                logger.info('ADMIN', `Updating game #${gameForm.id}`, gameForm);
                await apiFetch<GameDto>(`/game/${gameForm.id}`, {
                    method: 'PUT',
                    body: JSON.stringify(gameForm),
                });
                onShowSuccess(`Game "${gameForm.title}" updated!`);
            } else {
                logger.info('ADMIN', `Creating game "${gameForm.title}"`, gameForm);
                await apiFetch<GameDto>('/game', {
                    method: 'POST',
                    body: JSON.stringify(gameForm),
                });
                onShowSuccess(`Game "${gameForm.title}" created!`);
            }
            setGameForm({ id: undefined, title: '', description: '', steamAppId: 0, imageUrl: '' });
            await onRefreshAll();
        } catch (err) {
            onShowError((err as Error).message);
        }
    };

    const handleDeleteGame = async (id: number) => {
        try {
            logger.info('ADMIN', `Deleting game #${id}`);
            await apiFetch<void>(`/game/${id}`, { method: 'DELETE' });
            onShowSuccess('Game deleted.');
            await onRefreshAll();
        } catch (err) {
            onShowError((err as Error).message);
        }
    };

    const handleSaveHeadset = async (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const selectedGames = games.filter(
                (g) => g.id !== undefined && headsetForm.gameIds.includes(g.id)
            );
            const dto: HeadsetDto = {
                id: headsetForm.id,
                name: headsetForm.name,
                hourlyPrice: headsetForm.hourlyPrice,
                status: headsetForm.status,
                description: headsetForm.description,
                imageUrl: headsetForm.imageUrl,
                installedGames: selectedGames,
            };
            if (headsetForm.id !== undefined) {
                logger.info('ADMIN', `Updating headset #${headsetForm.id}`, dto);
                await apiFetch<HeadsetDto>(`/headset/${headsetForm.id}`, {
                    method: 'PUT',
                    body: JSON.stringify(dto),
                });
                onShowSuccess(`Headset "${headsetForm.name}" updated!`);
            } else {
                logger.info('ADMIN', `Creating headset "${headsetForm.name}"`, dto);
                await apiFetch<HeadsetDto>('/headset', {
                    method: 'POST',
                    body: JSON.stringify(dto),
                });
                onShowSuccess(`Headset "${headsetForm.name}" created!`);
            }
            setHeadsetForm({
                id: undefined,
                name: '',
                hourlyPrice: 5500,
                status: 'Available',
                description: '',
                imageUrl: '',
                gameIds: [],
            });
            await onRefreshAll();
        } catch (err) {
            onShowError((err as Error).message);
        }
    };

    const handleDeleteHeadset = async (id: number) => {
        try {
            logger.info('ADMIN', `Deleting headset #${id}`);
            await apiFetch<void>(`/headset/${id}`, { method: 'DELETE' });
            onShowSuccess('Headset deleted.');
            await onRefreshAll();
        } catch (err) {
            onShowError((err as Error).message);
        }
    };

    const handleSaveRig = async (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            if (rigForm.id !== undefined) {
                logger.info('ADMIN', `Updating PC rig #${rigForm.id}`, rigForm);
                await apiFetch<RigDto>(`/rig/${rigForm.id}`, {
                    method: 'PUT',
                    body: JSON.stringify(rigForm),
                });
                onShowSuccess(`Rig "${rigForm.name}" updated!`);
            } else {
                logger.info('ADMIN', `Creating PC rig "${rigForm.name}"`, rigForm);
                await apiFetch<RigDto>('/rig', {
                    method: 'POST',
                    body: JSON.stringify(rigForm),
                });
                onShowSuccess(`Rig "${rigForm.name}" created!`);
            }
            setRigForm({
                id: undefined,
                name: '',
                cpu: '',
                gpu: '',
                ram: '',
                os: '',
                imageUrl: '',
                description: '',
            });
            await onRefreshAll();
        } catch (err) {
            onShowError((err as Error).message);
        }
    };

    const handleDeleteRig = async (id: number) => {
        try {
            logger.info('ADMIN', `Deleting PC rig #${id}`);
            await apiFetch<void>(`/rig/${id}`, { method: 'DELETE' });
            onShowSuccess('Rig deleted.');
            await onRefreshAll();
        } catch (err) {
            onShowError((err as Error).message);
        }
    };

    const handleUpdateReservationStatus = async (id: number, status: ReservationStatus) => {
        try {
            logger.info('ADMIN', `Changing reservation #${id} status to ${status}`);
            await apiFetch<ReservationDto>(
                `/reservation/${id}/status?status=${encodeURIComponent(status)}`,
                { method: 'PUT' }
            );
            onShowSuccess(`Reservation #${id} status changed to ${status}.`);
            await onRefreshAll();
        } catch (err) {
            onShowError((err as Error).message);
        }
    };

    const handleDeleteReservation = async (id: number) => {
        try {
            logger.info('ADMIN', `Permanently deleting reservation #${id}`);
            await apiFetch<void>(`/reservation/${id}`, { method: 'DELETE' });
            onShowSuccess(`Reservation #${id} permanently deleted.`);
            await onRefreshAll();
        } catch (err) {
            onShowError((err as Error).message);
        }
    };

    return (
        <section className="page-transition">
            <div className="admin-header">
                <div>
                    <h1>{t.studioTitle}</h1>
                    <p className="subtitle">{t.studioSub}</p>
                </div>
                <div className="admin-subnav">
                    <button
                        type="button"
                        className={route === 'ADMIN_AVAILABILITY' ? 'subnav-btn active' : 'subnav-btn'}
                        onClick={() => onNavigate('ADMIN_AVAILABILITY')}
                    >
                        {t.tabAvailability}
                    </button>
                    <button
                        type="button"
                        className={route === 'ADMIN_HEADSETS' ? 'subnav-btn active' : 'subnav-btn'}
                        onClick={() => onNavigate('ADMIN_HEADSETS')}
                    >
                        {t.tabHeadsets}
                    </button>
                    <button
                        type="button"
                        className={route === 'ADMIN_GAMES' ? 'subnav-btn active' : 'subnav-btn'}
                        onClick={() => onNavigate('ADMIN_GAMES')}
                    >
                        {t.tabGames}
                    </button>
                    <button
                        type="button"
                        className={route === 'ADMIN_RIGS' ? 'subnav-btn active' : 'subnav-btn'}
                        onClick={() => onNavigate('ADMIN_RIGS')}
                    >
                        {t.tabRigs}
                    </button>
                    <button
                        type="button"
                        className={route === 'ADMIN_RESERVATIONS' ? 'subnav-btn active' : 'subnav-btn'}
                        onClick={() => onNavigate('ADMIN_RESERVATIONS')}
                    >
                        {t.tabReservations}
                    </button>
                </div>
            </div>

            {route === 'ADMIN_AVAILABILITY' && (
                <div className="admin-workspace-grid">
                    <div className="card">
                        <div className="card-header">
                            <h2>
                                {availForm.id !== undefined
                                    ? t.editAvailTitle(availForm.id)
                                    : t.addAvailTitle}
                            </h2>
                            <button
                                type="button"
                                className="secondary-btn small"
                                onClick={() => void handleGenerateCurrentWeekAvailability()}
                            >
                                {t.autoFillBtn}
                            </button>
                        </div>
                        <form className="vertical-form" onSubmit={handleSaveAvailability}>
                            <div className="form-row">
                                <label>
                                    <span>{t.startDate}</span>
                                    <input
                                        type="date"
                                        value={availForm.startDate}
                                        onChange={(e) => setAvailForm({ ...availForm, startDate: e.target.value })}
                                        required
                                    />
                                </label>
                                <div className="field-group">
                                    <span>{t.startTime24}</span>
                                    <Time24Picker
                                        value={availForm.startTime}
                                        onChange={(val) => setAvailForm({ ...availForm, startTime: val })}
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <label>
                                    <span>{t.endDate}</span>
                                    <input
                                        type="date"
                                        value={availForm.endDate}
                                        onChange={(e) => setAvailForm({ ...availForm, endDate: e.target.value })}
                                        required
                                    />
                                </label>
                                <div className="field-group">
                                    <span>{t.endTime24}</span>
                                    <Time24Picker
                                        value={availForm.endTime}
                                        onChange={(val) => setAvailForm({ ...availForm, endTime: val })}
                                    />
                                </div>
                            </div>

                            <div className="btn-group">
                                <button type="submit" className="primary-btn">
                                    {availForm.id !== undefined ? t.updateWindowBtn : t.createWindowBtn}
                                </button>
                                {availForm.id !== undefined && (
                                    <button
                                        type="button"
                                        className="secondary-btn"
                                        onClick={() => {
                                            const today = toIsoDateString(new Date());
                                            setAvailForm({
                                                id: undefined,
                                                startDate: today,
                                                startTime: '10:00',
                                                endDate: today,
                                                endTime: '22:00',
                                            });
                                        }}
                                    >
                                        {t.cancelEditBtn}
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>

                    <div className="card">
                        <h2>{t.existingAvailTitle(adminAvailabilities.length)}</h2>
                        <ul className="admin-list">
                            {adminAvailabilities.map((a) => (
                                <li key={a.id}>
                                    <span>
                                        <strong>#{a.id}</strong> | {formatDateTime24(a.startTime)} →{' '}
                                        {formatDateTime24(a.endTime)}
                                    </span>
                                    <div className="btn-group">
                                        <button
                                            type="button"
                                            className="secondary-btn small"
                                            onClick={() =>
                                                setAvailForm({
                                                    id: a.id,
                                                    startDate: a.startTime.slice(0, 10),
                                                    startTime: a.startTime.slice(11, 16),
                                                    endDate: a.endTime.slice(0, 10),
                                                    endTime: a.endTime.slice(11, 16),
                                                })
                                            }
                                        >
                                            {t.editBtn}
                                        </button>
                                        {a.id !== undefined && (
                                            <button
                                                type="button"
                                                className="danger-btn small"
                                                onClick={() => void handleDeleteAvailability(a.id!)}
                                            >
                                                {t.deleteBtn}
                                            </button>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}

            {route === 'ADMIN_HEADSETS' && (
                <div className="admin-workspace-grid">
                    <div className="card">
                        <h2>
                            {headsetForm.id !== undefined
                                ? t.editHeadsetTitle(headsetForm.id)
                                : t.addHeadsetTitle}
                        </h2>
                        <form className="vertical-form" onSubmit={handleSaveHeadset}>
                            <label>
                                <span>{t.headsetName}</span>
                                <input
                                    type="text"
                                    placeholder="Valve Index / Meta Quest 3"
                                    value={headsetForm.name}
                                    onChange={(e) => setHeadsetForm({ ...headsetForm, name: e.target.value })}
                                    required
                                />
                            </label>
                            <label>
                                <span>{t.hourlyPriceHuf}</span>
                                <input
                                    type="number"
                                    step="100"
                                    min="100"
                                    value={headsetForm.hourlyPrice}
                                    onChange={(e) =>
                                        setHeadsetForm({
                                            ...headsetForm,
                                            hourlyPrice: Number(e.target.value),
                                        })
                                    }
                                    required
                                />
                            </label>
                            <label>
                                <span>{t.statusLabel}</span>
                                <select
                                    value={headsetForm.status}
                                    onChange={(e) =>
                                        setHeadsetForm({
                                            ...headsetForm,
                                            status: e.target.value as HeadsetStatus,
                                        })
                                    }
                                >
                                    <option value="Available">{translateHeadsetStatus('Available', lang)}</option>
                                    <option value="Coming Soon...">{translateHeadsetStatus('Coming Soon...', lang)}</option>
                                    <option value="Maintenance">{translateHeadsetStatus('Maintenance', lang)}</option>
                                </select>
                            </label>
                            <label>
                                <span>{t.pictureUrl}</span>
                                <input
                                    type="url"
                                    placeholder="https://..."
                                    value={headsetForm.imageUrl}
                                    onChange={(e) =>
                                        setHeadsetForm({ ...headsetForm, imageUrl: e.target.value })
                                    }
                                />
                            </label>
                            <label>
                                <span>{t.descriptionLabel}</span>
                                <textarea
                                    rows={3}
                                    value={headsetForm.description}
                                    onChange={(e) =>
                                        setHeadsetForm({ ...headsetForm, description: e.target.value })
                                    }
                                />
                            </label>

                            <div className="checkbox-group">
                                <span>{t.installedGamesLabel}</span>
                                <div className="checkbox-grid">
                                    {games.map((g) => (
                                        <label key={g.id} className="checkbox-item">
                                            <input
                                                type="checkbox"
                                                checked={g.id !== undefined && headsetForm.gameIds.includes(g.id)}
                                                onChange={(e) => {
                                                    if (g.id === undefined) return;
                                                    const nextIds = e.target.checked
                                                        ? [...headsetForm.gameIds, g.id]
                                                        : headsetForm.gameIds.filter((id) => id !== g.id);
                                                    setHeadsetForm({ ...headsetForm, gameIds: nextIds });
                                                }}
                                            />
                                            <span>{g.title}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="btn-group">
                                <button type="submit" className="primary-btn">
                                    {headsetForm.id !== undefined ? t.saveChangesBtn : t.addHeadsetBtn}
                                </button>
                                {headsetForm.id !== undefined && (
                                    <button
                                        type="button"
                                        className="secondary-btn"
                                        onClick={() =>
                                            setHeadsetForm({
                                                id: undefined,
                                                name: '',
                                                hourlyPrice: 5500,
                                                status: 'Available',
                                                description: '',
                                                imageUrl: '',
                                                gameIds: [],
                                            })
                                        }
                                    >
                                        {t.cancelEditBtn}
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>

                    <div className="card">
                        <h2>{t.configuredHeadsetsTitle(headsets.length)}</h2>
                        <ul className="admin-list">
                            {headsets.map((h) => (
                                <li key={h.id}>
                                    <div className="admin-item-info">
                                        <img
                                            src={h.imageUrl || DEFAULT_HEADSET_IMG}
                                            alt={h.name}
                                            className="admin-thumb"
                                        />
                                        <div>
                                            <strong>{h.name}</strong> ({translateHeadsetStatus(h.status, lang)}) —{' '}
                                            {formatHuf(h.hourlyPrice)}/{translations[lang].home.hourShort}
                                            <div className="small-text">
                                                {t.gamesListPrefix}{' '}
                                                {h.installedGames?.map((g) => g.title).join(', ') || t.none}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="btn-group">
                                        <button
                                            type="button"
                                            className="secondary-btn small"
                                            onClick={() =>
                                                setHeadsetForm({
                                                    id: h.id,
                                                    name: h.name,
                                                    hourlyPrice: h.hourlyPrice,
                                                    status: h.status,
                                                    description: h.description || '',
                                                    imageUrl: h.imageUrl || '',
                                                    gameIds: (h.installedGames || [])
                                                        .map((g) => g.id)
                                                        .filter((id): id is number => id !== undefined),
                                                })
                                            }
                                        >
                                            {t.editBtn}
                                        </button>
                                        {h.id !== undefined && (
                                            <button
                                                type="button"
                                                className="danger-btn small"
                                                onClick={() => void handleDeleteHeadset(h.id!)}
                                            >
                                                {t.deleteBtn}
                                            </button>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}

            {route === 'ADMIN_GAMES' && (
                <div className="admin-workspace-grid">
                    <div className="card">
                        <h2>
                            {gameForm.id !== undefined ? t.editGameTitle(gameForm.id) : t.addGameTitle}
                        </h2>
                        <form className="vertical-form" onSubmit={handleSaveGame}>
                            <label>
                                <span>{t.steamAppIdLabel}</span>
                                <div className="steam-fetch-row">
                                    <input
                                        type="number"
                                        placeholder="546560"
                                        value={gameForm.steamAppId || ''}
                                        onChange={(e) =>
                                            setGameForm({
                                                ...gameForm,
                                                steamAppId: Number(e.target.value) || 0,
                                            })
                                        }
                                    />
                                    <button
                                        type="button"
                                        className="secondary-btn"
                                        disabled={fetchingSteamForm}
                                        onClick={() => void handleFetchSteamForAdminForm()}
                                    >
                                        {fetchingSteamForm ? t.fetchingSteam : t.pullFromSteamBtn}
                                    </button>
                                </div>
                            </label>
                            <label>
                                <span>{t.gameTitleLabel}</span>
                                <input
                                    type="text"
                                    placeholder="Half-Life: Alyx"
                                    value={gameForm.title}
                                    onChange={(e) => setGameForm({ ...gameForm, title: e.target.value })}
                                    required
                                />
                            </label>
                            <label>
                                <span>{t.coverImageUrlLabel}</span>
                                <input
                                    type="url"
                                    placeholder="https://shared.akamai.steamstatic.com/..."
                                    value={gameForm.imageUrl || ''}
                                    onChange={(e) => setGameForm({ ...gameForm, imageUrl: e.target.value })}
                                />
                            </label>
                            <label>
                                <span>{t.descriptionLabel}</span>
                                <textarea
                                    rows={4}
                                    value={gameForm.description}
                                    onChange={(e) =>
                                        setGameForm({ ...gameForm, description: e.target.value })
                                    }
                                />
                            </label>

                            <div className="btn-group">
                                <button type="submit" className="primary-btn">
                                    {gameForm.id !== undefined ? t.updateGameBtn : t.addGameBtn}
                                </button>
                                {gameForm.id !== undefined && (
                                    <button
                                        type="button"
                                        className="secondary-btn"
                                        onClick={() =>
                                            setGameForm({
                                                id: undefined,
                                                title: '',
                                                description: '',
                                                steamAppId: 0,
                                                imageUrl: '',
                                            })
                                        }
                                    >
                                        {t.cancelEditBtn}
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>

                    <div className="card">
                        <h2>{t.gamesCatalogTitle(games.length)}</h2>
                        <ul className="admin-list">
                            {games.map((g) => (
                                <li key={g.id}>
                                    <div className="admin-item-info">
                                        <img src={getGameCoverUrl(g)} alt={g.title} className="admin-thumb" />
                                        <div>
                                            <strong>{g.title}</strong>
                                            {g.steamAppId && (
                                                <span className="small-text"> • Steam #{g.steamAppId}</span>
                                            )}
                                            <div className="small-text">{g.description}</div>
                                        </div>
                                    </div>
                                    <div className="btn-group">
                                        <button
                                            type="button"
                                            className="secondary-btn small"
                                            onClick={() =>
                                                setGameForm({
                                                    id: g.id,
                                                    title: g.title,
                                                    description: g.description || '',
                                                    steamAppId: g.steamAppId || 0,
                                                    imageUrl: g.imageUrl || '',
                                                })
                                            }
                                        >
                                            {t.editBtn}
                                        </button>
                                        {g.id !== undefined && (
                                            <button
                                                type="button"
                                                className="danger-btn small"
                                                onClick={() => void handleDeleteGame(g.id!)}
                                            >
                                                {t.deleteBtn}
                                            </button>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}

            {route === 'ADMIN_RIGS' && (
                <div className="admin-workspace-grid">
                    <div className="card">
                        <h2>{rigForm.id !== undefined ? t.editRigTitle(rigForm.id) : t.addRigTitle}</h2>
                        <form className="vertical-form" onSubmit={handleSaveRig}>
                            <label>
                                <span>{t.rigNameLabel}</span>
                                <input
                                    type="text"
                                    placeholder="Apex Hyperion X1"
                                    value={rigForm.name}
                                    onChange={(e) => setRigForm({ ...rigForm, name: e.target.value })}
                                    required
                                />
                            </label>
                            <label>
                                <span>CPU:</span>
                                <input
                                    type="text"
                                    placeholder="AMD Ryzen 7 9800X3D"
                                    value={rigForm.cpu}
                                    onChange={(e) => setRigForm({ ...rigForm, cpu: e.target.value })}
                                />
                            </label>
                            <label>
                                <span>GPU:</span>
                                <input
                                    type="text"
                                    placeholder="NVIDIA GeForce RTX 5090 32GB"
                                    value={rigForm.gpu}
                                    onChange={(e) => setRigForm({ ...rigForm, gpu: e.target.value })}
                                />
                            </label>
                            <label>
                                <span>RAM:</span>
                                <input
                                    type="text"
                                    placeholder="64GB DDR5 6400MHz"
                                    value={rigForm.ram}
                                    onChange={(e) => setRigForm({ ...rigForm, ram: e.target.value })}
                                />
                            </label>
                            <label>
                                <span>{t.osLabel}</span>
                                <input
                                    type="text"
                                    placeholder="Windows 11 Pro 24H2 / SteamOS"
                                    value={rigForm.os}
                                    onChange={(e) => setRigForm({ ...rigForm, os: e.target.value })}
                                />
                            </label>
                            <label>
                                <span>{t.pictureUrl}</span>
                                <input
                                    type="url"
                                    placeholder="https://..."
                                    value={rigForm.imageUrl || ''}
                                    onChange={(e) => setRigForm({ ...rigForm, imageUrl: e.target.value })}
                                />
                            </label>
                            <label>
                                <span>{t.descriptionLabel}</span>
                                <textarea
                                    rows={3}
                                    value={rigForm.description}
                                    onChange={(e) => setRigForm({ ...rigForm, description: e.target.value })}
                                />
                            </label>

                            <div className="btn-group">
                                <button type="submit" className="primary-btn">
                                    {rigForm.id !== undefined ? t.updateRigBtn : t.addRigBtn}
                                </button>
                                {rigForm.id !== undefined && (
                                    <button
                                        type="button"
                                        className="secondary-btn"
                                        onClick={() =>
                                            setRigForm({
                                                id: undefined,
                                                name: '',
                                                cpu: '',
                                                gpu: '',
                                                ram: '',
                                                os: '',
                                                imageUrl: '',
                                                description: '',
                                            })
                                        }
                                    >
                                        {t.cancelEditBtn}
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>

                    <div className="card">
                        <h2>{t.configuredRigsTitle(rigs.length)}</h2>
                        <ul className="admin-list">
                            {rigs.map((r) => (
                                <li key={r.id}>
                                    <div className="admin-item-info">
                                        <img
                                            src={r.imageUrl || DEFAULT_RIG_IMG}
                                            alt={r.name}
                                            className="admin-thumb"
                                        />
                                        <div>
                                            <strong>{r.name}</strong> — {r.gpu} | {r.os || 'Windows 11'}
                                            <div className="small-text">{r.description}</div>
                                        </div>
                                    </div>
                                    <div className="btn-group">
                                        <button
                                            type="button"
                                            className="secondary-btn small"
                                            onClick={() =>
                                                setRigForm({
                                                    id: r.id,
                                                    name: r.name,
                                                    cpu: r.cpu || '',
                                                    gpu: r.gpu || '',
                                                    ram: r.ram || '',
                                                    os: r.os || '',
                                                    imageUrl: r.imageUrl || '',
                                                    description: r.description || '',
                                                })
                                            }
                                        >
                                            {t.editBtn}
                                        </button>
                                        {r.id !== undefined && (
                                            <button
                                                type="button"
                                                className="danger-btn small"
                                                onClick={() => void handleDeleteRig(r.id!)}
                                            >
                                                {t.deleteBtn}
                                            </button>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}

            {route === 'ADMIN_RESERVATIONS' && (
                <div className="card">
                    <h2>{t.allReservationsTitle(adminReservations.length)}</h2>
                    <ul className="admin-list">
                        {adminReservations.map((r) => (
                            <li key={r.id}>
                                <span>
                                    <strong>#{r.id}</strong> | {r.userFullName} |{' '}
                                    <strong>{r.headsetName}</strong> | {formatDateTime24(r.startTime)} →{' '}
                                    {formatDateTime24(r.endTime)} |{' '}
                                    <span className={`badge badge-${r.status}`}>
                                        {translateReservationStatus(r.status, lang)}
                                    </span>
                                </span>
                                <div className="btn-group">
                                    <button
                                        type="button"
                                        className="secondary-btn small"
                                        onClick={() => void handleUpdateReservationStatus(r.id, 'Confirmed')}
                                    >
                                        {t.confirmBtn}
                                    </button>
                                    <button
                                        type="button"
                                        className="primary-btn small"
                                        onClick={() => void handleUpdateReservationStatus(r.id, 'Completed')}
                                    >
                                        {t.completeBtn}
                                    </button>
                                    <button
                                        type="button"
                                        className="danger-btn small"
                                        onClick={() => void onCancelReservation(r.id)}
                                    >
                                        {t.cancelBtn}
                                    </button>
                                    <button
                                        type="button"
                                        className="danger-btn small"
                                        onClick={() => void handleDeleteReservation(r.id)}
                                    >
                                        {t.deleteBtn}
                                    </button>
                                </div>
                            </li>
                        ))}
                        {adminReservations.length === 0 && (
                            <p className="muted-text">{t.noReservationsRecorded}</p>
                        )}
                    </ul>
                </div>
            )}
        </section>
    );
}