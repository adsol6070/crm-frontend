// utils/permissions.ts
export const hasPermission = (
	permissions: any,
	section: string,
	action: any
): boolean => {
	return permissions?.[section]?.[action] ?? false
}
