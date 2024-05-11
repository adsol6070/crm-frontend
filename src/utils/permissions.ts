// utils/permissions.ts
export const hasPermission = (
	permissions: any,
	section: string,
	action: string
): boolean => {
	return permissions?.[section]?.[action] ?? false
}
