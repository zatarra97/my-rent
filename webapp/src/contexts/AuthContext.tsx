import React, { createContext, useContext, useState, ReactNode } from "react"
import { getPassword, setPassword, clearPassword, verificaAccesso } from "../services/api"

interface AuthContextType {
	isAuthenticated: boolean
	login: (password: string) => Promise<boolean>
	logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
	children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
	// Se c'è una password salvata si considera autenticato; una password errata
	// verrà comunque intercettata (401) e farà logout automatico.
	const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => !!getPassword())

	const login = async (password: string): Promise<boolean> => {
		setPassword(password)
		try {
			await verificaAccesso()
			setIsAuthenticated(true)
			return true
		} catch {
			clearPassword()
			setIsAuthenticated(false)
			return false
		}
	}

	const logout = () => {
		clearPassword()
		setIsAuthenticated(false)
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
