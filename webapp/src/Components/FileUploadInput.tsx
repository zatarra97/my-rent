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
	if (!key) return "Nessun file caricato"
	return key.split("/").pop() || key
}

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
	const [localError, setLocalError] = useState<string | null>(null)

	const busy = disabled || isUploading || isDownloading

	const handleFileChange = async (file: File | null) => {
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

	const handleDownload = async () => {
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

	const handleRemove = async () => {
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

	return (
		<div>
			<label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
			<div
				className={`flex items-center gap-3 border rounded-lg px-3 py-2 bg-white ${
					localError ? "border-red-400" : "border-gray-300"
				}`}
			>
				<span className="flex-1 min-w-0 text-sm text-gray-700 truncate">{getFileLabel(value)}</span>
				<div className="flex items-center gap-2 shrink-0">
					{value && (
						<button
							type="button"
							onClick={handleDownload}
							disabled={busy}
							className="text-xs font-medium text-emerald-600 hover:text-emerald-700 disabled:text-gray-400 cursor-pointer disabled:cursor-not-allowed"
						>
							{isDownloading ? "…" : "Scarica"}
						</button>
					)}
					{value && (
						<button
							type="button"
							onClick={handleRemove}
							disabled={busy}
							className="text-xs font-medium text-red-600 hover:text-red-700 disabled:text-gray-400 cursor-pointer disabled:cursor-not-allowed"
						>
							Rimuovi
						</button>
					)}
					<button
						type="button"
						onClick={() => !busy && fileInputRef.current?.click()}
						disabled={busy}
						className="text-xs font-medium text-primary hover:opacity-80 disabled:text-gray-400 cursor-pointer disabled:cursor-not-allowed"
					>
						{isUploading ? "Caricamento…" : value ? "Sostituisci" : "Carica PDF"}
					</button>
				</div>
				<input
					ref={fileInputRef}
					type="file"
					accept="application/pdf,.pdf"
					onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
					disabled={busy}
					className="hidden"
				/>
			</div>
			{localError && <p className="text-red-500 text-xs mt-1">{localError}</p>}
		</div>
	)
}

export default FileUploadInput
