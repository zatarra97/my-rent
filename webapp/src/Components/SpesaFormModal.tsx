import React, { useState } from "react"
import {
	Spesa,
	SpesaPayload,
	TipoSpesa,
	CategoriaSpesa,
	TIPI,
	CATEGORIE,
	ETICHETTE_CATEGORIA,
} from "../types/spesa"
import {
	createSpesa,
	updateSpesa,
	getUploadUrl,
	uploadFileToS3,
	getDownloadUrl,
	deleteAllegato,
} from "../services/api"
import FileUploadInput from "./FileUploadInput"

interface SpesaFormModalProps {
	spesa: Spesa | null // null = nuova spesa
	onClose: () => void
	onSaved: () => void
}

const oggiIso = (): string => new Date().toISOString().slice(0, 10)

const ETICHETTE_TIPO: Record<TipoSpesa, string> = {
	proprietario: "Spesa (proprietario)",
	affittuario: "Rimborso (affittuario)",
}

const SpesaFormModal: React.FC<SpesaFormModalProps> = ({ spesa, onClose, onSaved }) => {
	const isModifica = !!spesa

	const [data, setData] = useState<string>(spesa?.data || oggiIso())
	const [importo, setImporto] = useState<string>(spesa ? String(spesa.importo) : "")
	const [descrizione, setDescrizione] = useState<string>(spesa?.descrizione || "")
	const [tipo, setTipo] = useState<TipoSpesa>(spesa?.tipo || "proprietario")
	const [categoria, setCategoria] = useState<CategoriaSpesa>(spesa?.categoria || "affitto")

	const [ricevutaKey, setRicevutaKey] = useState<string | null>(spesa?.ricevutaUrl ?? null)
	const [cedolinoKey, setCedolinoKey] = useState<string | null>(spesa?.cedolinoUrl ?? null)

	const [saving, setSaving] = useState(false)
	const [errore, setErrore] = useState<string | null>(null)

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setErrore(null)

		const importoNum = Number(importo.replace(",", "."))
		if (!data) {
			setErrore("La data è obbligatoria.")
			return
		}
		if (!Number.isFinite(importoNum) || importoNum <= 0) {
			setErrore("L'importo deve essere un numero maggiore di zero.")
			return
		}

		const payload: SpesaPayload = { data, importo: importoNum, descrizione, tipo, categoria }

		try {
			setSaving(true)
			if (isModifica) {
				await updateSpesa(spesa!.publicId, payload)
			} else {
				await createSpesa(payload)
			}
			onSaved()
			onClose()
		} catch (err: any) {
			setErrore(err?.response?.data?.error?.message || "Errore nel salvataggio della spesa.")
		} finally {
			setSaving(false)
		}
	}

	// --- Allegati (solo in modifica: la spesa deve già esistere) ---
	const uploadAllegato = (tipoAllegato: "ricevuta" | "cedolino", setKey: (k: string | null) => void) => async (
		file: File
	) => {
		const { uploadUrl, key } = await getUploadUrl(spesa!.publicId, tipoAllegato, file.name)
		await uploadFileToS3(uploadUrl, file)
		setKey(key)
		onSaved()
	}

	const downloadAllegato = (tipoAllegato: "ricevuta" | "cedolino") => async () => {
		const url = await getDownloadUrl(spesa!.publicId, tipoAllegato)
		window.open(url, "_blank", "noopener,noreferrer")
	}

	const removeAllegato = (tipoAllegato: "ricevuta" | "cedolino", setKey: (k: string | null) => void) => async () => {
		await deleteAllegato(spesa!.publicId, tipoAllegato)
		setKey(null)
		onSaved()
	}

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
			<div
				className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
				onClick={(e) => e.stopPropagation()}
			>
				<div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
					<h2 className="text-lg font-semibold text-gray-900">
						{isModifica ? "Modifica spesa" : "Nuova spesa"}
					</h2>
					<button
						onClick={onClose}
						className="text-gray-400 hover:text-gray-600 text-xl leading-none cursor-pointer"
						aria-label="Chiudi"
					>
						×
					</button>
				</div>

				<form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
							<input
								type="date"
								value={data}
								onChange={(e) => setData(e.target.value)}
								className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary"
								required
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">Importo (€)</label>
							<input
								type="number"
								step="0.01"
								min="0"
								value={importo}
								onChange={(e) => setImporto(e.target.value)}
								className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary"
								placeholder="0.00"
								required
							/>
						</div>
					</div>

					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
							<select
								value={tipo}
								onChange={(e) => setTipo(e.target.value as TipoSpesa)}
								className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary bg-white"
							>
								{TIPI.map((t) => (
									<option key={t} value={t}>
										{ETICHETTE_TIPO[t]}
									</option>
								))}
							</select>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
							<select
								value={categoria}
								onChange={(e) => setCategoria(e.target.value as CategoriaSpesa)}
								className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary bg-white"
							>
								{CATEGORIE.map((c) => (
									<option key={c} value={c}>
										{ETICHETTE_CATEGORIA[c]}
									</option>
								))}
							</select>
						</div>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">Descrizione</label>
						<textarea
							value={descrizione}
							onChange={(e) => setDescrizione(e.target.value)}
							rows={2}
							className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary"
							placeholder="Opzionale"
						/>
					</div>

					{/* Allegati PDF: solo su spese già salvate */}
					{isModifica ? (
						<div className="space-y-3 pt-2 border-t border-gray-200">
							<FileUploadInput
								label="Ricevuta di pagamento (PDF)"
								value={ricevutaKey}
								onUpload={uploadAllegato("ricevuta", setRicevutaKey)}
								onDownload={downloadAllegato("ricevuta")}
								onRemove={removeAllegato("ricevuta", setRicevutaKey)}
							/>
							<FileUploadInput
								label="Cedolino (PDF)"
								value={cedolinoKey}
								onUpload={uploadAllegato("cedolino", setCedolinoKey)}
								onDownload={downloadAllegato("cedolino")}
								onRemove={removeAllegato("cedolino", setCedolinoKey)}
							/>
						</div>
					) : (
						<p className="text-xs text-gray-500 pt-2 border-t border-gray-200">
							Salva la spesa per poter allegare la ricevuta di pagamento e il cedolino (PDF).
						</p>
					)}

					{errore && (
						<div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
							{errore}
						</div>
					)}

					<div className="flex justify-end gap-3 pt-2">
						<button
							type="button"
							onClick={onClose}
							className="btn btn-secondary btn-small"
							disabled={saving}
						>
							Annulla
						</button>
						<button type="submit" className="btn btn-primary btn-small" disabled={saving}>
							{saving ? "Salvataggio…" : isModifica ? "Salva modifiche" : "Crea spesa"}
						</button>
					</div>
				</form>
			</div>
		</div>
	)
}

export default SpesaFormModal
