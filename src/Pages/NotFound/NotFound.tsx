import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faHome } from "@fortawesome/free-solid-svg-icons"
import { Link } from "react-router-dom"
import SEO from "../../Components/SEO"
import Navbar from "../../Components/Navbar"
import NotFoundGif from "../../Images/404.gif"

export default function NotFound() {
	return (
		<div className="min-h-screen bg-white flex flex-col">
			<SEO title="Pagina Non Trovata - 404" description="La pagina che stai cercando non esiste. Torna alla homepage." noindex={true} />
			<Navbar />

			<main className="flex-1 bg-slate-100">
				<section className="py-20 md:pb-34">
					<div className="container px-4">
						<div className="max-w-2xl mx-auto text-center">
							<div className="relative">
								<div className="mb-8">
									<div className="inline-block p-4 rounded-full">
										<img src={NotFoundGif} className="" alt="not_found" />
									</div>
									<h2 className="text-2xl font-semibold text-slate-900 mb-4">Ops! I raggi del sole non arrivano qui</h2>
									<p className="text-slate-900 text-lg mb-8 max-w-md mx-auto">
										La pagina che stai cercando non esiste o è stata spostata.
									</p>
								</div>

								<Link
									to="/"
									className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary hover:bg-primary-dark text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-primary/25"
								>
									<FontAwesomeIcon icon={faHome} className="text-lg" />
									<span>Torna alla home</span>
								</Link>
							</div>
						</div>
					</div>
				</section>
			</main>
		</div>
	)
}
