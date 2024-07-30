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

function ChecklistsService() {
	return {
		createChecklist: (checklist: any) => {
			return HttpClient.post('/checklists/', checklist, { headers: getAuthHeaders() })
		},
		getChecklist: () => {
			return HttpClient.get('/checklists/', { headers: getAuthHeaders() })
		},
		getChecklistByVisaType: (visaType: string) => {
			return HttpClient.get(`/checklists/${visaType}`, { headers: getAuthHeaders() })
		},
		updateChecklist: (checklistId: string, updatedChecklist: any) => {
			return HttpClient.patch(`/checklists/${checklistId}`, updatedChecklist, { headers: getAuthHeaders() })
		},
		deleteChecklist: (checklistId: string) => {
			return HttpClient.delete(`/checklists/${checklistId}`, { headers: getAuthHeaders() })
		},
	}
}

export default ChecklistsService()
