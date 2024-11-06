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

function TaskService() {
	return {
		// Create a new task 
		createTask: (data: any) => {
			return HttpClient.post('/task/', data, { headers: getAuthHeaders() })
		},

        // Retrieve all tasks
		getAllTaks: () => {
			return HttpClient.get('/task/', { headers: getAuthHeaders() })
		},
	}
}

export default TaskService()
