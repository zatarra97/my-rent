export type TipoSpesa = "proprietario" | "affittuario"

export type CategoriaSpesa =
	| "affitto"
	| "condominio"
	| "energia"
	| "gas"
	| "aqp"
	| "tari"
	| "assicurazione"
	| "varie"

export type TipoAllegato = "ricevuta" | "cedolino"

export interface Spesa {
	publicId: string
	data: string // ISO YYYY-MM-DD (dal backend)
	importo: number
	descrizione: string
	tipo: TipoSpesa
	categoria: CategoriaSpesa
	ricevutaUrl: string | null
	cedolinoUrl: string | null
}

// Payload per creazione/modifica (senza allegati, gestiti a parte)
export interface SpesaPayload {
	data: string // ISO YYYY-MM-DD
	importo: number
	descrizione: string
	tipo: TipoSpesa
	categoria: CategoriaSpesa
}

export const TIPI: TipoSpesa[] = ["proprietario", "affittuario"]

export const CATEGORIE: CategoriaSpesa[] = [
	"affitto",
	"condominio",
	"energia",
	"gas",
	"aqp",
	"tari",
	"assicurazione",
	"varie",
]

export const ETICHETTE_CATEGORIA: Record<CategoriaSpesa, string> = {
	affitto: "Affitto",
	condominio: "Condominio",
	energia: "Energia",
	gas: "Gas",
	aqp: "Aqp",
	tari: "Tari",
	assicurazione: "Assicurazione",
	varie: "Varie",
}
