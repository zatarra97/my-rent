import React from "react"

// Piccola icona "documento PDF" mostrata accanto a un importo quando la spesa
// ha una ricevuta di pagamento allegata.
const IconaRicevuta: React.FC<{ url: string | null }> = ({ url }) => {
	if (!url) return null
	return (
		<span
			title="Ricevuta di pagamento allegata"
			aria-label="Ricevuta di pagamento allegata"
			className="inline-flex items-center align-middle ml-1 text-red-500"
		>
			<svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
				<path d="M6 2a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6H6zm7 1.5L18.5 9H13V3.5z" />
			</svg>
		</span>
	)
}

export default IconaRicevuta
