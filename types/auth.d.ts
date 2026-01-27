enum RoleType {
    KARYAWAN = "karyawan",
}

interface User {
    id: string;
    email: string;
    name: string;
    roleType: RoleType;
    branchName?: string;
    createdAt: string;
    updatedAt: string;
}

interface LoginRequest {
    email?: string;
    name?: string;
    password: string;
    branchName?: string;
}

interface AuthResponse {
    success: boolean;
    message: string;
    data?: User;
}

interface AuthContextType {
    user: User | null
    isLoading: boolean
    error: string | null
    login: (credentials: LoginRequest) => Promise<User | null>
    logout: () => void | Promise<void>
    isAuthenticated: boolean
    clearError: () => void
}