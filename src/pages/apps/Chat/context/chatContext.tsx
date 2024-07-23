import { chatApi, useAuthContext } from '@/common'
import groupPlaceholder from '@/assets/images/users/group-placeholder.jpg'
import SocketManager from '@/common/context/SocketManager'
import { EmojiClickData } from 'emoji-picker-react'
import { useOutsideClick, useUser, useUserImage } from '@/hooks'
import React, {
	createContext,
	KeyboardEvent,
	RefObject,
	useContext,
	useEffect,
	useRef,
	useState,
} from 'react'
import withReactContent from 'sweetalert2-react-content'
import Swal from 'sweetalert2'
import Zoom from 'react-medium-image-zoom'
import 'react-medium-image-zoom/dist/styles.css'

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
	isGroupChat: boolean
	showSelectNewOwnerModal: boolean
	handleCloseSelectNewOwnerModal: () => void
	selectedMember: string
	setSelectedMember: React.Dispatch<React.SetStateAction<string>>
	userChatOpen: (chat: any) => void
	groupChatOpen: (group: any) => void
	chatBoxUsername: string
	chatBoxUserStatus: string
	chatBoxUserImage: string
	handleTyping: (e: React.ChangeEvent<HTMLInputElement>) => void
	addMessage: () => void
	handleEmojiClick: (emojiObject: EmojiClickData) => void
	onKeyPress: (e: KeyboardEvent<HTMLInputElement>) => void
	curMessage: string
	isDisable: boolean
	handleCaptionChange: (e: React.ChangeEvent<HTMLInputElement>) => void
	handleSendFileMessage: () => void
	isCaptionTyping: boolean
	caption: string
	handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
	selectedFile: any
	members: any[]
	handleGroupContextMenu: (event: React.MouseEvent, group: any) => void
	typingUsers: any[]
	renderFilePreview: (fileData: any, isRight: boolean) => JSX.Element | null
	fileInputRef: RefObject<HTMLInputElement>
	deleteSelfMessage: (messageId: string) => void
	deleteMessageForMe: (messageId: string) => void
	deleteMessageForEveryone: (messageId: string, userId: string) => void
	deleteGroupMessageForMe: (messageId: string, groupId: string) => void
	deleteGroupMessageForEveryone: (messageId: string, groupId: string) => void
	isTyping: boolean
	emojiPickerRef: RefObject<HTMLDivElement>
	showEmojiPicker: boolean
	setShowEmojiPicker: React.Dispatch<React.SetStateAction<boolean>>
	copyMsg: (message: string) => void
	copyMsgAlert: boolean
	openForwardModal: (message: any) => void
	openGroupInfoModal: () => void
	showCreateGroupModal: boolean
	setShowCreateGroupModal: React.Dispatch<React.SetStateAction<boolean>>
	showAddUserModal: boolean
	setShowAddUserModal: React.Dispatch<React.SetStateAction<boolean>>
	showGroupInfoModal: boolean
	setShowGroupInfoModal: React.Dispatch<React.SetStateAction<boolean>>
	showForwardModal: boolean
	setShowForwardModal: React.Dispatch<React.SetStateAction<boolean>>
	messageToForward: any
	setMessageToForward: React.Dispatch<React.SetStateAction<any>>
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export const useChatContext = () => {
	const context = useContext(ChatContext)
	if (!context) {
		throw new Error('useChatContext must be used within a ChatProvider')
	}
	return context
}

