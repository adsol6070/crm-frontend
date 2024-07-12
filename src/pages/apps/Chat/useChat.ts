import { chatApi, useAuthContext } from '@/common'
import SocketManager from '@/common/context/SocketManager'
import { useUserImage } from '@/hooks'
import { useEffect, useState } from 'react'

const useChat = () => {
	const { user } = useAuthContext()
	const [chats, setChats] = useState<any[]>([])
	const [groups, setGroups] = useState<any[]>([])
	const [messages, setMessages] = useState<any[]>([])
	const [isLoadingMessages, setIsLoadingMessages] = useState<boolean>(false)
	const fetchUserImage = useUserImage()

	const fetchGroupImage = async (groupId: string) => {
		try {
			const response = await chatApi.getGroupImage(groupId)
			const imageUrl = URL.createObjectURL(response)
			return imageUrl
		} catch (error) {
			console.error('Error fetching group image:', error)
			return avatar1
		}
	}

	useEffect(() => {
		const socket = SocketManager.getSocket()
		fetchInitialData(socket)

		socket?.on('userStatusUpdated', updateUserStatus)
		socket?.on('chatHistory', updateChatHistory)
		socket?.on(
			'groupChatHistory',
			async ({ groupId, chatHistory, members }) => {
				if (groupId === currentRoomId) {
					const modifiedMembers = await Promise.all(
						members.map(async (member: any) => {
							const image = await fetchUserImage(member)
							return {
								...member,
								profileImage: image,
							}
						})
					)

					const processedMessages = await Promise.all(
						chatHistory.map(async (message: any) => {
							if (message.file_url && message.file_type && message.file_name) {
								try {
									const response = await chatApi.getChatFile({
										messageId: message.id,
										tenantID: user.tenantID,
										isGroupMessage: true,
									})
									const fileUrl = URL.createObjectURL(response)
									return { ...message, file_url: fileUrl }
								} catch (error) {
									console.error('Error fetching file for chat message:', error)
									return { ...message }
								}
							}
							return message
						})
					)

					setMessages(processedMessages)
					setMembers(modifiedMembers || [])
					scrollToBottom()
					setIsLoadingMessages(false)
				}
			}
		)

		return () => {
			socket?.off('userStatusUpdated')
			socket?.off('chatHistory')
			socket?.off('groupChatHistory')
		}
	}, [])

	const fetchInitialData = (socket) => {
		socket?.emit('requestInitialUsers')
		socket?.emit('requestInitialGroups')
		socket?.emit('getUnreadMessages')
		socket?.on('initialUsers', setChatsData)
		socket?.on('initialGroups', setGroupsData)
	}

	const transformUserToChat = async (user) => {
		const imageUrl = await fetchUserImage(user)
		return {
			id: user.id,
			status: user.online ? 'Online' : user.last_active ? 'Offline' : 'Away',
			roomId: user.id.toString(),
			isImg: !!user.profileImage,
			profile: `${user.firstname.charAt(0)}${user.lastname.charAt(0)}`,
			image: imageUrl,
			name: `${user.firstname} ${user.lastname}`,
			description: user.online
				? 'Online'
				: `Last seen at ${new Date(user.last_active).toLocaleTimeString([], {
						hour: '2-digit',
						minute: '2-digit',
					})}`,
			time: new Date(user.last_active).toLocaleTimeString([], {
				hour: '2-digit',
				minute: '2-digit',
			}),
		}
	}

	const setChatsData = async (users) => {
		const transformedChats = await Promise.all(users.map(transformUserToChat))
		setChats(transformedChats)
	}

	const transformGroupData = async (group) => {
		const imageUrl = await fetchGroupImage(group.id)
		return {
			...group,
			image: imageUrl,
			members: group.members || [],
		}
	}

	const setGroupsData = async ({ groups, disabledGroups }) => {
		const transformedGroups = await Promise.all(groups.map(transformGroupData))
		setGroups(transformedGroups)
	}

	const updateUserStatus = ({ userId, status, description }) => {
		setChats((prevChats) =>
			prevChats.map((chat) =>
				chat.id === userId
					? { ...chat, status: status ? 'Online' : 'Offline', description }
					: chat
			)
		)
	}

	const processMessageFileUrl = async (message) => {
		if (message.file_url && message.file_type && message.file_name) {
			try {
				const response = await chatApi.getChatFile({
					messageId: message.id,
					tenantID: user.tenantID,
				})
				const fileUrl = URL.createObjectURL(response)
				return { ...message, file_url: fileUrl }
			} catch (error) {
				console.error('Error fetching file for chat message:', error)
				return { ...message }
			}
		}
		return message
	}

	const updateChatHistory = async (chatHistory: any[]) => {
		const processedMessages = await Promise.all(
			chatHistory.map(processMessageFileUrl)
		)
		setMessages(processedMessages)
		setIsLoadingMessages(false)
	}

	const updateGroupChatHistory = async ({ groupId, chatHistory, members }) => {
		if (groupId === currentRoomId) {
			const modifiedMembers = await Promise.all(
				members.map(transformUserToChat)
			)
			const processedMessages = await Promise.all(
				chatHistory.map(processMessageFileUrl)
			)
			setMessages(processedMessages)
			setMembers(modifiedMembers || [])
			setIsLoadingMessages(false)
		}
	}

	return {
		chats,
		groups,
		messages,
		isLoadingMessages,
	}
}

export default useChat
