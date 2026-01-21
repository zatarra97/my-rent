export interface Spesa {
	data: string
	importo: number
	descrizione: string
	tipo: "proprietario" | "affittuario"
	categoria: "affitto" | "condominio" | "energia" | "gas" | "aqp" | "tari" | "assicurazione" | "varie"
}




