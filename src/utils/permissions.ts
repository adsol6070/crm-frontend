// utils/permissions.ts
export const hasPermission = (
	permissions: any,
	section: string,
	action: any
): boolean => {
	console.table({
		Permissions: permissions,
		Section: section,
		Action: action,
	})
	return permissions?.[section]?.[action] ?? false
}
