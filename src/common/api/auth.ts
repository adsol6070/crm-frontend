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

function AuthService() {
	return {
		login: (values: any) => {
			return HttpClient.post('/auth/login', values)
		},
		logout(values: any) {
			return HttpClient.post('/auth/logout', values, {
				headers: getAuthHeaders(),
			})
		},
		register: (values: any) => {
			return HttpClient.post('/auth/register', values, {
				headers: {
					'Content-Type': 'multipart/form-data',
				},
			})
		},
		forgetPassword: (values: any) => {
			return HttpClient.post('/auth/forgot-password', values)
		},
	}
}

export default AuthService()
