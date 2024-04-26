import { HttpClient } from '../helpers'

function AuthService() {
	return {
		login: (values: any) => {
			return HttpClient.post('/auth/login', values)
		},
		logout() {
			console.log('Logout get called.')
			return HttpClient.post('/logout', {})
		},
		register: (values: any) => {
			return HttpClient.post('/auth/register', values, {
				headers: {
					'Content-Type': 'multipart/form-data',
				},
			})
		},
		forgetPassword: (values: any) => {
			return HttpClient.post('/forget-password', values)
		},
	}
}

export default AuthService()
