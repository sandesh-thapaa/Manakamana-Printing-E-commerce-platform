export interface LoginPayload {
  client_id: string;
  password?: string;
}

export interface AuthenticatedUser {
  id: string;
  client_id: string;
  role: 'ADMIN' | 'CLIENT';
}

export interface LoginResponse {
  message: string;
  token: string;
  user: AuthenticatedUser;
}
