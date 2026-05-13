export interface UserDto {
  id: string;
  email: string;
  fullName: string;
  age: number;
  userType: 'Adult' | 'Minor';
  averageRating: number | null;
  completedJobs: number;
}

export interface AuthResponse {
  accessToken: string;
  expiresAt: string;
  user: UserDto;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  birthDate: string; // ISO yyyy-MM-dd
  phoneNumber?: string;
  postalCode?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}
