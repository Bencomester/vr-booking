import { DAY_NAMES, type Language } from '../i18n';
import { type GameDto, type PageRoute, ROUTE_PATHS, type WeekDayInfo } from '../types';

export const HOURS_24 = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
export const MINUTES_STEP = ['00', '15', '30', '45'];

export const DEFAULT_HEADSET_IMG =
    'https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?auto=format&fit=crop&w=900&q=80';
export const DEFAULT_GAME_IMG =
    'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=900&q=80';
export const DEFAULT_RIG_IMG =
    'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=900&q=80';
export const DEFAULT_AVATAR_IMG =
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80';

export const AVATAR_PRESETS = [
    DEFAULT_AVATAR_IMG,
    'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
];

export function parsePathToRoute(pathname: string): PageRoute {
    const clean = pathname.replace(/\/+$/, '') || '/';
    const entry = (Object.entries(ROUTE_PATHS) as [PageRoute, string][]).find(
        ([, path]) => path === clean
    );
    if (entry) return entry[0];
    if (clean.startsWith('/admin')) return 'ADMIN_AVAILABILITY';
    return 'HOME';
}

export function getMondayOfWeek(baseDate: Date, weekOffset: number): Date {
    const d = new Date(baseDate);
    d.setHours(0, 0, 0, 0);
    const day = d.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diffToMonday + weekOffset * 7);
    return d;
}

export function toIsoDateString(d: Date): string {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export function buildWeekDays(weekOffset: number, lang: Language = 'en'): WeekDayInfo[] {
    const monday = getMondayOfWeek(new Date(), weekOffset);
    const dayNames = DAY_NAMES[lang];
    const todayIso = toIsoDateString(new Date());

    return Array.from({ length: 7 }, (_, idx) => {
        const d = new Date(monday);
        d.setDate(monday.getDate() + idx);
        const iso = toIsoDateString(d);
        const labelShort = `${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}.`;
        return {
            iso,
            dayName: dayNames[idx],
            labelShort,
            isToday: iso === todayIso,
        };
    });
}

export function formatHuf(amount?: number): string {
    const val = Number.isFinite(amount) ? Number(amount) : 0;
    return `${new Intl.NumberFormat('hu-HU').format(Math.round(val))} HUF`;
}

export function formatDateTime24(isoString: string): string {
    if (!isoString) return '';
    const datePart = isoString.slice(0, 10).replaceAll('-', '.');
    const timePart = isoString.slice(11, 16);
    return `${datePart}. ${timePart}`;
}

export function formatTimeShort24(isoString: string): string {
    if (!isoString) return '';
    return isoString.slice(11, 16);
}

export function timeToPercentage(isoString: string): number {
    if (!isoString) return 0;
    const hours = Number(isoString.slice(11, 13));
    const minutes = Number(isoString.slice(14, 16));
    return ((hours * 60 + minutes) / 1440) * 100;
}

export function clockToMinutes(hhmm: string): number {
    const [h, m] = hhmm.split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
}

export function getGameCoverUrl(game: GameDto): string {
    if (game.imageUrl && game.imageUrl.trim().length > 0) {
        return game.imageUrl;
    }
    if (game.steamAppId && game.steamAppId > 0) {
        return `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${game.steamAppId}/header.jpg`;
    }
    return DEFAULT_GAME_IMG;
}
