import axios from "axios"
import { Spesa, SpesaPayload, TipoAllegato } from "../types/spesa"

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || ""
const PW_KEY = "rent_pw"

// --- Gestione password condivisa (in localStorage) ---
export const getPassword = (): string => localStorage.getItem(PW_KEY) || ""
export const setPassword = (pw: string): void => localStorage.setItem(PW_KEY, pw)
export const clearPassword = (): void => localStorage.removeItem(PW_KEY)

// --- Istanza axios verso il backend ---
const api = axios.create({ baseURL: BACKEND_URL })

api.interceptors.request.use((config) => {
	const pw = getPassword()
	if (pw) {
		config.headers.Authorization = `Bearer ${pw}`
	}
	return config
})

api.interceptors.response.use(
	(response) => response,
	(error) => {
		if (error.response?.status === 401) {
			clearPassword()
			if (!window.location.pathname.endsWith("/login")) {
				window.location.href = "/login"
			}
		}
		return Promise.reject(error)
	}
)

// --- Auth ---
// Verifica la password corrente contro il backend (usata al login).
export const verificaAccesso = async (): Promise<void> => {
	await api.get("/spese")
}

// --- CRUD spese ---
export const getSpese = async (): Promise<Spesa[]> => {
	const { data } = await api.get<Spesa[]>("/spese")
	return data
}

export const createSpesa = async (payload: SpesaPayload): Promise<Spesa> => {
	const { data } = await api.post<Spesa>("/spese", payload)
	return data
}

export const updateSpesa = async (publicId: string, payload: SpesaPayload): Promise<Spesa> => {
	const { data } = await api.put<Spesa>(`/spese/${publicId}`, payload)
	return data
}

export const deleteSpesa = async (publicId: string): Promise<void> => {
	await api.delete(`/spese/${publicId}`)
}

// --- Allegati PDF (presigned URL) ---
export const getUploadUrl = async (
	publicId: string,
	tipo: TipoAllegato,
	filename: string
): Promise<{ uploadUrl: string; key: string }> => {
	const { data } = await api.post(`/spese/${publicId}/allegati/${tipo}/upload-url`, {
		filename,
		contentType: "application/pdf",
	})
	return data
}

// Upload diretto browser -> S3 (nessun header Authorization: URL già firmato)
export const uploadFileToS3 = async (uploadUrl: string, file: File): Promise<void> => {
	await axios.put(uploadUrl, file, {
		headers: { "Content-Type": file.type || "application/pdf" },
	})
}

export const getDownloadUrl = async (publicId: string, tipo: TipoAllegato): Promise<string> => {
	const { data } = await api.get(`/spese/${publicId}/allegati/${tipo}/download-url`)
	return data.downloadUrl
}

export const deleteAllegato = async (publicId: string, tipo: TipoAllegato): Promise<void> => {
	await api.delete(`/spese/${publicId}/allegati/${tipo}`)
}

export default api
