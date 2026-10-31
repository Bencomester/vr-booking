import type { PageRoute, UserDto } from '../types';
import { DEFAULT_AVATAR_IMG } from '../utils/formatters';

interface NavbarProps {
    route: PageRoute;
    user: UserDto | null;
    onNavigate: (route: PageRoute) => void;
}

export function Navbar({ route, user, onNavigate }: NavbarProps) {
    const isAdminRoute = route.startsWith('ADMIN_');

    return (
        <header className="navbar">
            <button type="button" className="brand-logo" onClick={() => onNavigate('HOME')}>
                <span className="brand-icon">◈</span>
                <span className="brand-text">
          AETHER<span>VR</span>
        </span>
            </button>

            <nav className="nav-links">
                <button
                    type="button"
                    className={route === 'HOME' ? 'nav-btn active' : 'nav-btn'}
                    onClick={() => onNavigate('HOME')}
                >
                    Home
                </button>
                <button
                    type="button"
                    className={route === 'TIMETABLE' ? 'nav-btn active' : 'nav-btn'}
                    onClick={() => onNavigate('TIMETABLE')}
                >
                    Book & Week Timetable
                </button>
                <button
                    type="button"
                    className={route === 'GAMES' ? 'nav-btn active' : 'nav-btn'}
                    onClick={() => onNavigate('GAMES')}
                >
                    Steam VR Games
                </button>
                <button
                    type="button"
                    className={route === 'HEADSETS' ? 'nav-btn active' : 'nav-btn'}
                    onClick={() => onNavigate('HEADSETS')}
                >
                    Headsets
                </button>
                <button
                    type="button"
                    className={route === 'RIGS' ? 'nav-btn active' : 'nav-btn'}
                    onClick={() => onNavigate('RIGS')}
                >
                    Rigs
                </button>
                {user?.role === 'Admin' && (
                    <button
                        type="button"
                        className={isAdminRoute ? 'nav-btn admin-btn active' : 'nav-btn admin-btn'}
                        onClick={() => onNavigate('ADMIN_AVAILABILITY')}
                    >
                        Admin Studio
                    </button>
                )}
            </nav>

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
                    <span>Sign In / Join</span>
                )}
            </button>
        </header>
    );
}