const MySwal = withReactContent(Swal)

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
	const { user } = useAuthContext()
	const typingTimeout = useRef<NodeJS.Timeout | null>(null)
	const fileInputRef = useRef<HTMLInputElement>(null)
	const [isDisable, setDisable] = useState<boolean>(false)
	const [isCaptionTyping, setIsCaptionTyping] = useState(false)
	const [curMessage, setCurMessage] = useState<string>('')
	const [caption, setCaption] = useState<string>('')
	const [copyMsgAlert, setCopyMsgAlert] = useState<boolean>(false)
	const [currentRoomId, setCurrentRoomId] = useState<string>('')
	const [chatBoxUsername, setChatBoxUsername] = useState<string>('')
	const [chatBoxUserStatus, setChatBoxUserStatus] = useState<string>('')
	const [chatBoxUserImage, setChatBoxUserImage] = useState<string>('')
	const [selectedImage, setSelectedImage] = useState<string | null>(null)
	const [selectedFile, setSelectedFile] = useState<{
		type: 'image' | 'pdf' | 'zip'
		url: string
		name?: string
		size?: number
	} | null>(null)
	const [chatFile, setChatFile] = useState<any | null>(null)
	const [chats, setChats] = useState<any[]>([])
	const [messages, setMessages] = useState<any[]>([])
	const [members, setMembers] = useState<any[]>([])
	const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false)
	const [isLoadingMessages, setIsLoadingMessages] = useState<boolean>(false)
	const [groups, setGroups] = useState<any[]>([])
	const [typingUsers, setTypingUsers] = useState<any[]>([])
	const [isTyping, setIsTyping] = useState<boolean>(false)
	const scrollRef = useRef<any>(null)
	const emojiPickerRef = useRef<HTMLDivElement>(null)
	const [currentUser] = useUser()
	const fetchUserImage = useUserImage()
	const [disabledGroups, setDisabledGroups] = useState<Map<string, boolean>>(
		new Map()
	)
	const [showSelectNewOwnerModal, setShowSelectNewOwnerModal] =
		useState<boolean>(false)
	const [selectedMember, setSelectedMember] = useState<string>('')
	const [unreadMessages, setUnreadMessages] = useState<Map<string, number>>(
		new Map()
	)
	const [unreadGroupMessages, setUnreadGroupMessages] = useState<
		Map<string, number>
	>(new Map())

	const [showForwardModal, setShowForwardModal] = useState<boolean>(false)
	const [messageToForward, setMessageToForward] = useState<any>(null)
	const [showCreateGroupModal, setShowCreateGroupModal] =
		useState<boolean>(false)
	const [showGroupInfoModal, setShowGroupInfoModal] = useState<boolean>(false)
	const [showAddUserModal, setShowAddUserModal] = useState<boolean>(false)

	const openForwardModal = (message: any) => {
		setMessageToForward(message)
		setShowForwardModal(true)
	}

	const openGroupInfoModal = () => {
		setShowGroupInfoModal(true)
	}

	const isGroupChat = groups.some((group) => group.id === currentRoomId)

	useOutsideClick(emojiPickerRef, () => setShowEmojiPicker(false))

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

	const copyMsg = (message: string) => {
		navigator.clipboard
			.writeText(message)
			.then(() => {
				setCopyMsgAlert(true)

				setTimeout(() => {
					setCopyMsgAlert(false)
				}, 1000)
			})
			.catch((err) => {
				console.error('Failed to copy text: ', err)
			})
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
					groups.map(async (group: any) => {
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

		socket?.on('userStatusUpdated', ({ userId, status, description }) => {
			setChats((prevChats) =>
				prevChats.map((chat) =>
					chat.id === userId
						? { ...chat, status: status ? 'Online' : 'Offline', description }
						: chat
				)
			)
		})

		socket?.on('chatHistory', async (chatHistory: any[]) => {
			const processedMessages = await Promise.all(
				chatHistory.map(async (message) => {
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
							return { ...message } // return message without file_url modification on error
						}
					}
					return message
				})
			)

			setMessages(processedMessages)
			scrollToBottom()
			setIsLoadingMessages(false)
		})

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

		socket?.on('groupCreated', async (newGroup: any) => {
			const imageUrl = await fetchGroupImage(newGroup)
			const modifiedNewGroup = {
				...newGroup,
				image: imageUrl,
				members: newGroup.members || [],
			}
			setGroups((prevGroups) => [...prevGroups, modifiedNewGroup])
		})

		socket?.on('groupDeleted', ({ groupId }) => {
			setGroups((prevGroups) =>
				prevGroups.filter((group) => group.id !== groupId)
			)
		})

		socket?.on('receiveMessage', async (newMessage: any) => {
			if (
				(newMessage.fromUserId === currentRoomId &&
					newMessage.toUserId === currentUser?.id) ||
				(newMessage.toUserId === currentRoomId &&
					newMessage.fromUserId === currentUser?.id)
			) {
				if (
					newMessage.file_url &&
					newMessage.file_type &&
					newMessage.file_name
				) {
					try {
						const response = await chatApi.getChatFile({
							messageId: newMessage.id,
							tenantID: user.tenantID,
							isGroupMessage: false, // Specify it's not a group message
						})
						const fileUrl = URL.createObjectURL(response)
						newMessage.file_url = fileUrl
					} catch (error) {
						console.error('Error fetching file for chat message:', error)
						return
					}
				}
				setMessages((prevMessages) => [...prevMessages, newMessage])
				scrollToBottom()
				socket.emit('messageRead', { fromUserId: newMessage.fromUserId })
			} else {
				socket.emit('getUnreadMessages')
			}
		})

		socket?.on('messageRead', ({ fromUserId }) => {
			setUnreadMessages((prev) => {
				const updated = new Map(prev)
				updated.delete(fromUserId)
				return updated
			})
		})

		socket?.on('receiveGroupMessage', async (newMessage: any) => {
			const isSentByCurrentUser = newMessage.from_user_id === currentUser?.id
			if (currentRoomId === newMessage.group_id) {
				if (
					newMessage.file_url &&
					newMessage.file_type &&
					newMessage.file_name
				) {
					try {
						const response = await chatApi.getChatFile({
							messageId: newMessage.id,
							tenantID: user.tenantID,
							isGroupMessage: true,
						})
						const fileUrl = URL.createObjectURL(response)
						newMessage.file_url = fileUrl
					} catch (error) {
						console.error('Error fetching file for chat message:', error)
						return
					}
				}
				socket?.emit('messageRead', { groupId: newMessage.group_id })
				setMessages((prevMessages) => [
					...prevMessages,
					{ ...newMessage, isSentByCurrentUser },
				])
				scrollToBottom()
			} else {
				socket.emit('getUnreadMessages')
			}
		})

		socket?.on('userAddedToGroup', async ({ groupId, userId, user }) => {
			const image = await fetchUserImage(user)
			const modifiedUser = {
				...user,
				profileImage: image,
			}
			setGroups((prevGroups) =>
				prevGroups.map((group) =>
					group.id === groupId
						? {
								...group,
								users: [...group.users, userId],
								members: [...group.members, modifiedUser],
							}
						: group
				)
			)
			if (groupId === currentRoomId) {
				setMembers((prevMembers) => [...prevMembers, modifiedUser])
				setDisabledGroups((prev) => {
					const newSet = new Map(prev)
					newSet.delete(groupId)
					return newSet
				})
			}
		})

		socket?.on('groupReenabled', async (groupDetails) => {
			const imageUrl = await fetchGroupImage(groupDetails)
			setGroups((prevGroups) => {
				const groupIndex = prevGroups.findIndex((g) => g.id === groupDetails.id)
				if (groupIndex !== -1) {
					// Update the existing group
					const updatedGroups = [...prevGroups]
					updatedGroups[groupIndex] = {
						...groupDetails,
						image: imageUrl,
						members: updatedGroups[groupIndex].members,
					}
					return updatedGroups
				}
				return [...prevGroups, { ...groupDetails, image: imageUrl }]
			})
		})

		socket?.on(
			'userRemovedFromGroup',
			({ groupId, userId, removedByAdmin }) => {
				setGroups((prevGroups) =>
					prevGroups.map((group) =>
						group.id === groupId
							? {
									...group,
									users: group.users.filter((id: string) => id !== userId),
									members: group.members?.filter(
										(user: any) => user.id !== userId
									),
								}
							: group
					)
				)
				if (groupId === currentRoomId) {
					setMembers((prevMembers) =>
						prevMembers.filter((user: any) => user.id !== userId)
					)
					if (removedByAdmin && userId === currentUser?.id) {
						setDisabledGroups((prev) => {
							const newSet = new Map(prev)
							newSet.set(groupId, true)
							return newSet
						})
					}
				}
			}
		)

		socket?.on('typing', ({ user, groupId, userId, isGroup }) => {
			if (
				(isGroup && groupId === currentRoomId) ||
				(!isGroup && user.id === currentRoomId)
			) {
				setTypingUsers((prevTypingUsers) => {
					const existingUser = prevTypingUsers.find((u) => u.id === user.id)
					if (!existingUser) {
						return [...prevTypingUsers, user]
					}
					return prevTypingUsers
				})
				setIsTyping(true)
			}
		})

		socket?.on('stopTyping', ({ user, groupId, userId, isGroup }) => {
			if (
				(isGroup && groupId === currentRoomId) ||
				(!isGroup && user.id === currentRoomId)
			) {
				setTypingUsers((prevTypingUsers) =>
					prevTypingUsers.filter((u) => u.id !== user.id)
				)
				setIsTyping(false)
			}
		})

		socket?.on('userRemovedNotification', (notificationMessage: any) => {
			setMessages((prevMessages) => [...prevMessages, notificationMessage])
			scrollToBottom()
		})

		socket?.on('groupDisabled', ({ groupId, removedByAdmin }) => {
			setDisabledGroups((prev) => {
				const newSet = new Map(prev)
				newSet.set(groupId, removedByAdmin)
				return newSet
			})
		})

		socket?.on('groupMessageDeletedForEveryone', ({ messageId }) => {
			setMessages((prevMessages) =>
				prevMessages.filter((message) => message.id !== messageId)
			)
		})

		socket?.on('messageDeletedForSelf', ({ messageId }) => {
			setMessages((prevMessages) =>
				prevMessages.filter((message) => message.id !== messageId)
			)
		})

		socket?.on('groupMessageDeletedForMe', ({ messageId }) => {
			setMessages((prevMessages) =>
				prevMessages.map((message) =>
					message.id === messageId
						? { ...message, deletedForMe: true }
						: message
				)
			)
		})

		socket?.on('promptSelectNewOwner', ({ groupId }) => {
			if (
				currentUser?.id ===
				groups.find((group) => group.id === groupId)?.creator_id
			) {
				handleOpenSelectNewOwnerModal()
			}
		})

		socket?.on('groupOwnershipTransferred', ({ groupId, newOwnerId }) => {
			if (groupId === currentRoomId && currentUser?.id === newOwnerId) {
				setCurrentRoomId(groupId)
			}
			setGroups((prevGroups) =>
				prevGroups.map((group) =>
					group.id === groupId ? { ...group, creator_id: newOwnerId } : group
				)
			)
			if (groupId === currentRoomId) {
				socket.emit('fetchGroupChatHistory', { groupId })
			}
		})

		socket?.on('messageDeletedForEveryone', ({ messageId }) => {
			setMessages((prevMessages) =>
				prevMessages.filter((message) => message.id !== messageId)
			)
		})

		socket?.on('messageDeletedForMe', ({ messageId }) => {
			setMessages((prevMessages) =>
				prevMessages.map((message) =>
					message.id === messageId
						? { ...message, deletedForMe: true }
						: message
				)
			)
		})

		socket?.on('userRejoinedNotification', (notificationMessage: any) => {
			setMessages((prevMessages) => [...prevMessages, notificationMessage])
			scrollToBottom()
		})

		return () => {
			socket?.off('initialUsers')
			socket?.off('initialGroups')
			socket?.off('unreadMessagesCount')
			socket?.off('userStatusUpdated')
			socket?.off('chatHistory')
			socket?.off('groupChatHistory')
			socket?.off('groupCreated')
			socket?.off('groupDeleted')
			socket?.off('receiveMessage')
			socket?.off('messageRead')
			socket?.off('receiveGroupMessage')
			socket?.off('userAddedToGroup')
			socket?.off('groupReenabled')
			socket?.off('userRemovedFromGroup')
			socket?.off('typing')
			socket?.off('stopTyping')
			socket?.off('groupDisabled')
			socket?.off('groupMessageDeletedForEveryone')
			socket?.off('messageDeletedForSelf')
			socket?.off('groupMessageDeletedForMe')
			socket?.off('promptSelectNewOwner')
			socket?.off('groupOwnershipTransferred')
			socket?.off('userRemovedNotification')
			socket?.off('userRejoinedNotification')
			socket?.off('messageDeletedForMe')
			socket?.off('messageDeletedForEveryone')
		}
	}, [currentRoomId])

	useEffect(() => {
		const style = document.createElement('style')
		style.innerHTML = `
			.simplebar-content {
				height: 100%;
			}
		`
		document.head.appendChild(style)

		return () => {
			document.head.removeChild(style)
		}
	}, [])

	useEffect(() => {
		const handleLeftClick = (event: any) => {
			if (selectedFile) {
				const container = document.getElementById('selected-file-container')
				if (container && !container.contains(event.target)) {
					event.preventDefault()

					document.removeEventListener('click', handleLeftClick)

					MySwal.fire({
						title: 'Discard unsent message?',
						text: 'Your message, including attached media, will not be sent if you leave this screen.',
						icon: 'warning',
						showCancelButton: true,
						confirmButtonColor: '#3085d6',
						cancelButtonColor: '#d33',
						confirmButtonText: 'Discard',
						cancelButtonText: 'Return to media',
					}).then((result) => {
						if (result.isConfirmed) {
							setSelectedFile(null)
							setCaption('')
						} else {
							setTimeout(() => {
								document.addEventListener('click', handleLeftClick)
							}, 100)
						}
					})
				}
			}
		}

		document.addEventListener('click', handleLeftClick)
		return () => {
			document.removeEventListener('click', handleLeftClick)
		}
	}, [selectedFile])

	const deleteSelfMessage = (messageId: string) => {
		const socket = SocketManager.getSocket()
		socket?.emit('deleteSelfMessage', { messageId })
	}

	const deleteMessageForMe = (messageId: string) => {
		const socket = SocketManager.getSocket()
		socket?.emit('deleteMessageForMe', { messageId })
	}

	const deleteMessageForEveryone = (messageId: string, userId: string) => {
		const socket = SocketManager.getSocket()
		socket?.emit('deleteMessageForEveryone', { messageId, userId })
	}

	const deleteGroupMessageForMe = (messageId: string, groupId: string) => {
		const socket = SocketManager.getSocket()
		socket?.emit('deleteGroupMessageForMe', { messageId, groupId })
	}

	const deleteGroupMessageForEveryone = (
		messageId: string,
		groupId: string
	) => {
		const socket = SocketManager.getSocket()
		socket?.emit('deleteGroupMessageForEveryone', { messageId, groupId })
	}

	const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (file) {
			if (file.type === 'application/pdf') {
				setSelectedFile({
					type: 'pdf',
					url: URL.createObjectURL(file),
					name: file.name,
					size: file.size,
				})
				setChatFile(file)
			} else if (
				file.type === 'application/zip' ||
				file.type === 'application/x-zip-compressed'
			) {
				setSelectedFile({
					type: 'zip',
					url: URL.createObjectURL(file),
					name: file.name,
					size: file.size,
				})
				setChatFile(file)
			} else {
				setSelectedFile({
					type: 'image',
					url: URL.createObjectURL(file),
				})
				setChatFile(file)
			}
			if (fileInputRef.current) {
				fileInputRef.current.value = ''
			}
		}
	}

	const handleOpenSelectNewOwnerModal = () => {
		setShowSelectNewOwnerModal(true)
	}

	const handleCloseSelectNewOwnerModal = () => {
		setShowSelectNewOwnerModal(false)
		setSelectedMember('')
	}

	const scrollToBottom = () => {
		setTimeout(() => {
			scrollRef.current
				?.getScrollElement()
				.scrollTo(0, scrollRef.current?.getScrollElement().scrollHeight)
		}, 0)
	}

	const handleGroupContextMenu = (event: React.MouseEvent, group: any) => {
		event.preventDefault()
		const userIsActive = !disabledGroups.has(group.id)

		if (!userIsActive) {
			MySwal.fire({
				title: 'Remove from Group?',
				text: 'You are not an active member of this group. Do you want to remove this group from your view?',
				icon: 'warning',
				showCancelButton: true,
				confirmButtonColor: '#3085d6',
				cancelButtonColor: '#d33',
				confirmButtonText: 'Yes, remove it!',
			}).then((result) => {
				if (result.isConfirmed) {
					const socket = SocketManager.getSocket()
					socket?.emit('deleteGroup', { groupId: group.id })
				}
			})
		}
	}

	const userChatOpen = (chat: any) => {
		setIsLoadingMessages(true)
		setChatBoxUsername(chat.name)
		setChatBoxUserStatus(chat.status)
		setCurrentRoomId(chat.roomId)
		setChatBoxUserImage(chat.image)
		setCurMessage('')
		setMembers([])

		const socket = SocketManager.getSocket()
		socket?.emit('fetchChatHistory', { userId: chat.roomId })
		socket?.emit('messageRead', { fromUserId: chat.roomId })

		setUnreadMessages((prev) => {
			const updated = new Map(prev)
			updated.delete(chat.roomId)
			return updated
		})
	}

	const groupChatOpen = async (group: any) => {
		setIsLoadingMessages(true)
		setChatBoxUsername(group.name)
		setCurrentRoomId(group.id)
		setChatBoxUserImage(group.image)
		setCurMessage('')

		const socket = SocketManager.getSocket()
		socket?.emit('fetchGroupChatHistory', { groupId: group.id })
		socket?.emit('messageRead', { groupId: group.id })

		setUnreadGroupMessages((prev) => {
			const updated = new Map(prev)
			updated.delete(group.id)
			return updated
		})
	}

	const addMessage = () => {
		const trimmedMessage = curMessage.trim()
		if (trimmedMessage !== '' || selectedImage !== null) {
			const socket = SocketManager.getSocket()
			const newMessage = {
				toUserId: currentRoomId,
				message: curMessage,
			}

			if (groups.some((group) => group.id === currentRoomId)) {
				socket?.emit('sendGroupMessage', {
					groupId: currentRoomId,
					message: curMessage,
				})
			} else {
				socket?.emit('sendMessage', newMessage)
			}
			setCurMessage('')
			setDisable(false)
			setSelectedImage(null)
			handleTyping({ target: { value: '' } })
			setIsCaptionTyping(false)
			scrollToBottom()
		}
	}

	const onKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter') {
			addMessage()
		}
	}

	const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
		const inputValue = e.target.value
		setCurMessage(inputValue)
		setDisable(inputValue.trim().length > 0)

		const isTyping = inputValue.trim().length > 0
		const socket = SocketManager.getSocket()

		if (isTyping) {
			if (groups.some((group) => group.id === currentRoomId)) {
				socket?.emit('startTyping', { groupId: currentRoomId })
			} else {
				socket?.emit('startTyping', { userId: currentRoomId })
			}
		}

		if (typingTimeout.current) {
			clearTimeout(typingTimeout.current)
		}

		// Set a new timer to trigger the stop typing event
		typingTimeout.current = setTimeout(() => {
			if (groups.some((group) => group.id === currentRoomId)) {
				socket?.emit('stopTyping', { groupId: currentRoomId })
			} else {
				socket?.emit('stopTyping', { userId: currentRoomId })
			}
		}, 500) // Set the timeout duration (e.g., 1 second)
	}

	const handleEmojiClick = (emojiObject: EmojiClickData) => {
		setCurMessage((prevMessage) => {
			const newMessage = prevMessage + emojiObject.emoji
			setDisable(newMessage.length > 0)
			handleTyping({
				target: { value: newMessage },
			} as React.ChangeEvent<HTMLInputElement>)
			return newMessage
		})
	}

	const uploadChatFile = async (
		file: any,
		tenantID: string
	): Promise<{
		fileUrl: string
		fileName: string
		fileType: string
		fileSize: number
	}> => {
		const formData = new FormData()
		formData.append('tenantID', tenantID)
		formData.append('uploadType', 'ChatMessageFiles')
		formData.append('chatFile', file)

		try {
			const response = await chatApi.uploadChatFile(formData)
			return {
				fileUrl: response.fileUrl,
				fileName: response.fileName,
				fileType: response.fileType,
				fileSize: response.fileSize,
			}
		} catch (error) {
			console.error('Error uploading chat file:', error)
			return
		}
	}

	const sendMessage = async (
		destinationId: string,
		caption: string,
		selectedFile: any,
		isGroupChat: boolean
	) => {
		const socket = SocketManager.getSocket()

		let fileInfo = {
			fileUrl: '',
			fileName: '',
			fileType: '',
			fileSize: 0,
		}

		if (chatFile) {
			try {
				fileInfo = await uploadChatFile(chatFile, user.tenantID)
			} catch (error) {
				return
			}
		}

		const newMessage = {
			message: caption,
			fileUrl: fileInfo.fileUrl,
			fileType: fileInfo.fileType,
			fileName: fileInfo.fileName,
			fileSize: fileInfo.fileSize,
			fromUserId: currentUser?.id,
		}

		if (isGroupChat) {
			newMessage.groupId = destinationId
			socket?.emit('sendGroupFileMessage', newMessage)
		} else {
			newMessage.toUserId = destinationId
			socket?.emit('sendFileMessage', newMessage)
		}
	}

	const handleCaptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const inputValue = e.target.value
		setCaption(inputValue)
		setIsCaptionTyping(true)
	}

	const handleSendFileMessage = () => {
		if (selectedFile) {
			sendMessage(currentRoomId, caption, selectedFile, isGroupChat)
			setSelectedFile(null)
			setCaption('')
			setIsCaptionTyping(false)
		}
	}

	const renderFilePreview = (fileData: any, isRight: boolean) => {
		if (!fileData) return null

		const iconColor = isRight ? '#ebebeb' : 'black'

		const formatFileSize = (size: number) => {
			if (size < 1024) return `${size} Bytes`
			else if (size < 1048576) return `${(size / 1024).toFixed(2)} KB`
			else return `${(size / 1048576).toFixed(2)} MB`
		}

		const fileSizeText = fileData.file_size
			? formatFileSize(fileData.file_size)
			: 'Unknown size'

		if (fileData.file_type === 'application/pdf') {
			return (
				<div className="pdf-preview-container d-flex flex-column justify-content-center align-items-center">
					<div className="pdf-file-icon">
						<i
							className="ri-file-pdf-line"
							style={{ fontSize: '3em', color: iconColor }}></i>
					</div>
					<div className="pdf-file-info text-center">
						<p className="mb-1">{fileData.file_name}</p>
						<p className="mb-1">{fileSizeText}, PDF Document</p>
					</div>
					<div className="pdf-file-actions">
						<a
							href={fileData.file_url}
							target="_blank"
							rel="noopener noreferrer"
							className="btn btn-primary btn-sm me-2">
							Open
						</a>
						<a
							href={fileData.file_url}
							download={fileData.file_name}
							className="btn btn-secondary btn-sm">
							Save as...
						</a>
					</div>
				</div>
			)
		} else if (fileData.file_type.startsWith('image/')) {
			return (
				<div className="image-preview-container">
					<Zoom>
						<img
							src={fileData.file_url}
							alt={fileData.file_name}
							className="react-medium-image-zoom"
							style={{ width: '100%', maxWidth: '300px' }} // Adjust the styles as needed
						/>
					</Zoom>
					<div className="image-file-actions mt-2">
						<a
							href={fileData.file_url}
							download={fileData.file_name}
							className="btn btn-secondary btn-sm">
							<i
								className="ri-download-line"
								style={{ marginRight: '5px' }}></i>
						</a>
					</div>
				</div>
			)
		} else if (fileData.file_type === 'application/x-zip-compressed') {
			return (
				<div className="zip-preview-container d-flex flex-column justify-content-center align-items-center">
					<div className="zip-file-icon">
						<i
							className="ri-file-zip-line"
							style={{ fontSize: '3em', color: iconColor }}></i>
					</div>
					<div className="zip-file-info text-center">
						<p className="mb-1">{fileData.file_name}</p>
						<p className="mb-1">{fileSizeText}, ZIP Archive</p>
					</div>
					<div className="zip-file-actions">
						<a
							href={fileData.file_url}
							target="_blank"
							rel="noopener noreferrer"
							className="btn btn-primary btn-sm me-2">
							Open
						</a>
						<a
							href={fileData.file_url}
							download={fileData.file_name}
							className="btn btn-secondary btn-sm">
							Save as...
						</a>
					</div>
				</div>
			)
		} else {
			return (
				<a href={fileData.file_url} download={fileData.file_name}>
					Download
				</a>
			)
		}
	}

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
				isGroupChat,
				showSelectNewOwnerModal,
				handleCloseSelectNewOwnerModal,
				selectedMember,
				setSelectedMember,
				userChatOpen,
				groupChatOpen,
				chatBoxUsername,
				chatBoxUserStatus,
				chatBoxUserImage,
				handleTyping,
				addMessage,
				handleEmojiClick,
				onKeyPress,
				curMessage,
				isDisable,
				handleCaptionChange,
				handleSendFileMessage,
				isCaptionTyping,
				caption,
				handleFileUpload,
				selectedFile,
				members,
				handleGroupContextMenu,
				typingUsers,
				renderFilePreview,
				fileInputRef,
				deleteSelfMessage,
				deleteMessageForMe,
				deleteMessageForEveryone,
				deleteGroupMessageForMe,
				deleteGroupMessageForEveryone,
				isTyping,
				emojiPickerRef,
				showEmojiPicker,
				setShowEmojiPicker,
				copyMsg,
				copyMsgAlert,
				openForwardModal,
				openGroupInfoModal,
				showCreateGroupModal,
				setShowCreateGroupModal,
				showAddUserModal,
				setShowAddUserModal,
				showGroupInfoModal,
				setShowGroupInfoModal,
				showForwardModal,
				setShowForwardModal,
				messageToForward,
				setMessageToForward,
			}}>
			{children}
		</ChatContext.Provider>
	)
}
