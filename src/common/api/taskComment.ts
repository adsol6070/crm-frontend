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

function TaskCommentService() {
	return {
		// Create a new task
		createTaskComment: (taskID: string, data: any) => {
			return HttpClient.post(`/taskComment/${taskID}`, data, {
				headers: getAuthHeaders(),
			})
		},

		// Retrieve all tasks
		getAllTaskComments: async (taskID: string) => {
			return HttpClient.get(`/taskComment/${taskID}`, {
				headers: getAuthHeaders(),
			})
		},

		// Retrieve all tasks comments
		getAllTaskCommentsWithoutId: async () => {
			return HttpClient.get(`/taskComment/`, { headers: getAuthHeaders() })
		},

		// Delete a task by ID
		getTaskCommentByID: (commentId: string) => {
			return HttpClient.get(`/taskComment/comment/${commentId}`, {
				headers: getAuthHeaders(),
			})
		},

		// Delete a task by ID
		updateTaskCommentByID: (commentId: string, data: any) => {
			return HttpClient.patch(`/taskComment/comment/${commentId}`, data, {
				headers: getAuthHeaders(),
			})
		},

		// Delete a task by ID
		deleteTaskCommentByID: (commentId: string) => {
			return HttpClient.delete(`/taskComment/comment/${commentId}`, {
				headers: getAuthHeaders(),
			})
		},
	}
}

export default TaskCommentService()
