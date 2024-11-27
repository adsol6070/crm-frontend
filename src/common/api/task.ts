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
		createTask: (boardId: string, data: any) => {
			return HttpClient.post(`/task/${boardId}`, data, {
				headers: getAuthHeaders(),
			})
		},

		// Retrieve all tasks
		getAllTaks: async (boardId: string) => {
			return HttpClient.get(`/task/${boardId}`, { headers: getAuthHeaders() })
		},

		// Delete a task by ID
		getTaskByID: (taskId: string) => {
			return HttpClient.get(`/task/${taskId}`, { headers: getAuthHeaders() })
		},

		// Delete a task by ID
		updateTaskByID: (taskId: string, data: any) => {
			return HttpClient.patch(`/task/${taskId}`, data, {
				headers: getAuthHeaders(),
			})
		},

		// Delete a task by ID
		deleteTaskByID: (taskId: string) => {
			return HttpClient.delete(`/task/${taskId}`, { headers: getAuthHeaders() })
		},

		updateTaskOrder: (updatedTasks: any, boardId: string) => {
			return HttpClient.patch(`/task/order/${boardId}`, updatedTasks, {
				headers: getAuthHeaders(),
			})
		},

		createTaskColumn: (boardId: string, data: any) => {
			return HttpClient.post(`/task/taskColumn/${boardId}`, data, { headers: getAuthHeaders() })
		},
		
		// Delete a task by ID
		getTaskColumn: (boardId: string) => {
			return HttpClient.get(`/task/taskColumn/${boardId}`, { headers: getAuthHeaders() })
		},
	}
}

export default TaskService()
