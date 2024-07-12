import React, { useEffect, useRef, useState, KeyboardEvent } from 'react'
import {
	Button,
	Card,
	CardBody,
	Col,
	Dropdown,
	DropdownItem,
	DropdownMenu,
	DropdownToggle,
	Input,
	Row,
	TabContent,
	TabPane,
	UncontrolledAlert,
	UncontrolledDropdown,
	Modal,
	ModalHeader,
	ModalBody,
	ListGroup,
	ListGroupItem,
	Nav,
	NavItem,
	NavLink,
	ModalFooter,
	FormGroup,
	Form,
	Label,
} from 'reactstrap'
import { Link, useNavigate } from 'react-router-dom'
import SimpleBar from 'simplebar-react'
import { PageBreadcrumb } from '@/components'
import './chat.css'
import SocketManager from '@/common/context/SocketManager'
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react'
import { useOutsideClick, useUser, useUserImage } from '@/hooks'
import classNames from 'classnames'
import avatar1 from '@/assets/images/users/avatar-1.jpg'
import { chatApi, useAuthContext } from '@/common'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import Zoom from 'react-medium-image-zoom'
import 'react-medium-image-zoom/dist/styles.css'

const MySwal = withReactContent(Swal)

const Chat: React.FC = () => {
	const { user } = useAuthContext()
	const navigate = useNavigate();
	const typingTimeout = useRef<NodeJS.Timeout | null>(null)
	const fileInputRef = useRef<HTMLInputElement>(null)
	const [singleButton, setSingleButton] = useState<boolean>(false)
	const [singleButton1, setSingleButton1] = useState<boolean>(false)
	const [singleButton2, setSingleButton2] = useState<boolean>(false)
	const [isDisable, setDisable] = useState<boolean>(false)
	const [isCaptionTyping, setIsCaptionTyping] = useState(false)
	const [curMessage, setCurMessage] = useState<string>('')
	const [caption, setCaption] = useState<string>('')
	const [copyMsgAlert, setCopyMsgAlert] = useState(false)
	const [currentRoomId, setCurrentRoomId] = useState<string>('')
	const [chatBoxUsername, setChatBoxUsername] = useState<string>('')
	const [chatBoxUserStatus, setChatBoxUserStatus] = useState<string>('')
	const [chatBoxUserImage, setChatBoxUserImage] = useState<string>('')
	const [selectedImage, setSelectedImage] = useState<string | null>(null)
	const [selectedFile, setSelectedFile] = useState<{
		type: 'image' | 'pdf'
		url: string
		name?: string
		size?: number
	} | null>(null)
	const [chatFile, setChatFile] = useState<any | null>(null)
	const [chats, setChats] = useState<any[]>([])
	const [messages, setMessages] = useState<any[]>([])
	const [members, setMembers] = useState<any[]>([])
	const [activeTab, setActiveTab] = useState<string>('1')
	const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false)
	const [searchTerm, setSearchTerm] = useState<string>('')
	const [isLoadingMessages, setIsLoadingMessages] = useState<boolean>(false)
	const [showForwardModal, setShowForwardModal] = useState<boolean>(false)
	const [messageToForward, setMessageToForward] = useState<any>(null)
	const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set())
	const [showCreateGroupModal, setShowCreateGroupModal] =
		useState<boolean>(false)
	const [showGroupInfoModal, setShowGroupInfoModal] = useState<boolean>(false)
	const [showAddUserModal, setShowAddUserModal] = useState<boolean>(false)
	const [groupName, setGroupName] = useState<string>('')
	const [groups, setGroups] = useState<any[]>([])
	const [typingUsers, setTypingUsers] = useState<any[]>([])
	const [isTyping, setIsTyping] = useState<boolean>(false)
	const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
	const [deleteConfirmationData, setDeleteConfirmationData] = useState<{
		groupId: string
		userId: string
	} | null>(null)
	const scrollRef = useRef<SimpleBar>(null)
	const emojiPickerRef = useRef<HTMLDivElement>(null)
	const [currentUser] = useUser()
	const fetchUserImage = useUserImage()

	const [disabledGroups, setDisabledGroups] = useState<Map<string, boolean>>(
		new Map()
	)

	const [showDeleteGroupModal, setShowDeleteGroupModal] =
		useState<boolean>(false)
	const [groupToDelete, setGroupToDelete] = useState<any>(null)
	const [groupImage, setGroupImage] = useState<any | null>(null)

	const [showSelectNewOwnerModal, setShowSelectNewOwnerModal] =
		useState<boolean>(false)
	const [selectedMember, setSelectedMember] = useState<string>('')
	const [unreadMessages, setUnreadMessages] = useState<Map<string, number>>(
		new Map()
	)
	const [unreadGroupMessages, setUnreadGroupMessages] = useState<
		Map<string, number>
	>(new Map())

	const handleGroupImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (file) {
			setGroupImage(file)
		}
	}

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

	const handleCloseCreateGroupModal = () => {
		setShowCreateGroupModal(false)
		setGroupName('')
		setSelectedUsers(new Set())
		setGroupImage(null)
	}

	useOutsideClick(emojiPickerRef, () => setShowEmojiPicker(false))

	useEffect(() => {
		const socket = SocketManager.getSocket()
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
					const imageUrl = await fetchGroupImage(group.id)
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

		socket?.on(
			'unreadMessagesCount',
			({ unreadMessagesMap, unreadGroupMessagesMap }) => {
				setUnreadMessages(new Map(Object.entries(unreadMessagesMap)))
				setUnreadGroupMessages(new Map(Object.entries(unreadGroupMessagesMap)))
			}
		)

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
							isGroupMessage: true, // Specify it's a group message
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

		socket?.on('groupCreated', async (newGroup: any) => {
			const imageUrl = await fetchGroupImage(newGroup.id)
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
			const imageUrl = await fetchGroupImage(groupDetails.id)
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

		socket?.on('confirmDeleteLastUser', ({ groupId, userId, message }) => {
			setDeleteConfirmationData({ groupId, userId })
			setShowDeleteConfirmation(true)
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

		socket?.on('groupDisabled', ({ groupId, removedByAdmin }) => {
			setDisabledGroups((prev) => {
				const newSet = new Map(prev)
				newSet.set(groupId, removedByAdmin)
				return newSet
			})
		})

		socket?.on('groupDeletedForUser', ({ groupId }) => {
			setGroups((prevGroups) =>
				prevGroups.filter((group) => group.id !== groupId)
			)
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

		socket?.on('userRemovedNotification', (notificationMessage: any) => {
			setMessages((prevMessages) => [...prevMessages, notificationMessage])
			scrollToBottom()
		})

		socket?.on('userRejoinedNotification', (notificationMessage: any) => {
			setMessages((prevMessages) => [...prevMessages, notificationMessage])
			scrollToBottom()
		})

		return () => {
			socket?.off('initialUsers')
			socket?.off('initialGroups')
			socket?.off('userStatusUpdated')
			socket?.off('chatHistory')
			socket?.off('groupChatHistory')
			socket?.off('unreadMessagesCount')
			socket?.off('receiveMessage')
			socket?.off('messageRead')
			socket?.off('receiveGroupMessage')
			socket?.off('groupCreated')
			socket?.off('groupDeleted')
			socket?.off('userAddedToGroup')
			socket?.off('groupReenabled')
			socket?.off('userRemovedFromGroup')
			socket?.off('typing')
			socket?.off('stopTyping')
			socket?.off('confirmDeleteLastUser')
			socket?.off('promptSelectNewOwner')
			socket?.off('groupOwnershipTransferred')
			socket?.off('groupDisabled')
			socket?.off('groupDeletedForUser')
			socket?.off('groupMessageDeletedForEveryone')
			socket?.off('messageDeletedForSelf')
			socket?.off('groupMessageDeletedForMe')
			socket?.off('userRemovedNotification')
			socket?.off('userRejoinedNotification')
		}
	}, [currentRoomId])

	const handleConfirmDeleteGroup = (confirmed: boolean) => {
		const socket = SocketManager.getSocket()
		if (deleteConfirmationData) {
			socket?.emit('confirmDeleteGroup', {
				groupId: deleteConfirmationData.groupId,
				userId: deleteConfirmationData.userId,
				confirmed,
			})
			setShowDeleteConfirmation(false)
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
		setDisable(inputValue.length > 0)

		const isTyping = inputValue.length > 0
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

	const handleCaptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setCaption(e.target.value)
		setDisable(e.target.value.length > 0)
		setIsCaptionTyping(true)
	}

	const addMessage = () => {
		if (curMessage !== '' || selectedImage !== null) {
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

	const sendFileMessage = async (
		toUserId: string,
		caption: string,
		fileData: any
	) => {
		const socket = SocketManager.getSocket()
		let fileInfo: { fileUrl: string; fileName: string; fileType: string } = {
			fileUrl: '',
			fileName: '',
			fileType: '',
		}

		if (chatFile) {
			const formData = new FormData()
			formData.append('tenantID', user.tenantID)
			formData.append('uploadType', 'ChatMessageFiles')
			formData.append('chatFile', chatFile)
			try {
				const response = await chatApi.uploadChatFile(formData)
				fileInfo = {
					fileUrl: response.fileUrl,
					fileName: response.fileName,
					fileType: response.fileType,
				}
			} catch (error) {
				console.error('Error uploading chat file:', error)
				return
			}
		}

		const newMessage = {
			toUserId,
			message: caption,
			fileUrl: fileInfo.fileUrl,
			fileType: fileInfo.fileType,
			fileName: fileInfo.fileName,
			fromUserId: currentUser?.id,
		}
		socket?.emit('sendFileMessage', newMessage)
	}

	const sendGroupFileMessage = async (
		groupId: string,
		caption: string,
		fileData: any
	) => {
		const socket = SocketManager.getSocket()
		let fileInfo: { fileUrl: string; fileName: string; fileType: string } = {
			fileUrl: '',
			fileName: '',
			fileType: '',
		}

		if (chatFile) {
			const formData = new FormData()
			formData.append('tenantID', user.tenantID)
			formData.append('uploadType', 'ChatMessageFiles')
			formData.append('chatFile', chatFile)
			try {
				const response = await chatApi.uploadChatFile(formData)
				fileInfo = {
					fileUrl: response.fileUrl,
					fileName: response.fileName,
					fileType: response.fileType,
				}
			} catch (error) {
				console.error('Error uploading chat file:', error)
				return
			}
		}

		const newMessage = {
			groupId,
			message: caption,
			fileUrl: fileInfo.fileUrl,
			fileType: fileInfo.fileType,
			fileName: fileInfo.fileName,
			fromUserId: currentUser?.id,
		}

		socket?.emit('sendGroupFileMessage', newMessage)
	}

	const handleSendFileMessage = () => {
		if (selectedFile) {
			if (isGroupChat) {
				sendGroupFileMessage(currentRoomId, caption, selectedFile)
			} else {
				sendFileMessage(currentRoomId, caption, selectedFile)
			}
		}
		setSelectedFile(null)
		setCaption('')
		setIsCaptionTyping(false)
	}

	const openForwardModal = (message: any) => {
		setMessageToForward(message)
		setShowForwardModal(true)
	}

	const closeForwardModal = () => {
		setShowForwardModal(false)
		setMessageToForward(null)
		setSelectedUsers(new Set())
	}

	const forwardMessage = () => {
		const socket = SocketManager.getSocket()
		socket?.emit('forwardMessage', {
			messageId: messageToForward.id,
			toUserIds: Array.from(selectedUsers),
		})
		closeForwardModal()
	}

	const closeAddRemoveUserModal = () => {
		setShowAddUserModal(false)
		setSelectedUsers(new Set())
	}

	const toggleTab = (tab: string) => {
		if (activeTab !== tab) {
			setActiveTab(tab)
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
		const groupImage = await fetchGroupImage(group.id)
		setIsLoadingMessages(true)
		setChatBoxUsername(group.name)
		setCurrentRoomId(group.id)
		setChatBoxUserImage(groupImage)
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

	const openGroupInfoModal = () => {
		setShowGroupInfoModal(true)
	}

	const copyMsg = (ele: HTMLElement) => {
		try {
			const conversationList = ele.closest('.conversation-list')
			if (!conversationList) {
				throw new Error('Conversation list element not found')
			}

			const messageElement = conversationList.querySelector('p')
			if (!messageElement) {
				throw new Error('Message element not found')
			}

			const copyText = messageElement.innerHTML
			if (!copyText) {
				throw new Error('No text to copy')
			}
			navigator.clipboard
				.writeText(copyText)
				.then(() => {
					setCopyMsgAlert(true)

					setTimeout(() => {
						setCopyMsgAlert(false)
					}, 1000)
				})
				.catch((err) => {
					console.error('Failed to copy text: ', err)
				})
		} catch (err) {
			console.error('Error in copyMsg function: ', err)
		}
	}

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

	const scrollToBottom = () => {
		setTimeout(() => {
			scrollRef.current
				?.getScrollElement()
				.scrollTo(0, scrollRef.current?.getScrollElement().scrollHeight)
		}, 0)
	}

	const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearchTerm(e.target.value)
	}

	const handleUserSelect = (userId: string) => {
		setSelectedUsers((prevSelected) => {
			const newSelected = new Set(prevSelected)
			if (newSelected.has(userId)) {
				newSelected.delete(userId)
			} else {
				newSelected.add(userId)
			}
			return newSelected
		})
	}

	const handleCreateGroup = async () => {
		const socket = SocketManager.getSocket()
		let imageUrl = ''

		if (groupImage) {
			const formData = new FormData()
			formData.append('tenantID', user.tenantID)
			formData.append('uploadType', 'ChatGroupImages')
			formData.append('groupImage', groupImage)

			try {
				const response = await chatApi.uploadGroupImage(formData)
				imageUrl = response.imageUrl
			} catch (error) {
				console.error('Error uploading image:', error)
				return
			}
		}

		const userIds = Array.from(selectedUsers)
		userIds.push(currentUser?.id as string)

		socket?.emit('createGroup', {
			tenantID: user.tenantID,
			groupName,
			userIds,
			image: imageUrl,
		})
		handleCloseCreateGroupModal()
	}

	const handleGroupContextMenu = (event: React.MouseEvent, group: any) => {
		event.preventDefault()

		const userIsActive = !disabledGroups.has(group.id)
		const isGroupCreator = group.creator_id === currentUser?.id

		if (isGroupCreator) {
			setGroupToDelete(group)
			setShowDeleteGroupModal(true)
		} else if (!userIsActive) {
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

	const handleDeleteGroup = () => {
		if (groupToDelete) {
			const socket = SocketManager.getSocket()
			socket?.emit('deleteGroup', { groupId: groupToDelete.id })
			setShowDeleteGroupModal(false)
			setGroupToDelete(null)
		}
	}

	const addUserToGroup = async (groupId: string, userId: string) => {
		const socket = SocketManager.getSocket()
		socket?.emit('addUserToGroup', { groupId, userId })
	}

	const removeUserFromGroup = async (groupId: string, userId: string) => {
		const socket = SocketManager.getSocket()
		socket?.emit('removeUserFromGroup', { groupId, userId })
	}

	const handleOpenSelectNewOwnerModal = () => {
		setShowSelectNewOwnerModal(true)
	}

	const leaveGroup = async (groupId: string) => {
		const result = await MySwal.fire({
			title: 'Are you sure?',
			text: 'Are you sure you want to leave this group?',
			icon: 'warning',
			showCancelButton: true,
			confirmButtonColor: '#3085d6',
			cancelButtonColor: '#d33',
			confirmButtonText: 'Yes, leave it!',
		})

		if (result.isConfirmed) {
			const socket = SocketManager.getSocket()
			socket?.emit('leaveGroup', { groupId })
			setShowGroupInfoModal(false)
		}
	}

	const renderLeaveGroupButton = () => {
		if (
			isGroupChat &&
			members.some((member) => member.id === currentUser?.id)
		) {
			return (
				<Button color="danger" onClick={() => leaveGroup(currentRoomId)}>
					Leave Group
				</Button>
			)
		}
	}

	const renderAddRemoveUserOptions = () => {
		if (
			isGroupChat &&
			currentUser?.id ===
				groups.find((group) => group.id === currentRoomId)?.creator_id
		) {
			return (
				<Button
					color="primary"
					onClick={() => setShowAddUserModal(true)}
					className="ms-2">
					Add or Remove User
				</Button>
			)
		}
	}

	const handleCloseSelectNewOwnerModal = () => {
		setShowSelectNewOwnerModal(false)
		setSelectedMember('')
	}

	const handleSelectNewOwner = (id: string) => {
		setSelectedMember(id)
	}

	const handleConfirmNewOwner = () => {
		const socket = SocketManager.getSocket()
		if (selectedMember) {
			socket?.emit('transferGroupOwnership', {
				groupId: currentRoomId,
				newOwnerId: selectedMember,
			})
			handleCloseSelectNewOwnerModal()
		}
	}

	const deleteGroupMessageForEveryone = (
		messageId: string,
		groupId: string
	) => {
		const socket = SocketManager.getSocket()
		socket?.emit('deleteGroupMessageForEveryone', { messageId, groupId })
	}

	const deleteGroupMessageForMe = (messageId: string, groupId: string) => {
		const socket = SocketManager.getSocket()
		socket?.emit('deleteGroupMessageForMe', { messageId, groupId })
	}

	const deleteMessageForEveryone = (messageId: string, userId: string) => {
		const socket = SocketManager.getSocket()
		socket?.emit('deleteMessageForEveryone', { messageId, userId })
	}

	const deleteMessageForMe = (messageId: string) => {
		const socket = SocketManager.getSocket()
		socket?.emit('deleteMessageForMe', { messageId })
	}

	const deleteSelfMessage = (messageId: string) => {
		const socket = SocketManager.getSocket()
		socket?.emit('deleteSelfMessage', { messageId })
	}

	const renderSelectNewOwnerModal = () => {
		const filteredMembers = members.filter(
			(member) => member.id !== currentUser?.id
		)

		return (
			<Modal
				isOpen={showSelectNewOwnerModal}
				toggle={handleCloseSelectNewOwnerModal}>
				<ModalHeader toggle={handleCloseSelectNewOwnerModal}>
					Select New Group Owner
				</ModalHeader>
				<ModalBody>
					<ListGroup>
						{filteredMembers.map((member) => (
							<ListGroupItem
								key={member.id}
								onClick={() => handleSelectNewOwner(member.id)}
								className={`d-flex align-items-center ${selectedMember === member.id ? 'bg-light' : ''}`}
								style={{ cursor: 'pointer', userSelect: 'none' }}>
								<input
									type="checkbox"
									checked={selectedMember === member.id}
									onChange={() => handleSelectNewOwner(member.id)}
									className="me-3"
									onClick={(e) => e.stopPropagation()}
									style={{ userSelect: 'none' }}
								/>
								<img
									src={member.profileImage}
									className="rounded-circle me-3"
									alt=""
									style={{
										height: '2.6rem',
										width: '2.6rem',
										userSelect: 'none',
									}}
								/>
								<div>
									<h5
										className="mb-0"
										style={{
											userSelect: 'none',
										}}>{`${member.firstname} ${member.lastname}`}</h5>
									<p
										className="text-muted mb-0"
										style={{
											userSelect: 'none',
										}}>
										{member.online
											? 'Online'
											: `Last seen at ${new Date(
													member.last_active
												).toLocaleTimeString([], {
													hour: '2-digit',
													minute: '2-digit',
												})}`}
									</p>
								</div>
							</ListGroupItem>
						))}
					</ListGroup>
				</ModalBody>
				<ModalFooter>
					<Button color="secondary" onClick={handleCloseSelectNewOwnerModal}>
						Cancel
					</Button>
					<Button color="primary" onClick={handleConfirmNewOwner}>
						Confirm
					</Button>
				</ModalFooter>
			</Modal>
		)
	}

	const filteredChats = chats.filter((chat) =>
		chat.name.toLowerCase().includes(searchTerm.toLowerCase())
	)
	const filteredGroups = groups.filter((group) =>
		group.name.toLowerCase().includes(searchTerm.toLowerCase())
	)

	const isGroupChat = groups.some((group) => group.id === currentRoomId)

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

	const renderFilePreview = (fileData: any, isRight: boolean) => {
		if (!fileData) return null
	
		const iconColor = isRight ? '#ebebeb' : 'black'
	
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
						<p className="mb-1">
							{(fileData.file_size / 1024).toFixed(2)} KB, PDF Document
						</p>
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
							<i className="ri-download-line" style={{ marginRight: '5px' }}></i>
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

	const handleProfile = ()=>{
		navigate("/pages/Profile")
	}

	return (
		<>
			<PageBreadcrumb title="Chat" subName="Chat" />
			<div className="d-lg-flex">
				<Card className="chat-leftsidebar">
					<CardBody className="profileStyles">
						<div className="text-center bg-light rounded px-4 py-3">
							<div className="text-end">
								<Dropdown
									className="chat-noti-dropdown"
									isOpen={singleButton}
									toggle={() => setSingleButton(!singleButton)}>
									<DropdownToggle tag="a" className="p-0">
										<i className="ri-settings-3-line"></i>
									</DropdownToggle>
									<DropdownMenu>
										<DropdownItem onClick={handleProfile}>Profile</DropdownItem>
										{/* <DropdownItem>Edit</DropdownItem>
										<DropdownItem>Add Contact</DropdownItem>
										<DropdownItem>Setting</DropdownItem> */}
									</DropdownMenu>
								</Dropdown>
							</div>
							{currentUser && (
								<div className="chat-user-status">
									<img
										src={currentUser.imageUrl}
										className="avatar-md rounded-circle"
										alt=""
									/>
									<div className="">
										<div className="status"></div>
									</div>
									<h5 className="font-size-16 mb-1 mt-3">
										<Link to="#" className="text-reset">
											{`${currentUser.firstname} ${currentUser.lastname}`}
										</Link>
									</h5>
									<p className="text-muted mb-0">
										{currentUser.online ? 'Available' : 'Offline'}
									</p>
								</div>
							)}
						</div>
					</CardBody>
					<div className="px-3">
						<div className="search-box position-relative">
							<Input
								type="text"
								className="form-control rounded border"
								placeholder="Search..."
								value={searchTerm}
								onChange={handleSearchChange}
							/>
							<i className="ri-search-line search-icon"></i>
						</div>
						<Button
							color="primary"
							className="w-100 mt-2"
							onClick={() => setShowCreateGroupModal(true)}>
							Create Group
						</Button>
					</div>

					<div className="chat-leftsidebar-nav">
						<Nav pills justified className="bg-light m-3 rounded">
							<NavItem className="nav-item-hover">
								<NavLink
									className={classNames({
										active: activeTab === '1',
									})}
									onClick={() => {
										toggleTab('1')
									}}>
									<i className="bx bx-chat font-size-20 d-sm-none"></i>
									<span className="d-sm-block">Chat</span>
								</NavLink>
							</NavItem>
							<NavItem className="nav-item-hover">
								<NavLink
									className={classNames({
										active: activeTab === '2',
									})}
									onClick={() => {
										toggleTab('2')
									}}>
									<i className="bx bx-group font-size-20 d-sm-none"></i>
									<span className="d-sm-block">Groups</span>
								</NavLink>
							</NavItem>
						</Nav>
						<TabContent activeTab={activeTab}>
							<TabPane tabId="1">
								<SimpleBar className="chat-message-list">
									<div>
										<div className="px-3">
											<h5 className="font-size-14">Recent</h5>
											<ul className="list-unstyled chat-list px-1">
												{filteredChats.map((chat) => (
													<li
														key={chat.id + chat.status}
														className={
															currentRoomId === chat.roomId ? 'active' : ''
														}>
														<Link
															to="#"
															onClick={() => {
																userChatOpen(chat)
															}}>
															<div className="d-flex align-items-center">
																<div
																	className={`flex-shrink-0 user-img ${chat.status} align-self-center me-3`}>
																	<img
																		src={chat.image}
																		className="rounded-circle"
																		style={{
																			height: '2.6rem',
																			width: '2.6rem',
																		}}
																		alt=""
																	/>
																	<span className="user-status"></span>
																</div>

																<div className="flex-grow-1 overflow-hidden">
																	<h5 className="text-truncate font-size-15 mb-0">
																		{chat.name}
																	</h5>
																	<p className="text-muted mb-0 mt-1 text-truncate">
																		{chat.description}
																	</p>
																</div>
																<div className="flex-shrink-0 ms-3">
																	{unreadMessages.get(chat.roomId) > 0 && (
																		<span
																			className="badge bg-danger"
																			style={{
																				paddingRight: '.6em',
																				paddingLeft: '.6em',
																			}}>
																			{unreadMessages.get(chat.roomId)}
																		</span>
																	)}
																</div>
															</div>
														</Link>
													</li>
												))}
											</ul>
										</div>
									</div>
								</SimpleBar>
							</TabPane>

							<TabPane tabId="2">
								<SimpleBar className="chat-message-list">
									<div>
										<div className="px-3">
											<h5 className="font-size-14">Groups</h5>
											<ul className="list-unstyled chat-list px-1">
												{groups &&
													filteredGroups.map((group) => (
														<li
															key={group.id}
															className={
																currentRoomId === group.id ? 'active' : ''
															}
															onContextMenu={(event) =>
																handleGroupContextMenu(event, group)
															}>
															<Link
																to="#"
																onClick={() => {
																	groupChatOpen(group)
																}}>
																<div className="d-flex align-items-center">
																	<div
																		className={`flex-shrink-0 user-img  align-self-center me-3`}>
																		<img
																			src={group.image}
																			className="rounded-circle"
																			style={{
																				height: '2.6rem',
																				width: '2.6rem',
																			}}
																			alt=""
																		/>
																	</div>

																	<div className="flex-grow-1">
																		<h5 className="font-size-13 mb-0">
																			{group.name}
																		</h5>
																	</div>

																	<div className="flex-shrink-0 ms-3">
																		{unreadGroupMessages.get(group.id) > 0 && (
																			<span
																				className="badge bg-danger"
																				style={{
																					paddingRight: '.6em',
																					paddingLeft: '.6em',
																				}}>
																				{unreadGroupMessages.get(group.id)}
																			</span>
																		)}
																	</div>
																</div>
															</Link>
														</li>
													))}
											</ul>
										</div>
									</div>
								</SimpleBar>
							</TabPane>
						</TabContent>
					</div>
				</Card>

				<div className="w-100 user-chat mt-4 mt-sm-0 ms-lg-3">
					<Card className="chat-window mb-">
						{currentRoomId ? (
							<>
								<div className="p-3 px-lg-4 border-bottom">
									<Row>
										<Col xl={4} className="col-7">
											<div className="d-flex align-items-center">
												<div
													className={`flex-shrink-0 me-3 d-sm-block d-none ${
														isGroupChat ? 'cursor-pointer' : ''
													}`}
													style={{
														height: '2.6rem',
														width: '2.6rem',
													}}
													onClick={isGroupChat ? openGroupInfoModal : undefined} // Add onClick handler
												>
													<img
														src={chatBoxUserImage}
														alt=""
														className="img-fluid d-block rounded-circle"
														style={{
															height: '2.6rem',
															width: '2.6rem',
														}}
													/>
												</div>
												<div
													className={`flex-grow-1 ${
														isGroupChat ? 'cursor-pointer' : ''
													}`}
													onClick={
														isGroupChat ? openGroupInfoModal : undefined
													}>
													<h5 className="font-size-16 mb-1 text-truncate">
														<Link to="#" className="text-reset">
															{chatBoxUsername}
														</Link>
													</h5>
													<p className="text-muted text-truncate mb-0">
														{isGroupChat ? 'Users' : chatBoxUserStatus}
													</p>
												</div>
											</div>
										</Col>
										<Col xl={8} className="col-5">
											<ul className="list-inline user-chat-nav text-end mb-0">
												<li className="list-inline-item">
													<Dropdown
														isOpen={singleButton1}
														toggle={() => setSingleButton1(!singleButton1)}>
														<DropdownToggle className="btn nav-btn" tag="a">
															<i className="ri-search-line"></i>
														</DropdownToggle>
														<DropdownMenu className="dropdown-menu-end dropdown-menu-md p-2">
															<form className="px-2">
																<div>
																	<input
																		type="text"
																		className="form-control border bg-light-subtle"
																		placeholder="Search..."
																	/>
																</div>
															</form>
														</DropdownMenu>
													</Dropdown>
												</li>

												<li className="list-inline-item">
													<Dropdown
														isOpen={singleButton2}
														toggle={() => setSingleButton2(!singleButton2)}>
														<DropdownToggle className="btn nav-btn" tag="a">
															<i className="ri-more-2-fill"></i>
														</DropdownToggle>
														<DropdownMenu className="dropdown-menu-end">
															<DropdownItem>Profile</DropdownItem>
															<DropdownItem>Archive</DropdownItem>
															<DropdownItem>Muted</DropdownItem>
															<DropdownItem>Delete</DropdownItem>
														</DropdownMenu>
													</Dropdown>
												</li>
											</ul>
										</Col>
									</Row>
								</div>

								<SimpleBar ref={scrollRef} className="chat-conversation p-4">
									{isLoadingMessages ? (
										<Spinners />
									) : (
										<>
											<ul className="list-unstyled mb-0">
												{messages.map((msg, index) => {
													if (msg.system) {
														return (
															<li key={index} className="system-message">
																<div className="d-flex justify-content-center">
																	<p className="text-muted mb-2">
																		{msg.message}
																	</p>
																</div>
															</li>
														)
													}

													if (msg.deletedForMe) {
														return (
															<li
																key={index}
																className={
																	msg.fromUserId === currentRoomId
																		? ''
																		: 'right'
																}>
																<div className="conversation-list">
																	<div className="d-flex">
																		<div className="flex-1 ms-3">
																			<div className="d-flex justify-content-between">
																				<h5 className="font-size-16 conversation-name align-middle">
																					Message deleted
																				</h5>
																			</div>
																		</div>
																	</div>
																</div>
															</li>
														)
													}

													const isSentByCurrentUser =
														msg.fromUserId === currentUser?.id

													const isMessageToSelf =
														msg.fromUserId === msg.toUserId

													return (
														<li
															key={index}
															className={
																msg.fromUserId === currentUser?.id ||
																msg.isSentByCurrentUser
																	? 'right'
																	: ''
															}>
															<div className="conversation-list">
																<div className="d-flex">
																	{msg.images && (
																		<img
																			src={msg.images}
																			className="rounded-circle avatar"
																			alt=""
																		/>
																	)}
																	<div className="flex-1 ms-3">
																		<div className="d-flex justify-content-between">
																			<h5 className="font-size-16 conversation-name align-middle">
																				{msg.group_id
																					? isSentByCurrentUser ||
																						msg.isSentByCurrentUser
																						? 'You'
																						: msg.user
																							? `${msg.user.firstname} ${msg.user.lastname}`
																							: 'Unknown'
																					: msg.fromUserId !== currentRoomId
																						? 'You'
																						: chatBoxUsername}
																			</h5>
																			{msg.timestamp && (
																				<span className="time fw-normal text-muted me-0 me-md-4">
																					{new Date(
																						msg.timestamp
																					).toLocaleTimeString([], {
																						hour: '2-digit',
																						minute: '2-digit',
																					})}
																				</span>
																			)}
																		</div>
																		<div className="ctext-wrap">
																			<div className="ctext-wrap-content">
																				<p className="mb-0">{msg.message}</p>
																				{msg.file_url && (
																					<div>
																						{renderFilePreview(
																							msg,
																							msg.fromUserId === currentUser?.id
																						)}
																					</div>
																				)}
																			</div>
																			<UncontrolledDropdown className="align-self-start">
																				<DropdownToggle tag="a">
																					<i className="ri-more-2-fill"></i>
																				</DropdownToggle>
																				<DropdownMenu>
																					<DropdownItem
																						onClick={(e) =>
																							copyMsg(e.target as HTMLElement)
																						}>
																						Copy
																					</DropdownItem>
																					<DropdownItem>Save</DropdownItem>
																					<DropdownItem
																						onClick={() =>
																							openForwardModal(msg)
																						}>
																						Forward
																					</DropdownItem>
																					{isMessageToSelf && !isGroupChat ? (
																						<DropdownItem
																							onClick={() =>
																								deleteSelfMessage(msg.id)
																							}>
																							Delete
																						</DropdownItem>
																					) : isGroupChat ? (
																						<>
																							{(isSentByCurrentUser ||
																								msg.isSentByCurrentUser) && (
																								<DropdownItem
																									onClick={() =>
																										deleteGroupMessageForEveryone(
																											msg.id,
																											currentRoomId
																										)
																									}>
																									Delete for Everyone
																								</DropdownItem>
																							)}
																							<DropdownItem
																								onClick={() =>
																									deleteGroupMessageForMe(
																										msg.id,
																										currentRoomId
																									)
																								}>
																								Delete for Me
																							</DropdownItem>
																						</>
																					) : isSentByCurrentUser ? (
																						<>
																							<DropdownItem
																								onClick={() =>
																									deleteMessageForEveryone(
																										msg.id,
																										currentRoomId
																									)
																								}>
																								Delete for Everyone
																							</DropdownItem>
																							<DropdownItem
																								onClick={() =>
																									deleteMessageForMe(msg.id)
																								}>
																								Delete for Me
																							</DropdownItem>
																						</>
																					) : (
																						<DropdownItem
																							onClick={() =>
																								deleteMessageForMe(msg.id)
																							}>
																							Delete for Me
																						</DropdownItem>
																					)}
																				</DropdownMenu>
																			</UncontrolledDropdown>
																		</div>
																	</div>
																</div>
															</div>
														</li>
													)
												})}
											</ul>
										</>
									)}
								</SimpleBar>
								{isTyping && (
									<div className="chat-wrap-content typing-indicator">
										{isGroupChat ? (
											typingUsers.map((user) => (
												<div key={user.id} className="typing-user">
													{user.firstname} {user.lastname} is typing
													<div className="typing-dots">
														<span></span>
														<span></span>
														<span></span>
													</div>
												</div>
											))
										) : (
											<div className="typing-dots">
												<span></span>
												<span></span>
												<span></span>
											</div>
										)}
									</div>
								)}
								{copyMsgAlert && (
									<UncontrolledAlert color="warning" dismissible role="alert">
										Message copied
									</UncontrolledAlert>
								)}
								<div className="p-3 border-top">
									{disabledGroups.has(currentRoomId) ? (
										<div className="text-center text-muted">
											<p>
												{disabledGroups.get(currentRoomId)
													? 'You have been removed from this group by an admin. You cannot send messages.'
													: 'You cannot send messages to this group because you are no longer a member.'}
											</p>
										</div>
									) : (
										<>
											<div className="row">
												<div className="col input-container">
													<input
														type="text"
														value={curMessage}
														onKeyPress={onKeyPress}
														onChange={handleTyping}
														className="form-control border chat-input"
														placeholder="Enter Message..."
													/>
													<Button
														type="button"
														color="link"
														className="emoji-btn"
														onClick={() =>
															setShowEmojiPicker(!showEmojiPicker)
														}>
														😊
													</Button>
													{showEmojiPicker && (
														<div
															className="emoji-picker position-absolute"
															ref={emojiPickerRef}>
															<EmojiPicker onEmojiClick={handleEmojiClick} />
														</div>
													)}
												</div>
												<div className="col-auto d-flex align-items-center">
													<Button
														type="button"
														color="link"
														className="file-btn"
														onClick={() => {
															const fileInput = fileInputRef.current
															if (fileInput) {
																fileInput.click()
															}
														}}>
														<i
															className="ri-attachment-line"
															style={{ fontSize: '1.2em' }}></i>
													</Button>
													<input
														type="file"
														id="fileInput"
														ref={fileInputRef}
														style={{ display: 'none' }}
														onChange={handleFileUpload}
													/>
													<Button
														type="button"
														color="primary"
														disabled={!isDisable || isCaptionTyping}
														onClick={addMessage}
														className="chat-send w-md waves-effect waves-light">
														<span className="d-none d-sm-inline-block me-2">
															Send
														</span>
														<i className="mdi mdi-send float-end"></i>
													</Button>
												</div>
											</div>
											{selectedFile && selectedFile.type === 'image' && (
												<div
													id="selected-file-container"
													className="mt-3"
													style={{
														position: 'absolute',
														bottom: '95px',
														right: '15px',
														width: '300px',
														maxHeight: '300px',
														backgroundColor: '#f8f9fa',
														padding: '10px',
														borderRadius: '10px',
														boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
													}}>
													<img
														src={selectedFile.url}
														alt="Selected"
														className="img-fluid rounded"
														style={{
															width: '100%',
															height: 'auto',
														}}
													/>
													<div className="d-flex align-items-center justify-content-center mt-2">
														<input
															type="text"
															className="form-control"
															placeholder="Caption (optional)"
															value={caption}
															onChange={handleCaptionChange}
															onKeyPress={(e) => {
																if (e.key === 'Enter') {
																	handleSendFileMessage()
																}
															}}
														/>
														<Button
															type="button"
															color="primary"
															disabled={!caption}
															onClick={handleSendFileMessage}
															className="chat-send w-md waves-effect waves-light">
															<i className="mdi mdi-send float-end" />
														</Button>
													</div>
												</div>
											)}

											{selectedFile && selectedFile.type === 'pdf' && (
												<div
													id="selected-file-container"
													className="mt-3 text-center pdf-preview"
													style={{
														position: 'absolute',
														bottom: '95px',
														right: '15px',
														width: '300px',
														maxHeight: '300px',
														backgroundColor: '#f8f9fa',
														padding: '10px',
														borderRadius: '10px',
														boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
													}}>
													<div className="pdf-file-icon">
														<i
															className="ri-file-pdf-line"
															style={{ fontSize: '3em', color: '#d9534f' }}></i>
													</div>
													<div className="pdf-file-info">
														<p className="mb-1">{selectedFile.name}</p>
														<p className="mb-1">
															{(selectedFile.size / 1024).toFixed(2)} KB, PDF
															Document
														</p>
													</div>
													<div className="d-flex align-items-center mt-2">
														<input
															type="text"
															className="form-control"
															placeholder="Caption (optional)"
															value={caption}
															onChange={handleCaptionChange}
															onKeyPress={(e) => {
																if (e.key === 'Enter') {
																	handleSendFileMessage()
																}
															}}
														/>
														<Button
															type="button"
															color="primary"
															disabled={!caption}
															onClick={handleSendFileMessage}
															className="waves-effect waves-light">
															<i className="mdi mdi-send" />
														</Button>
													</div>
												</div>
											)}
										</>
									)}
								</div>
							</>
						) : (
							<div className="chat-window no-chat-selected text-center my-auto p-5">
								<h5 className="text-muted">Select a user to start chatting</h5>
							</div>
						)}
					</Card>
				</div>
			</div>
			<Modal isOpen={showForwardModal} toggle={closeForwardModal}>
				<ModalHeader toggle={closeForwardModal}>Forward Message</ModalHeader>
				<ModalBody>
					<ListGroup style={{ userSelect: 'none' }}>
						{chats.map((chat) => (
							<ListGroupItem
								key={chat.id}
								onClick={() => handleUserSelect(chat.id)}
								style={{ cursor: 'pointer' }}>
								<div className="d-flex align-items-center">
									<input
										type="checkbox"
										checked={selectedUsers.has(chat.id)}
										onChange={() => handleUserSelect(chat.id)}
										onClick={(e) => e.stopPropagation()}
										className="me-2"
										style={{ cursor: 'pointer' }}
									/>
									<img
										src={chat.image}
										className="rounded-circle me-3"
										alt=""
										style={{
											height: '2.6rem',
											width: '2.6rem',
										}}
									/>
									<div>
										<h5 className="mb-0">{chat.name}</h5>
										<p className="text-muted mb-0">{chat.description}</p>
									</div>
								</div>
							</ListGroupItem>
						))}
					</ListGroup>
				</ModalBody>
				<ModalFooter>
					<Button color="secondary" onClick={closeForwardModal}>
						Cancel
					</Button>
					<Button color="primary" onClick={forwardMessage}>
						Forward
					</Button>
				</ModalFooter>
			</Modal>
			<Modal isOpen={showCreateGroupModal} toggle={handleCloseCreateGroupModal}>
				<ModalHeader toggle={handleCloseCreateGroupModal}>
					Create Group
				</ModalHeader>
				<ModalBody>
					<Form>
						<FormGroup>
							<Label
								for="groupName"
								style={{ userSelect: 'none', cursor: 'pointer' }}>
								Group Name
							</Label>
							<Input
								type="text"
								id="groupName"
								placeholder="Enter group name"
								value={groupName}
								onChange={(e) => setGroupName(e.target.value)}
								style={{ userSelect: 'none' }}
							/>
						</FormGroup>
						<FormGroup>
							<Label
								for="groupImage"
								style={{ userSelect: 'none', cursor: 'pointer' }}>
								Group Image
							</Label>
							<Input
								type="file"
								id="groupImage"
								className="mt-2"
								onChange={handleGroupImageChange}
							/>
						</FormGroup>
						<FormGroup>
							<Label style={{ userSelect: 'none' }}>Select Members</Label>
							<ListGroup className="mt-3 chat-list modalStyle">
								{chats
									.filter((chat) => chat.id !== currentUser?.id)
									.map((chat) => (
										<ListGroupItem
											key={chat.id}
											style={{ cursor: 'pointer', userSelect: 'none' }}
											className={selectedUsers.has(chat.id) ? 'active' : ''}
											onClick={() => handleUserSelect(chat.id)}>
											<div className="d-flex align-items-center">
												<input
													type="checkbox"
													checked={selectedUsers.has(chat.id)}
													onClick={(e) => e.stopPropagation()}
													onChange={(e) => {
														handleUserSelect(chat.id)
													}}
													className="me-2"
												/>
												<div className="d-flex align-items-center">
													<img
														src={chat.image}
														className="rounded-circle me-3"
														alt=""
														style={{ height: '2.6rem', width: '2.6rem' }}
													/>
													<div>
														<h5 className="mb-0">{chat.name}</h5>
														<p className="text-muted mb-0">
															{chat.description}
														</p>
													</div>
												</div>
											</div>
										</ListGroupItem>
									))}
							</ListGroup>
						</FormGroup>
					</Form>
				</ModalBody>
				<ModalFooter>
					<Button color="secondary" onClick={handleCloseCreateGroupModal}>
						Cancel
					</Button>
					<Button color="primary" onClick={handleCreateGroup}>
						Create
					</Button>
				</ModalFooter>
			</Modal>
			<Modal
				isOpen={showGroupInfoModal}
				toggle={() => setShowGroupInfoModal(false)}>
				<ModalHeader toggle={() => setShowGroupInfoModal(false)}>
					<div className="d-flex justify-content-between align-items-center w-100">
						<div>Group Information</div>
						{renderAddRemoveUserOptions()}
					</div>
				</ModalHeader>
				<ModalBody className="modalStyle">
					<ListGroup>
						{members.map((member) => (
							<ListGroupItem
								key={member.id}
								style={{ cursor: 'pointer', userSelect: 'none' }}>
								<div className="d-flex align-items-center">
									<img
										src={member.profileImage}
										className="rounded-circle me-3"
										alt=""
										style={{
											height: '2.6rem',
											width: '2.6rem',
										}}
									/>
									<div>
										<h5 className="mb-0">
											{member.firstname} {member.lastname}
										</h5>
										<p className="text-muted mb-0">
											{member.online
												? 'Online'
												: `Last seen at ${new Date(
														member.last_active
													).toLocaleTimeString([], {
														hour: '2-digit',
														minute: '2-digit',
													})}`}
										</p>
									</div>
								</div>
							</ListGroupItem>
						))}
					</ListGroup>
				</ModalBody>
				<ModalFooter>{renderLeaveGroupButton()}</ModalFooter>
			</Modal>
			<Modal isOpen={showAddUserModal} toggle={closeAddRemoveUserModal}>
				<ModalHeader toggle={closeAddRemoveUserModal}>
					Add/Remove User to Group
				</ModalHeader>
				<ModalBody className="modalStyle">
					<ListGroup>
						{filteredChats.map((chat) => {
							const isMember = members.some((member) => member.id === chat.id)
							if (chat.id === currentUser?.id) {
								return null
							}
							return (
								<ListGroupItem
									key={chat.id}
									onClick={() => handleUserSelect(chat.id)}
									style={{
										cursor: 'pointer',
										background: isMember ? '#f8f9fa' : '',
									}}>
									<div className="d-flex align-items-center">
										<input
											type="checkbox"
											checked={isMember || selectedUsers.has(chat.id)}
											onClick={(e) => e.stopPropagation()}
											onChange={() => handleUserSelect(chat.id)}
											className="me-2"
											disabled={isMember}
										/>
										<img
											src={chat.image}
											className="rounded-circle me-3"
											alt=""
											style={{
												height: '2.6rem',
												width: '2.6rem',
												userSelect: 'none',
											}}
										/>
										<div style={{ userSelect: 'none' }}>
											<h5 className="mb-0">{chat.name}</h5>
											<p className="text-muted mb-0">{chat.description}</p>
										</div>
										{isMember && (
											<Button
												color="danger"
												onClick={() =>
													removeUserFromGroup(currentRoomId, chat.id)
												}
												size="sm"
												className="ms-auto">
												Remove
											</Button>
										)}
									</div>
								</ListGroupItem>
							)
						})}
					</ListGroup>
				</ModalBody>
				<ModalFooter>
					<Button color="secondary" onClick={closeAddRemoveUserModal}>
						Cancel
					</Button>
					<Button
						color="primary"
						onClick={() => {
							selectedUsers.forEach((userId) => {
								if (!members.some((member) => member.id === userId)) {
									addUserToGroup(currentRoomId, userId)
								}
							})
							setShowAddUserModal(false)
						}}>
						Add
					</Button>
				</ModalFooter>
			</Modal>
			<Modal
				isOpen={showDeleteGroupModal}
				toggle={() => setShowDeleteGroupModal(false)}>
				<ModalHeader toggle={() => setShowDeleteGroupModal(false)}>
					Delete Group
				</ModalHeader>
				<ModalBody>
					Are you sure you want to delete the group "{groupToDelete?.name}"?
				</ModalBody>
				<ModalFooter>
					<Button
						color="secondary"
						onClick={() => setShowDeleteGroupModal(false)}>
						Cancel
					</Button>
					<Button color="danger" onClick={handleDeleteGroup}>
						Delete
					</Button>
				</ModalFooter>
			</Modal>
			<Modal
				isOpen={showDeleteConfirmation}
				toggle={() => setShowDeleteConfirmation(false)}>
				<ModalHeader toggle={() => setShowDeleteConfirmation(false)}>
					Confirm Deletion
				</ModalHeader>
				<ModalBody>
					Deleting the last user will delete this group. Are you sure you want
					to proceed?
				</ModalBody>
				<ModalFooter>
					<Button
						color="secondary"
						onClick={() => handleConfirmDeleteGroup(false)}>
						Cancel
					</Button>
					<Button color="danger" onClick={() => handleConfirmDeleteGroup(true)}>
						Confirm
					</Button>
				</ModalFooter>
			</Modal>
			{renderSelectNewOwnerModal()}
		</>
	)
}

const Spinners: React.FC = () => {
	return (
		<div
			className="d-flex justify-content-center align-items-center"
			style={{ height: '100%' }}>
			<div className="spinner-border text-primary" role="status">
				<span className="visually-hidden">Loading...</span>
			</div>
		</div>
	)
}

export default Chat
