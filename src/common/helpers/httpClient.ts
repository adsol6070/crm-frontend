/* eslint-disable indent */
import axios from 'axios'

const ErrorCodeMessages: { [key: number]: string } = {
	401: 'Invalid credentials',
	403: 'Access Forbidden',
	404: 'Resource or page not found',
}

function HttpClient() {
	const _errorHandler = (error: any) =>
		Promise.reject(
			Object.keys(ErrorCodeMessages).includes(error?.response?.status)
				? ErrorCodeMessages[error.response.status]
				: error.response.data && error.response.data.message
					? error.response.data.message
					: error.message || error
		)

	const _httpClient = axios.create({
		// baseURL: process.env.VITE_API_URL,
		baseURL: 'http://localhost:8000/api/v1',
		timeout: 6000,
		headers: {
			'Content-Type': 'application/json',
		},
	})

	_httpClient.interceptors.response.use((response) => {
		return response.data
	}, _errorHandler)

	return {
		get: async (url: string, config = {}) => _httpClient.get(url, config),
		post: async (url: string, data: any, config = {}) =>
			_httpClient.post(url, data, config),
		patch: async (url: string, config = {}) => _httpClient.patch(url, config),
		put: async (url: string, config = {}) => _httpClient.put(url, config),
		delete: async (url: string, config = {}) => _httpClient.delete(url, config),
		client: _httpClient.get("", ),
	}
}

export default HttpClient()
