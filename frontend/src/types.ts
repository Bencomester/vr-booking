export type HeadsetStatus = "Available" | "Maintenance" | "Coming Soon...";
export type ReservationStatus = "Pending" | "Confirmed" | "Completed" | "Cancelled";
export type UserRole = "User" | "Admin";

export type PageRoute =
    | 'HOME'
    | 'TIMETABLE'
    | 'GAMES'
    | 'HEADSETS'
    | 'RIGS'
    | 'ACCOUNT'
    | 'ADMIN_AVAILABILITY'
    | 'ADMIN_HEADSETS'
    | 'ADMIN_GAMES'
    | 'ADMIN_RIGS'
    | 'ADMIN_RESERVATIONS';

export const ROUTE_PATHS: Record<PageRoute, string> = {
    HOME: '/vr',
    TIMETABLE: '/vr/timetable',
    GAMES: '/vr/games',
    HEADSETS: '/vr/headsets',
    RIGS: '/vr/rigs',
    ACCOUNT: '/vr/account',
    ADMIN_AVAILABILITY: '/vr/admin/availability',
    ADMIN_HEADSETS: '/vr/admin/headsets',
    ADMIN_GAMES: '/vr/admin/games',
    ADMIN_RIGS: '/vr/admin/rigs',
    ADMIN_RESERVATIONS: '/vr/admin/reservations',
};

export interface GameDto {
    id?: number;
    title: string;
    description: string;
    steamAppId?: number;
    imageUrl?: string;
}

export interface SteamGameDetailsDto {
    appId: number;
    name: string;
    shortDescription: string;
    aboutTheGame: string;
    headerImage: string;
    developers: string[];
    publishers: string[];
    releaseDate: string;
    genres: string[];
    metacriticScore?: number | null;
    screenshots: string[];
    website?: string;
}

export interface HeadsetDto {
    id?: number;
    name: string;
    hourlyPrice: number;
    status: HeadsetStatus;
    description?: string;
    imageUrl?: string;
    installedGames: GameDto[];
}

export interface HeadsetUpdateDto {
    id?: number;
    name: string;
    hourlyPrice: number;
    status: HeadsetStatus;
    description?: string;
    imageUrl?: string;
    gameIds: number[];
}

export interface RigDto {
    id?: number;
    name: string;
    cpu: string;
    gpu: string;
    ram: string;
    os: string;
    imageUrl?: string;
    description?: string;
}

export interface AvailabilityDto {
    id?: number;
    startTime: string;
    endTime: string;
}

export interface TimeBlock {
    startTime: string;
    endTime: string;
    headsetId: number;
}

export interface TimetableResponseDto {
    availableTimes: TimeBlock[];
}

export interface ReservationCreateDto {
    headsetId: number;
    startTime: string;
    endTime: string;
}

export interface ReservationDto {
    id: number;
    userId: number;
    userFullName: string;
    headsetId: number;
    headsetName: string;
    startTime: string;
    endTime: string;
    status: ReservationStatus;
}

export interface UserDto {
    id: number;
    email: string;
    fullName: string;
    phoneNumber: string;
    profilePictureUrl?: string;
    createdAt: string;
    role: UserRole;
}

export interface UserUpdateDto {
    fullName: string;
    phoneNumber: string;
    profilePictureUrl?: string;
}

export interface AuthResponseDto {
    token: string;
    user: UserDto;
}

export interface WeekDayInfo {
    iso: string;
    dayName: string;
    labelShort: string;
    isToday: boolean;
}