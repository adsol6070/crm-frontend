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
	ModalFooter,
	ListGroup,
	ListGroupItem,
} from 'reactstrap'
import { Link } from 'react-router-dom'
import SimpleBar from 'simplebar-react'
import { PageBreadcrumb } from '@/components'
// import './chat.css'
import styles from './chat.module.css';
import SocketManager from '@/common/context/SocketManager'
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react'
import { useOutsideClick, useUser, useUserImage } from '@/hooks'

const Chat: React.FC = () => {
	const [singlebtn, setSinglebtn] = useState(false)
	const [activeTab, setActiveTab] = useState('1')
	const [isLoading, setLoading] = useState(false)
	const [singlebtn1, setSinglebtn1] = useState(false)
	const [singlebtn2, setSinglebtn2] = useState(false)
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
	const [showEmojiPicker, setShowEmojiPicker] = useState(false)
	const [searchTerm, setSearchTerm] = useState('')
	const [isLoadingMessages, setIsLoadingMessages] = useState(false)
	const [showForwardModal, setShowForwardModal] = useState(false)
	const [messageToForward, setMessageToForward] = useState<any>(null)
	const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set())
	const [showCreateGroupModal, setShowCreateGroupModal] = useState(false)
	const [groupName, setGroupName] = useState('')
	const scrollRef = useRef<SimpleBar>(null)
	const emojiPickerRef = useRef<HTMLDivElement>(null)
	const [currentUser] = useUser()
	const fetchUserImage = useUserImage()

	useOutsideClick(emojiPickerRef, () => setShowEmojiPicker(false))

	useEffect(() => {
		const socket = SocketManager.getSocket()
		socket?.emit('requestInitialUsers')
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

		socket?.on('userStatusUpdated', ({ userId, status, description }) => {
			setChats((prevChats) =>
				prevChats.map((chat) =>
					chat.id === userId
						? {
								...chat,
								status: status ? 'Online' : 'Offline',
								description,
							}
						: chat
				)
			)
		})

		socket?.on('chatHistory', (chatHistory: any[]) => {
			setMessages(chatHistory)
			scrollToBottom()
			setIsLoadingMessages(false)
		})

		socket?.on('receiveMessage', (newMessage: any) => {
			setMessages((prevMessages) => [...prevMessages, newMessage])
			scrollToBottom()
		})

		socket?.on('messageDeleted', ({ messageId }) => {
			setMessages((prevMessages) =>
				prevMessages.filter((message) => message.id !== messageId)
			)
		})

		socket?.on('receiveGroupMessage', (newMessage: any) => {
			if (currentRoomId === newMessage.group_id) {
				setMessages((prevMessages) => [...prevMessages, newMessage])
				scrollToBottom()
			}
		})

		return () => {
			socket?.off('initialUsers')
			socket?.off('userStatusUpdated')
			socket?.off('chatHistory')
			socket?.off('receiveMessage')
			socket?.off('messageDeleted')
			socket?.off('receiveGroupMessage')
		}
	}, [])

	const onKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter') {
			addMessage()
		}
	}

	const addMessage = () => {
		if (curMessage !== '' || selectedImage !== null) {
			const socket = SocketManager.getSocket()
			const newMessage = {
				toUserId: currentRoomId,
				message: curMessage,
			}
			socket?.emit('sendMessage', newMessage)
			setCurMessage('')
			setDisable(false)
			setSelectedImage(null)
			scrollToBottom()
		}
	}

	const deleteMessage = (messageId: string) => {
		const socket = SocketManager.getSocket()
		socket?.emit('deleteMessage', { messageId })
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

	const userChatOpen = (chat: any) => {
		setChatBoxUsername(chat.name)
		setChatBoxUserStatus(chat.status)
		setCurrentRoomId(chat.roomId)
		setChatBoxUserImage(chat.image)
		setMessages([])
		setCurMessage('')

		const socket = SocketManager.getSocket()
		socket?.emit('fetchChatHistory', { userId: chat.roomId })
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

	const handleEmojiClick = (emojiObject: EmojiClickData) => {
		setCurMessage((prevMessage) => prevMessage + emojiObject.emoji)
		setDisable(true)
	}

	const scrollToBottom = () => {
		setTimeout(() => {
			scrollRef.current
				?.getScrollElement()
				.scrollTo(0, scrollRef.current?.getScrollElement().scrollHeight)
		}, 0);
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

	const handleCreateGroup = () => {
		const socket = SocketManager.getSocket()
		socket?.emit('createGroup', {
			groupName,
			userIds: Array.from(selectedUsers),
		})
		setShowCreateGroupModal(false)
		setGroupName('')
		setSelectedUsers(new Set())
	}

	const filteredChats = chats.filter((chat) =>
		chat.name.toLowerCase().includes(searchTerm.toLowerCase())
	)

	return (
		<>
			<PageBreadcrumb title="Chat" subName="Chat" />
			<div className="d-lg-flex">
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
					<div className="p-3">
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
							className="w-100 mt-3"
							onClick={() => setShowCreateGroupModal(true)}>
							Create Group
						</Button>
					</div>

					<div className="chat-leftsidebar-nav">
						<TabContent activeTab={activeTab}>
							<TabPane tabId="1">
								<SimpleBar className="chat-message-list">
									<div>
										<div className="px-3">
											<h5 className="font-size-14">Recent</h5>
										</div>
										<ul className="list-unstyled chat-list p-3">
											{isLoading ? (
												<Spinners setLoading={setLoading} />
											) : (
												<SimpleBar>
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
																		<span
																			className="badge bg-danger"
																			style={{
																				paddingRight: '.6em',
																				paddingLeft: '.6em',
																			}}>
																			{chat.time}
																		</span>
																	</div>
																</div>
															</Link>
														</li>
													))}
												</SimpleBar>
											)}
										</ul>
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
													className="flex-shrink-0  me-3 d-sm-block d-none"
													style={{
														height: '2.6rem',
														width: '2.6rem',
													}}>
													<img
														src={chatBoxUserImage}
														alt=""
														className="img-fluid d-block  rounded-circle"
														style={{
															height: '2.6rem',
															width: '2.6rem',
														}}
													/>
												</div>
												<div className="flex-grow-1">
													<h5 className="font-size-16 mb-1 text-truncate">
														<Link to="#" className="text-reset">
															{chatBoxUsername}
														</Link>
													</h5>
													<p className="text-muted text-truncate mb-0">
														{chatBoxUserStatus}
													</p>
												</div>
											</div>
										</Col>
										<Col xl={8} className="col-5">
											<ul className="list-inline user-chat-nav text-end mb-0">
												<li className="list-inline-item">
													<Dropdown
														isOpen={singlebtn1}
														toggle={() => setSinglebtn1(!singlebtn1)}>
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
														isOpen={singlebtn2}
														toggle={() => setSinglebtn2(!singlebtn2)}>
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
										<Spinners setLoading={setLoading} />
									) : (
										<ul className="list-unstyled mb-0">
											{messages.map((msg, index) => (
												<li
													key={index}
													className={
														msg.fromUserId === currentRoomId ? '' : 'right'
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
																		{msg.fromUserId === currentRoomId
																			? chatBoxUsername
																			: 'You'}
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
																				onClick={() => openForwardModal(msg)}>
																				Forward
																			</DropdownItem>
																			<DropdownItem
																				onClick={() => deleteMessage(msg.id)}>
																				Delete
																			</DropdownItem>
																		</DropdownMenu>
																	</UncontrolledDropdown>
																</div>
															</div>
														</div>
													</div>
												</li>
											))}
										</ul>
									)}
								</SimpleBar>
								{copyMsgAlert && (
									<UncontrolledAlert color="warning" dismissible role="alert">
										Message copied
									</UncontrolledAlert>
								)}
								<div className="p-3 border-top">
									<div className="row">
										<div className="col input-container">
											<input
												type="text"
												value={curMessage}
												onKeyPress={onKeyPress}
												onChange={(e) => {
													setCurMessage(e.target.value)
													setDisable(true)
												}}
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
												<div
													className="emoji-picker position-absolute"
													ref={emojiPickerRef}>
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
												<span className="d-none d-sm-inline-block me-2">
													Send
												</span>
												<i className="mdi mdi-send float-end"></i>
											</Button>
										</div>
									</div>
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
			<Modal
				isOpen={showForwardModal}
				toggle={() => setShowForwardModal(false)}>
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
									<input
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
			<Modal
				isOpen={showCreateGroupModal}
				toggle={() => setShowCreateGroupModal(false)}>
				<ModalHeader toggle={() => setShowCreateGroupModal(false)}>
					Create Group
				</ModalHeader>
				<ModalBody>
					<Input
						type="text"
						placeholder="Group Name"
						value={groupName}
						onChange={(e) => setGroupName(e.target.value)}
					/>
					<ListGroup className="mt-3">
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
					<Button
						color="secondary"
						onClick={() => setShowCreateGroupModal(false)}>
						Cancel
					</Button>
					<Button color="primary" onClick={handleCreateGroup}>
						Create
					</Button>
				</ModalFooter>
			</Modal>
		</>
	)
}

const Spinners: React.FC<{ setLoading: (loading: boolean) => void }> = ({
	setLoading,
}) => {
	useEffect(() => {
		const timer = setTimeout(() => {
			setLoading(false)
		}, 1000) // Simulate loading for 1 second

		return () => clearTimeout(timer)
	}, [setLoading])

	return <div>Loading...</div>
}

export default Chat
