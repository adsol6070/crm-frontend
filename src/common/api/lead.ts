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
		createLead: async (values: any) => {
			return await HttpClient.post('/lead/createLead', values)
		},
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
		getSpecificLead: async (userId: string) => {
			return await HttpClient.get(`/lead/getSpecificLeads/${userId}`, {
				headers: getAuthHeaders(),
			})
		},
		deleteAllLeads: async () => {
			return await HttpClient.delete('/lead/', {
				headers: getAuthHeaders(),
			})
		},
		deleteSelectedLeads: async (values: any) => {
			return await HttpClient.post('/lead/deleteSelected', values, {
				headers: getAuthHeaders(),
			})
		},
		updateSelectedLeads: async (values: any) => {
			return await HttpClient.patch('/lead/updateSelected', values, {
				headers: getAuthHeaders(),
			})
		},
		getLeadById: async (leadId: string) => {
			return await HttpClient.get(`/lead/${leadId}`, {
				headers: getAuthHeaders(),
			})
		},
		getLeadDocumentStatus: async () => {
			return await HttpClient.get(`/lead/getDocumentStatus`, {
				headers: getAuthHeaders(),
			})
		},
		update: async (values: any, leadId?: string) => {
			const data = await HttpClient.patch(`/lead/${leadId}`, values, {
				headers: getAuthHeaders(),
			})
			return data
		},
		downloadLeadCsv: async (category: string) => {
			return await HttpClient.get(`/lead/downloadFullCsv/${category}`, {
				responseType: 'blob',
				headers: getAuthHeaders(),
			})
		},
		updateLeadStatusById: async (leadId: string, values: any) => {
			return await HttpClient.patch(`/lead/leadStatus/${leadId}`, values, {
				headers: getAuthHeaders(),
			})
		},
		getUploadedDocuments: async (leadId?: string) => {
			return await HttpClient.get(`/lead/getDocument/${leadId}`, {
				headers: getAuthHeaders(),
			})
		},
		getSingleDocument: async (leadId?: string, filename?: string) => {
			return await HttpClient.get(
				`/lead/getSingleDocument/${leadId}/${filename}`,
				{
					responseType: 'blob',
					headers: getAuthHeaders(),
				}
			)
		},
		updateSingleDocument: async (
			values?: any,
			leadId?: string,
			filename?: string
		) => {
			const data = await HttpClient.patch(
				`/lead/getSingleDocument/${leadId}/${filename}`,
				values,
				{
					headers: getAuthHeaders(true),
				}
			)
			return data
		},
		deleteSingleDocument: async (leadId?: string, filename?: string) => {
			return await HttpClient.delete(
				`/lead/getSingleDocument/${leadId}/${filename}`,
				{
					headers: getAuthHeaders(),
				}
			)
		},
		deleteDocuments: async (leadId?: string) => {
			return await HttpClient.delete(`/lead/getDocument/${leadId}`, {
				headers: getAuthHeaders(),
			})
		},
		uploadChecklist: async (values: any, leadId?: string) => {
			const data = await HttpClient.post(
				`/lead/documentChecklist/${leadId}`,
				values,
				{
					headers: getAuthHeaders(true),
				}
			)
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
		assignLead: async (values: { lead_id: string; user_id: string[] }) => {
			return await HttpClient.post('/lead/leadAssignee', values, {
				headers: getAuthHeaders(),
			})
		},
		getAssigneeById: async (leadId: string) => {
			return await HttpClient.get(`/lead/leadAssignee/${leadId}`, {
				headers: getAuthHeaders(),
			})
		},
		getLeadHistory: async (leadId: string) => {
			return await HttpClient.get(`/lead/leadHistory/${leadId}`, {
				headers: getAuthHeaders(),
			})
		},
		createLeadNote: (leadId: string, leadNoteData: any) => {
			return HttpClient.post(`/lead/leadNotes/${leadId}`, leadNoteData, {
				headers: getAuthHeaders(),
			})
		},
		getLeadNotes: (leadId: string) => {
			return HttpClient.get(`/lead/leadNotes/${leadId}`, {
				headers: getAuthHeaders(),
			})
		},
		updateLeadNote: (noteId: any, values: any) => {
			return HttpClient.patch(`/lead/leadNote/${noteId}`, values, {
				headers: getAuthHeaders(),
			})
		},
		deleteLeadNoteById: (noteId: string) => {
			return HttpClient.delete(`/lead/leadNote/${noteId}`, {
				headers: getAuthHeaders(),
			})
		},
		deleteLeadNotes: (leadId: string) => {
			return HttpClient.delete(`/lead/leadNotes/${leadId}`, {
				headers: getAuthHeaders(),
			})
		},
	}
}

export default LeadService()
