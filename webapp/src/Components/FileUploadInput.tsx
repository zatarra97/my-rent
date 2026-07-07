import React, { useRef, useState } from "react"

interface FileUploadInputProps {
	label: string
	value: string | null // key S3 (o null se assente)
	onUpload: (file: File) => Promise<void>
	onDownload: () => Promise<void>
	onRemove: () => Promise<void>
	disabled?: boolean
	maxSizeMb?: number
}

const getFileLabel = (key: string | null): string => {
	if (!key) return ""
	return key.split("/").pop() || key
}

// --- Icone (SVG inline, nessuna dipendenza esterna) ---
const IconDownload = () => (
	<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
		<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
	</svg>
)
const IconTrash = () => (
	<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
		<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 7h12M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2m-1 0v12a1 1 0 01-1 1H10a1 1 0 01-1-1V7m3 4v6m4-6v6" />
	</svg>
)
const IconUpload = () => (
	<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
		<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 9l5-5 5 5M12 4v12" />
	</svg>
)
const IconSpinner = () => (
	<svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
		<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
		<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
	</svg>
)

const FileUploadInput: React.FC<FileUploadInputProps> = ({
	label,
	value,
	onUpload,
	onDownload,
	onRemove,
	disabled,
	maxSizeMb = 10,
}) => {
	const fileInputRef = useRef<HTMLInputElement>(null)
	const [isUploading, setIsUploading] = useState(false)
	const [isDownloading, setIsDownloading] = useState(false)
	const [isDragging, setIsDragging] = useState(false)
	const [localError, setLocalError] = useState<string | null>(null)

	const busy = disabled || isUploading || isDownloading

	const processFile = async (file: File | null) => {
		if (!file) return
		setLocalError(null)

		const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")
		if (!isPdf) {
			setLocalError("Sono ammessi solo file PDF.")
			return
		}
		if (file.size > maxSizeMb * 1024 * 1024) {
			setLocalError(`File troppo grande. Dimensione massima: ${maxSizeMb}MB.`)
			return
		}

		try {
			setIsUploading(true)
			await onUpload(file)
		} catch (err: any) {
			console.error("Errore upload:", err)
			setLocalError(err?.response?.data?.error?.message || "Errore nel caricamento del file.")
		} finally {
			setIsUploading(false)
			if (fileInputRef.current) fileInputRef.current.value = ""
		}
	}

	const openPicker = () => {
		if (!busy) fileInputRef.current?.click()
	}

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault()
		setIsDragging(false)
		if (busy) return
		processFile(e.dataTransfer.files?.[0] || null)
	}

	const handleDownload = async (e: React.MouseEvent) => {
		e.stopPropagation()
		if (busy) return
		try {
			setIsDownloading(true)
			await onDownload()
		} catch (err: any) {
			console.error("Errore download:", err)
			setLocalError(err?.response?.data?.error?.message || "Errore nel download del file.")
		} finally {
			setIsDownloading(false)
		}
	}

	const handleRemove = async (e: React.MouseEvent) => {
		e.stopPropagation()
		if (busy) return
		setLocalError(null)
		try {
			setIsUploading(true)
			await onRemove()
		} catch (err: any) {
			console.error("Errore rimozione:", err)
			setLocalError(err?.response?.data?.error?.message || "Errore nella rimozione del file.")
		} finally {
			setIsUploading(false)
		}
	}

	const handleReplace = (e: React.MouseEvent) => {
		e.stopPropagation()
		openPicker()
	}

	return (
		<div>
			<label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
			<div
				onClick={value ? undefined : openPicker}
				onDragOver={(e) => {
					e.preventDefault()
					if (!busy) setIsDragging(true)
				}}
				onDragLeave={(e) => {
					e.preventDefault()
					setIsDragging(false)
				}}
				onDrop={handleDrop}
				className={`flex items-center gap-3 rounded-lg px-3 py-3 border-2 border-dashed transition-colors ${
					isDragging
						? "border-primary bg-primary/5"
						: localError
						? "border-red-400"
						: "border-gray-300"
				} ${value ? "" : "cursor-pointer hover:border-gray-400"} ${busy ? "opacity-70" : ""}`}
			>
				{value ? (
					<>
						<span className="flex-1 min-w-0 text-sm text-gray-700 truncate" title={getFileLabel(value)}>
							{getFileLabel(value)}
						</span>
						<div className="flex items-center gap-1 shrink-0">
							<button
								type="button"
								onClick={handleDownload}
								disabled={busy}
								title="Scarica"
								aria-label="Scarica"
								className="p-1.5 rounded text-emerald-600 hover:bg-emerald-50 disabled:text-gray-300 cursor-pointer disabled:cursor-not-allowed"
							>
								{isDownloading ? <IconSpinner /> : <IconDownload />}
							</button>
							<button
								type="button"
								onClick={handleReplace}
								disabled={busy}
								title="Sostituisci"
								aria-label="Sostituisci"
								className="p-1.5 rounded text-primary hover:bg-gray-100 disabled:text-gray-300 cursor-pointer disabled:cursor-not-allowed"
							>
								{isUploading ? <IconSpinner /> : <IconUpload />}
							</button>
							<button
								type="button"
								onClick={handleRemove}
								disabled={busy}
								title="Rimuovi"
								aria-label="Rimuovi"
								className="p-1.5 rounded text-red-600 hover:bg-red-50 disabled:text-gray-300 cursor-pointer disabled:cursor-not-allowed"
							>
								<IconTrash />
							</button>
						</div>
					</>
				) : (
					<div className="flex items-center gap-2 text-sm text-gray-500 w-full justify-center py-1">
						{isUploading ? (
							<>
								<IconSpinner /> Caricamento…
							</>
						) : (
							<>
								<IconUpload />
								<span>
									Trascina qui il PDF, oppure <span className="text-primary font-medium">clicca per selezionare</span>
								</span>
							</>
						)}
					</div>
				)}
				<input
					ref={fileInputRef}
					type="file"
					accept="application/pdf,.pdf"
					onChange={(e) => processFile(e.target.files?.[0] || null)}
					disabled={busy}
					className="hidden"
				/>
			</div>
			{localError && <p className="text-red-500 text-xs mt-1">{localError}</p>}
		</div>
	)
}

export default FileUploadInput
