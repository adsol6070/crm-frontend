import React, {
	createContext,
	useContext,
	ReactNode,
	useState,
	useEffect,
} from 'react'
import { permissionService } from '../api'

// Permissions type
interface Permissions {
	[category: string]: {
		[action: string]: boolean
	}
}

// Permissions context type
interface PermissionsContextType {
	permissions: Permissions
}

// Creating the Permissions context
const PermissionsContext = createContext<PermissionsContextType | undefined>(
	undefined
)

// Hook to use Permissions context
export function usePermissions() {
	const context = useContext(PermissionsContext)
	if (!context) {
		throw new Error('usePermissions must be used within a PermissionsProvider')
	}
	return context
}

// PermissionsProvider component
export const PermissionsProvider: React.FC<{ children: ReactNode }> = ({
	children,
}) => {
	const [permissions, setPermissions] = useState<Permissions>({})

	console.log('Permissions:', permissions)

	const fetchPermissions = async (role: string) => {
		try {
			const data = await permissionService.getPermissionsByRole({ role })
			setPermissions(data.permissions)
		} catch (error) {
			console.error('Error fetching permissions:', error)
			return {}
		}
	}

	useEffect(() => {
		fetchPermissions('admin')
	}, [])

	return (
		<PermissionsContext.Provider value={{ permissions }}>
			{children}
		</PermissionsContext.Provider>
	)
}
