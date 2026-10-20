import {type SyntheticEvent, useState, useEffect} from "react"
import "./App.css"
import {apiFetch} from "./api";
import type {
    AuthResponseDto,
    AvailabilityDto,
    GameDto,
    HeadsetDto,
    HeadsetStatus,
    ReservationDto,
    ReservationStatus,
    ReservationCreateDto,
    RigDto,
    TimeBlock,
    TimetableResponseDto,
    UserDto, HeadsetCreateDto,
} from "./types";

type Tab = "TIMETABLE" | "GAMES" | "HEADSETS" | "RIGS" | "ADMIN" | "ACCOUNT";

function App() {
    const [activeTab, setActiveTab] = useState<Tab>("TIMETABLE");
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    const [user, setUser] = useState<UserDto | null>(null);
    const [reservations, setReservations] = useState<ReservationDto[]>([]);

    const [games, setGames] = useState<GameDto[]>([]);
    const [headsets, setHeadsets] = useState<HeadsetDto[]>([]);
    const [rigs, setRigs] = useState<RigDto[]>([]);
    const [availableTimes, setAvailableTimes] = useState<TimeBlock[]>([]);

    const [selectedGame, setSelectedGame] = useState<GameDto | null>(null);
    const [selectedHeadset, setSelectedHeadset] = useState<HeadsetDto | null>(null);
    const [selectedRig, setSelectedRig] = useState<RigDto | null>(null);

    const [selectedHeadsetId, setSelectedHeadsetId] = useState<number>(0);
    const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString());
    const [bookingStartTime, setBookingStartTime] = useState<string>("");
    const [bookingEndTime, setBookingEndTime] = useState<string>("");

    const [isRegistering, setIsRegistering] = useState<boolean>(false);
    const [authEmail, setAuthEmail] = useState<string>("");
    const [authPassword, setAuthPassword] = useState<string>("");
    const [authFullName, setAuthFullName] = useState<string>("");
    const [authPhone, setAuthPhone] = useState<string>("");

    const [adminAvailabilities, setAdminAvailabilities] = useState<AvailabilityDto[]>([]);
    const [adminReservations, setAdminReservations] = useState<ReservationDto[]>([]);
    const [newGame, setNewGame] = useState<GameDto>({title: "", description: "" });
    const [newHeadset, setNewHeadset] = useState<HeadsetCreateDto>({ name: "", hourlyPrice: 15, status: "Available", gameIds: [] });
    const [newRig, setNewRig] = useState<RigDto>({ name: "", cpu: "", gpu: "", ram: "", description: "" });
    const [newAvailStart, setNewAvailStart] = useState<string>("");
    const [newAvailEnd, setNewAvailEnd] = useState<string>("");

    const showSuccess = (msg: string) => {
        setSuccessMsg(msg);
        setErrorMsg(null);
    }

    const showError = (msg: string) => {
        setErrorMsg(msg);
        setSuccessMsg(null);
    }

    const loadPublicData = async () => {
        try {
            const [gamesData, headsetsData, rigsData, timetableData] = await Promise.all([
                apiFetch<GameDto[]>("/game"),
                apiFetch<HeadsetDto[]>("/headset"),
                apiFetch<RigDto[]>("/rig"),
                apiFetch<TimetableResponseDto>("/timetable"),
            ]);
            setGames(gamesData);
            setHeadsets(headsetsData);
            setRigs(rigsData);
            setAvailableTimes(timetableData.availableTimes || []);

            const firstAvailable = headsetsData.find((h) => h.status === "Available");
            if (firstAvailable?.id && selectedHeadsetId === 0) {
                setSelectedHeadsetId(firstAvailable.id);
            }
        } catch (err) {
            showError((err as Error).message)
        }
    };

    const loadAccountData = async () => {
        const token = localStorage.getItem("token");
        if (!token) return;
        try {
            const [account, reservations] = await Promise.all([
                apiFetch<UserDto>("/account"),
                apiFetch<ReservationDto[]>("/account/reservation"),
            ]);
            setUser(account);
            setReservations(reservations);
        } catch {
            localStorage.removeItem("token");
            setUser(null);
        }
    };

    const loadAdminData = async () => {
        if (user?.role !== "Admin") return;
        try {
            const [availabilities, reservations] = await Promise.all([
                apiFetch<AvailabilityDto[]>("/availability"),
                apiFetch<ReservationDto[]>("/reservation"),
            ]);
            setAdminAvailabilities(availabilities);
            setAdminReservations(reservations);
        } catch (err) {
            showError((err as Error).message)
        }
    };

    useEffect(() => {
        void loadPublicData();
        void loadAccountData();
    }, []);

    useEffect(() => {
        if (user?.role === "Admin") {
            void loadAdminData();
        }
    }, [user]);

    const handleAuthSubmit = async (event: SyntheticEvent<HTMLFormElement>) => {
        event.preventDefault();
        try {
            const endpoint = isRegistering ? "/auth/register" : "/auth/login";
            const payload = isRegistering
                ? { email: authEmail, password: authPassword, fullName: authFullName, phoneNumber: authPhone }
                : { email: authEmail, password: authPassword };

            const res = await apiFetch<AuthResponseDto>(endpoint, {
                method: "POST",
                body: JSON.stringify(payload),
            });

            localStorage.setItem("token", res.token);
            setUser(res.user);
            await loadAccountData();
            showSuccess(`Welcome, ${res.user.fullName}!`);
        } catch (err) {
            showError((err as Error).message)
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        setUser(null);
        setReservations([]);
        setActiveTab("TIMETABLE");
        showSuccess("Logged out successfully!");
    };

    const handleMakeReservation = async (event: SyntheticEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!user) {
            showError("Please log in to make a reservation");
            setActiveTab("ACCOUNT");
            return;
        }
        try {
            const startDateTime = `${selectedDate}T${bookingStartTime}:00`;
            const endDateTime = `${selectedDate}T${bookingEndTime}:00`;

            await apiFetch<ReservationCreateDto>("/reservation", {
                method: "POST",
                body: JSON.stringify({
                    userId: user.id,
                    headsetId: selectedHeadsetId,
                    startTime: startDateTime,
                    endTime: endDateTime,
                }),
            });

            showSuccess("Reservation confirmed!")
            await loadPublicData();
            await loadAccountData();
        } catch (err) {
            showError((err as Error).message)
        }
    };

    const handleCancelReservation = async (id: number) => {
        try {
            await apiFetch<ReservationDto>(`/reservation/${id}/cancel`, {method: "POST"});
            showSuccess("Reservation cancelled!");
            await loadPublicData();
            await loadAccountData();
            if (user?.role === "Admin") await loadAdminData();
        } catch (err) {
            showError((err as Error).message)
        }
    };

    const handleCreateGame = async (event: SyntheticEvent<HTMLFormElement>) => {
         event.preventDefault();
         try {
             await apiFetch<GameDto>("/game", {method: "POST", body: JSON.stringify(newGame)});
             setNewGame({title: "", description: ""});
             showSuccess("Game added successfully!");
             await loadPublicData();
         } catch (err) {
             showError((err as Error).message)
         }
    };

    const handleDeleteGame = async (id?: number) => {
        if (!id) return;
        try {
            await apiFetch<void>(`/game/${id}`, {method: "DELETE"});
            showSuccess("Game deleted successfully!");
            await loadPublicData();
        } catch (err) {
            showError((err as Error).message)
        }
    };

    const handleCreateHeadset = async (event: SyntheticEvent<HTMLFormElement>) => {
        event.preventDefault();
        try {
            const selectedGames = games.filter((g) => g.id && newHeadset.gameIds.includes(g.id))
            const dto: HeadsetDto = {
                name: newHeadset.name,
                hourlyPrice: newHeadset.hourlyPrice,
                status: newHeadset.status,
                installedGames: selectedGames,
            };
            await  apiFetch<HeadsetDto>("/headsets", {method: "POST", body: JSON.stringify(dto)});
            setNewHeadset({name: '', hourlyPrice: 15, status: 'Available', gameIds: []});
            showSuccess("Headset added successfully!");
            await loadPublicData();
        } catch (err) {
            showError((err as Error).message)
        }
    };

    const handleDeleteHeadset = async (id: number) => {
        if (!id) return;
        try {
            await apiFetch<void>(`headset/${id}`, {method: "DELETE"});
            showSuccess("Headset deleted successfully!");
            await loadPublicData();
        } catch (err) {
            showError((err as Error).message)
        }
    };

    const handleCreateRig = async (event: SyntheticEvent<HTMLFormElement>) => {
        event.preventDefault();
        try {
            await apiFetch<RigDto>("/rig", {method: "POST", body: JSON.stringify(newRig)});
            setNewRig({name: "", cpu: "", gpu: "", ram: "", description: ""});
            showSuccess("Rig added successfully!");
            await loadPublicData();
        } catch (err) {
            showError((err as Error).message)
        }
    };

    const handleDeleteRig = async (id: number) => {
        if (!id) return;
        try {
            await apiFetch<void>(`rig/${id}`, {method: "DELETE"});
            showSuccess("Rig deleted successfully!");
            await loadPublicData();
        } catch (err) {
            showError((err as Error).message)
        }
    };

    const handleCreateAvailability = async (event: SyntheticEvent<HTMLFormElement>) => {
        event.preventDefault();
        try {
            await apiFetch<AvailabilityDto>("/availability", {
                method: "POST",
                body: JSON.stringify({startTime: newAvailStart, endTime: newAvailEnd}),
                });
                setNewAvailStart("");
                setNewAvailEnd("");
                showSuccess("Availability window added successfully!");
                await loadPublicData();
                await loadAdminData();
        } catch (err) {
            showError((err as Error).message)
        }
    };

    const handleDeleteAvailability = async (id: number) => {
        if (!id) return;
        try {
            await apiFetch<void>(`/availability/${id}`, {method: "DELETE"});
            showSuccess("Availability window deleted successfully!");
            await loadPublicData();
            await loadAdminData();
        } catch (err) {
            showError((err as Error).message)
        }
    };

    const handleUpdateReservationStatus = async (id: number, status: ReservationStatus) => {
        try {
            await apiFetch<ReservationDto>(`/reservation/${id}/status?status=${status}`, {method: "PUT"});
            showSuccess(`Reservation ${id} updated successfully to ${status}!`);
            await loadPublicData();
            await loadAdminData();
        } catch (err) {
            showError((err as Error).message)
        }
    };

    const timeToPercentage = (isoString: string): number => {
        const date = new Date(isoString);
        const minutes = date.getHours() * 60 + date.getMinutes();
        return (minutes / 1440) * 100;
    };

    const formatTimeShort = (isoString: string): string => {
        return isoString.slice(11, 16);
    };

    const filteredTimeBlocksForSelection = availableTimes.filter(
        (b) => b.headsetId === selectedHeadsetId && b.startTime.startsWith(selectedDate)
    );

    return (
        <div className="app-wrapper">
            <header className="navbar">
                <div className="nav-links">
                    <button
                        className={activeTab === 'TIMETABLE' ? 'nav-btn active' : 'nav-btn'}
                        onClick={() => setActiveTab('TIMETABLE')}
                    >
                        BOOK VR / TIMETABLE
                    </button>
                    <button
                        className={activeTab === 'GAMES' ? 'nav-btn active' : 'nav-btn'}
                        onClick={() => setActiveTab('GAMES')}
                    >
                        GAMES
                    </button>
                    <button
                        className={activeTab === 'HEADSETS' ? 'nav-btn active' : 'nav-btn'}
                        onClick={() => setActiveTab('HEADSETS')}
                    >
                        HEADSETS
                    </button>
                    <button
                        className={activeTab === 'RIGS' ? 'nav-btn active' : 'nav-btn'}
                        onClick={() => setActiveTab('RIGS')}
                    >
                        RIGS
                    </button>
                    {user?.role === 'Admin' && (
                        <button
                            className={activeTab === 'ADMIN' ? 'nav-btn admin-btn active' : 'nav-btn admin-btn'}
                            onClick={() => setActiveTab('ADMIN')}
                        >
                            ADMIN PANEL
                        </button>
                    )}
                </div>

                <button
                    className={activeTab === 'ACCOUNT' ? 'account-btn active' : 'account-btn'}
                    onClick={() => setActiveTab('ACCOUNT')}
                >
                    👤 {user ? user.fullName : 'Log In / Register'}
                </button>
            </header>

            {errorMsg && (
                <button type="button" className="banner error-banner" onClick={() => setErrorMsg(null)}>
                    {errorMsg} (click to dismiss)
                </button>
            )}
            {successMsg && (
                <button type="button" className="banner success-banner" onClick={() => setSuccessMsg(null)}>
                    {successMsg} (click to dismiss)
                </button>
            )}

            <main className="main-content">
                {activeTab === 'TIMETABLE' && (
                    <section>
                        <h1>VR Headset Timetable & Booking</h1>
                        <p className="subtitle">
                            Red areas are unavailable or already reserved. Click any <strong>Green</strong> block to load its times,
                            then adjust your interval (min. 30 minutes).
                        </p>

                        <div className="timetable-controls">
                            <label>
                                <span>1. Choose Headset:</span>
                                <select
                                    value={selectedHeadsetId}
                                    onChange={(e) => setSelectedHeadsetId(Number(e.target.value))}
                                >
                                    <option value={0} disabled>
                                        -- Select Headset --
                                    </option>
                                    {headsets.map((h) => (
                                        <option key={h.id} value={h.id} disabled={h.status !== 'Available'}>
                                            {h.name} (${h.hourlyPrice}/hr) - [{h.status}]
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label>
                                <span>2. Choose Date:</span>
                                <input
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                />
                            </label>
                        </div>

                        <div className="timeline-section">
                            <div className="timeline-labels">
                                <span>00:00</span>
                                <span>06:00</span>
                                <span>12:00</span>
                                <span>18:00</span>
                                <span>24:00</span>
                            </div>

                            <div className="timeline-bar-red">
                                {filteredTimeBlocksForSelection.map((block) => {
                                    const leftPercent = timeToPercentage(block.startTime);
                                    const endPercent = timeToPercentage(block.endTime);
                                    const widthPercent = Math.max(endPercent - leftPercent, 2);
                                    const blockKey = `${block.headsetId}-${block.startTime}-${block.endTime}`;

                                    return (
                                        <button
                                            type="button"
                                            key={blockKey}
                                            className="timeline-block-green"
                                            style={{ left: `${leftPercent}%`, width: `${widthPercent}%` }}
                                            title={`Available: ${formatTimeShort(block.startTime)} - ${formatTimeShort(block.endTime)}`}
                                            onClick={() => {
                                                setBookingStartTime(formatTimeShort(block.startTime));
                                                setBookingEndTime(formatTimeShort(block.endTime));
                                            }}
                                        >
                                            {formatTimeShort(block.startTime)} - {formatTimeShort(block.endTime)}
                                        </button>
                                    );
                                })}
                            </div>

                            {filteredTimeBlocksForSelection.length === 0 && (
                                <p className="empty-hint">
                                    No green available slots for this headset on {selectedDate}. Try another date or add availability in
                                    the Admin Panel!
                                </p>
                            )}
                        </div>

                        <form className="booking-form card" onSubmit={handleMakeReservation}>
                            <h3>3. Reserve Your Custom Time Interval (Min. 30 mins)</h3>
                            <div className="form-row">
                                <label>
                                    <span>Start Time:</span>
                                    <input
                                        type="time"
                                        value={bookingStartTime}
                                        onChange={(e) => setBookingStartTime(e.target.value)}
                                        required
                                    />
                                </label>
                                <label>
                                    <span>End Time:</span>
                                    <input
                                        type="time"
                                        value={bookingEndTime}
                                        onChange={(e) => setBookingEndTime(e.target.value)}
                                        required
                                    />
                                </label>
                                <button type="submit" className="primary-btn">
                                    Confirm Reservation
                                </button>
                            </div>
                        </form>
                    </section>
                )}

                {activeTab === 'GAMES' && (
                    <section>
                        <h1>VR Games Library</h1>
                        <div className="card-grid">
                            {games.map((g) => (
                                <div key={g.id} className="card">
                                    <h3>{g.title}</h3>
                                    <p>{g.description}</p>
                                    <button type="button" className="secondary-btn" onClick={() => setSelectedGame(g)}>
                                        View Details
                                    </button>
                                </div>
                            ))}
                        </div>
                        {selectedGame && (
                            <div className="detail-box card">
                                <h2>Game Details: {selectedGame.title}</h2>
                                <p><strong>ID:</strong> #{selectedGame.id}</p>
                                <p>{selectedGame.description}</p>
                                <button className="secondary-btn" onClick={() => setSelectedGame(null)}>
                                    Close Details
                                </button>
                            </div>
                        )}
                    </section>
                )}

                {activeTab === 'HEADSETS' && (
                    <section>
                        <h1>VR Headsets</h1>
                        <div className="card-grid">
                            {headsets.map((h) => (
                                <div key={h.id} className="card">
                                    <div className="card-header">
                                        <h3>{h.name}</h3>
                                        <span className={`badge badge-${h.status}`}>{h.status}</span>
                                    </div>
                                    <p className="price">${h.hourlyPrice} / hour</p>
                                    <p className="small-text">
                                        Installed Games: {h.installedGames?.map((g) => g.title).join(', ') || 'None'}
                                    </p>
                                    <div className="btn-group">
                                        <button type="button" className="secondary-btn" onClick={() => setSelectedHeadset(h)}>
                                            Details
                                        </button>
                                        {h.status === 'Available' && h.id !== undefined && (
                                            <button
                                                type="button"
                                                className="primary-btn"
                                                onClick={() => {
                                                    setSelectedHeadsetId(h.id!);
                                                    setActiveTab('TIMETABLE');
                                                }}
                                            >
                                                Book This Headset
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                        {selectedHeadset && (
                            <div className="detail-box card">
                                <h2>Headset Details: {selectedHeadset.name}</h2>
                                <p><strong>Status:</strong> {selectedHeadset.status}</p>
                                <p><strong>Hourly Price:</strong> ${selectedHeadset.hourlyPrice}</p>
                                <p>
                                    <strong>Installed Games:</strong>{' '}
                                    {selectedHeadset.installedGames?.map((g) => g.title).join(', ') || 'None'}
                                </p>
                                <button className="secondary-btn" onClick={() => setSelectedHeadset(null)}>
                                    Close Details
                                </button>
                            </div>
                        )}
                    </section>
                )}

                {activeTab === 'RIGS' && (
                    <section>
                        <h1>PC & VR Rigs</h1>
                        <div className="card-grid">
                            {rigs.map((r) => (
                                <div key={r.id} className="card">
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
                                    </ul>
                                    <p>{r.description}</p>
                                    <button type="button" className="secondary-btn" onClick={() => setSelectedRig(r)}>
                                        View Details
                                    </button>
                                </div>
                            ))}
                        </div>
                        {selectedRig && (
                            <div className="detail-box card">
                                <h2>Rig Details: {selectedRig.name}</h2>
                                <p><strong>CPU:</strong> {selectedRig.cpu} | <strong>GPU:</strong> {selectedRig.gpu} | <strong>RAM:</strong> {selectedRig.ram}</p>
                                <p>{selectedRig.description}</p>
                                <button className="secondary-btn" onClick={() => setSelectedRig(null)}>
                                    Close Details
                                </button>
                            </div>
                        )}
                    </section>
                )}

                {activeTab === 'ACCOUNT' && (
                    <section>
                        {!user ? (
                            <div className="auth-box card">
                                <h2>{isRegistering ? 'Create an Account' : 'Log In'}</h2>
                                <form className="vertical-form" onSubmit={handleAuthSubmit}>
                                    {isRegistering && (
                                        <>
                                            <input
                                                type="text"
                                                placeholder="Full Name"
                                                value={authFullName}
                                                onChange={(e) => setAuthFullName(e.target.value)}
                                                required
                                            />
                                            <input
                                                type="text"
                                                placeholder="Phone Number"
                                                value={authPhone}
                                                onChange={(e) => setAuthPhone(e.target.value)}
                                            />
                                        </>
                                    )}
                                    <input
                                        type="email"
                                        placeholder="Email Address"
                                        value={authEmail}
                                        onChange={(e) => setAuthEmail(e.target.value)}
                                        required
                                    />
                                    <input
                                        type="password"
                                        placeholder="Password (min. 8 chars)"
                                        value={authPassword}
                                        onChange={(e) => setAuthPassword(e.target.value)}
                                        required
                                    />
                                    <button type="submit" className="primary-btn">
                                        {isRegistering ? 'Register' : 'Log In'}
                                    </button>
                                </form>
                                <button className="link-btn" onClick={() => setIsRegistering(!isRegistering)}>
                                    {isRegistering ? 'Already have an account? Log In' : 'Need an account? Register'}
                                </button>
                            </div>
                        ) : (
                            <div>
                                <div className="card account-header">
                                    <div>
                                        <h2>Account Details</h2>
                                        <p><strong>Name:</strong> {user.fullName}</p>
                                        <p><strong>Email:</strong> {user.email}</p>
                                        <p><strong>Phone:</strong> {user.phoneNumber || 'N/A'}</p>
                                        <p><strong>Role:</strong> <span className="badge badge-AVAILABLE">{user.role}</span></p>
                                    </div>
                                    <button className="danger-btn" onClick={handleLogout}>
                                        Log Out
                                    </button>
                                </div>

                                <h2 style={{ marginTop: '24px' }}>My Reservations</h2>
                                <div className="card-grid">
                                    {reservations.map((res) => (
                                        <div key={res.id} className="card">
                                            <h3>{res.headsetName}</h3>
                                            <p><strong>Start:</strong> {res.startTime.replace('T', ' ')}</p>
                                            <p><strong>End:</strong> {res.endTime.replace('T', ' ')}</p>
                                            <p><strong>Status:</strong> <span className={`badge badge-${res.status}`}>{res.status}</span></p>
                                            {res.status !== 'Cancelled' && res.status !== 'Completed' && (
                                                <button className="danger-btn" onClick={() => handleCancelReservation(res.id)}>
                                                    Cancel Reservation
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    {reservations.length === 0 && <p>You have no reservations yet.</p>}
                                </div>
                            </div>
                        )}
                    </section>
                )}

                {activeTab === 'ADMIN' && user?.role === 'Admin' && (
                    <section className="admin-grid">
                        <div className="card">
                            <h2>1. Manage Availability (Green Windows)</h2>
                            <form className="vertical-form" onSubmit={handleCreateAvailability}>
                                <label>
                                    <span>Start Date & Time:</span>
                                    <input
                                        type="datetime-local"
                                        value={newAvailStart}
                                        onChange={(e) => setNewAvailStart(e.target.value)}
                                        required
                                    />
                                </label>
                                <label>
                                    <span>End Date & Time:</span>
                                    <input
                                        type="datetime-local"
                                        value={newAvailEnd}
                                        onChange={(e) => setNewAvailEnd(e.target.value)}
                                        required
                                    />
                                </label>
                                <button type="submit" className="primary-btn">Add Free Time Window</button>
                            </form>
                            <ul className="admin-list">
                                {adminAvailabilities.map((a) => (
                                    <li key={a.id}>
                                        <span>{a.startTime.replace('T', ' ')} → {a.endTime.replace('T', ' ')}</span>
                                        <button className="danger-btn small" onClick={() => handleDeleteAvailability(a.id!)}>Delete</button>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="card">
                            <h2>2. Manage Headsets</h2>
                            <form className="vertical-form" onSubmit={handleCreateHeadset}>
                                <input
                                    type="text"
                                    placeholder="Headset Name (e.g. Valve Index, Steam Frame)"
                                    value={newHeadset.name}
                                    onChange={(e) => setNewHeadset({ ...newHeadset, name: e.target.value })}
                                    required
                                />
                                <input
                                    type="number"
                                    step="0.5"
                                    placeholder="Hourly Price"
                                    value={newHeadset.hourlyPrice}
                                    onChange={(e) => setNewHeadset({ ...newHeadset, hourlyPrice: Number(e.target.value) })}
                                    required
                                />
                                <select
                                    value={newHeadset.status}
                                    onChange={(e) => setNewHeadset({ ...newHeadset, status: e.target.value as HeadsetStatus })}
                                >
                                    <option value="Available">Available</option>
                                    <option value="Coming Soon...">Coming Soon...</option>
                                    <option value="Maintenance">Maintenance</option>
                                </select>
                                <div className="checkbox-group">
                                    <span>Installed Games:</span>
                                    {games.map((g) => (
                                        <label key={g.id} className="checkbox-label">
                                            <input
                                                type="checkbox"
                                                checked={g.id !== undefined && newHeadset.gameIds.includes(g.id)}
                                                onChange={(e) => {
                                                    if (g.id === undefined) return;
                                                    const nextIds = e.target.checked
                                                        ? [...newHeadset.gameIds, g.id]
                                                        : newHeadset.gameIds.filter((id) => id !== g.id);
                                                    setNewHeadset({ ...newHeadset, gameIds: nextIds });
                                                }}
                                            />
                                            <span>{g.title}</span>
                                        </label>
                                    ))}
                                </div>
                                <button type="submit" className="primary-btn">Add Headset</button>
                            </form>
                            <ul className="admin-list">
                                {headsets.map((h) => (
                                    <li key={h.id}>
                                        <span>{h.name} ({h.status}) - ${h.hourlyPrice}/h</span>
                                        <button className="danger-btn small" onClick={() => handleDeleteHeadset(h.id!)}>Delete</button>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="card">
                            <h2>3. Manage Games</h2>
                            <form className="vertical-form" onSubmit={handleCreateGame}>
                                <input
                                    type="text"
                                    placeholder="Game Title (e.g. Half-Life: Alyx)"
                                    value={newGame.title}
                                    onChange={(e) => setNewGame({ ...newGame, title: e.target.value })}
                                    required
                                />
                                <textarea
                                    placeholder="Game Description"
                                    value={newGame.description}
                                    onChange={(e) => setNewGame({ ...newGame, description: e.target.value })}
                                />
                                <button type="submit" className="primary-btn">Add Game</button>
                            </form>
                            <ul className="admin-list">
                                {games.map((g) => (
                                    <li key={g.id}>
                                        <span>{g.title}</span>
                                        <button className="danger-btn small" onClick={() => handleDeleteGame(g.id)}>Delete</button>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="card">
                            <h2>4. Manage Rigs</h2>
                            <form className="vertical-form" onSubmit={handleCreateRig}>
                                <input
                                    type="text"
                                    placeholder="Rig Name"
                                    value={newRig.name}
                                    onChange={(e) => setNewRig({ ...newRig, name: e.target.value })}
                                    required
                                />
                                <input
                                    type="text"
                                    placeholder="CPU (e.g. Ryzen 7 7800X3D)"
                                    value={newRig.cpu}
                                    onChange={(e) => setNewRig({ ...newRig, cpu: e.target.value })}
                                />
                                <input
                                    type="text"
                                    placeholder="GPU (e.g. RTX 4080)"
                                    value={newRig.gpu}
                                    onChange={(e) => setNewRig({ ...newRig, gpu: e.target.value })}
                                />
                                <input
                                    type="text"
                                    placeholder="RAM (e.g. 32GB DDR5)"
                                    value={newRig.ram}
                                    onChange={(e) => setNewRig({ ...newRig, ram: e.target.value })}
                                />
                                <button type="submit" className="primary-btn">Add Rig</button>
                            </form>
                            <ul className="admin-list">
                                {rigs.map((r) => (
                                    <li key={r.id}>
                                        <span>{r.name} ({r.gpu})</span>
                                        <button className="danger-btn small" onClick={() => handleDeleteRig(r.id!)}>Delete</button>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="card full-width">
                            <h2>5. All Reservations (Workflow Management)</h2>
                            <ul className="admin-list">
                                {adminReservations.map((r) => (
                                    <li key={r.id}>
                    <span>
                      <strong>#{r.id}</strong> | {r.userFullName} | {r.headsetName} |{' '}
                        {r.startTime.replace('T', ' ')} → {r.endTime.replace('T', ' ')} |{' '}
                        <span className={`badge badge-${r.status}`}>{r.status}</span>
                    </span>
                                        <div className="btn-group">
                                            <button
                                                className="primary-btn small"
                                                onClick={() => handleUpdateReservationStatus(r.id, 'Completed')}
                                            >
                                                Mark Completed
                                            </button>
                                            <button className="danger-btn small" onClick={() => handleCancelReservation(r.id)}>
                                                Cancel
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
}

export default App;
