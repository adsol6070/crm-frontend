import axios, {
	AxiosInstance,
	AxiosRequestConfig,
	AxiosResponse,
	AxiosError,
} from 'axios'
import { jwtDecode } from 'jwt-decode'
import { DecodedToken } from '@/types'

interface CustomAxiosRequestConfig extends AxiosRequestConfig {
	_retry?: boolean
}

interface QueueItem {
	resolve: (token: string) => void
	reject: (reason: any) => void
}

const ErrorCodeMessages: { [key: number]: string } = {
	401: 'Invalid credentials',
	403: 'Access Forbidden',
	404: 'Resource or page not found',
}

let isRefreshing = false
let failedQueue: QueueItem[] = []

const processQueue = (error: any, token: string | null = null): void => {
	failedQueue.forEach((prom) => {
		if (error) {
			prom.reject(error)
		} else {
			prom.resolve(token)
		}
	})

	failedQueue = []
}

const refreshToken = async (): Promise<string | null> => {
	try {
		const access_token = localStorage.getItem('access_token')
		const refresh_token = localStorage.getItem('refresh_token')

		console.table({
			OLD_ACCESS_TOKEN: access_token,
			OLD_REFRESH_TOKEN: refresh_token,
		})

		if (!refresh_token) throw new Error('No refresh token available')
		console.log('Refresh...')
		const decodedRefreshToken = jwtDecode<DecodedToken>(refresh_token)
		const response = await axios.post<{
			accessToken: string
			refreshToken: string
		}>('http://localhost:8000/api/v1/auth/refresh-tokens', {
			tenantID: decodedRefreshToken.tenantID,
			refresh_token,
		}, {
			headers: {
				Authorization: `Bearer ${access_token}`
			}
		})

		// const newAccesstoken = response.data.accessToken
		// const newRefreshtoken = response.data.refreshToken

		// console.table({
		// 	NEW_ACCESS_TOKEN: newAccesstoken,
		// 	NEW_REFRESH_TOKEN: newRefreshtoken,
		// })

		localStorage.setItem('access_token', response.data.accessToken)
		localStorage.setItem('refresh_token', response.data.refreshToken)

		const newAccesstoken = localStorage.getItem('access_token')
		const newRefreshtoken = localStorage.getItem('refresh_token')

		console.table({
			NEW_ACCESS_TOKEN: newAccesstoken,
			NEW_REFRESH_TOKEN: newRefreshtoken,
		})
		return response.data.accessToken
	} catch (error) {
		console.error('Error refreshing token:', error)
		processQueue(error)
		return null
	}
}

function HttpClient(): { [key: string]: Function } {
	const _httpClient: AxiosInstance = axios.create({
		baseURL: 'http://localhost:8000/api/v1',
		timeout: 6000,
		headers: {
			'Content-Type': 'application/json',
		},
	})

	_httpClient.interceptors.request.use(
		async (config: CustomAxiosRequestConfig) => {
			const accessToken = localStorage.getItem('access_token')
			if (accessToken) {
				const { exp } = jwtDecode<DecodedToken>(accessToken)
				if (Date.now() >= exp * 1000) {
					if (!isRefreshing) {
						isRefreshing = true
						const newToken = await refreshToken()
						isRefreshing = false
						if (newToken) {
							axios.defaults.headers.common['Authorization'] =
								`Bearer ${newToken}`
							config.headers = config.headers || {}
							config.headers['Authorization'] = `Bearer ${newToken}`
							processQueue(null, newToken)
						}
					} else {
						return new Promise((resolve, reject) => {
							failedQueue.push({
								resolve: (token: string) => {
									config.headers = config.headers || {}
									config.headers['Authorization'] = `Bearer ${token}`
									resolve(config)
								},
								reject: (error: any) => {
									reject(error)
								},
							})
						})
					}
				} else {
					config.headers = config.headers || {}
					config.headers['Authorization'] = `Bearer ${accessToken}`
				}
			}
			return config
		},
		(error) => Promise.reject(error)
	)

	const _errorHandler = async (error: AxiosError) => {
		if (error.response?.status === 401 && !error.config._retry) {
			return refreshToken().then((newToken) => {
				if (newToken) {
					error.config.headers = error.config.headers || {}
					error.config.headers['Authorization'] = `Bearer ${newToken}`
					error.config._retry = true
					return _httpClient(error.config)
				} else {
					return Promise.reject('Failed to refresh token')
				}
			})
		}

		return Promise.reject(
			Object.keys(ErrorCodeMessages).includes(String(error.response?.status))
				? ErrorCodeMessages[error.response!.status]
				: error.response?.data?.message
					? error.response.data.message
					: error.message || error
		)
	}

	_httpClient.interceptors.response.use(
		(response: AxiosResponse) => response.data,
		_errorHandler
	)

	return {
		get: (url: string, config: AxiosRequestConfig = {}) =>
			_httpClient.get(url, config),
		post: (url: string, data: any, config: AxiosRequestConfig = {}) =>
			_httpClient.post(url, data, config),
		patch: (url: string, data: any, config: AxiosRequestConfig = {}) =>
			_httpClient.patch(url, data, config),
		put: (url: string, data: any, config: AxiosRequestConfig = {}) =>
			_httpClient.put(url, data, config),
		delete: (url: string, config: AxiosRequestConfig = {}) =>
			_httpClient.delete(url, config),
	}
}

export default HttpClient()
