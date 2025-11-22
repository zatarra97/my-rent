import React, { useMemo } from "react"
import Navbar from "../../Components/Navbar"
import SEO from "../../Components/SEO"

interface Spesa {
	data: string
	importo: number
	descrizione: string
	tipo: "proprietario" | "affittuario"
}

const Home: React.FC = () => {
	// Dati delle spese
	const spese: Spesa[] = useMemo(
		() => [
			{
				id: 1,
				data: "01/09/2025",
				importo: 300.0,
				descrizione: "Affitto Settembre 2025",
				tipo: "proprietario",
			},
			{
				id: 2,
				data: "19/09/2025",
				importo: 92.0,
				descrizione: "Tari (Settembre - Dicembre 2025)",
				tipo: "proprietario",
			},
			{
				id: 3,
				data: "01/10/2025",
				importo: 300.0,
				descrizione: "Affitto Ottobre 2025",
				tipo: "proprietario",
			},
			{
				id: 4,
				data: "01/11/2025",
				importo: 300.0,
				descrizione: "Affitto Novembre 2025",
				tipo: "proprietario",
			},
			{
				id: 5,
				data: "10/11/2025",
				importo: 109.7,
				descrizione: "Energia (Settembre - Ottobre 2025)",
				tipo: "proprietario",
			},
			{
				id: 6,
				data: "17/11/2025",
				importo: 20.05,
				descrizione: "Gas (Luglio - Settembre €60.16/3 mesi)",
				tipo: "proprietario",
			},
			{
				id: 7,
				data: "18/11/2025",
				importo: 19.01,
				descrizione: "Acqua 6^ emissione 2025",
				tipo: "proprietario",
			},
			{
				id: 8,
				data: "18/11/2025",
				importo: 26.33,
				descrizione: "Condominio (Luglio - Settembre 2025 - €79,00/3 mesi)",
				tipo: "proprietario",
			},
			{
				id: 9,
				data: "18/11/2025",
				importo: 79.27,
				descrizione: "Condominio (Ottobre - Dicembre 2025)",
				tipo: "proprietario",
			},
			{
				id: 10,
				data: "22/11/2025",
				importo: 1250.0,
				descrizione: "Rimborso spese precedenti",
				tipo: "affittuario",
			},
		],
		[]
	)

	// Calcolo del totale
	const totale = useMemo(() => {
		return spese.reduce((acc, spesa) => {
			if (spesa.tipo === "proprietario") {
				return acc + spesa.importo
			} else {
				return acc - spesa.importo
			}
		}, 0)
	}, [spese])

	// Formattazione importo in formato italiano
	const formattaImporto = (importo: number): string => {
		return new Intl.NumberFormat("it-IT", {
			style: "currency",
			currency: "EUR",
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		}).format(importo)
	}

	return (
		<div className="min-h-screen bg-gray-50">
			<SEO
				title="Gestione spese affitto - riepilogo"
				description="Riepilogo completo delle spese per l'affitto con calcolo del saldo tra proprietario e affittuario."
				keywords={["affitto", "spese", "proprietario", "affittuario", "gestione"]}
				canonical="/"
				noindex={true}
			/>
			<Navbar />

			{/* Header */}
			<section className="bg-white border-b border-gray-200 py-8 md:py-12">
				<div className="container px-4 sm:px-6 lg:px-8">
					<h1 className="text-2xl md:text-4xl font-semibold text-gray-900">Gestione spese</h1>
					<p className="mt-2 text-base md:text-lg text-gray-600">Riepilogo completo delle spese e dei pagamenti.</p>
				</div>
			</section>

			{/* Tabella Spese */}
			<section className="py-8 md:py-12">
				<div className="container px-2 sm:px-6 lg:px-8">
					<div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
						{/* Tabella Desktop */}
						<div className="hidden md:block overflow-x-auto">
							<table className="w-full">
								<thead>
									<tr className="bg-primary text-white">
										<th className="px-6 py-4 text-left text-sm font-semibold">Data notifica</th>
										<th className="px-6 py-4 text-left text-sm font-semibold">Descrizione</th>
										<th className="px-6 py-4 text-right text-sm font-semibold">Importo</th>
										<th className="px-6 py-4 text-center text-sm font-semibold">Tipo</th>
									</tr>
								</thead>
								<tbody>
									{spese.map((spesa, index) => (
										<tr key={index} className={`border-b border-gray-200 ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}>
											<td className="px-6 py-4 text-sm text-gray-900">{spesa.data}</td>
											<td className="px-6 py-4 text-sm text-gray-900">{spesa.descrizione}</td>
											<td
												className={`px-6 py-4 text-sm text-right font-medium ${
													spesa.tipo === "proprietario" ? "text-red-600" : "text-green-600"
												}`}
											>
												{spesa.tipo === "proprietario" ? "+" : "-"}
												{formattaImporto(spesa.importo)}
											</td>
											<td className="px-6 py-4 text-center">
												<span
													className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
														spesa.tipo === "proprietario" ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
													}`}
												>
													{spesa.tipo === "proprietario" ? "Proprietario" : "Affittuario"}
												</span>
											</td>
										</tr>
									))}
									{/* Riga Totale */}
									<tr className="bg-gray-100 border-t-2 border-gray-300">
										<td colSpan={2} className="px-6 py-4 text-sm font-semibold text-gray-900">
											TOTALE
										</td>
										<td className={`px-6 py-4 text-right text-lg font-bold ${totale >= 0 ? "text-red-600" : "text-green-600"}`}>
											{formattaImporto(Math.abs(totale))}
										</td>
										<td className="px-6 py-4 text-center text-sm text-gray-600">
											{totale >= 0 ? "Da riscuotere" : "Saldo positivo"}
										</td>
									</tr>
								</tbody>
							</table>
						</div>

						{/* Vista Mobile */}
						<div className="md:hidden">
							<div className="divide-y divide-gray-200">
								{spese.map((spesa, index) => (
									<div key={index} className="p-4">
										<div className="flex justify-between items-start mb-2">
											<div className="flex-1">
												<p className="text-sm font-medium text-gray-900">{spesa.descrizione}</p>
												<p className="text-xs text-gray-500 mt-1">{spesa.data}</p>
											</div>
											<div className="ml-4 text-right">
												<p
													className={`text-sm font-semibold ${
														spesa.tipo === "proprietario" ? "text-red-600" : "text-green-600"
													}`}
												>
													{spesa.tipo === "proprietario" ? "+" : "-"}
													{formattaImporto(spesa.importo)}
												</p>
												<span
													className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${
														spesa.tipo === "proprietario" ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
													}`}
												>
													{spesa.tipo === "proprietario" ? "Proprietario" : "Affittuario"}
												</span>
											</div>
										</div>
									</div>
								))}
								{/* Totale Mobile */}
								<div className="p-4 bg-gray-100 border-t-2 border-gray-300">
									<div className="flex justify-between items-center">
										<div>
											<p className="text-sm font-semibold text-gray-900">TOTALE</p>
											<p className="text-xs text-gray-600 mt-1">{totale >= 0 ? "Da riscuotere" : "Saldo positivo"}</p>
										</div>
										<p className={`text-lg font-bold ${totale >= 0 ? "text-red-600" : "text-green-600"}`}>
											{formattaImporto(Math.abs(totale))}
										</p>
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Info Box */}
					<div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 md:p-6">
						<div className="flex items-start">
							<div className="flex-shrink-0">
								<svg className="h-5 w-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
									<path
										fillRule="evenodd"
										d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
										clipRule="evenodd"
									/>
								</svg>
							</div>
							<div className="ml-3 flex-1">
								<h3 className="text-sm font-medium text-blue-900 mb-2">Legenda</h3>
								<ul className="text-sm text-blue-800 space-y-1">
									<li>
										<span className="font-semibold text-red-600">+ Importo</span> = Spesa del proprietario (da sommare)
									</li>
									<li>
										<span className="font-semibold text-green-600">- Importo</span> = Pagamento dell'affittuario (da sottrarre)
									</li>
									<li>
										<span className="font-semibold">Totale positivo</span> = Importo da riscuotere dall'affittuario
									</li>
									<li>
										<span className="font-semibold">Totale negativo</span> = Saldo positivo (affittuario in credito)
									</li>
								</ul>
							</div>
						</div>
					</div>
				</div>
			</section>
		</div>
	)
}

export default Home
