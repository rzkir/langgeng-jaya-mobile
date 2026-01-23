"use client"

import { ReactNode, createContext, useContext, useEffect, useState } from "react"

import { router } from "expo-router"

import { API_CONFIG } from "@/lib/config"

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function getInitialUser(): User | null {
    if (typeof window === "undefined") return null

    try {
        const storedUser = localStorage.getItem("user")
        if (storedUser) {
            return JSON.parse(storedUser)
        }
    } catch (err) {
        console.error("Error parsing stored user:", err)
        localStorage.removeItem("user")
    }
    return null
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(getInitialUser)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Sinkronkan cookie user.role agar proxy bisa redirect / → /dashboard
    useEffect(() => {
        if (user && typeof window !== "undefined") {
            document.cookie = `user.role=${encodeURIComponent(user.roleType)}; path=/; max-age=604800`
        }
    }, [user])

    const login = async (credentials: LoginRequest): Promise<User | null> => {
        setIsLoading(true)
        setError(null)

        try {
            const response = await fetch(API_CONFIG.ENDPOINTS.auth.login, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(credentials),
            })

            // Parse response
            let data: AuthResponse
            try {
                data = await response.json()
            } catch {
                // Jika response bukan JSON
                setError(`Server error: ${response.status} ${response.statusText}`)
                setIsLoading(false)
                return null
            }

            if (!data.success || !data.data) {
                setError(data.message || "Login failed")
                setIsLoading(false)
                return null
            }

            // Save user to state and localStorage
            setUser(data.data)
            if (typeof window !== "undefined") {
                localStorage.setItem("user", JSON.stringify(data.data))
                // Cookie untuk proxy: redirect / → /dashboard jika role admin
                document.cookie = `user.role=${encodeURIComponent(data.data.roleType)}; path=/; max-age=604800`
            }

            setIsLoading(false)
            return data.data
        } catch (error) {
            console.error("Login error:", error)
            setError(error instanceof Error ? error.message : "An error occurred. Please try again.")
            setIsLoading(false)
            return null
        }
    }

    const logout = async () => {
        setUser(null)
        if (typeof window !== "undefined") {
            localStorage.removeItem("user")
            await fetch(API_CONFIG.ENDPOINTS.auth.session, { method: "DELETE", credentials: "include" })
        }
        router.replace("/login")
    }

    const clearError = () => {
        setError(null)
    }

    const value: AuthContextType = {
        user,
        isLoading,
        error,
        login,
        logout,
        isAuthenticated: !!user,
        clearError,
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider")
    }
    return context
}