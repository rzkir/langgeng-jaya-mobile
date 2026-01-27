"use client"

import AsyncStorage from "@react-native-async-storage/async-storage"

import { ReactNode, createContext, useContext, useEffect, useState } from "react"

import { router } from "expo-router"

import { API_CONFIG } from "@/lib/config"

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const USER_STORAGE_KEY = "user"

function hasWebStorage() {
    return typeof globalThis !== "undefined" && typeof (globalThis as any).localStorage !== "undefined"
}

function getInitialUser(): User | null {
    // Di Expo native: `window` bisa ada, tapi `localStorage` tidak ada.
    if (!hasWebStorage()) return null

    try {
        const storedUser = (globalThis as any).localStorage.getItem(USER_STORAGE_KEY)
        if (storedUser) {
            return JSON.parse(storedUser)
        }
    } catch (err) {
        console.error("Error parsing stored user:", err)
        try {
            ; (globalThis as any).localStorage.removeItem(USER_STORAGE_KEY)
        } catch {
            // ignore
        }
    }
    return null
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(getInitialUser)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Hydrate user on native (AsyncStorage)
    useEffect(() => {
        if (hasWebStorage()) return

        let isMounted = true
            ; (async () => {
                try {
                    setIsLoading(true)
                    const storedUser = await AsyncStorage.getItem(USER_STORAGE_KEY)
                    if (!isMounted) return
                    if (storedUser) {
                        setUser(JSON.parse(storedUser))
                    }
                } catch (err) {
                    console.error("Error loading stored user:", err)
                    await AsyncStorage.removeItem(USER_STORAGE_KEY)
                } finally {
                    if (isMounted) setIsLoading(false)
                }
            })()

        return () => {
            isMounted = false
        }
    }, [])

    // Optional: hydrate via httpOnly cookie session (mostly for web)
    useEffect(() => {
        if (!hasWebStorage()) return

        let isMounted = true
            ; (async () => {
                try {
                    const res = await fetch(API_CONFIG.ENDPOINTS.auth.session, {
                        method: "GET",
                        credentials: "include",
                    })
                    const json = (await res.json()) as { success: boolean; data: User | null }
                    if (!isMounted) return
                    if (json?.success && json.data) {
                        setUser(json.data)
                            ; (globalThis as any).localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(json.data))
                    }
                } catch {
                    // ignore (network/cookie not available)
                }
            })()

        return () => {
            isMounted = false
        }
    }, [])

    // Sinkronkan cookie user.role agar proxy bisa redirect / → /dashboard
    useEffect(() => {
        if (user && typeof document !== "undefined") {
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
                // Cookie httpOnly akan diset oleh server (web). Di mobile biasanya tidak dipakai,
                // karena kita simpan user di AsyncStorage.
                credentials: "include",
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
            try {
                if (hasWebStorage()) {
                    ; (globalThis as any).localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.data))
                    // Cookie untuk proxy: redirect / → /dashboard jika role admin
                    if (typeof document !== "undefined") {
                        document.cookie = `user.role=${encodeURIComponent(data.data.roleType)}; path=/; max-age=604800`
                    }
                } else {
                    await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.data))
                }
            } catch (err) {
                console.error("Error persisting user:", err)
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
        try {
            if (hasWebStorage()) {
                ; (globalThis as any).localStorage.removeItem(USER_STORAGE_KEY)
                await fetch(API_CONFIG.ENDPOINTS.auth.session, { method: "DELETE", credentials: "include" })
            } else {
                await AsyncStorage.removeItem(USER_STORAGE_KEY)
                // Best-effort: kalau backend support cookies di RN (jarang), tetap hit endpoint logout
                try {
                    await fetch(API_CONFIG.ENDPOINTS.auth.session, { method: "DELETE" })
                } catch {
                    // ignore
                }
            }
        } catch (err) {
            console.error("Logout error:", err)
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