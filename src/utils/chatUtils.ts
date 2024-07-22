export const isGroupChat = (currentRoomId: string, groups: any) => {
	return groups.some((group: any) => group.id === currentRoomId)
}

export const filterByName = (items: any[], searchTerm: string) => {
	return items.filter((item) =>
		item.name.toLowerCase().includes(searchTerm.toLowerCase())
	)
}
