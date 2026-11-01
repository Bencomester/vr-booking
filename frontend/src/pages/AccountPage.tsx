import { type SyntheticEvent, useEffect, useState } from 'react';
import {
    type Language,
    translateReservationStatus,
    translateRole,
    translations,
} from '../i18n';
import type { ReservationDto, UserDto, UserUpdateDto } from '../types';
import { AVATAR_PRESETS, DEFAULT_AVATAR_IMG, formatDateTime24 } from '../utils/formatters';

interface AccountPageProps {
    user: UserDto | null;
    myReservations: ReservationDto[];
    lang: Language;
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
                                lang,
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
        profilePictureUrl:
            user?.profilePictureUrl && AVATAR_PRESETS.includes(user.profilePictureUrl)
                ? user.profilePictureUrl
                : DEFAULT_AVATAR_IMG,
    });

    const t = translations[lang].account;

    useEffect(() => {
        if (user) {
            setProfileForm({
                fullName: user.fullName || '',
                phoneNumber: user.phoneNumber || '',
                profilePictureUrl:
                    user.profilePictureUrl && AVATAR_PRESETS.includes(user.profilePictureUrl)
                        ? user.profilePictureUrl
                        : DEFAULT_AVATAR_IMG,
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
                    <h2>{isRegistering ? t.createAccountTitle : t.signInTitle}</h2>
                    <form className="vertical-form" onSubmit={handleAuthSubmit}>
                        {isRegistering && (
                            <>
                                <label>
                                    <span>{t.fullName}</span>
                                    <input
                                        type="text"
                                        placeholder="John Smith"
                                        value={authFullName}
                                        onChange={(e) => setAuthFullName(e.target.value)}
                                        required
                                    />
                                </label>
                                <label>
                                    <span>{t.phoneNumber}</span>
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
                            <span>{t.emailAddress}</span>
                            <input
                                type="email"
                                placeholder="pilot@aethervr.hu"
                                value={authEmail}
                                onChange={(e) => setAuthEmail(e.target.value)}
                                required
                            />
                        </label>
                        <label>
                            <span>{t.passwordLabel}</span>
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={authPassword}
                                onChange={(e) => setAuthPassword(e.target.value)}
                                required
                            />
                        </label>
                        <button type="submit" className="primary-btn glow-btn">
                            {isRegistering ? t.createAccountBtn : t.signInBtn}
                        </button>
                    </form>
                    <button
                        type="button"
                        className="link-btn"
                        onClick={() => setIsRegistering(!isRegistering)}
                    >
                        {isRegistering ? t.alreadyHaveAccount : t.needAccount}
                    </button>
                </div>
            ) : (
                <div className="account-layout">
                    <div className="account-top-grid">
                        <div className="card profile-overview-card">
                            <img
                                src={profileForm.profilePictureUrl || user.profilePictureUrl || DEFAULT_AVATAR_IMG}
                                alt={user.fullName}
                                className="profile-avatar-large"
                            />
                            <div className="profile-meta">
                                <span className="badge badge-Available">
                                    {translateRole(user.role, lang)}
                                </span>
                                <h2>{user.fullName}</h2>
                                <p className="muted-text">{user.email}</p>
                                <p>
                                    <strong>{t.phoneLabel}</strong> {user.phoneNumber || t.notSet}
                                </p>
                                <p className="small-text">
                                    {t.joinedLabel} {formatDateTime24(user.createdAt)}
                                </p>
                                <button type="button" className="danger-btn" onClick={onLogout}>
                                    {t.signOutBtn}
                                </button>
                            </div>
                        </div>

                        <div className="card">
                            <h3>{t.editProfileTitle}</h3>
                            <form className="vertical-form" onSubmit={handleProfileSubmit}>
                                <label>
                                    <span>{t.fullName}:</span>
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
                                    <span>{t.phoneNumber}:</span>
                                    <input
                                        type="text"
                                        value={profileForm.phoneNumber}
                                        onChange={(e) =>
                                            setProfileForm({ ...profileForm, phoneNumber: e.target.value })
                                        }
                                    />
                                </label>

                                <div className="avatar-preset-row">
                                    <span>{t.chooseAvatarLabel}</span>
                                    <div className="preset-list">
                                        {AVATAR_PRESETS.map((presetUrl, index) => {
                                            const isSelected = profileForm.profilePictureUrl === presetUrl;
                                            return (
                                                <button
                                                    type="button"
                                                    key={presetUrl}
                                                    className={
                                                        isSelected
                                                            ? 'avatar-preset-btn selected'
                                                            : 'avatar-preset-btn'
                                                    }
                                                    onClick={() =>
                                                        setProfileForm({
                                                            ...profileForm,
                                                            profilePictureUrl: presetUrl,
                                                        })
                                                    }
                                                    title={`Avatar #${index + 1}`}
                                                >
                                                    <img src={presetUrl} alt={`Preset Avatar ${index + 1}`} />
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <button type="submit" className="primary-btn">
                                    {t.saveProfileBtn}
                                </button>
                            </form>
                        </div>
                    </div>

                    <h2 style={{ marginTop: '32px' }}>{t.myReservationsTitle}</h2>
                    <div className="card-grid">
                        {myReservations.map((res) => (
                            <div key={res.id} className="card">
                                <div className="card-header">
                                    <h3>{res.headsetName}</h3>
                                    <span className={`badge badge-${res.status}`}>
                                        {translateReservationStatus(res.status, lang)}
                                    </span>
                                </div>
                                <p>
                                    <strong>{t.startLabel}</strong> {formatDateTime24(res.startTime)}
                                </p>
                                <p>
                                    <strong>{t.endLabel}</strong> {formatDateTime24(res.endTime)}
                                </p>
                                {res.status !== 'Cancelled' && res.status !== 'Completed' && (
                                    <button
                                        type="button"
                                        className="danger-btn"
                                        onClick={() => void onCancelReservation(res.id)}
                                    >
                                        {t.cancelReservationBtn}
                                    </button>
                                )}
                            </div>
                        ))}
                        {myReservations.length === 0 && (
                            <p className="muted-text">{t.noReservationsYet}</p>
                        )}
                    </div>
                </div>
            )}
        </section>
    );
}