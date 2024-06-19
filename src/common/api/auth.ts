import { HttpClient } from '../helpers'

function AuthService() {
	return {
		createOrganization: (values: any) => {
			return HttpClient.post('/tenant/create', values)
		},
		register: (values: any) => {
			return HttpClient.post('/auth/register', values, {
				headers: {
					'Content-Type': 'multipart/form-data',
				},
			})
		},
		login: (values: any) => {
			return HttpClient.post('/auth/login', values, {
				_skipRefresh: true,
			})
		},
		forgetPassword: (values: any) => {
			return HttpClient.post('/auth/forgot-password', values)
		},
		resetPassword: (values: any) => {
			return HttpClient.post('/auth/reset-password', values)
		},
		logout(values: any) {
			return HttpClient.post('/auth/logout', values, {
				_skipRefresh: true,
			})
		},
	}
}

export default AuthService()
