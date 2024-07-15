import { chatApi, useAuthContext } from '@/common'
import groupPlaceholder from '@/assets/images/users/group-placeholder.jpg'
import SocketManager from '@/common/context/SocketManager'
import { useUser, useUserImage } from '@/hooks'
import React, {
	createContext,
	useContext,
	useEffect,
	useRef,
	useState,
} from 'react'

interface ChatContextType {
	currentUser: any
	chats: any[]
	groups: any[]
	messages: any[]
	setMessages: React.Dispatch<React.SetStateAction<any[]>>
	currentRoomId: string
	setCurrentRoomId: React.Dispatch<React.SetStateAction<string>>
	isLoadingMessages: boolean
	setIsLoadingMessages: React.Dispatch<React.SetStateAction<boolean>>
	unreadMessages: Map<string, number>
	unreadGroupMessages: Map<string, number>
	disabledGroups: Map<string, boolean>
	scrollRef: any
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export const useChatContext = () => {
	const context = useContext(ChatContext)
	if (!context) {
		throw new Error('useChatContext must be used within a ChatProvider')
	}
	return context
}

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
	const { user } = useAuthContext()
	const [currentUser] = useUser()
	const fetchUserImage = useUserImage()
	const [chats, setChats] = useState<any[]>([])
	const [groups, setGroups] = useState<any[]>([])
	const [messages, setMessages] = useState<any[]>([])
	const [currentRoomId, setCurrentRoomId] = useState<string>('')
	const [isLoadingMessages, setIsLoadingMessages] = useState<boolean>(false)
	const [unreadMessages, setUnreadMessages] = useState<Map<string, number>>(
		new Map()
	)
	const [unreadGroupMessages, setUnreadGroupMessages] = useState<
		Map<string, number>
	>(new Map())
	const [disabledGroups, setDisabledGroups] = useState<Map<string, boolean>>(
		new Map()
	)
	const scrollRef = useRef<any>(null)

	const fetchGroupImage = async (group: any) => {
		try {
			if (group.image) {
				const response = await chatApi.getGroupImage(group.id)
				if (response) {
					return URL.createObjectURL(response)
				}
			} else {
				return groupPlaceholder
			}
		} catch (error) {
			console.error('Error fetching group image:', error)
		}
	}

	useEffect(() => {
		const socket = SocketManager.getSocket()

		const fetchInitialData = async () => {
			socket?.emit('requestInitialUsers')
			socket?.emit('requestInitialGroups')
			socket?.emit('getUnreadMessages')

			socket?.on('initialUsers', async (users: any[]) => {
				const transformedChats = await Promise.all(
					users.map(async (user) => {
						const imageUrl = await fetchUserImage(user)
						return {
							id: user.id,
							status: user.online
								? 'Online'
								: user.last_active
									? 'Offline'
									: 'Away',
							roomId: user.id.toString(),
							isImg: !!user.profileImage,
							profile: `${user.firstname.charAt(0)}${user.lastname.charAt(0)}`,
							image: imageUrl,
							name: `${user.firstname} ${user.lastname}`,
							description: user.online
								? 'Online'
								: `Last seen at ${new Date(user.last_active).toLocaleTimeString(
										[],
										{
											hour: '2-digit',
											minute: '2-digit',
										}
									)}`,
							time: new Date(user.last_active).toLocaleTimeString([], {
								hour: '2-digit',
								minute: '2-digit',
							}),
						}
					})
				)
				setChats(transformedChats)
			})

			socket?.on('initialGroups', async ({ groups, disabledGroups }: any) => {
				const transformedGroups = await Promise.all(
					groups.map(async (group) => {
						const imageUrl = await fetchGroupImage(group)
						return {
							...group,
							image: imageUrl,
							members: group.members || [],
						}
					})
				)
				setGroups(transformedGroups)
				const disabledGroupsMap = new Map(
					disabledGroups.map((group: any) => [
						group.groupId,
						group.removedByAdmin,
					])
				)
				setDisabledGroups(disabledGroupsMap)
			})

			socket?.on(
				'unreadMessagesCount',
				({ unreadMessagesMap, unreadGroupMessagesMap }) => {
					setUnreadMessages(new Map(Object.entries(unreadMessagesMap)))
					setUnreadGroupMessages(
						new Map(Object.entries(unreadGroupMessagesMap))
					)
				}
			)
		}

		fetchInitialData()

		return () => {
			socket?.off('initialUsers')
			socket?.off('initialGroups')
			socket?.off('unreadMessagesCount')
		}
	}, [])

	return (
		<ChatContext.Provider
			value={{
				currentUser,
				chats,
				groups,
				messages,
				setMessages,
				currentRoomId,
				setCurrentRoomId,
				isLoadingMessages,
				setIsLoadingMessages,
				unreadMessages,
				unreadGroupMessages,
				disabledGroups,
				scrollRef,
			}}>
			{children}
		</ChatContext.Provider>
	)
}
