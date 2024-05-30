// utils/permissions.ts
export const hasPermission = (
	permissions: any,
	section: string,
	action: any
): boolean => {
	if (permissions?.['*']?.['*']) {
		return true
	}
	return permissions?.[section]?.[action] ?? false
}
