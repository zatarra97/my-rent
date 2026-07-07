import React from "react"

type Tipo = "ricevuta" | "cedolino"

// Ricevuta di pagamento -> verde; Cedolino -> blu
const CONFIG: Record<Tipo, { colore: string; titolo: string }> = {
	ricevuta: { colore: "text-green-600", titolo: "Ricevuta di pagamento allegata" },
	cedolino: { colore: "text-blue-600", titolo: "Cedolino allegato" },
}

// Piccola icona "documento PDF" mostrata accanto a un importo quando la spesa
// ha l'allegato corrispondente.
const IconaAllegato: React.FC<{ url: string | null; tipo: Tipo }> = ({ url, tipo }) => {
	if (!url) return null
	const { colore, titolo } = CONFIG[tipo]
	return (
		<span title={titolo} aria-label={titolo} className={`inline-flex items-center align-middle ml-1 ${colore}`}>
			<svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
				<path d="M6 2a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6H6zm7 1.5L18.5 9H13V3.5z" />
			</svg>
		</span>
	)
}

export default IconaAllegato
