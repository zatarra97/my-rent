import React, { useState, FormEvent } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import SEO from "../../Components/SEO"

const Login: React.FC = () => {
	const [password, setPassword] = useState("")
	const [error, setError] = useState("")
	const [isLoading, setIsLoading] = useState(false)
	const { login } = useAuth()
	const navigate = useNavigate()

	const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		setError("")
		setIsLoading(true)

		// Simula un piccolo delay per UX migliore
		await new Promise((resolve) => setTimeout(resolve, 300))

		const success = login(password)
		if (success) {
			navigate("/")
		} else {
			setError("Password non corretta. Riprova.")
			setPassword("")
		}

		setIsLoading(false)
	}

	return (
		<div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
			<SEO title="Login - Accesso" description="Accedi all'area riservata" noindex={true} />
			<div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
				<div className="text-center mb-8">
					<h1 className="text-3xl font-semibold text-gray-900 mb-2">Accesso</h1>
					<p className="text-gray-600">Inserisci la password per accedere</p>
				</div>

				<form onSubmit={handleSubmit} className="space-y-6">
					<div>
						<label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
							Password
						</label>
						<input
							type="password"
							id="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
							placeholder="Inserisci la password"
							required
							autoFocus
							disabled={isLoading}
						/>
					</div>

					{error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}

					<button
						type="submit"
						disabled={isLoading}
						className="w-full btn btn-primary btn-big disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{isLoading ? "Accesso in corso..." : "Accedi"}
					</button>
				</form>
			</div>
		</div>
	)
}

export default Login
