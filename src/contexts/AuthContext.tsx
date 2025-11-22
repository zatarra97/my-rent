import React, { createContext, useContext, useState, useEffect, ReactNode } from "react"

interface AuthContextType {
	isAuthenticated: boolean
	login: (password: string) => boolean
	logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const AUTH_STORAGE_KEY = "rent_auth"
const LOGIN_PASSWORD = import.meta.env.VITE_LOGIN_PASSWORD || ""

interface AuthProviderProps {
	children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
	const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
		// Verifica se c'è un'autenticazione salvata nel localStorage
		const savedAuth = localStorage.getItem(AUTH_STORAGE_KEY)
		return savedAuth === "true"
	})

	useEffect(() => {
		// Salva lo stato di autenticazione nel localStorage
		localStorage.setItem(AUTH_STORAGE_KEY, isAuthenticated.toString())
	}, [isAuthenticated])

	const login = (password: string): boolean => {
		if (password === LOGIN_PASSWORD) {
			setIsAuthenticated(true)
			return true
		}
		return false
	}

	const logout = () => {
		setIsAuthenticated(false)
		localStorage.removeItem(AUTH_STORAGE_KEY)
	}

	return <AuthContext.Provider value={{ isAuthenticated, login, logout }}>{children}</AuthContext.Provider>
}

export const useAuth = (): AuthContextType => {
	const context = useContext(AuthContext)
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider")
	}
	return context
}

