/* eslint-disable indent */
import { DecodedToken } from '@/types'
import axios from 'axios'
import { jwtDecode } from 'jwt-decode'

const ErrorCodeMessages: { [key: number]: string } = {
	401: 'Invalid credentials',
	403: 'Access Forbidden',
	404: 'Resource or page not found',
}

function HttpClient() {
	const refreshToken = async () => {
		try {
			const refresh_token = localStorage.getItem('refresh_token')
			const decodedRefreshToken = jwtDecode<DecodedToken>(refresh_token)
			const response = await axios.post(
				'http://localhost:8000/api/v1/auth/refresh-tokens',
				{ tenantID: decodedRefreshToken.tenantID, refresh_token }
			)

			localStorage.setItem('access_token', response.data.accessToken)
			localStorage.setItem('refresh_token', response.data.refreshToken)
			return response.data.access_token
		} catch (error) {
			console.error('Error refreshing token:', error)
			return null
		}
	}

	const shouldRefreshToken = () => {
		const token = localStorage.getItem('access_token')
		if (!token) return true
		const decodedToken = jwtDecode<DecodedToken>(token)
		const currentTime = Date.now() / 1000
		return decodedToken.exp < currentTime
	}

	const _errorHandler = async (error: any) => {
		if (error?.response.status === 401 || shouldRefreshToken()) {
			const originalRequest = error.config
			if (!originalRequest._retry) {
				originalRequest._retry = true
				const access_token = await refreshToken()
				if (access_token) {
					axios.defaults.headers.common['Authorization'] =
						`Bearer ${access_token}`
					originalRequest.headers['Authorization'] = `Bearer ${access_token}`
					return axios(originalRequest)
				}
			}
		}

		return Promise.reject(
			Object.keys(ErrorCodeMessages).includes(String(error?.response?.status))
				? ErrorCodeMessages[error.response.status]
				: error.response.data && error.response.data.message
					? error.response.data.message
					: error.message || error
		)
	}

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

	_httpClient.interceptors.request.use(
		async (config) => {
			if (shouldRefreshToken()) {
				const newAccessToken = await refreshToken()
				if (newAccessToken) {
					config.headers['Authorization'] = `Bearer ${newAccessToken}`
				}
			}
			return config
		},
		(error) => Promise.reject(error)
	)

	return {
		get: async (url: string, config = {}) => _httpClient.get(url, config),
		post: async (url: string, data: any, config = {}) =>
			_httpClient.post(url, data, config),
		patch: async (url: string, data: any, config = {}) =>
			_httpClient.patch(url, data, config),
		put: async (url: string, config = {}) => _httpClient.put(url, config),
		delete: async (url: string, config = {}) => _httpClient.delete(url, config),
	}
}

export default HttpClient()
