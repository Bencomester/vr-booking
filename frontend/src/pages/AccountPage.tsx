import { type SyntheticEvent, useEffect, useState } from 'react';
import type { ReservationDto, UserDto, UserUpdateDto } from '../types';
import { AVATAR_PRESETS, DEFAULT_AVATAR_IMG, formatDateTime24 } from '../utils/formatters';

interface AccountPageProps {
    user: UserDto | null;
    myReservations: ReservationDto[];
    onLoginOrRegister: (
        isRegistering: boolean,
        payload: Record<string, string>
    ) => Promise<void>;
    onUpdateProfile: (dto: UserUpdateDto) => Promise<void>;
    onCancelReservation: (id: number) => Promise<void>;
    onLogout: () => void;
}

export function AccountPage({
                                user,
                                myReservations,
                                onLoginOrRegister,
                                onUpdateProfile,
                                onCancelReservation,
                                onLogout,
                            }: AccountPageProps) {
    const [isRegistering, setIsRegistering] = useState<boolean>(false);
    const [authEmail, setAuthEmail] = useState<string>('');
    const [authPassword, setAuthPassword] = useState<string>('');
    const [authFullName, setAuthFullName] = useState<string>('');
    const [authPhone, setAuthPhone] = useState<string>('');

    const [profileForm, setProfileForm] = useState<UserUpdateDto>({
        fullName: user?.fullName || '',
        phoneNumber: user?.phoneNumber || '',
        profilePictureUrl: user?.profilePictureUrl || '',
    });

    useEffect(() => {
        if (user) {
            setProfileForm({
                fullName: user.fullName || '',
                phoneNumber: user.phoneNumber || '',
                profilePictureUrl: user.profilePictureUrl || '',
            });
        }
    }, [user]);

    const handleAuthSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        const payload: Record<string, string> = isRegistering
            ? {
                email: authEmail,
                password: authPassword,
                fullName: authFullName,
                phoneNumber: authPhone,
            }
            : { email: authEmail, password: authPassword };
        await onLoginOrRegister(isRegistering, payload);
    };

    const handleProfileSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        await onUpdateProfile(profileForm);
    };

    return (
        <section className="page-transition">
            {!user ? (
        <div className="auth-box card">
            <h2>{isRegistering ? 'Create Your VR Pilot Account' : 'Sign In to AetherVR'}</h2>
            <form className="vertical-form" onSubmit={handleAuthSubmit}>
        {isRegistering && (
            <>
                <label>
                    <span>Full Name</span>
    <input
    type="text"
    placeholder="John Smith"
    value={authFullName}
    onChange={(e) => setAuthFullName(e.target.value)}
    required
    />
    </label>
    <label>
    <span>Phone Number</span>
    <input
    type="text"
    placeholder="+36 30 123 4567"
    value={authPhone}
    onChange={(e) => setAuthPhone(e.target.value)}
    />
    </label>
    </>
)}
    <label>
        <span>Email Address</span>
    <input
    type="email"
    placeholder="pilot@aethervr.hu"
    value={authEmail}
    onChange={(e) => setAuthEmail(e.target.value)}
    required
    />
    </label>
    <label>
    <span>Password (min. 8 characters)</span>
    <input
    type="password"
    placeholder="••••••••"
    value={authPassword}
    onChange={(e) => setAuthPassword(e.target.value)}
    required
    />
    </label>
    <button type="submit" className="primary-btn glow-btn">
        {isRegistering ? 'Create Account' : 'Sign In'}
        </button>
        </form>
        <button
    type="button"
    className="link-btn"
    onClick={() => setIsRegistering(!isRegistering)}
>
    {isRegistering
        ? 'Already have an account? Sign In'
        : 'Need an account? Register now'}
    </button>
    </div>
) : (
        <div className="account-layout">
        <div className="account-top-grid">
        <div className="card profile-overview-card">
        <img
            src={user.profilePictureUrl || DEFAULT_AVATAR_IMG}
    alt={user.fullName}
    className="profile-avatar-large"
    />
    <div className="profile-meta">
    <span className="badge badge-Available">{user.role}</span>
        <h2>{user.fullName}</h2>
        <p className="muted-text">{user.email}</p>
        <p>
        <strong>Phone:</strong> {user.phoneNumber || 'Not set'}
    </p>
    <p className="small-text">Joined: {formatDateTime24(user.createdAt)}</p>
    <button type="button" className="danger-btn" onClick={onLogout}>
        Sign Out
    </button>
    </div>
    </div>

    <div className="card">
        <h3>Edit Profile & Avatar</h3>
    <form className="vertical-form" onSubmit={handleProfileSubmit}>
        <label>
            <span>Full Name:</span>
    <input
    type="text"
    value={profileForm.fullName}
    onChange={(e) =>
    setProfileForm({ ...profileForm, fullName: e.target.value })
}
    required
    />
    </label>
    <label>
    <span>Phone Number:</span>
    <input
    type="text"
    value={profileForm.phoneNumber}
    onChange={(e) =>
    setProfileForm({ ...profileForm, phoneNumber: e.target.value })
}
    />
    </label>
    <label>
    <span>Profile Picture URL:</span>
    <input
    type="url"
    placeholder="https://..."
    value={profileForm.profilePictureUrl || ''}
    onChange={(e) =>
    setProfileForm({
        ...profileForm,
        profilePictureUrl: e.target.value,
    })
}
    />
    </label>

    <div className="avatar-preset-row">
        <span>Quick Avatars:</span>
    <div className="preset-list">
        {AVATAR_PRESETS.map((presetUrl) => (
                <button
                    type="button"
            key={presetUrl}
            className="avatar-preset-btn"
            onClick={() =>
    setProfileForm({ ...profileForm, profilePictureUrl: presetUrl })
}
>
    <img src={presetUrl} alt="Preset Avatar" />
        </button>
))}
    </div>
    </div>

    <button type="submit" className="primary-btn">
        Save Profile Changes
    </button>
    </form>
    </div>
    </div>

    <h2 style={{ marginTop: '32px' }}>My VR Reservations (24H Format)</h2>
    <div className="card-grid">
        {myReservations.map((res) => (
                <div key={res.id} className="card">
            <div className="card-header">
                <h3>{res.headsetName}</h3>
                <span className={`badge badge-${res.status}`}>{res.status}</span>
        </div>
        <p>
        <strong>Start:</strong> {formatDateTime24(res.startTime)}
    </p>
    <p>
    <strong>End:</strong> {formatDateTime24(res.endTime)}
    </p>
    {res.status !== 'Cancelled' && res.status !== 'Completed' && (
        <button
            type="button"
        className="danger-btn"
        onClick={() => void onCancelReservation(res.id)}
    >
        Cancel Reservation
    </button>
    )}
    </div>
))}
    {myReservations.length === 0 && (
        <p className="muted-text">You have no reservations yet.</p>
    )}
    </div>
    </div>
)}
    </section>
);
}