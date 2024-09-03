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

function ReportService() {
	return {
		getLeadReportBasedOnStatus: async () => {
			return await HttpClient.get('/reports/getLeadBasedOnStatus', {
				headers: getAuthHeaders(),
			})
		},
        getLeadReportBasedOnTime: async (startDate: string, endDate: string) => {
			return await HttpClient.get(`/reports/getCreatedLeadsBasedOnTime/?startDate=${startDate}&endDate=${endDate}`, {
				headers: getAuthHeaders(),
			})
		},
		getLeadReportBasedOnSource: async () => {
			return await HttpClient.get('/reports/getCreatedLeadsBasedOnSource', {
				headers: getAuthHeaders(),
			})
		},
		getCardsData: async () => {
			return await HttpClient.get('/reports/getCardsData', {
				headers: getAuthHeaders(),
			})
		},
	}
}

export default ReportService()
