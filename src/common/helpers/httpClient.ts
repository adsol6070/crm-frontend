import axios, {
	AxiosInstance,
	AxiosRequestConfig,
	AxiosResponse,
	AxiosError,
	AxiosRequestHeaders,
} from 'axios'
import { jwtDecode } from 'jwt-decode'
import { DecodedToken } from '@/types'
import SocketManager from '../context/SocketManager'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

const MySwal = withReactContent(Swal)

interface CustomAxiosRequestConfig extends AxiosRequestConfig {
	_skipRefresh?: boolean
	headers: AxiosRequestHeaders
}

const ErrorCodeMessages: { [key: number]: string } = {
	401: 'Invalid credentials',
	403: 'Access Forbidden',
	404: 'Resource or page not found',
}

let isRefreshing = false

const refreshToken = async (): Promise<string | null> => {
	try {
		const access_token = localStorage.getItem('access_token')

		if (!access_token) throw new Error('No Access token available')
		const decodedAccessToken = jwtDecode<DecodedToken>(access_token)
		const response = await axios.post<{
			accessToken: string
			refreshToken: string
		}>(`${process.env.VITE_API_URL}/auth/refresh-tokens`, {
			tenantID: decodedAccessToken.tenantID,
			userID: decodedAccessToken.sub,
		})

		localStorage.setItem('access_token', response.data.accessToken)

		const newAccesstoken = localStorage.getItem('access_token')

		if (newAccesstoken) {
			SocketManager.updateToken(response.data.accessToken)
		}

		return response.data.accessToken
	} catch (error) {
		console.error('Error refreshing token:', error)
		if (error?.response && error?.response.status === 401) {
			if (
				error?.response.data.message === 'Refresh Token expired' ||
				error?.response.data.message === 'Refresh token not found'
			) {
				const removeSession = () => {
					const accessToken = localStorage.getItem('access_token')
					if (accessToken) {
						localStorage.removeItem('access_token')
					}
				}
				MySwal.fire({
					title: 'Session Expired',
					text: 'Your session has expired, please log in again.',
					icon: 'warning',
					confirmButtonText: 'Login In',
					allowOutsideClick: false,
					allowEscapeKey: false,
				}).then((result) => {
					if (result.isConfirmed) {
						removeSession()
						window.location.href = '/auth/login'
					}
				})
			}
		}
		return null
	}
}

function HttpClient(): { [key: string]: Function } {
	const _httpClient: AxiosInstance = axios.create({
		baseURL: `${process.env.VITE_API_URL}`,
		timeout: 6000,
		headers: {
			'Content-Type': 'application/json',
		},
	})

	_httpClient.interceptors.request.use(
		async (config: CustomAxiosRequestConfig) => {
			if (config._skipRefresh) return config

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
						}
					} else {
						await new Promise((resolve) => setTimeout(resolve, 1000))
						const updatedAccessToken = localStorage.getItem('access_token')
						if (updatedAccessToken) {
							config.headers.Authorization = `Bearer ${updatedAccessToken}`
						}
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
		const errorMessage =
			error.response?.data && typeof error.response.data === 'object'
				? (error.response?.data as { message: string }).message
				: error.message

		return Promise.reject(
			Object.keys(ErrorCodeMessages).includes(String(error.response?.status))
				? ErrorCodeMessages[error.response!.status]
				: errorMessage
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
