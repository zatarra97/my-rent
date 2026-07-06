import React from "react"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import "./App.css"
import { AuthProvider } from "./contexts/AuthContext"
import NotFound from "./Pages/NotFound/NotFound"
import Home from "./Pages/Home/Home"
import Login from "./Pages/Login/Login"
import ProtectedRoute from "./Components/ProtectedRoute"
import ScrollToTop from "./Components/ScrollToTop"

// Usa il base URL fornito da Vite (corrisponde al base path configurato in vite.config.js)
// import.meta.env.BASE_URL è sempre una stringa che termina con '/'
// Es: '/' per root, '/my-rent/' per repository progetto
const basename = import.meta.env.BASE_URL

const App: React.FC = () => {
	return (
		<AuthProvider>
			<Router basename={basename}>
				<Routes>
					<Route path="/login" element={<Login />} />
					<Route
						path="/"
						element={
							<ProtectedRoute>
								<Home />
							</ProtectedRoute>
						}
					/>
					<Route path="*" element={<NotFound />} />
				</Routes>
				<ScrollToTop />
			</Router>
		</AuthProvider>
	)
}

export default App
