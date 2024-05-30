import { HttpClient } from '../helpers'

const accessTokenKey = 'access_token'

const getAuthHeaders = (isMultipart: boolean = false) => {
	const token: string | null = localStorage.getItem(accessTokenKey)
	let headers: { [key: string]: string } = {}

	if (token) {
		headers['Authorization'] = `Bearer ${token}`
	}
	if (isMultipart) {
		headers['Content-Type'] = 'multipart/form-data'
	}
	return headers
}

function LeadService() {
	return {
		create: async (values: any) => {
			return await HttpClient.post('/lead/', values, {
				headers: getAuthHeaders(),
			})
		},
		uploadBulkLeads: async (values: any) => {
			return await HttpClient.post('/lead/importLeads', values, {
				headers: getAuthHeaders(true),
			})
		},
		get: async () => {
			return await HttpClient.get('/lead/', {
				headers: getAuthHeaders(),
			})
		},
		getLeadById: async (leadId: string) => {
			return await HttpClient.get(`/lead/${leadId}`, {
				headers: getAuthHeaders(),
			})
		},
		update: async (values: any, leadId?: string) => {
			const data = await HttpClient.patch(`/lead/${leadId}`, values, {
				headers: getAuthHeaders(),
			})
			return data
		},
		getUploadedDocuments: async (leadId?: string) => {
			return await HttpClient.get(`/lead/getDocument/${leadId}`, {
				headers: getAuthHeaders(),
			})
		},
		getSingleDocument: async (leadId?: string, filename?: string) => {
			return await HttpClient.get(`/lead/getSingleDocument/${leadId}/${filename}`, {
				responseType: 'blob',
				headers: getAuthHeaders()
			})
		},
		deleteSingleDocument: async (leadId?: string, filename?: string) => {
			return await HttpClient.delete(`/lead/getSingleDocument/${leadId}/${filename}`, {
				headers: getAuthHeaders()
			})
		},
		deleteDocuments: async (leadId?: string) => {
			return await HttpClient.delete(`/lead/getDocument/${leadId}`, {
				headers: getAuthHeaders(),
			})
		},
		uploadChecklist: async (values: any, leadId?: string) => {
			const data = await HttpClient.post(`/lead/documentChecklist/${leadId}`, values, {
				headers: getAuthHeaders(true),
			})
			return data
		},
		getUploadChecklistbyId: async (leadId?: string) => {
			const data = await HttpClient.get(`/lead/documentChecklist/${leadId}`, {
				responseType: 'blob',
				headers: getAuthHeaders(),
			})
			return data
		},
		delete: async (leadId: string) => {
			return await HttpClient.delete(`/lead/${leadId}`, {
				headers: getAuthHeaders(),
			})
		},
	}
}

export default LeadService()
