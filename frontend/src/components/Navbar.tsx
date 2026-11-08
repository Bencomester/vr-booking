import { type Language, translations } from '../i18n';
import type { PageRoute, UserDto } from '../types';
import { DEFAULT_AVATAR_IMG } from '../utils/formatters';

interface NavbarProps {
    route: PageRoute;
    user: UserDto | null;
    lang: Language;
    onToggleLang: () => void;
    onNavigate: (route: PageRoute) => void;
}

export function Navbar({ route, user, lang, onToggleLang, onNavigate }: Readonly<NavbarProps>) {
    const isAdminRoute = route.startsWith('ADMIN_');
    const t = (translations[lang]).nav;

    return (
        <header className="navbar">
            <button type="button" className="brand-logo" onClick={() => onNavigate('HOME')}>
                <span className="brand-icon">◈</span>
                <span className="brand-text">
                    RENT-A-<span>VR</span>
                </span>
            </button>

            <nav className="nav-links">
                <button
                    type="button"
                    className={route === 'HOME' ? 'nav-btn active' : 'nav-btn'}
                    onClick={() => onNavigate('HOME')}
                >
                    {t.home}
                </button>
                <button
                    type="button"
                    className={route === 'TIMETABLE' ? 'nav-btn active' : 'nav-btn'}
                    onClick={() => onNavigate('TIMETABLE')}
                >
                    {t.timetable}
                </button>
                <button
                    type="button"
                    className={route === 'GAMES' ? 'nav-btn active' : 'nav-btn'}
                    onClick={() => onNavigate('GAMES')}
                >
                    {t.games}
                </button>
                <button
                    type="button"
                    className={route === 'HEADSETS' ? 'nav-btn active' : 'nav-btn'}
                    onClick={() => onNavigate('HEADSETS')}
                >
                    {t.headsets}
                </button>
                <button
                    type="button"
                    className={route === 'RIGS' ? 'nav-btn active' : 'nav-btn'}
                    onClick={() => onNavigate('RIGS')}
                >
                    {t.rigs}
                </button>
                {user?.role === 'Admin' && (
                    <button
                        type="button"
                        className={isAdminRoute ? 'nav-btn admin-btn active' : 'nav-btn admin-btn'}
                        onClick={() => onNavigate('ADMIN_AVAILABILITY')}
                    >
                        {t.adminStudio}
                    </button>
                )}
            </nav>

            <div className="btn-group">
                <button
                    type="button"
                    className="nav-btn"
                    onClick={onToggleLang}
                    title={lang === 'en' ? 'Váltás magyar nyelvre' : 'Switch to English'}
                >
                    🌐 {lang === 'en' ? 'HU' : 'EN'}
                </button>

                <button
                    type="button"
                    className={route === 'ACCOUNT' ? 'account-btn active' : 'account-btn'}
                    onClick={() => onNavigate('ACCOUNT')}
                >
                    {user ? (
                        <span className="account-chip">
                            <img
                                src={user.profilePictureUrl || DEFAULT_AVATAR_IMG}
                                alt={user.fullName}
                                className="nav-avatar"
                            />
                            <span>{user.fullName}</span>
                        </span>
                    ) : (
                        <span>{t.signInJoin}</span>
                    )}
                </button>
            </div>
        </header>
    );
}
