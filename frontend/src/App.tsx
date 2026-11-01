import { useEffect, useMemo, useState } from 'react';
import './App.css';
import { TOKEN_STORAGE_KEY, apiFetch } from './api';
import { GameSteamModal } from './components/Modals';
import { Navbar } from './components/Navbar';
import { AccountPage } from './pages/AccountPage';
import { AdminStudioPage } from './pages/AdminStudioPage';
import { GamesPage, HeadsetsPage, RigsPage } from './pages/CatalogPages';
import { HomePage } from './pages/HomePage';
import { TimetablePage } from './pages/TimetablePage';
import {
    type AuthResponseDto,
    type AvailabilityDto,
    type GameDto,
    type HeadsetDto,
    type PageRoute,
    ROUTE_PATHS,
    type ReservationCreateDto,
    type ReservationDto,
    type RigDto,
    type SteamGameDetailsDto,
    type TimeBlock,
    type TimetableResponseDto,
    type UserDto,
    type UserUpdateDto,
} from './types';
import { buildWeekDays, parsePathToRoute } from './utils/formatters';

export function App() {
    const [route, setRoute] = useState<PageRoute>(() => parsePathToRoute(window.location.pathname));
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    const [user, setUser] = useState<UserDto | null>(null);
    const [myReservations, setMyReservations] = useState<ReservationDto[]>([]);

    const [games, setGames] = useState<GameDto[]>([]);
    const [headsets, setHeadsets] = useState<HeadsetDto[]>([]);
    const [rigs, setRigs] = useState<RigDto[]>([]);
    const [availableBlocks, setAvailableBlocks] = useState<TimeBlock[]>([]);

    const [selectedHeadsetId, setSelectedHeadsetId] = useState<number>(0);
    const [weekOffset, setWeekOffset] = useState<number>(0);

    const [selectedGame, setSelectedGame] = useState<GameDto | null>(null);
    const [steamDetails, setSteamDetails] = useState<SteamGameDetailsDto | null>(null);
    const [steamLoading, setSteamLoading] = useState<boolean>(false);
    const [steamError, setSteamError] = useState<string | null>(null);

    const [adminAvailabilities, setAdminAvailabilities] = useState<AvailabilityDto[]>([]);
    const [adminReservations, setAdminReservations] = useState<ReservationDto[]>([]);

    const weekDays = useMemo(() => buildWeekDays(weekOffset), [weekOffset]);

    const navigateTo = (nextRoute: PageRoute) => {
        const targetPath = ROUTE_PATHS[nextRoute];
        if (window.location.pathname !== targetPath) {
            window.history.pushState({ route: nextRoute }, '', targetPath);
        }
        setRoute(nextRoute);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    useEffect(() => {
        const onPopState = () => setRoute(parsePathToRoute(window.location.pathname));
        window.addEventListener('popstate', onPopState);
        return () => window.removeEventListener('popstate', onPopState);
    }, []);

    const showSuccess = (msg: string) => {
        setSuccessMsg(msg);
        setErrorMsg(null);
    };

    const showError = (msg: string) => {
        setErrorMsg(msg);
        setSuccessMsg(null);
    };

    const loadPublicData = async () => {
        try {
            const [gamesData, headsetsData, rigsData, timetableData] = await Promise.all([
                apiFetch<GameDto[]>('/game'),
                apiFetch<HeadsetDto[]>('/headset'),
                apiFetch<RigDto[]>('/rig'),
                apiFetch<TimetableResponseDto>('/timetable'),
            ]);
            const safeHeadsets = headsetsData || [];
            setGames(gamesData || []);
            setHeadsets(safeHeadsets);
            setRigs(rigsData || []);
            setAvailableBlocks(timetableData?.availableTimes || []);

            const firstAvailable = safeHeadsets.find((h) => h.status === 'Available');
            if (firstAvailable?.id !== undefined) {
                setSelectedHeadsetId((prev) =>
                    safeHeadsets.some((h) => h.id === prev && h.status === 'Available')
                        ? prev
                        : firstAvailable.id!
                );
            }
        } catch (err) {
            showError((err as Error).message);
        }
    };

    const loadAccountData = async () => {
        const token = localStorage.getItem(TOKEN_STORAGE_KEY);
        if (!token || token === 'null' || token === 'undefined') return;
        try {
            const [account, myRes] = await Promise.all([
                apiFetch<UserDto>('/account'),
                apiFetch<ReservationDto[]>('/account/reservation'),
            ]);
            setUser(account);
            setMyReservations(myRes || []);
        } catch (err) {
            console.error('loadAccountData failed:', err);
            localStorage.removeItem('token');
            setUser(null);
            setMyReservations([]);
        }
    };

    const loadAdminData = async () => {
        if (user?.role !== 'Admin') return;
        try {
            const [avails, allRes] = await Promise.all([
                apiFetch<AvailabilityDto[]>('/availability'),
                apiFetch<ReservationDto[]>('/reservation/all'),
            ]);
            setAdminAvailabilities(avails || []);
            setAdminReservations(allRes || []);
        } catch (err) {
            showError((err as Error).message);
        }
    };

    const refreshAll = async () => {
        await loadPublicData();
        await loadAccountData();
        if (user?.role === 'Admin') {
            await loadAdminData();
        }
    };

    useEffect(() => {
        void loadPublicData();
        void loadAccountData();
    }, []);

    useEffect(() => {
        if (user?.role === 'Admin') {
            void loadAdminData();
        }
    }, [user]);

    const openGameDetails = async (game: GameDto) => {
        setSelectedGame(game);
        setSteamDetails(null);
        setSteamError(null);
        if (game.steamAppId && game.steamAppId > 0) {
            setSteamLoading(true);
            try {
                const details = await apiFetch<SteamGameDetailsDto>(
                    `/game/steam/${encodeURIComponent(game.steamAppId)}`
                );
                setSteamDetails(details);
            } catch (err) {
                setSteamError((err as Error).message);
            } finally {
                setSteamLoading(false);
            }
        }
    };

    const handleLoginOrRegister = async (
        isRegistering: boolean,
        payload: Record<string, string>
    ) => {
        try {
            setErrorMsg(null);
            const endpoint = isRegistering ? '/auth/register' : '/auth/login';
            const res = await apiFetch<AuthResponseDto>(endpoint, {
                method: 'POST',
                body: JSON.stringify(payload),
            });
            localStorage.setItem(TOKEN_STORAGE_KEY, res.token);
            setUser(res.user);
            await loadAccountData();
            showSuccess(`Welcome back, ${res.user.fullName}!`);
        } catch (err) {
            showError((err as Error).message);
        }
    };

    const handleUpdateProfile = async (dto: UserUpdateDto) => {
        try {
            const updated = await apiFetch<UserDto>('/account', {
                method: 'PUT',
                body: JSON.stringify(dto),
            });
            setUser(updated);
            showSuccess('Profile updated successfully!');
        } catch (err) {
            showError((err as Error).message);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        setUser(null);
        setMyReservations([]);
        navigateTo('HOME');
        showSuccess('Logged out successfully.');
    };

    const handleBookReservation = async (
        headsetId: number,
        startTime: string,
        endTime: string
    ) => {
        if (!user) {
            showError('Please log in to book a VR session.');
            navigateTo('ACCOUNT');
            return;
        }
        try {
            await apiFetch<ReservationDto>('/reservation', {
                method: 'POST',
                body: JSON.stringify({ headsetId, startTime, endTime }),
            });
            showSuccess('Reservation confirmed!');
            await refreshAll();
        } catch (err) {
            showError((err as Error).message);
        }
    };

    const handleCancelReservation = async (id: number) => {
        try {
            await apiFetch<ReservationDto>(`/reservation/${id}/cancel`, { method: 'POST' });
            showSuccess('Reservation cancelled.');
            await refreshAll();
        } catch (err) {
            showError((err as Error).message);
        }
    };

    return (
        <div className="app-wrapper">
            <div className="ambient-bg" aria-hidden="true">
                <div className="orb orb-1" />
                <div className="orb orb-2" />
                <div className="orb orb-3" />
                <div className="cyber-grid" />
            </div>

            <Navbar route={route} user={user} onNavigate={navigateTo} />

            {errorMsg && (
                <button type="button" className="banner error-banner" onClick={() => setErrorMsg(null)}>
                    <span>⚠ {errorMsg}</span>
                    <span className="banner-dismiss">Dismiss ✕</span>
                </button>
            )}
            {successMsg && (
                <button type="button" className="banner success-banner" onClick={() => setSuccessMsg(null)}>
                    <span>✦ {successMsg}</span>
                    <span className="banner-dismiss">Dismiss ✕</span>
                </button>
            )}

            <main className="main-content">
                {route === 'HOME' && (
                    <HomePage
                        headsets={headsets}
                        games={games}
                        rigs={rigs}
                        onNavigate={navigateTo}
                        onSelectHeadsetForBooking={(id) => {
                            setSelectedHeadsetId(id);
                            navigateTo('TIMETABLE');
                        }}
                        onOpenGameDetails={(g) => void openGameDetails(g)}
                    />
                )}

                {route === 'TIMETABLE' && (
                    <TimetablePage
                        headsets={headsets}
                        availableBlocks={availableBlocks}
                        selectedHeadsetId={selectedHeadsetId}
                        onSelectHeadsetId={setSelectedHeadsetId}
                        weekOffset={weekOffset}
                        onChangeWeekOffset={setWeekOffset}
                        weekDays={weekDays}
                        onBookReservation={handleBookReservation}
                    />
                )}

                {route === 'GAMES' && (
                    <GamesPage games={games} onOpenGameDetails={(g) => void openGameDetails(g)} />
                )}

                {route === 'HEADSETS' && (
                    <HeadsetsPage
                        headsets={headsets}
                        onBookHeadset={(id) => {
                            setSelectedHeadsetId(id);
                            navigateTo('TIMETABLE');
                        }}
                    />
                )}

                {route === 'RIGS' && <RigsPage rigs={rigs} />}

                {route === 'ACCOUNT' && (
                    <AccountPage
                        user={user}
                        myReservations={myReservations}
                        onLoginOrRegister={handleLoginOrRegister}
                        onUpdateProfile={handleUpdateProfile}
                        onCancelReservation={handleCancelReservation}
                        onLogout={handleLogout}
                    />
                )}

                {route.startsWith('ADMIN_') && user?.role === 'Admin' && (
                    <AdminStudioPage
                        route={route}
                        onNavigate={navigateTo}
                        games={games}
                        headsets={headsets}
                        rigs={rigs}
                        adminAvailabilities={adminAvailabilities}
                        adminReservations={adminReservations}
                        weekDays={weekDays}
                        onRefreshAll={refreshAll}
                        onCancelReservation={handleCancelReservation}
                        onShowSuccess={showSuccess}
                        onShowError={showError}
                    />
                )}

                {selectedGame && (
                    <GameSteamModal
                        game={selectedGame}
                        steamDetails={steamDetails}
                        steamLoading={steamLoading}
                        steamError={steamError}
                        onClose={() => setSelectedGame(null)}
                        onBookNow={() => {
                            setSelectedGame(null);
                            navigateTo('TIMETABLE');
                        }}
                    />
                )}
            </main>
        </div>
    );
}

export default App;