import React from "react"
import { useAuth } from "../contexts/AuthContext"

const Navbar: React.FC = () => {
	const { isAuthenticated, logout } = useAuth()

	if (!isAuthenticated) {
		return null
	}

	return (
		<header className="w-full sticky top-0 z-30 bg-white border-b border-gray-200">
			<nav className="container px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-end">
				<button onClick={logout} className="btn btn-secondary btn-small">
					Disconnetti
				</button>
			</nav>
		</header>
	)
}

export default Navbar
