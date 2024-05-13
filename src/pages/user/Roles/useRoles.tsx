import { permissionService } from '@/common'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'

interface PermissionOptions {
	Create: boolean
	Read: boolean
	Update: boolean
	Delete: boolean
}

interface Permissions {
	[category: string]: PermissionOptions
}

interface TransformedUserPermissions {
	id: string
	role: string
	permissions: Permissions
	createdOn: string
	updatedOn: string
}

type UserPermissions = Omit<
	TransformedUserPermissions,
	'createdOn' | 'updatedOn'
> & {
	created_at: string
	updated_at: string
}

// Converts a string to Title Case
const toTitleCase = (str: string) => {
	return str.toLowerCase().replace(/\b(\w)/g, (s) => s.toUpperCase())
}

export const useRoles = () => {
	const [permissionsData, setPermissionsData] = useState<
		TransformedUserPermissions[]
	>([])
	const columns = [
		{ Header: 'Role Title', accessor: 'role', defaultCanSort: true },
		{ Header: 'Users', accessor: 'users' },
		{ Header: 'Created On', accessor: 'createdOn' },
		{ Header: 'Updated On', accessor: 'updatedOn' },
	]

	const fetchPermissions = async () => {
		const permissions = await permissionService.get()
		const updatedPermissions = permissions.map(
			({ created_at, updated_at, ...rest }: UserPermissions) => {
				return {
					...rest,
					role: toTitleCase(rest.role),
					createdOn: created_at.split('T')[0],
					updatedOn: updated_at.split('T')[0],
				}
			}
		)
		setPermissionsData(updatedPermissions)
	}

	const deletePermission = async (permissionId: string) => {
		try {
			await permissionService.delete(permissionId)
			toast.success('Permission successfully deleted.')
			fetchPermissions()
		} catch (error) {
			toast.error('Failed to delete permission.')
			console.error('Failed to delete permission:', error)
		}
	}

	useEffect(() => {
		fetchPermissions()
	}, [])

	return { columns, permissionsData, fetchPermissions, deletePermission }
}