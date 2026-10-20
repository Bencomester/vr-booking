export type HeadsetStatus = "Available" | "Maintenance" | "Coming Soon...";
export type ReservationStatus = "Pending" | "Confirmed" | "Completed" | "Cancelled";
export type UserRole = "User" | "Admin";

export interface GameDto {
    id?: number;
    title: string;
    description: string;
}

export interface HeadsetDto {
    id?: number;
    name: string;
    hourlyPrice: number;
    status: HeadsetStatus;
    installedGames: GameDto[];
}

export interface HeadsetCreateDto {
    name: string;
    hourlyPrice: number;
    status: HeadsetStatus;
    gameIds: number[];
}

export interface RigDto {
    id?: number;
    name: string;
    cpu: string;
    gpu: string;
    ram: string;
    description: string;
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
    userId?: number;
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
    createdAt: string;
    role: UserRole;
}

export interface AuthResponseDto {
    token: string;
    user: UserDto;
}