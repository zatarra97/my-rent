import React, { useMemo } from "react"
import Navbar from "../../Components/Navbar"
import Chart from "react-apexcharts"

interface Spesa {
	data: string
	importo: number
	descrizione: string
	tipo: "proprietario" | "affittuario"
	categoria: "affitto" | "condominio" | "energia" | "gas" | "aqp" | "tari" | "assicurazione" | "varie"
}

const Home: React.FC = () => {
	// Dati delle spese
	const spese: Spesa[] = useMemo(
		() => [
			{
				data: "01/09/2025",
				importo: 300.0,
				descrizione: "",
				tipo: "proprietario",
				categoria: "affitto",
			},
			{
				data: "19/09/2025",
				importo: 92.0,
				descrizione: "Tari (Settembre - Dicembre 2025)",
				tipo: "proprietario",
				categoria: "tari",
			},
			{
				data: "01/10/2025",
				importo: 300.0,
				descrizione: "",
				tipo: "proprietario",
				categoria: "affitto",
			},
			{
				data: "01/11/2025",
				importo: 300.0,
				descrizione: "",
				tipo: "proprietario",
				categoria: "affitto",
			},
			{
				data: "10/11/2025",
				importo: 109.7,
				descrizione: "Settembre - Ottobre 2025",
				tipo: "proprietario",
				categoria: "energia",
			},
			{
				data: "17/11/2025",
				importo: 60.16,
				descrizione: "Luglio - Settembre 2025",
				tipo: "proprietario",
				categoria: "gas",
			},
			{
				data: "18/11/2025",
				importo: 19.01,
				descrizione: "6^ emissione 2025",
				tipo: "proprietario",
				categoria: "aqp",
			},
			{
				data: "18/11/2025",
				importo: 26.33,
				descrizione: "Luglio - Settembre 2025 - €79,00 / 3 mesi",
				tipo: "proprietario",
				categoria: "condominio",
			},
			{
				data: "18/11/2025",
				importo: 79.27,
				descrizione: "Ottobre - Dicembre 2025",
				tipo: "proprietario",
				categoria: "condominio",
			},
			{
				data: "22/11/2025",
				importo: 1286.47,
				descrizione: "",
				tipo: "affittuario",
				categoria: "varie",
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

	// Funzione per estrarre il mese dalla data (formato DD/MM/YYYY)
	const getMeseFromData = (data: string): string => {
		const [, mese, anno] = data.split("/")
		const mesi = [
			"Gennaio",
			"Febbraio",
			"Marzo",
			"Aprile",
			"Maggio",
			"Giugno",
			"Luglio",
			"Agosto",
			"Settembre",
			"Ottobre",
			"Novembre",
			"Dicembre",
		]
		return `${mesi[parseInt(mese) - 1]} ${anno}`
	}

	// Funzione per ottenere l'indice del mese per l'ordinamento
	const getMeseIndex = (data: string): number => {
		const [, mese, anno] = data.split("/")
		return parseInt(anno) * 12 + parseInt(mese) - 1
	}

	// Raggruppa le spese per mese
	const spesePerMese = useMemo(() => {
		const grouped: Record<
			string,
			{
				mese: string
				affitto: Array<{ data: string; importo: number; descrizione: string }>
				condominio: Array<{ data: string; importo: number; descrizione: string }>
				energia: Array<{ data: string; importo: number; descrizione: string }>
				gas: Array<{ data: string; importo: number; descrizione: string }>
				aqp: Array<{ data: string; importo: number; descrizione: string }>
				tari: Array<{ data: string; importo: number; descrizione: string }>
				assicurazione: Array<{ data: string; importo: number; descrizione: string }>
				varie: Array<{ data: string; importo: number; descrizione: string }>
				rimborsi: Array<{ data: string; importo: number; descrizione: string }>
			}
		> = {}

		// Separa spese proprietario e rimborsi affittuario
		const speseProprietario = spese.filter((s) => s.tipo === "proprietario")
		const rimborsiAffittuario = spese.filter((s) => s.tipo === "affittuario")

		// Raggruppa spese proprietario per mese
		speseProprietario.forEach((spesa) => {
			const meseKey = getMeseFromData(spesa.data)
			if (!grouped[meseKey]) {
				grouped[meseKey] = {
					mese: meseKey,
					affitto: [],
					condominio: [],
					energia: [],
					gas: [],
					aqp: [],
					tari: [],
					assicurazione: [],
					varie: [],
					rimborsi: [],
				}
			}

			const entry = {
				data: spesa.data,
				importo: spesa.importo,
				descrizione: spesa.descrizione,
			}

			if (spesa.categoria === "affitto") {
				grouped[meseKey].affitto.push(entry)
			} else if (spesa.categoria === "condominio") {
				grouped[meseKey].condominio.push(entry)
			} else if (spesa.categoria === "energia") {
				grouped[meseKey].energia.push(entry)
			} else if (spesa.categoria === "gas") {
				grouped[meseKey].gas.push(entry)
			} else if (spesa.categoria === "aqp") {
				grouped[meseKey].aqp.push(entry)
			} else if (spesa.categoria === "tari") {
				grouped[meseKey].tari.push(entry)
			} else if (spesa.categoria === "assicurazione") {
				grouped[meseKey].assicurazione.push(entry)
			} else if (spesa.categoria === "varie") {
				grouped[meseKey].varie.push(entry)
			}
		})

		// Aggiungi rimborsi al mese corrispondente
		rimborsiAffittuario.forEach((rimborso) => {
			const meseKey = getMeseFromData(rimborso.data)
			if (!grouped[meseKey]) {
				grouped[meseKey] = {
					mese: meseKey,
					affitto: [],
					condominio: [],
					energia: [],
					gas: [],
					aqp: [],
					tari: [],
					assicurazione: [],
					varie: [],
					rimborsi: [],
				}
			}
			grouped[meseKey].rimborsi.push({
				data: rimborso.data,
				importo: rimborso.importo,
				descrizione: rimborso.descrizione,
			})
		})

		// Ordina per mese (più recente prima)
		return Object.values(grouped).sort((a, b) => {
			const getFirstData = (meseData: (typeof grouped)[string]) => {
				return (
					meseData.affitto[0]?.data ||
					meseData.condominio[0]?.data ||
					meseData.energia[0]?.data ||
					meseData.gas[0]?.data ||
					meseData.aqp[0]?.data ||
					meseData.tari[0]?.data ||
					meseData.assicurazione[0]?.data ||
					meseData.varie[0]?.data ||
					meseData.rimborsi[0]?.data ||
					"01/01/2025"
				)
			}
			const indexA = getMeseIndex(getFirstData(a))
			const indexB = getMeseIndex(getFirstData(b))
			return indexA - indexB // Ordine crescente (più vecchio prima)
		})
	}, [spese])

	// Funzione per calcolare il totale di un mese (senza rimborsi)
	const getTotaleMese = useMemo(() => {
		return (meseData: (typeof spesePerMese)[0]): number => {
			let totale = 0
			totale += meseData.affitto.reduce((acc, s) => acc + s.importo, 0)
			totale += meseData.condominio.reduce((acc, s) => acc + s.importo, 0)
			totale += meseData.energia.reduce((acc, s) => acc + s.importo, 0)
			totale += meseData.gas.reduce((acc, s) => acc + s.importo, 0)
			totale += meseData.aqp.reduce((acc, s) => acc + s.importo, 0)
			totale += meseData.tari.reduce((acc, s) => acc + s.importo, 0)
			totale += meseData.assicurazione.reduce((acc, s) => acc + s.importo, 0)
			totale += meseData.varie.reduce((acc, s) => acc + s.importo, 0)

			return totale
		}
	}, [])

	// Funzione helper per ottenere l'importo per categoria
	const getImportoPerCategoria = (categoria: string): number => {
		return spese.filter((s) => s.categoria === categoria && s.tipo === "proprietario").reduce((acc, spesa) => acc + spesa.importo, 0)
	}

	// Totale rimborsi
	const totaleRimborsi = useMemo(() => {
		return spese.filter((s) => s.tipo === "affittuario").reduce((acc, spesa) => acc + spesa.importo, 0)
	}, [spese])

	// Totale delle righe (considerando la checkbox)
	const totaleRighe = useMemo(() => {
		return spesePerMese.reduce((acc, meseData) => acc + getTotaleMese(meseData), 0)
	}, [spesePerMese, getTotaleMese])

	// Formattazione importo in formato italiano
	const formattaImporto = (importo: number): string => {
		return new Intl.NumberFormat("it-IT", {
			style: "currency",
			currency: "EUR",
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		}).format(importo)
	}

	// Dati per il grafico ad area
	const chartData = useMemo(() => {
		const categories = spesePerMese.map((m) => m.mese.split(" ")[0])
		const data = spesePerMese.map((m) => getTotaleMese(m))

		// Determina il colore in base al segno del totale
		const hasPositive = data.some((d) => d >= 0)
		const hasNegative = data.some((d) => d < 0)
		const chartColor = hasPositive && !hasNegative ? "#EF4444" : hasNegative && !hasPositive ? "#10B981" : "#EF4444"

		return {
			categories,
			data,
			color: chartColor,
		}
	}, [spesePerMese, getTotaleMese])

	// Opzioni del grafico ApexCharts
	const chartOptions = useMemo(() => {
		return {
			chart: {
				height: "100%",
				maxWidth: "100%",
				type: "area" as const,
				fontFamily: "Inter, sans-serif",
				dropShadow: {
					enabled: false,
				},
				toolbar: {
					show: false,
				},
			},
			tooltip: {
				enabled: true,
				x: {
					show: false,
				},
				y: {
					formatter: (value: number) => {
						return (value >= 0 ? "+" : "") + formattaImporto(Math.abs(value))
					},
				},
			},
			fill: {
				type: "gradient",
				gradient: {
					opacityFrom: 0.55,
					opacityTo: 0,
					shade: chartData.color,
					gradientToColors: [chartData.color],
				},
			},
			dataLabels: {
				enabled: false,
			},
			stroke: {
				width: 6,
				curve: "smooth" as const,
			},
			grid: {
				show: false,
				strokeDashArray: 4,
				padding: {
					left: 2,
					right: 2,
					top: 0,
				},
			},
			series: [
				{
					name: "Totale mese",
					data: chartData.data,
					color: chartData.color,
				},
			],
			xaxis: {
				categories: chartData.categories,
				labels: {
					show: true,
					style: {
						fontSize: "12px",
						fontFamily: "Inter, sans-serif",
						colors: "#6B7280",
					},
				},
				axisBorder: {
					show: false,
				},
				axisTicks: {
					show: false,
				},
			},
			yaxis: {
				show: false,
			},
		}
	}, [chartData, formattaImporto])

	// Funzione helper per renderizzare una cella con più spese
	const renderCellaSpese = (speseArray: Array<{ data: string; importo: number; descrizione: string }>) => {
		if (speseArray.length === 0) {
			return <span className="text-gray-400">-</span>
		}

		// Raggruppa per data
		const spesePerData: Record<string, Array<{ data: string; importo: number; descrizione: string }>> = {}
		speseArray.forEach((spesa) => {
			if (!spesePerData[spesa.data]) {
				spesePerData[spesa.data] = []
			}
			spesePerData[spesa.data].push(spesa)
		})

		const dateUniche = Object.keys(spesePerData)
		const tutteStessaData = dateUniche.length === 1

		return (
			<div className="space-y-1">
				{dateUniche.map((data, idx) => {
					const speseData = spesePerData[data]
					const tutteStesseDescrizioni = speseData.length > 1 && speseData.every((s) => s.descrizione === speseData[0].descrizione)

					return (
						<div key={idx} className="flex items-center justify-end gap-2">
							<div className="text-right">
								{(!tutteStessaData || idx === 0) && <div className="text-xs text-gray-500">{data}</div>}
								<div className="font-medium text-red-600 space-y-0.5">
									{speseData.length === 1 ? (
										<>+{formattaImporto(speseData[0].importo)}</>
									) : (
										speseData.map((spesa, i) => (
											<div key={i} className="text-sm">
												+{formattaImporto(spesa.importo)}
											</div>
										))
									)}
								</div>
							</div>
							{speseData.some((s) => s.descrizione) && (
								<div className="relative group">
									<svg className="w-4 h-4 text-gray-400 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
										/>
									</svg>
									<div className="absolute right-0 bottom-full mb-2 w-64 p-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
										{tutteStesseDescrizioni ? (
											speseData[0].descrizione
										) : (
											<div className="space-y-1">
												{speseData.map((s, i) => (
													<div key={i}>
														{s.descrizione && (
															<>
																<span className="font-semibold">{s.data}:</span> {s.descrizione}
															</>
														)}
													</div>
												))}
											</div>
										)}
									</div>
								</div>
							)}
						</div>
					)
				})}
			</div>
		)
	}

	return (
		<div className="min-h-screen bg-gray-50">
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
										<th className="px-4 py-4 text-left text-sm font-semibold border-r border-white/20">Mese</th>
										<th className="px-4 py-4 text-right text-sm font-semibold border-r border-white/20">Affitto</th>
										<th className="px-4 py-4 text-right text-sm font-semibold border-r border-white/20">Condominio</th>
										<th className="px-4 py-4 text-right text-sm font-semibold border-r border-white/20">Energia</th>
										<th className="px-4 py-4 text-right text-sm font-semibold border-r border-white/20">Gas</th>
										<th className="px-4 py-4 text-right text-sm font-semibold border-r border-white/20">Aqp</th>
										<th className="px-4 py-4 text-right text-sm font-semibold border-r border-white/20">Tari</th>
										<th className="px-4 py-4 text-right text-sm font-semibold border-r border-white/20">Ass.</th>
										<th className="px-4 py-4 text-right text-sm font-semibold border-r border-white/20">Varie</th>
										<th className="px-4 py-4 text-right text-sm font-semibold border-r border-white/20">Totale</th>
										<th className="px-4 py-4 text-right text-sm font-semibold">Rimborsi</th>
									</tr>
								</thead>
								<tbody>
									{spesePerMese.map((meseData, index) => (
										<tr key={index} className={`border-b border-gray-200 ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}>
											<td className="px-4 py-4 text-sm font-semibold text-gray-900 border-r border-gray-200">
												{meseData.mese}
											</td>
											<td className="px-4 py-4 text-sm text-right border-r border-gray-200">
												{renderCellaSpese(meseData.affitto)}
											</td>
											<td className="px-4 py-4 text-sm text-right border-r border-gray-200">
												{renderCellaSpese(meseData.condominio)}
											</td>
											<td className="px-4 py-4 text-sm text-right border-r border-gray-200">
												{renderCellaSpese(meseData.energia)}
											</td>
											<td className="px-4 py-4 text-sm text-right border-r border-gray-200">
												{renderCellaSpese(meseData.gas)}
											</td>
											<td className="px-4 py-4 text-sm text-right border-r border-gray-200">
												{renderCellaSpese(meseData.aqp)}
											</td>
											<td className="px-4 py-4 text-sm text-right border-r border-gray-200">
												{renderCellaSpese(meseData.tari)}
											</td>
											<td className="px-4 py-4 text-sm text-right border-r border-gray-200">
												{renderCellaSpese(meseData.assicurazione)}
											</td>
											<td className="px-4 py-4 text-sm text-right border-r border-gray-200">
												{renderCellaSpese(meseData.varie)}
											</td>
											<td className="px-4 py-4 text-sm text-right border-r border-gray-200">
												<div className="font-semibold">
													<span className={getTotaleMese(meseData) >= 0 ? "text-red-600" : "text-green-600"}>
														{getTotaleMese(meseData) >= 0 ? "+" : ""}
														{formattaImporto(Math.abs(getTotaleMese(meseData)))}
													</span>
												</div>
											</td>
											<td className="px-4 py-4 text-sm text-right">
												{meseData.rimborsi.length > 0 ? (
													<div className="space-y-1">
														{meseData.rimborsi.map((rimborso, rIndex) => (
															<div key={rIndex} className="flex items-center justify-end gap-2">
																<div className="text-right">
																	<div className="text-xs text-gray-500">{rimborso.data}</div>
																	<div className="font-medium text-green-600">
																		-{formattaImporto(rimborso.importo)}
																	</div>
																</div>
																{rimborso.descrizione && (
																	<div className="relative group">
																		<svg
																			className="w-4 h-4 text-gray-400 cursor-help"
																			fill="none"
																			stroke="currentColor"
																			viewBox="0 0 24 24"
																		>
																			<path
																				strokeLinecap="round"
																				strokeLinejoin="round"
																				strokeWidth={2}
																				d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
																			/>
																		</svg>
																		<div className="absolute right-0 bottom-full mb-2 w-64 p-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
																			{rimborso.descrizione}
																		</div>
																	</div>
																)}
															</div>
														))}
													</div>
												) : (
													<span className="text-gray-400">-</span>
												)}
											</td>
										</tr>
									))}
									{/* Riga Totale */}
									<tr className="bg-gray-100 border-t-2 border-gray-300">
										<td className="px-4 py-4 text-sm font-semibold text-gray-900 border-r border-gray-300">TOTALE</td>
										<td className="px-4 py-4 text-sm text-right font-semibold border-r border-gray-300">
											{getImportoPerCategoria("affitto") !== 0 && (
												<span className="text-red-600">{formattaImporto(getImportoPerCategoria("affitto"))}</span>
											)}
										</td>
										<td className="px-4 py-4 text-sm text-right font-semibold border-r border-gray-300">
											{getImportoPerCategoria("condominio") !== 0 && (
												<span className="text-red-600">{formattaImporto(getImportoPerCategoria("condominio"))}</span>
											)}
										</td>
										<td className="px-4 py-4 text-sm text-right font-semibold border-r border-gray-300">
											{getImportoPerCategoria("energia") !== 0 && (
												<span className="text-red-600">{formattaImporto(getImportoPerCategoria("energia"))}</span>
											)}
										</td>
										<td className="px-4 py-4 text-sm text-right font-semibold border-r border-gray-300">
											{getImportoPerCategoria("gas") !== 0 && (
												<span className="text-red-600">{formattaImporto(getImportoPerCategoria("gas"))}</span>
											)}
										</td>
										<td className="px-4 py-4 text-sm text-right font-semibold border-r border-gray-300">
											{getImportoPerCategoria("aqp") !== 0 && (
												<span className="text-red-600">{formattaImporto(getImportoPerCategoria("aqp"))}</span>
											)}
										</td>
										<td className="px-4 py-4 text-sm text-right font-semibold border-r border-gray-300">
											{getImportoPerCategoria("tari") !== 0 && (
												<span className="text-red-600">{formattaImporto(getImportoPerCategoria("tari"))}</span>
											)}
										</td>
										<td className="px-4 py-4 text-sm text-right font-semibold border-r border-gray-300">
											{getImportoPerCategoria("assicurazione") !== 0 && (
												<span className="text-red-600">{formattaImporto(getImportoPerCategoria("assicurazione"))}</span>
											)}
										</td>
										<td className="px-4 py-4 text-sm text-right font-semibold border-r border-gray-300">
											{getImportoPerCategoria("varie") !== 0 && (
												<span className="text-red-600">{formattaImporto(getImportoPerCategoria("varie"))}</span>
											)}
										</td>
										<td className="px-4 py-4 text-sm text-right font-semibold border-r border-gray-300">
											<span className={totaleRighe >= 0 ? "text-red-600" : "text-green-600"}>
												{totaleRighe >= 0 ? "+" : ""}
												{formattaImporto(Math.abs(totaleRighe))}
											</span>
										</td>
										<td className="px-4 py-4 text-sm text-right font-semibold">
											{totaleRimborsi !== 0 && <span className="text-green-600">-{formattaImporto(totaleRimborsi)}</span>}
										</td>
									</tr>
									{/* Riga Saldo Finale */}
									<tr className="bg-gray-200 border-t-2 border-gray-400">
										<td colSpan={10} className="px-4 py-4 text-sm font-semibold text-gray-900 text-right">
											SALDO FINALE
										</td>
										<td className={`px-4 py-4 text-right text-lg font-bold ${totale >= 0 ? "text-red-600" : "text-green-600"}`}>
											{formattaImporto(Math.abs(totale))}
										</td>
									</tr>
								</tbody>
							</table>
						</div>

						{/* Vista Mobile */}
						<div className="md:hidden">
							<div className="divide-y divide-gray-200">
								{spesePerMese.map((meseData, index) => (
									<div key={index} className="p-4">
										<h3 className="text-base font-semibold text-gray-900 mb-3">{meseData.mese}</h3>
										<div className="space-y-3">
											{/* Affitto */}
											{meseData.affitto.length > 0 && (
												<div className="space-y-2">
													{meseData.affitto.map((spesa, idx) => (
														<div key={idx} className="flex justify-between items-start">
															<div className="flex-1">
																<div className="flex items-center gap-2 mb-1">
																	<span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
																		Affitto
																	</span>
																	<span className="text-xs text-gray-500">{spesa.data}</span>
																</div>
																{spesa.descrizione && <p className="text-xs text-gray-600">{spesa.descrizione}</p>}
															</div>
															<p className="text-sm font-semibold text-red-600 ml-2">
																+{formattaImporto(spesa.importo)}
															</p>
														</div>
													))}
												</div>
											)}
											{/* Condominio */}
											{meseData.condominio.length > 0 && (
												<div className="space-y-2">
													{meseData.condominio.map((spesa, idx) => (
														<div key={idx} className="flex justify-between items-start">
															<div className="flex-1">
																<div className="flex items-center gap-2 mb-1">
																	<span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
																		Condominio
																	</span>
																	<span className="text-xs text-gray-500">{spesa.data}</span>
																</div>
																{spesa.descrizione && <p className="text-xs text-gray-600">{spesa.descrizione}</p>}
															</div>
															<p className="text-sm font-semibold text-red-600 ml-2">
																+{formattaImporto(spesa.importo)}
															</p>
														</div>
													))}
												</div>
											)}
											{/* Energia */}
											{meseData.energia.length > 0 && (
												<div className="space-y-2">
													{meseData.energia.map((spesa, idx) => (
														<div key={idx} className="flex justify-between items-start">
															<div className="flex-1">
																<div className="flex items-center gap-2 mb-1">
																	<span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
																		Energia
																	</span>
																	<span className="text-xs text-gray-500">{spesa.data}</span>
																</div>
																{spesa.descrizione && <p className="text-xs text-gray-600">{spesa.descrizione}</p>}
															</div>
															<p className="text-sm font-semibold text-red-600 ml-2">
																+{formattaImporto(spesa.importo)}
															</p>
														</div>
													))}
												</div>
											)}
											{/* Gas */}
											{meseData.gas.length > 0 && (
												<div className="space-y-2">
													{meseData.gas.map((spesa, idx) => (
														<div key={idx} className="flex justify-between items-start">
															<div className="flex-1">
																<div className="flex items-center gap-2 mb-1">
																	<span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
																		Gas
																	</span>
																	<span className="text-xs text-gray-500">{spesa.data}</span>
																</div>
																{spesa.descrizione && <p className="text-xs text-gray-600">{spesa.descrizione}</p>}
															</div>
															<p className="text-sm font-semibold text-red-600 ml-2">
																+{formattaImporto(spesa.importo)}
															</p>
														</div>
													))}
												</div>
											)}
											{/* Aqp */}
											{meseData.aqp.length > 0 && (
												<div className="space-y-2">
													{meseData.aqp.map((spesa, idx) => (
														<div key={idx} className="flex justify-between items-start">
															<div className="flex-1">
																<div className="flex items-center gap-2 mb-1">
																	<span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-cyan-100 text-cyan-800">
																		Aqp
																	</span>
																	<span className="text-xs text-gray-500">{spesa.data}</span>
																</div>
																{spesa.descrizione && <p className="text-xs text-gray-600">{spesa.descrizione}</p>}
															</div>
															<p className="text-sm font-semibold text-red-600 ml-2">
																+{formattaImporto(spesa.importo)}
															</p>
														</div>
													))}
												</div>
											)}
											{/* Tari */}
											{meseData.tari.length > 0 && (
												<div className="space-y-2">
													{meseData.tari.map((spesa, idx) => (
														<div key={idx} className="flex justify-between items-start">
															<div className="flex-1">
																<div className="flex items-center gap-2 mb-1">
																	<span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800">
																		Tari
																	</span>
																	<span className="text-xs text-gray-500">{spesa.data}</span>
																</div>
																{spesa.descrizione && <p className="text-xs text-gray-600">{spesa.descrizione}</p>}
															</div>
															<p className="text-sm font-semibold text-red-600 ml-2">
																+{formattaImporto(spesa.importo)}
															</p>
														</div>
													))}
												</div>
											)}
											{/* Assicurazione */}
											{meseData.assicurazione.length > 0 && (
												<div className="space-y-2">
													{meseData.assicurazione.map((spesa, idx) => (
														<div key={idx} className="flex justify-between items-start">
															<div className="flex-1">
																<div className="flex items-center gap-2 mb-1">
																	<span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
																		Ass.
																	</span>
																	<span className="text-xs text-gray-500">{spesa.data}</span>
																</div>
																{spesa.descrizione && <p className="text-xs text-gray-600">{spesa.descrizione}</p>}
															</div>
															<p className="text-sm font-semibold text-red-600 ml-2">
																+{formattaImporto(spesa.importo)}
															</p>
														</div>
													))}
												</div>
											)}
											{/* Varie */}
											{meseData.varie.length > 0 && (
												<div className="space-y-2">
													{meseData.varie.map((spesa, idx) => (
														<div key={idx} className="flex justify-between items-start">
															<div className="flex-1">
																<div className="flex items-center gap-2 mb-1">
																	<span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-pink-100 text-pink-800">
																		Varie
																	</span>
																	<span className="text-xs text-gray-500">{spesa.data}</span>
																</div>
																{spesa.descrizione && <p className="text-xs text-gray-600">{spesa.descrizione}</p>}
															</div>
															<p className="text-sm font-semibold text-red-600 ml-2">
																+{formattaImporto(spesa.importo)}
															</p>
														</div>
													))}
												</div>
											)}
											{/* Totale Mese */}
											<div className="pt-3 mt-3 border-t-2 border-gray-300">
												<div className="flex justify-between items-center">
													<p className="text-sm font-semibold text-gray-900">Totale mese</p>
													<p
														className={`text-base font-bold ${
															getTotaleMese(meseData) >= 0 ? "text-red-600" : "text-green-600"
														}`}
													>
														{getTotaleMese(meseData) >= 0 ? "+" : ""}
														{formattaImporto(Math.abs(getTotaleMese(meseData)))}
													</p>
												</div>
											</div>
											{/* Rimborsi */}
											{meseData.rimborsi.length > 0 && (
												<div className="pt-2 mt-2 border-t border-gray-200">
													<p className="text-xs font-semibold text-gray-700 mb-2">Rimborsi</p>
													{meseData.rimborsi.map((rimborso, rIndex) => (
														<div key={rIndex} className="flex justify-between items-start mb-2">
															<div className="flex-1">
																<span className="text-xs text-gray-500">{rimborso.data}</span>
																{rimborso.descrizione && (
																	<p className="text-xs text-gray-600 mt-1">{rimborso.descrizione}</p>
																)}
															</div>
															<p className="text-sm font-semibold text-green-600 ml-2">
																-{formattaImporto(rimborso.importo)}
															</p>
														</div>
													))}
												</div>
											)}
										</div>
									</div>
								))}
								{/* Totale Mobile */}
								<div className="p-4 bg-gray-100 border-t-2 border-gray-300">
									<div className="mb-3">
										<p className="text-sm font-semibold text-gray-900 mb-2">Totali per categoria</p>
										<div className="space-y-1 text-xs">
											{getImportoPerCategoria("affitto") !== 0 && (
												<div className="flex justify-between">
													<span className="text-gray-600">Affitto:</span>
													<span className={getImportoPerCategoria("affitto") >= 0 ? "text-red-600" : "text-green-600"}>
														{formattaImporto(Math.abs(getImportoPerCategoria("affitto")))}
													</span>
												</div>
											)}
											{getImportoPerCategoria("condominio") !== 0 && (
												<div className="flex justify-between">
													<span className="text-gray-600">Condominio:</span>
													<span className={getImportoPerCategoria("condominio") >= 0 ? "text-red-600" : "text-green-600"}>
														{formattaImporto(Math.abs(getImportoPerCategoria("condominio")))}
													</span>
												</div>
											)}
											{getImportoPerCategoria("energia") !== 0 && (
												<div className="flex justify-between">
													<span className="text-gray-600">Energia:</span>
													<span className={getImportoPerCategoria("energia") >= 0 ? "text-red-600" : "text-green-600"}>
														{formattaImporto(Math.abs(getImportoPerCategoria("energia")))}
													</span>
												</div>
											)}
											{getImportoPerCategoria("gas") !== 0 && (
												<div className="flex justify-between">
													<span className="text-gray-600">Gas:</span>
													<span className={getImportoPerCategoria("gas") >= 0 ? "text-red-600" : "text-green-600"}>
														{formattaImporto(Math.abs(getImportoPerCategoria("gas")))}
													</span>
												</div>
											)}
											{getImportoPerCategoria("aqp") !== 0 && (
												<div className="flex justify-between">
													<span className="text-gray-600">Aqp:</span>
													<span className={getImportoPerCategoria("aqp") >= 0 ? "text-red-600" : "text-green-600"}>
														{formattaImporto(Math.abs(getImportoPerCategoria("aqp")))}
													</span>
												</div>
											)}
											{getImportoPerCategoria("tari") !== 0 && (
												<div className="flex justify-between">
													<span className="text-gray-600">Tari:</span>
													<span className={getImportoPerCategoria("tari") >= 0 ? "text-red-600" : "text-green-600"}>
														{formattaImporto(Math.abs(getImportoPerCategoria("tari")))}
													</span>
												</div>
											)}
											{getImportoPerCategoria("assicurazione") !== 0 && (
												<div className="flex justify-between">
													<span className="text-gray-600">Assicurazione:</span>
													<span
														className={getImportoPerCategoria("assicurazione") >= 0 ? "text-red-600" : "text-green-600"}
													>
														{formattaImporto(Math.abs(getImportoPerCategoria("assicurazione")))}
													</span>
												</div>
											)}
											{getImportoPerCategoria("varie") !== 0 && (
												<div className="flex justify-between">
													<span className="text-gray-600">Varie:</span>
													<span className={getImportoPerCategoria("varie") >= 0 ? "text-red-600" : "text-green-600"}>
														{formattaImporto(Math.abs(getImportoPerCategoria("varie")))}
													</span>
												</div>
											)}
										</div>
									</div>
									<div className="pt-3 border-t border-gray-300">
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
					</div>

					{/* Grafico Totali Mensili */}
					<div className="mt-6 bg-white border border-gray-200 rounded-lg shadow-sm p-4 md:p-6">
						<div className="flex justify-between items-start mb-4">
							<div>
								<h5 className="text-2xl font-semibold text-gray-900">{formattaImporto(Math.abs(totaleRighe))}</h5>
								<p className="text-gray-600">Totale spese</p>
							</div>
							<div className="flex items-center px-2.5 py-0.5 font-medium text-center">
								<span className={`text-sm ${totale >= 0 ? "text-red-600" : "text-green-600"}`}>
									{totale >= 0 ? "Da riscuotere" : "Saldo positivo"}
								</span>
							</div>
						</div>

						{/* Grafico ad area */}
						<div className="mt-6">
							<div id="area-chart" className="h-64">
								<Chart options={chartOptions} series={chartOptions.series} type="area" height="100%" />
							</div>
						</div>

						<div className="grid grid-cols-1 items-center border-t border-gray-200 justify-between mt-4 pt-4">
							<div className="flex justify-between items-center">
								<div className="text-sm font-medium text-gray-700">
									{spesePerMese.length} {spesePerMese.length === 1 ? "mese" : "mesi"} visualizzati
								</div>
								<div className="flex items-center gap-4 text-xs text-gray-600">
									<div className="flex items-center gap-2">
										<div className="w-3 h-3 bg-red-500 rounded"></div>
										<span>Spese</span>
									</div>
									<div className="flex items-center gap-2">
										<div className="w-3 h-3 bg-green-500 rounded"></div>
										<span>Credito</span>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>
		</div>
	)
}

export default Home
