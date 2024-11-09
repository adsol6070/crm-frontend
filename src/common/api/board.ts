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

function BoardService() {
	return {
		// Create a new task
		createBoard: (data: any) => {
			return HttpClient.post(`/taskBoard/`, data, { headers: getAuthHeaders() })
		},

		// Retrieve all tasks
		getAllBoards: async () => {
			return HttpClient.get(`/taskBoard/`, { headers: getAuthHeaders() })
		},

		// Delete a task by ID
		getBoardByID: (boardId: string) => {
			return HttpClient.get(`/taskBoard/${boardId}`, { headers: getAuthHeaders() })
		},

		// Delete a task by ID
		updateBoardByID: (boardId: string, data: any) => {
			return HttpClient.patch(`/taskBoard/${boardId}`, data, {
				headers: getAuthHeaders(),
			})
		},

		// Delete a task by ID
		deleteBoardByID: (boardId: string) => {
			return HttpClient.delete(`/taskBoard/${boardId}`, { headers: getAuthHeaders() })
		},

		// Delete a task by ID
		deleteBoards: () => {
			return HttpClient.delete(`/taskBoard/`, { headers: getAuthHeaders() })
		},
	}
}

export default BoardService()
