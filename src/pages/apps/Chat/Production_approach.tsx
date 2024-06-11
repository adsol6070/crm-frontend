import React, {
	useEffect,
	useRef,
	useState,
	KeyboardEvent,
	useCallback,
} from 'react'
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
import { Link } from 'react-router-dom'
import SimpleBar from 'simplebar-react'
import { PageBreadcrumb } from '@/components'
import './chat.css'
import SocketManager from '@/common/context/SocketManager'
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react'
import { useOutsideClick, useUser, useUserImage } from '@/hooks'
import classNames from 'classnames'
import avatar1 from '@/assets/images/users/avatar-1.jpg'
import { chatApi, useAuthContext } from '@/common'

const Chat: React.FC = () => {
	const { user } = useAuthContext()
	const typingTimeout = useRef<NodeJS.Timeout | null>(null)
	const scrollRef = useRef<SimpleBar>(null)
	const emojiPickerRef = useRef<HTMLDivElement>(null)

	const [singlebtn, setSinglebtn] = useState(false)
	const [singlebtn1, setSinglebtn1] = useState(false)
	const [singlebtn2, setSinglebtn2] = useState(false)
	const [isLoading, setLoading] = useState(false)
	const [isDisable, setDisable] = useState(false)
	const [curMessage, setCurMessage] = useState('')
	const [copyMsgAlert, setCopyMsgAlert] = useState(false)
	const [currentRoomId, setCurrentRoomId] = useState('')
	const [chatBoxUsername, setChatBoxUsername] = useState('')
	const [chatBoxUserStatus, setChatBoxUserStatus] = useState('')
	const [chatBoxUserImage, setChatBoxUserImage] = useState('')
	const [selectedImage, setSelectedImage] = useState<string | null>(null)
	const [chats, setChats] = useState<any[]>([])
	const [messages, setMessages] = useState<any[]>([])
	const [members, setMembers] = useState<any[]>([])
	const [activeTab, setActiveTab] = useState('1')
	const [showEmojiPicker, setShowEmojiPicker] = useState(false)
	const [searchTerm, setSearchTerm] = useState('')
	const [isLoadingMessages, setIsLoadingMessages] = useState(false)
	const [showForwardModal, setShowForwardModal] = useState(false)
	const [messageToForward, setMessageToForward] = useState<any>(null)
	const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set())
	const [showCreateGroupModal, setShowCreateGroupModal] = useState(false)
	const [showGroupInfoModal, setShowGroupInfoModal] = useState(false)
	const [groupName, setGroupName] = useState('')
	const [groups, setGroups] = useState<any[]>([])
	const [typingUsers, setTypingUsers] = useState<any[]>([])
	const [isTyping, setIsTyping] = useState(false) // New state for typing animation
	const [showDeleteGroupModal, setShowDeleteGroupModal] = useState(false) // State to manage delete group modal
	const [groupToDelete, setGroupToDelete] = useState<any>(null) // State to store group to be deleted
	const [groupImage, setGroupImage] = useState<any | null>(null)

	const currentUser = useUser()[0]
	const fetchUserImage = useUserImage()

	useOutsideClick(emojiPickerRef, () => setShowEmojiPicker(false))

	const handleGroupImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (file) {
			setGroupImage(file)
		}
	}

	const fetchGroupImage = async (groupId: string) => {
		try {
			const response = await chatApi.getGroupImage(groupId)
			return URL.createObjectURL(response)
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

	const fetchInitialData = async (socket) => {
		socket.emit('requestInitialUsers')
		socket.emit('requestInitialGroups')

		socket.on('initialUsers', async (users) => {
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
							: `Last seen at ${new Date(user.last_active).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
						time: new Date(user.last_active).toLocaleTimeString([], {
							hour: '2-digit',
							minute: '2-digit',
						}),
					}
				})
			)
			setChats(transformedChats)
		})

		socket.on('initialGroups', async (groups) => {
			const transformedGroups = await Promise.all(
				groups.map(async (group) => {
					const imageUrl = await fetchGroupImage(group.id)
					return { ...group, image: imageUrl }
				})
			)
			setGroups(transformedGroups)
		})
	}

	const socketEventHandlers = (socket) => {
		socket.on('userStatusUpdated', ({ userId, status, description }) => {
			setChats((prevChats) =>
				prevChats.map((chat) =>
					chat.id === userId
						? { ...chat, status: status ? 'Online' : 'Offline', description }
						: chat
				)
			)
		})

		socket.on('chatHistory', (chatHistory) => {
			setMessages(chatHistory)
			scrollToBottom()
			setIsLoadingMessages(false)
		})

		socket.on('groupChatHistory', ({ chatHistory, members }) => {
			setMessages(chatHistory)
			setMembers(members)
			scrollToBottom()
			setIsLoadingMessages(false)
		})

		socket.on('receiveMessage', (newMessage) => {
			setMessages((prevMessages) => [...prevMessages, newMessage])
			scrollToBottom()
		})

		socket.on('messageDeleted', ({ messageId }) => {
			setMessages((prevMessages) =>
				prevMessages.filter((message) => message.id !== messageId)
			)
		})

		socket.on('groupMessageDeletedForUser', ({ messageId }) => {
			setMessages((prevMessages) =>
				prevMessages.filter((message) => message.id !== messageId)
			)
		})

		socket.on('receiveGroupMessage', (newMessage) => {
			if (currentRoomId === newMessage.group_id) {
				setMessages((prevMessages) => [...prevMessages, newMessage])
				scrollToBottom()
			}
		})

		socket.on('groupCreated', async (newGroup) => {
			const imageUrl = await fetchGroupImage(newGroup.id)
			setGroups((prevGroups) => [
				...prevGroups,
				{ ...newGroup, image: imageUrl },
			])
		})

		socket.on('groupDeleted', ({ groupId }) => {
			setGroups((prevGroups) =>
				prevGroups.filter((group) => group.id !== groupId)
			)
		})

		socket.on('userAddedToGroup', ({ groupId, userId }) => {
			setGroups((prevGroups) =>
				prevGroups.map((group) =>
					group.id === groupId
						? { ...group, users: [...group.users, userId] }
						: group
				)
			)
		})

		socket.on('userRemovedFromGroup', ({ groupId, userId }) => {
			setGroups((prevGroups) =>
				prevGroups.map((group) =>
					group.id === groupId
						? { ...group, users: group.users.filter((id) => id !== userId) }
						: group
				)
			)
		})

		socket.on('typing', ({ user, groupId, userId }) => {
			if (groupId === currentRoomId || user.id === currentRoomId) {
				setTypingUsers((prevTypingUsers) => [...prevTypingUsers, user])
				setIsTyping(true)
			}
		})

		socket.on('stopTyping', ({ user, groupId, userId }) => {
			if (groupId === currentRoomId || user.id === currentRoomId) {
				setTypingUsers((prevTypingUsers) =>
					prevTypingUsers.filter((u) => u.id !== user.id)
				)
				setIsTyping(false)
			}
		})

		return () => {
			socket.off('initialUsers')
			socket.off('initialGroups')
			socket.off('userStatusUpdated')
			socket.off('chatHistory')
			socket.off('groupChatHistory')
			socket.off('receiveMessage')
			socket.off('messageDeleted')
			socket.off('receiveGroupMessage')
			socket.off('groupCreated')
			socket.off('groupDeleted')
			socket.off('userAddedToGroup')
			socket.off('userRemovedFromGroup')
			socket.off('groupMessageDeletedForUser')
			socket.off('typing')
			socket.off('stopTyping')
		}
	}

	useEffect(() => {
		const socket = SocketManager.getSocket()
		fetchInitialData(socket)
		return socketEventHandlers(socket)
	}, [fetchInitialData, socketEventHandlers])

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
			const event = groups.some((group) => group.id === currentRoomId)
				? 'startTyping'
				: 'startTyping'
			socket?.emit(event, { groupId: currentRoomId, userId: currentRoomId })
		}

		if (typingTimeout.current) {
			clearTimeout(typingTimeout.current)
		}

		typingTimeout.current = setTimeout(() => {
			const event = groups.some((group) => group.id === currentRoomId)
				? 'stopTyping'
				: 'stopTyping'
			socket?.emit(event, { groupId: currentRoomId, userId: currentRoomId })
		}, 500)
	}

	const addMessage = () => {
		if (curMessage !== '' || selectedImage !== null) {
			const socket = SocketManager.getSocket()
			const messagePayload = {
				toUserId: currentRoomId,
				message: curMessage,
			}
			const event = groups.some((group) => group.id === currentRoomId)
				? 'sendGroupMessage'
				: 'sendMessage'
			socket?.emit(event, { ...messagePayload, groupId: currentRoomId })
			resetMessageInput()
		}
	}

	const resetMessageInput = () => {
		setCurMessage('')
		setDisable(false)
		setSelectedImage(null)
		handleTyping({ target: { value: '' } } as any)
		scrollToBottom()
	}

	const deleteMessage = (messageId: string) => {
		const socket = SocketManager.getSocket()
		const event = groups.some((group) => group.id === currentRoomId)
			? 'deleteGroupMessageForUser'
			: 'deleteMessage'
		socket?.emit(event, { messageId })
	}

	const openForwardModal = (message: any) => {
		setMessageToForward(message)
		setShowForwardModal(true)
	}

	const forwardMessage = () => {
		const socket = SocketManager.getSocket()
		socket?.emit('forwardMessage', {
			messageId: messageToForward.id,
			toUserIds: Array.from(selectedUsers),
		})
		setShowForwardModal(false)
		setMessageToForward(null)
		setSelectedUsers(new Set())
	}

	const toggleTab = (tab: string) => {
		if (activeTab !== tab) {
			setActiveTab(tab)
		}
	}

	const userChatOpen = (chat: any) => {
		setChatBoxUsername(chat.name)
		setChatBoxUserStatus(chat.status)
		setCurrentRoomId(chat.roomId)
		setChatBoxUserImage(chat.image)
		setMessages([])
		setCurMessage('')
		setMembers([])

		const socket = SocketManager.getSocket()
		socket?.emit('fetchChatHistory', { userId: chat.roomId })
	}

	const groupChatOpen = (group: any) => {
		setChatBoxUsername(group.name)
		setCurrentRoomId(group.id)
		setChatBoxUserImage(avatar1)
		setMessages([])
		setCurMessage('')

		const socket = SocketManager.getSocket()
		socket?.emit('fetchGroupChatHistory', { groupId: group.id })
	}

	const openGroupInfoModal = () => {
		setShowGroupInfoModal(true)
	}

	const copyMsg = (ele: HTMLElement) => {
		const conversationList = ele.closest('.conversation-list')
		const messageElement = conversationList?.querySelector('p')
		const copyText = messageElement?.innerHTML
		if (copyText) {
			navigator.clipboard
				.writeText(copyText)
				.then(() => {
					setCopyMsgAlert(true)
					setTimeout(() => setCopyMsgAlert(false), 1000)
				})
				.catch((err) => console.error('Failed to copy text: ', err))
		}
	}

	const handleEmojiClick = (emojiObject: EmojiClickData) => {
		setCurMessage((prevMessage) => prevMessage + emojiObject.emoji)
		setDisable(true)
		handleTyping({ target: { value: emojiObject.emoji } } as any)
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
			newSelected.has(userId)
				? newSelected.delete(userId)
				: newSelected.add(userId)
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
		socket?.emit('createGroup', {
			tenantID: user.tenantID,
			groupName,
			userIds: Array.from(selectedUsers),
			image: imageUrl,
		})
		handleCloseCreateGroupModal()
	}

	const handleGroupContextMenu = (event: React.MouseEvent, group: any) => {
		event.preventDefault()
		setGroupToDelete(group)
		setShowDeleteGroupModal(true)
	}

	const handleDeleteGroup = () => {
		if (groupToDelete) {
			const socket = SocketManager.getSocket()
			socket?.emit('deleteGroup', { groupId: groupToDelete.id })
			setShowDeleteGroupModal(false)
			setGroupToDelete(null)
		}
	}

	const filteredChats = chats.filter((chat) =>
		chat.name.toLowerCase().includes(searchTerm.toLowerCase())
	)
	const filteredGroups = groups.filter((group) =>
		group.name.toLowerCase().includes(searchTerm.toLowerCase())
	)

	const isGroupChat = groups.some((group) => group.id === currentRoomId)

	return (
		<>
			<PageBreadcrumb title="Chat" subName="Chat" />
			<div className="d-lg-flex">
				<ChatSidebar
					singlebtn={singlebtn}
					setSinglebtn={setSinglebtn}
					searchTerm={searchTerm}
					setSearchTerm={setSearchTerm}
					filteredChats={filteredChats}
					filteredGroups={filteredGroups}
					toggleTab={toggleTab}
					activeTab={activeTab}
					userChatOpen={userChatOpen}
					groupChatOpen={groupChatOpen}
					showCreateGroupModal={showCreateGroupModal}
					setShowCreateGroupModal={setShowCreateGroupModal}
					handleGroupContextMenu={handleGroupContextMenu}
				/>
				<ChatWindow
					currentRoomId={currentRoomId}
					chatBoxUsername={chatBoxUsername}
					chatBoxUserStatus={chatBoxUserStatus}
					chatBoxUserImage={chatBoxUserImage}
					messages={messages}
					isLoadingMessages={isLoadingMessages}
					isTyping={isTyping}
					copyMsgAlert={copyMsgAlert}
					curMessage={curMessage}
					handleTyping={handleTyping}
					onKeyPress={onKeyPress}
					addMessage={addMessage}
					deleteMessage={deleteMessage}
					openForwardModal={openForwardModal}
					handleEmojiClick={handleEmojiClick}
					scrollRef={scrollRef}
					setCopyMsgAlert={setCopyMsgAlert}
					showEmojiPicker={showEmojiPicker}
					setShowEmojiPicker={setShowEmojiPicker}
					emojiPickerRef={emojiPickerRef}
					isDisable={isDisable}
				/>
			</div>
			<ForwardMessageModal
				showForwardModal={showForwardModal}
				setShowForwardModal={setShowForwardModal}
				chats={chats}
				selectedUsers={selectedUsers}
				handleUserSelect={handleUserSelect}
				forwardMessage={forwardMessage}
			/>
			<CreateGroupModal
				showCreateGroupModal={showCreateGroupModal}
				handleCloseCreateGroupModal={handleCloseCreateGroupModal}
				groupName={groupName}
				setGroupName={setGroupName}
				handleGroupImageChange={handleGroupImageChange}
				chats={chats}
				selectedUsers={selectedUsers}
				handleUserSelect={handleUserSelect}
				handleCreateGroup={handleCreateGroup}
			/>
			<GroupInfoModal
				showGroupInfoModal={showGroupInfoModal}
				setShowGroupInfoModal={setShowGroupInfoModal}
				members={members}
			/>
			<DeleteGroupModal
				showDeleteGroupModal={showDeleteGroupModal}
				setShowDeleteGroupModal={setShowDeleteGroupModal}
				groupToDelete={groupToDelete}
				handleDeleteGroup={handleDeleteGroup}
			/>
		</>
	)
}

const ChatSidebar = ({
	singlebtn,
	setSinglebtn,
	searchTerm,
	setSearchTerm,
	filteredChats,
	filteredGroups,
	toggleTab,
	activeTab,
	userChatOpen,
	groupChatOpen,
	showCreateGroupModal,
	setShowCreateGroupModal,
	handleGroupContextMenu,
}) => (
	<Card className="chat-leftsidebar">
		<CardBody>
			<div className="text-center bg-light rounded px-4 py-3">
				<div className="text-end">
					<Dropdown
						className="chat-noti-dropdown"
						isOpen={singlebtn}
						toggle={() => setSinglebtn(!singlebtn)}>
						<DropdownToggle tag="a" className="p-0">
							<i className="ri-settings-3-line"></i>
						</DropdownToggle>
						<DropdownMenu>
							<DropdownItem>Profile</DropdownItem>
							<DropdownItem>Edit</DropdownItem>
							<DropdownItem>Add Contact</DropdownItem>
							<DropdownItem>Setting</DropdownItem>
						</DropdownMenu>
					</Dropdown>
				</div>
				<UserStatus />
			</div>
		</CardBody>
		<div className="p-3">
			<div className="search-box position-relative">
				<Input
					type="text"
					className="form-control rounded border"
					placeholder="Search..."
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
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
		<ChatNavigation toggleTab={toggleTab} activeTab={activeTab} />
		<ChatList
			activeTab={activeTab}
			filteredChats={filteredChats}
			filteredGroups={filteredGroups}
			userChatOpen={userChatOpen}
			groupChatOpen={groupChatOpen}
			handleGroupContextMenu={handleGroupContextMenu}
		/>
	</Card>
)

const UserStatus = () => {
	const currentUser = useUser()[0]
	return (
		currentUser && (
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
		)
	)
}

const ChatNavigation = ({ toggleTab, activeTab }) => (
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
				<span className="d-none d-sm-block">Chat</span>
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
				<span className="d-none d-sm-block">Groups</span>
			</NavLink>
		</NavItem>
	</Nav>
)

const ChatList = ({
	activeTab,
	filteredChats,
	filteredGroups,
	userChatOpen,
	groupChatOpen,
	handleGroupContextMenu,
}) => (
	<TabContent activeTab={activeTab}>
		<TabPane tabId="1">
			<SimpleBar className="chat-message-list">
				<div>
					<div className="px-3">
						<h5 className="font-size-14">Recent</h5>
						<ul className="list-unstyled chat-list p-3">
							{filteredChats.map((chat) => (
								<ChatListItem
									key={chat.id + chat.status}
									chat={chat}
									userChatOpen={userChatOpen}
								/>
							))}
						</ul>
					</div>
				</div>
			</SimpleBar>
		</TabPane>
		<TabPane tabId="2">
			<SimpleBar className="chat-message-list">
				<div className="pt-3">
					<div className="px-3">
						<h5 className="font-size-14 mb-3">Groups</h5>
						<ul className="list-unstyled chat-list p-3 pt-0">
							{filteredGroups.map((group) => (
								<GroupListItem
									key={group.id}
									group={group}
									groupChatOpen={groupChatOpen}
									handleGroupContextMenu={handleGroupContextMenu}
								/>
							))}
						</ul>
					</div>
				</div>
			</SimpleBar>
		</TabPane>
	</TabContent>
)

const ChatListItem = ({ chat, userChatOpen }) => (
	<li className={chat.roomId === currentRoomId ? 'active' : ''}>
		<Link to="#" onClick={() => userChatOpen(chat)}>
			<div className="d-flex align-items-center">
				<div
					className={`flex-shrink-0 user-img ${chat.status} align-self-center me-3`}>
					<img
						src={chat.image}
						className="rounded-circle"
						style={{ height: '2.6rem', width: '2.6rem' }}
						alt=""
					/>
					<span className="user-status"></span>
				</div>
				<div className="flex-grow-1 overflow-hidden">
					<h5 className="text-truncate font-size-15 mb-0">{chat.name}</h5>
					<p className="text-muted mb-0 mt-1 text-truncate">
						{chat.description}
					</p>
				</div>
				<div className="flex-shrink-0 ms-3">
					<span
						className="badge bg-danger"
						style={{ paddingRight: '.6em', paddingLeft: '.6em' }}>
						{chat.time}
					</span>
				</div>
			</div>
		</Link>
	</li>
)

const GroupListItem = ({ group, groupChatOpen, handleGroupContextMenu }) => (
	<li
		className={group.id === currentRoomId ? 'active' : ''}
		onContextMenu={(event) => handleGroupContextMenu(event, group)}>
		<Link to="#" onClick={() => groupChatOpen(group)}>
			<div className="d-flex align-items-center">
				<div className="flex-shrink-0 user-img align-self-center me-3">
					<img
						src={group.image}
						className="rounded-circle"
						style={{ height: '2.6rem', width: '2.6rem' }}
						alt=""
					/>
				</div>
				<div className="flex-grow-1">
					<h5 className="font-size-13 mb-0">{group.name}</h5>
				</div>
			</div>
		</Link>
	</li>
)

const ChatWindow = ({
	currentRoomId,
	chatBoxUsername,
	chatBoxUserStatus,
	chatBoxUserImage,
	messages,
	isLoadingMessages,
	isTyping,
	copyMsgAlert,
	curMessage,
	handleTyping,
	onKeyPress,
	addMessage,
	deleteMessage,
	openForwardModal,
	handleEmojiClick,
	scrollRef,
	setCopyMsgAlert,
	showEmojiPicker,
	setShowEmojiPicker,
	emojiPickerRef,
	isDisable,
}) => (
	<div className="w-100 user-chat mt-4 mt-sm-0 ms-lg-3">
		<Card className="chat-window mb-">
			{currentRoomId ? (
				<>
					<ChatHeader
						chatBoxUsername={chatBoxUsername}
						chatBoxUserStatus={chatBoxUserStatus}
						chatBoxUserImage={chatBoxUserImage}
						isGroupChat={isGroupChat}
					/>
					<ChatContent
						messages={messages}
						isLoadingMessages={isLoadingMessages}
						isTyping={isTyping}
						copyMsgAlert={copyMsgAlert}
						curMessage={curMessage}
						handleTyping={handleTyping}
						onKeyPress={onKeyPress}
						addMessage={addMessage}
						deleteMessage={deleteMessage}
						openForwardModal={openForwardModal}
						handleEmojiClick={handleEmojiClick}
						scrollRef={scrollRef}
						setCopyMsgAlert={setCopyMsgAlert}
						showEmojiPicker={showEmojiPicker}
						setShowEmojiPicker={setShowEmojiPicker}
						emojiPickerRef={emojiPickerRef}
						isDisable={isDisable}
					/>
				</>
			) : (
				<NoChatSelected />
			)}
		</Card>
	</div>
)

const ChatHeader = ({
	chatBoxUsername,
	chatBoxUserStatus,
	chatBoxUserImage,
	isGroupChat,
}) => (
	<div className="p-3 px-lg-4 border-bottom">
		<Row>
			<Col xl={4} className="col-7">
				<div className="d-flex align-items-center">
					<div
						className={`flex-shrink-0 me-3 d-sm-block d-none ${isGroupChat ? 'cursor-pointer' : ''}`}
						style={{ height: '2.6rem', width: '2.6rem' }}
						onClick={isGroupChat ? openGroupInfoModal : undefined}>
						<img
							src={chatBoxUserImage}
							alt=""
							className="img-fluid d-block rounded-circle"
						/>
					</div>
					<div
						className={`flex-grow-1 ${isGroupChat ? 'cursor-pointer' : ''}`}
						onClick={isGroupChat ? openGroupInfoModal : undefined}>
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
				<ChatOptions
					singlebtn1={singlebtn1}
					setSinglebtn1={setSinglebtn1}
					singlebtn2={singlebtn2}
					setSinglebtn2={setSinglebtn2}
				/>
			</Col>
		</Row>
	</div>
)

const ChatOptions = ({
	singlebtn1,
	setSinglebtn1,
	singlebtn2,
	setSinglebtn2,
}) => (
	<ul className="list-inline user-chat-nav text-end mb-0">
		<li className="list-inline-item">
			<Dropdown isOpen={singlebtn1} toggle={() => setSinglebtn1(!singlebtn1)}>
				<DropdownToggle className="btn nav-btn" tag="a">
					<i className="ri-search-line"></i>
				</DropdownToggle>
				<DropdownMenu className="dropdown-menu-end dropdown-menu-md p-2">
					<form className="px-2">
						<div>
							<Input
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
			<Dropdown isOpen={singlebtn2} toggle={() => setSinglebtn2(!singlebtn2)}>
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
)

const ChatContent = ({
	messages,
	isLoadingMessages,
	isTyping,
	copyMsgAlert,
	curMessage,
	handleTyping,
	onKeyPress,
	addMessage,
	deleteMessage,
	openForwardModal,
	handleEmojiClick,
	scrollRef,
	setCopyMsgAlert,
	showEmojiPicker,
	setShowEmojiPicker,
	emojiPickerRef,
	isDisable,
}) => (
	<>
		<SimpleBar ref={scrollRef} className="chat-conversation p-4">
			{isLoadingMessages ? (
				<Spinners setLoading={setLoading} />
			) : (
				<>
					<ul className="list-unstyled mb-0">
						{messages.map((msg, index) => (
							<ChatMessage
								key={index}
								msg={msg}
								chatBoxUsername={chatBoxUsername}
								currentRoomId={currentRoomId}
								deleteMessage={deleteMessage}
								openForwardModal={openForwardModal}
								copyMsg={copyMsg}
							/>
						))}
					</ul>
				</>
			)}
		</SimpleBar>
		{isTyping && <TypingIndicator />}
		{copyMsgAlert && <MessageCopiedAlert />}
		<MessageInput
			curMessage={curMessage}
			handleTyping={handleTyping}
			onKeyPress={onKeyPress}
			addMessage={addMessage}
			handleEmojiClick={handleEmojiClick}
			showEmojiPicker={showEmojiPicker}
			setShowEmojiPicker={setShowEmojiPicker}
			emojiPickerRef={emojiPickerRef}
			isDisable={isDisable}
		/>
	</>
)

const ChatMessage = ({
	msg,
	chatBoxUsername,
	currentRoomId,
	deleteMessage,
	openForwardModal,
	copyMsg,
}) => (
	<li className={msg.fromUserId === currentRoomId ? '' : 'right'}>
		<div className="conversation-list">
			<div className="d-flex">
				{msg.images && (
					<img src={msg.images} className="rounded-circle avatar" alt="" />
				)}
				<div className="flex-1 ms-3">
					<div className="d-flex justify-content-between">
						<h5 className="font-size-16 conversation-name align-middle">
							{msg.group_id
								? msg.user
									? `${msg.user.firstname} ${msg.user.lastname}`
									: 'Unknown'
								: msg.fromUserId === currentRoomId
									? 'You'
									: chatBoxUsername}
						</h5>
						{msg.timestamp && (
							<span className="time fw-normal text-muted me-0 me-md-4">
								{new Date(msg.timestamp).toLocaleTimeString([], {
									hour: '2-digit',
									minute: '2-digit',
								})}
							</span>
						)}
					</div>
					<div className="ctext-wrap">
						<div className="ctext-wrap-content">
							<p className="mb-0">{msg.message}</p>
						</div>
						<UncontrolledDropdown className="align-self-start">
							<DropdownToggle tag="a">
								<i className="ri-more-2-fill"></i>
							</DropdownToggle>
							<DropdownMenu>
								<DropdownItem onClick={(e) => copyMsg(e.target as HTMLElement)}>
									Copy
								</DropdownItem>
								<DropdownItem>Save</DropdownItem>
								<DropdownItem onClick={() => openForwardModal(msg)}>
									Forward
								</DropdownItem>
								<DropdownItem onClick={() => deleteMessage(msg.id)}>
									Delete
								</DropdownItem>
							</DropdownMenu>
						</UncontrolledDropdown>
					</div>
				</div>
			</div>
		</div>
	</li>
)

const TypingIndicator = () => (
	<div className="chat-wrap-content typing-indicator">
		<div className="typing-dots">
			<span></span>
			<span></span>
			<span></span>
		</div>
	</div>
)

const MessageCopiedAlert = () => (
	<UncontrolledAlert color="warning" dismissible role="alert">
		Message copied
	</UncontrolledAlert>
)

const MessageInput = ({
	curMessage,
	handleTyping,
	onKeyPress,
	addMessage,
	handleEmojiClick,
	showEmojiPicker,
	setShowEmojiPicker,
	emojiPickerRef,
	isDisable,
}) => (
	<div className="p-3 border-top">
		<div className="row">
			<div className="col input-container">
				<Input
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
					onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
					😊
				</Button>
				{showEmojiPicker && (
					<div className="emoji-picker position-absolute" ref={emojiPickerRef}>
						<EmojiPicker onEmojiClick={handleEmojiClick} />
					</div>
				)}
			</div>
			<div className="col-auto">
				<Button
					type="button"
					color="primary"
					disabled={!isDisable}
					onClick={addMessage}
					className="chat-send w-md waves-effect waves-light">
					<span className="d-none d-sm-inline-block me-2">Send</span>
					<i className="mdi mdi-send float-end"></i>
				</Button>
			</div>
		</div>
	</div>
)

const NoChatSelected = () => (
	<div className="chat-window no-chat-selected text-center my-auto p-5">
		<h5 className="text-muted">Select a user to start chatting</h5>
	</div>
)

const ForwardMessageModal = ({
	showForwardModal,
	setShowForwardModal,
	chats,
	selectedUsers,
	handleUserSelect,
	forwardMessage,
}) => (
	<Modal isOpen={showForwardModal} toggle={() => setShowForwardModal(false)}>
		<ModalHeader toggle={() => setShowForwardModal(false)}>
			Forward Message
		</ModalHeader>
		<ModalBody>
			<ListGroup>
				{chats.map((chat) => (
					<ListGroupItem
						key={chat.id}
						onClick={() => handleUserSelect(chat.id)}
						style={{ cursor: 'pointer' }}>
						<div className="d-flex align-items-center">
							<Input
								type="checkbox"
								checked={selectedUsers.has(chat.id)}
								onChange={() => handleUserSelect(chat.id)}
								className="me-2"
							/>
							<img
								src={chat.image}
								className="rounded-circle me-3"
								alt=""
								style={{ height: '2.6rem', width: '2.6rem' }}
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
			<Button color="secondary" onClick={() => setShowForwardModal(false)}>
				Cancel
			</Button>
			<Button color="primary" onClick={forwardMessage}>
				Forward
			</Button>
		</ModalFooter>
	</Modal>
)

const CreateGroupModal = ({
	showCreateGroupModal,
	handleCloseCreateGroupModal,
	groupName,
	setGroupName,
	handleGroupImageChange,
	chats,
	selectedUsers,
	handleUserSelect,
	handleCreateGroup,
}) => (
	<Modal isOpen={showCreateGroupModal} toggle={handleCloseCreateGroupModal}>
		<ModalHeader toggle={handleCloseCreateGroupModal}>Create Group</ModalHeader>
		<ModalBody>
			<Form>
				<FormGroup>
					<Label for="groupName">Group Name</Label>
					<Input
						type="text"
						id="groupName"
						placeholder="Enter group name"
						value={groupName}
						onChange={(e) => setGroupName(e.target.value)}
					/>
				</FormGroup>
				<FormGroup>
					<Label for="groupImage">Group Image</Label>
					<Input
						type="file"
						id="groupImage"
						className="mt-2"
						onChange={handleGroupImageChange}
					/>
				</FormGroup>
				<FormGroup>
					<Label>Select Members</Label>
					<ListGroup className="mt-3 chat-list">
						{chats.map((chat) => (
							<ListGroupItem
								key={chat.id}
								style={{ cursor: 'pointer' }}
								className={selectedUsers.has(chat.id) ? 'active' : ''}>
								<div className="d-flex align-items-center">
									<Input
										type="checkbox"
										checked={selectedUsers.has(chat.id)}
										onChange={() => handleUserSelect(chat.id)}
										className="me-2"
									/>
									<div
										className="d-flex align-items-center"
										onClick={() => handleUserSelect(chat.id)}>
										<img
											src={chat.image}
											className="rounded-circle me-3"
											alt=""
											style={{ height: '2.6rem', width: '2.6rem' }}
										/>
										<div>
											<h5 className="mb-0">{chat.name}</h5>
											<p className="text-muted mb-0">{chat.description}</p>
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
)

const GroupInfoModal = ({
	showGroupInfoModal,
	setShowGroupInfoModal,
	members,
}) => (
	<Modal
		isOpen={showGroupInfoModal}
		toggle={() => setShowGroupInfoModal(false)}>
		<ModalHeader toggle={() => setShowGroupInfoModal(false)}>
			Group Information
		</ModalHeader>
		<ModalBody>
			<ListGroup>
				{members.map((member) => (
					<ListGroupItem key={member.id}>
						<div className="d-flex align-items-center">
							<img
								src={member.image || avatar1}
								className="rounded-circle me-3"
								alt=""
								style={{ height: '2.6rem', width: '2.6rem' }}
							/>
							<div>
								<h5 className="mb-0">{`${member.firstname} ${member.lastname}`}</h5>
								<p className="text-muted mb-0">
									{member.online
										? 'Online'
										: `Last seen at ${new Date(member.last_active).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
								</p>
							</div>
						</div>
					</ListGroupItem>
				))}
			</ListGroup>
		</ModalBody>
	</Modal>
)

const DeleteGroupModal = ({
	showDeleteGroupModal,
	setShowDeleteGroupModal,
	groupToDelete,
	handleDeleteGroup,
}) => (
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
			<Button color="secondary" onClick={() => setShowDeleteGroupModal(false)}>
				Cancel
			</Button>
			<Button color="danger" onClick={handleDeleteGroup}>
				Delete
			</Button>
		</ModalFooter>
	</Modal>
)

const Spinners: React.FC<{ setLoading: (loading: boolean) => void }> = ({
	setLoading,
}) => {
	useEffect(() => {
		const timer = setTimeout(() => setLoading(false), 1000)
		return () => clearTimeout(timer)
	}, [setLoading])
	return <div>Loading...</div>
}

export default Chat
