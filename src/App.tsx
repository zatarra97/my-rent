import React from "react"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { HelmetProvider } from "react-helmet-async"
import "./App.css"
import { AuthProvider } from "./contexts/AuthContext"
import NotFound from "./Pages/NotFound/NotFound"
import Home from "./Pages/Home/Home"
import Login from "./Pages/Login/Login"
import ProtectedRoute from "./Components/ProtectedRoute"
import ScrollToTop from "./Components/ScrollToTop"

const App: React.FC = () => {
	return (
		<HelmetProvider>
			<AuthProvider>
				<Router>
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
		</HelmetProvider>
	)
}

export default App
