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

function PermissionsService() {
	return {
		create: async (values: any) => {
			return await HttpClient.post('/permissions/', values, {
				headers: getAuthHeaders(),
			})
		},
		get: async () => {
			return await HttpClient.get('/permissions/', {
				headers: getAuthHeaders(),
			})
		},
		getRoles: async () => {
			return await HttpClient.get('/permissions/roles', {
				headers: getAuthHeaders(),
			})
		},
		getPermissionsByRole: async (values: any) => {
			return await HttpClient.post('/permissions/by-role', values, {
				headers: getAuthHeaders(),
			})
		},
		update: async (values: any, permissionId?: string) => {
			const data = await HttpClient.patch(
				`/permissions/${permissionId}`,
				values,
				{
					headers: getAuthHeaders(),
				}
			)
			return data
		},
		delete: async (permissionId: string) => {
			return await HttpClient.delete(`/permissions/${permissionId}`, {
				headers: getAuthHeaders(),
			})
		},

		deleteSelectedRoles: async (values: any) => {
			return await HttpClient.post('/permissions/deleteSelected', values, {
				headers: getAuthHeaders(),
			})
		},
	}
}

export default PermissionsService()
