import React, { useMemo, useState, useEffect, useCallback } from "react"
import Navbar from "../../Components/Navbar"
import Chart from "react-apexcharts"
import { Spesa, ETICHETTE_CATEGORIA } from "../../types/spesa"
import { getSpese, deleteSpesa } from "../../services/api"
import SpesaFormModal from "../../Components/SpesaFormModal"

// Converte una data ISO (YYYY-MM-DD) nel formato di visualizzazione DD/MM/YYYY
const isoToDisplay = (iso: string): string => {
	const [y, m, d] = iso.split("-")
	return `${d}/${m}/${y}`
}

const Home: React.FC = () => {
	// --- Stato dati (dal backend) ---
	const [speseRaw, setSpeseRaw] = useState<Spesa[]>([])
	const [loading, setLoading] = useState(true)
	const [erroreCaricamento, setErroreCaricamento] = useState<string | null>(null)

	// --- Stato UI CRUD ---
	const [modaleAperta, setModaleAperta] = useState(false)
	const [spesaSelezionata, setSpesaSelezionata] = useState<Spesa | null>(null)

	const caricaSpese = useCallback(async () => {
		try {
			setErroreCaricamento(null)
			const dati = await getSpese()
			setSpeseRaw(dati)
		} catch (err) {
			console.error("Errore caricamento spese:", err)
			setErroreCaricamento("Impossibile caricare le spese. Riprova.")
		} finally {
			setLoading(false)
		}
	}, [])

	useEffect(() => {
		caricaSpese()
	}, [caricaSpese])

	// Spese in formato "display" (data DD/MM/YYYY) per la logica di aggregazione
	const spese: Spesa[] = useMemo(
		() => speseRaw.map((s) => ({ ...s, data: isoToDisplay(s.data) })),
		[speseRaw]
	)

	// Elenco piatto ordinato per data decrescente (le date ISO si ordinano lessicograficamente)
	const speseOrdinate = useMemo(
		() => [...speseRaw].sort((a, b) => b.data.localeCompare(a.data)),
		[speseRaw]
	)

	// Estrai gli anni disponibili dalle spese
	const anniDisponibili = useMemo(() => {
		const anni = new Set<string>()
		spese.forEach((spesa) => {
			const anno = spesa.data.split("/")[2]
			anni.add(anno)
		})
		return Array.from(anni).sort()
	}, [spese])

	// Stato per l'anno selezionato (default: tutti)
	const [annoSelezionato, setAnnoSelezionato] = useState<string | null>(null)

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

	// Raggruppa le spese per mese (sempre tutte le spese per i calcoli)
	const spesePerMese = useMemo(() => {
		const grouped: Record<
			string,
			{
				mese: string
				affitto: Array<{ publicId: string; data: string; importo: number; descrizione: string }>
				condominio: Array<{ publicId: string; data: string; importo: number; descrizione: string }>
				energia: Array<{ publicId: string; data: string; importo: number; descrizione: string }>
				gas: Array<{ publicId: string; data: string; importo: number; descrizione: string }>
				aqp: Array<{ publicId: string; data: string; importo: number; descrizione: string }>
				tari: Array<{ publicId: string; data: string; importo: number; descrizione: string }>
				assicurazione: Array<{ publicId: string; data: string; importo: number; descrizione: string }>
				varie: Array<{ publicId: string; data: string; importo: number; descrizione: string }>
				rimborsi: Array<{ publicId: string; data: string; importo: number; descrizione: string }>
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
				publicId: spesa.publicId,
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
				publicId: rimborso.publicId,
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

	// Totale delle righe
	const totaleRighe = useMemo(() => {
		return spesePerMese.reduce((acc, meseData) => acc + getTotaleMese(meseData), 0)
	}, [spesePerMese, getTotaleMese])

	// Filtra spesePerMese per anno selezionato (solo per visualizzazione, i calcoli rimangono totali)
	const spesePerMeseFiltrate = useMemo(() => {
		if (!annoSelezionato) {
			return spesePerMese
		}
		return spesePerMese.filter((meseData) => {
			// Estrai l'anno dal campo mese (formato "Mese Anno")
			const annoMese = meseData.mese.split(" ")[1]
			return annoMese === annoSelezionato
		})
	}, [spesePerMese, annoSelezionato])

	// Formattazione importo in formato italiano
	const formattaImporto = (importo: number): string => {
		return new Intl.NumberFormat("it-IT", {
			style: "currency",
			currency: "EUR",
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		}).format(importo)
	}

	// Calcolo statistiche mensili
	const statisticheMensili = useMemo(() => {
		const totaliMensili = spesePerMese.map((m) => getTotaleMese(m))
		const media = totaliMensili.length > 0 ? totaliMensili.reduce((acc, val) => acc + val, 0) / totaliMensili.length : 0
		const minimo = totaliMensili.length > 0 ? Math.min(...totaliMensili) : 0
		const massimo = totaliMensili.length > 0 ? Math.max(...totaliMensili) : 0

		// Calcola il trend (confronto tra ultimo e penultimo mese)
		let trend: { valore: number; percentuale: number; direzione: "up" | "down" | "stable" } | null = null
		if (totaliMensili.length >= 2) {
			const ultimo = totaliMensili[totaliMensili.length - 1]
			const penultimo = totaliMensili[totaliMensili.length - 2]
			const differenza = ultimo - penultimo
			const percentuale = penultimo !== 0 ? (differenza / Math.abs(penultimo)) * 100 : 0
			trend = {
				valore: differenza,
				percentuale: Math.abs(percentuale),
				direzione: differenza > 0 ? "up" : differenza < 0 ? "down" : "stable",
			}
		}

		return {
			media,
			minimo,
			massimo,
			trend,
		}
	}, [spesePerMese, getTotaleMese])

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
		// Crea una serie per la linea della media
		const mediaData = chartData.data.map(() => statisticheMensili.media)

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
					show: true,
					formatter: (val: number) => {
						return chartData.categories[val] || ""
					},
				},
				y: {
					formatter: (value: number, { seriesIndex }: { seriesIndex: number }) => {
						if (seriesIndex === 0) {
							// Serie principale
							return (value >= 0 ? "+" : "") + formattaImporto(Math.abs(value))
						} else {
							// Serie media
							return "Media: " + (value >= 0 ? "+" : "") + formattaImporto(Math.abs(value))
						}
					},
				},
				custom: ({ series, dataPointIndex }: any) => {
					const valoreMese = series[0][dataPointIndex]
					const media = statisticheMensili.media
					const differenzaMedia = valoreMese - media
					const percentualeMedia = media !== 0 ? (differenzaMedia / Math.abs(media)) * 100 : 0

					return `
						<div class="p-3 bg-gray-900 text-white rounded-lg shadow-lg">
							<div class="text-xs text-gray-400 mb-1">${chartData.categories[dataPointIndex]}</div>
							<div class="text-base font-semibold mb-2">
								${valoreMese >= 0 ? "+" : ""}${formattaImporto(Math.abs(valoreMese))}
							</div>
							<div class="text-xs space-y-1 pt-2 border-t border-gray-700">
								<div class="flex justify-between">
									<span class="text-gray-400">Media:</span>
									<span>${media >= 0 ? "+" : ""}${formattaImporto(Math.abs(media))}</span>
								</div>
								<div class="flex justify-between">
									<span class="text-gray-400">Scostamento:</span>
									<span class="${differenzaMedia >= 0 ? "text-red-400" : "text-green-400"}">
										${differenzaMedia >= 0 ? "+" : ""}${formattaImporto(Math.abs(differenzaMedia))}
										(${differenzaMedia >= 0 ? "+" : ""}${Math.abs(percentualeMedia).toFixed(1)}%)
									</span>
								</div>
							</div>
						</div>
					`
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
				width: [6, 2],
				curve: ["smooth" as const, "straight" as const],
				dashArray: [0, 5],
			},
			grid: {
				show: true,
				strokeDashArray: 4,
				padding: {
					left: 10,
					right: 2,
					top: 0,
				},
				borderColor: "#E5E7EB",
			},
			series: [
				{
					name: "Totale mese",
					data: chartData.data,
					color: chartData.color,
				},
				{
					name: "Media mensile",
					data: mediaData,
					color: "#3B82F6",
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
				show: true,
				labels: {
					show: true,
					style: {
						fontSize: "12px",
						fontFamily: "Inter, sans-serif",
						colors: "#6B7280",
					},
					formatter: (value: number) => {
						// Formatta i valori in modo compatto per l'asse Y
						if (Math.abs(value) >= 1000) {
							return (value >= 0 ? "+" : "") + (value / 1000).toFixed(1) + "k€"
						}
						return (value >= 0 ? "+" : "") + Math.round(value).toString() + "€"
					},
				},
				axisBorder: {
					show: true,
					color: "#E5E7EB",
				},
				axisTicks: {
					show: true,
					color: "#E5E7EB",
				},
				title: {
					text: "Importo (€)",
					style: {
						fontSize: "12px",
						fontFamily: "Inter, sans-serif",
						fontWeight: 500,
						color: "#6B7280",
					},
				},
			},
			legend: {
				show: true,
				position: "top" as const,
				horizontalAlign: "right" as const,
				fontSize: "12px",
				fontFamily: "Inter, sans-serif",
				markers: {
					size: 8,
				},
			},
		}
	}, [chartData, statisticheMensili, formattaImporto])

	// Funzione helper per renderizzare una cella con più spese
	const renderCellaSpese = (speseArray: Array<{ publicId: string; data: string; importo: number; descrizione: string }>) => {
		if (speseArray.length === 0) {
			return <span className="text-gray-400">-</span>
		}

		// Raggruppa per data
		const spesePerData: Record<string, Array<{ publicId: string; data: string; importo: number; descrizione: string }>> = {}
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
										<span onClick={() => apriSpesaPerPublicId(speseData[0].publicId)} className="cursor-pointer hover:underline">+{formattaImporto(speseData[0].importo)}</span>
									) : (
										speseData.map((spesa, i) => (
											<div key={i} onClick={() => apriSpesaPerPublicId(spesa.publicId)} className="text-sm cursor-pointer hover:underline">
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

	// --- Handlers CRUD ---
	const apriNuovaSpesa = () => {
		setSpesaSelezionata(null)
		setModaleAperta(true)
	}

	const apriModificaSpesa = (spesa: Spesa) => {
		setSpesaSelezionata(spesa)
		setModaleAperta(true)
	}

	// Apre la modale di dettaglio/modifica a partire dal publicId (click sugli importi in tabella)
	const apriSpesaPerPublicId = (publicId: string) => {
		const spesa = speseRaw.find((s) => s.publicId === publicId)
		if (spesa) {
			setSpesaSelezionata(spesa)
			setModaleAperta(true)
		}
	}

	const eliminaSpesa = async (spesa: Spesa) => {
		if (!window.confirm(`Eliminare la spesa del ${isoToDisplay(spesa.data)} (${formattaImporto(spesa.importo)})?`)) {
			return
		}
		try {
			await deleteSpesa(spesa.publicId)
			caricaSpese()
		} catch (err) {
			console.error("Errore eliminazione spesa:", err)
			window.alert("Impossibile eliminare la spesa.")
		}
	}

	return (
		<div className="min-h-screen bg-gray-50">
			<Navbar />

			{/* Header */}
			<section className="bg-white border-b border-gray-200 py-8 md:py-12">
				<div className="container px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4">
					<div>
						<h1 className="text-2xl md:text-4xl font-semibold text-gray-900">Gestione spese</h1>
						<p className="mt-2 text-base md:text-lg text-gray-600">Riepilogo completo delle spese e dei pagamenti.</p>
					</div>
					<button onClick={apriNuovaSpesa} className="btn btn-primary btn-small">
						+ Aggiungi spesa
					</button>
				</div>
			</section>

			{loading ? (
				<div className="container px-4 py-16 text-center text-gray-500">Caricamento spese…</div>
			) : erroreCaricamento ? (
				<div className="container px-4 py-16 text-center">
					<p className="text-red-600 mb-4">{erroreCaricamento}</p>
					<button onClick={caricaSpese} className="btn btn-secondary btn-small">
						Riprova
					</button>
				</div>
			) : (
				<>
					{/* Tabella Spese */}
					<section className="py-8 md:py-12">
						<div className="container px-2 sm:px-6 lg:px-8">
							{/* Selettore Anno */}
							<div className="mb-4 flex flex-wrap items-center gap-3">
								<label className="text-sm font-medium text-gray-700">Filtra per anno:</label>
								<div className="flex flex-wrap gap-2">
									<button
										onClick={() => setAnnoSelezionato(null)}
										className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
											annoSelezionato === null ? "bg-primary text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200 cursor-pointer"
										}`}
									>
										Tutti
									</button>
									{anniDisponibili.map((anno) => (
										<button
											key={anno}
											onClick={() => setAnnoSelezionato(anno)}
											className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
												annoSelezionato === anno
													? "bg-primary text-white"
													: "bg-gray-100 text-gray-700 hover:bg-gray-200 cursor-pointer"
											}`}
										>
											{anno}
										</button>
									))}
								</div>
							</div>

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
											{spesePerMeseFiltrate.map((meseData, index) => (
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
																			<div onClick={() => apriSpesaPerPublicId(rimborso.publicId)} className="font-medium text-green-600 cursor-pointer hover:underline">
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
										{spesePerMeseFiltrate.map((meseData, index) => (
											<div key={index} className="p-4">
												<h3 className="text-base font-semibold text-gray-900 mb-3">{meseData.mese}</h3>
												<div className="space-y-3">
													{(
														[
															["affitto", "Affitto", "bg-blue-100 text-blue-800"],
															["condominio", "Condominio", "bg-purple-100 text-purple-800"],
															["energia", "Energia", "bg-yellow-100 text-yellow-800"],
															["gas", "Gas", "bg-orange-100 text-orange-800"],
															["aqp", "Aqp", "bg-cyan-100 text-cyan-800"],
															["tari", "Tari", "bg-teal-100 text-teal-800"],
															["assicurazione", "Ass.", "bg-indigo-100 text-indigo-800"],
															["varie", "Varie", "bg-pink-100 text-pink-800"],
														] as const
													).map(([chiave, etichetta, badge]) => {
														const voci = meseData[chiave]
														if (!voci.length) return null
														return (
															<div key={chiave} className="space-y-2">
																{voci.map((spesa, idx) => (
																	<div key={idx} className="flex justify-between items-start">
																		<div className="flex-1">
																			<div className="flex items-center gap-2 mb-1">
																				<span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${badge}`}>
																					{etichetta}
																				</span>
																				<span className="text-xs text-gray-500">{spesa.data}</span>
																			</div>
																			{spesa.descrizione && <p className="text-xs text-gray-600">{spesa.descrizione}</p>}
																		</div>
																		<p onClick={() => apriSpesaPerPublicId(spesa.publicId)} className="text-sm font-semibold text-red-600 ml-2 cursor-pointer hover:underline">
																			+{formattaImporto(spesa.importo)}
																		</p>
																	</div>
																))}
															</div>
														)
													})}
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
																	<p onClick={() => apriSpesaPerPublicId(rimborso.publicId)} className="text-sm font-semibold text-green-600 ml-2 cursor-pointer hover:underline">
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
									<div className="text-right">
										<div className="text-sm text-gray-500 mb-1">Media mensile</div>
										<div className={`text-xl font-semibold ${statisticheMensili.media >= 0 ? "text-red-600" : "text-green-600"}`}>
											{statisticheMensili.media >= 0 ? "+" : ""}
											{formattaImporto(Math.abs(statisticheMensili.media))}
										</div>
										{statisticheMensili.trend && (
											<div
												className={`text-xs mt-1 flex items-center gap-1 justify-end ${
													statisticheMensili.trend.direzione === "up"
														? "text-red-600"
														: statisticheMensili.trend.direzione === "down"
														? "text-green-600"
														: "text-gray-500"
												}`}
											>
												<span>
													{statisticheMensili.trend.direzione === "up" ? "▲ " : statisticheMensili.trend.direzione === "down" ? "▼ " : "= "}
													{statisticheMensili.trend.direzione === "up" ? "+" : ""}
													{formattaImporto(Math.abs(statisticheMensili.trend.valore))} (
													{statisticheMensili.trend.percentuale.toFixed(1)}%)
												</span>
											</div>
										)}
									</div>
								</div>

								{/* Grafico ad area */}
								<div className="mt-6">
									<div id="area-chart" className="h-64">
										<Chart options={chartOptions} series={chartOptions.series} type="area" height="100%" />
									</div>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-2 items-center border-t border-gray-200 justify-between mt-4 pt-4 gap-4">
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
									<div className="flex items-center gap-6 text-xs text-gray-600">
										<div className="flex flex-col">
											<span className="text-gray-500 mb-1">Minimo</span>
											<span className={`font-semibold ${statisticheMensili.minimo >= 0 ? "text-red-600" : "text-green-600"}`}>
												{statisticheMensili.minimo >= 0 ? "+" : ""}
												{formattaImporto(Math.abs(statisticheMensili.minimo))}
											</span>
										</div>
										<div className="flex flex-col">
											<span className="text-gray-500 mb-1">Massimo</span>
											<span className={`font-semibold ${statisticheMensili.massimo >= 0 ? "text-red-600" : "text-green-600"}`}>
												{statisticheMensili.massimo >= 0 ? "+" : ""}
												{formattaImporto(Math.abs(statisticheMensili.massimo))}
											</span>
										</div>
										<div className="flex flex-col">
											<span className="text-gray-500 mb-1">Variazione</span>
											<span className="font-semibold text-gray-700">
												{formattaImporto(Math.abs(statisticheMensili.massimo - statisticheMensili.minimo))}
											</span>
										</div>
									</div>
								</div>
							</div>
						</div>
					</section>

					{/* Elenco spese (gestione: modifica, elimina, allegati) */}
					<section className="pb-12">
						<div className="container px-2 sm:px-6 lg:px-8">
							<h2 className="text-lg font-semibold text-gray-900 mb-4 px-2">Tutte le spese</h2>
							<div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
								<table className="w-full text-sm">
									<thead>
										<tr className="bg-gray-100 text-gray-700">
											<th className="px-4 py-3 text-left font-semibold">Data</th>
											<th className="px-4 py-3 text-left font-semibold">Categoria</th>
											<th className="px-4 py-3 text-left font-semibold">Tipo</th>
											<th className="px-4 py-3 text-right font-semibold">Importo</th>
											<th className="px-4 py-3 text-left font-semibold">Descrizione</th>
											<th className="px-4 py-3 text-center font-semibold">Allegati</th>
											<th className="px-4 py-3 text-right font-semibold">Azioni</th>
										</tr>
									</thead>
									<tbody>
										{speseOrdinate.length === 0 && (
											<tr>
												<td colSpan={7} className="px-4 py-8 text-center text-gray-400">
													Nessuna spesa registrata.
												</td>
											</tr>
										)}
										{speseOrdinate.map((s) => (
											<tr key={s.publicId} className="border-b border-gray-100">
												<td className="px-4 py-3 whitespace-nowrap text-gray-900">{isoToDisplay(s.data)}</td>
												<td className="px-4 py-3">{ETICHETTE_CATEGORIA[s.categoria]}</td>
												<td className="px-4 py-3">
													<span
														className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
															s.tipo === "proprietario" ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
														}`}
													>
														{s.tipo === "proprietario" ? "Spesa" : "Rimborso"}
													</span>
												</td>
												<td
													className={`px-4 py-3 text-right whitespace-nowrap font-medium ${
														s.tipo === "proprietario" ? "text-red-600" : "text-green-600"
													}`}
												>
													{formattaImporto(s.importo)}
												</td>
												<td className="px-4 py-3 text-gray-600 max-w-xs truncate" title={s.descrizione}>
													{s.descrizione || "—"}
												</td>
												<td className="px-4 py-3 text-center text-xs text-gray-500 whitespace-nowrap">
													<span title="Ricevuta di pagamento">R {s.ricevutaUrl ? "✓" : "—"}</span>
													<span className="mx-1">/</span>
													<span title="Cedolino">C {s.cedolinoUrl ? "✓" : "—"}</span>
												</td>
												<td className="px-4 py-3 text-right whitespace-nowrap">
													<button
														onClick={() => apriModificaSpesa(s)}
														className="text-primary hover:opacity-80 font-medium cursor-pointer"
													>
														Modifica
													</button>
													<button
														onClick={() => eliminaSpesa(s)}
														className="ml-3 text-red-600 hover:text-red-700 font-medium cursor-pointer"
													>
														Elimina
													</button>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</div>
					</section>
				</>
			)}

			{modaleAperta && (
				<SpesaFormModal spesa={spesaSelezionata} onClose={() => setModaleAperta(false)} onSaved={caricaSpese} />
			)}
		</div>
	)
}

export default Home
