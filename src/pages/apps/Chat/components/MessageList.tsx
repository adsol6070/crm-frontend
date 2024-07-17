import {
	DropdownItem,
	DropdownMenu,
	DropdownToggle,
	UncontrolledDropdown,
} from 'reactstrap'
import styled from 'styled-components'
import { useChatContext } from '../context/chatContext'

const List = styled.ul`
	list-style-type: none;
	margin-bottom: 0;
	padding: 0;
`

const SystemMessage = styled.li`
	display: flex;
	justify-content: center;
	.text-muted {
		margin-bottom: 2px;
	}
`

const MessageItem = styled.li`
	display: flex;
	justify-content: ${({ isRight }) => (isRight ? 'flex-end' : 'flex-start')};
	clear: both;
`

const ConversationList = styled.div`
	margin-bottom: 24px;
	position: relative;
	max-width: 60%;

	@media (max-width: 992px) {
		max-width: 100%;
	}
`

const CtextWrap = styled.div`
	display: flex;
	margin-bottom: 20px;
	position: static !important;
	background: none !important;
	border-radius: 10px;
	padding: 12px;

	&::after {
		left: -11px;
		top: 0;
		border: none !important;
		content: ' ';
		height: 0;
		width: 0;
		position: absolute;
		pointer-events: none;
		border-top-color: var(--tz-light);
		border-width: 6px;
		margin-right: -1px;
		border-right-color: var(--tz-light);
	}
`

const CtextWrapContent = styled.div`
	max-width: 30vw;
	word-wrap: break-word;
	background-color: ${({ isRight }) => (isRight ? '#334e7b' : '#d5d8db')};
	border-radius: ${({ isRight }) =>
		isRight ? '15px 0px 15px 15px' : '0px 15px 15px 15px'};
	color: ${({ isRight }) => (isRight ? '#ffffff' : '#000000')};
	padding: 15px 20px;
	position: relative;
`

const ConversationName = styled.h5`
	font-size: 16px !important;
	display: flex;
	justify-content: ${({ isRight }) => (isRight ? 'flex-end' : 'flex-start')};
	align-items: center;

	.time {
		font-size: 14px;
		color: #6c757d;
		font-weight: 400;
		position: absolute;
		right: ${({ isRight }) => (isRight ? '-58px' : 'auto')};
		left: ${({ isRight }) => (isRight ? 'auto' : 'initial')};
	}

	.user-name {
		color: ${({ isRight }) =>
			isRight ? '#1a2942' : 'rgba(255, 255, 255, 0.5)'};
		order: ${({ isRight }) => (isRight ? '2' : 'initial')};
	}
`

const Avatar = styled.div`
	text-align: center;
	img {
		width: 32px;
		height: 32px;
		border-radius: 50%;
	}
`

const MessageList = ({ filteredMessages }) => {
	const {
		currentRoomId,
		currentUser,
		chatBoxUsername,
		openForwardModal,
		deleteSelfMessage,
		deleteGroupMessageForEveryone,
		deleteGroupMessageForMe,
		deleteMessageForMe,
		deleteMessageForEveryone,
		copyMsg,
		isGroupChat,
		renderFilePreview,
	} = useChatContext()

	return (
		<List>
			{filteredMessages.map((msg, index) => {
				if (msg.system) {
					return (
						<SystemMessage key={index}>
							<p className="text-muted">{msg.message}</p>
						</SystemMessage>
					)
				}

				if (msg.deletedForMe) {
					return (
						<MessageItem key={index} isRight={msg.fromUserId === currentRoomId}>
							<ConversationList>
								<div className="d-flex">
									<div className="flex-1 ms-3">
										<div className="d-flex justify-content-between">
											<ConversationName
												isRight={msg.fromUserId === currentRoomId}>
												Message deleted
											</ConversationName>
										</div>
									</div>
								</div>
							</ConversationList>
						</MessageItem>
					)
				}

				const isSentByCurrentUser = msg.fromUserId === currentUser?.id

				const isMessageToSelf = msg.fromUserId === msg.toUserId

				return (
					<MessageItem
						key={index}
						isRight={isSentByCurrentUser || msg.isSentByCurrentUser}>
						<ConversationList>
							<div className="d-flex">
								{msg.images && (
									<Avatar>
										<img src={msg.images} className="rounded-circle" alt="" />
									</Avatar>
								)}
								<div className="flex-1 ms-3">
									<div className="d-flex justify-content-between">
										<ConversationName
											isRight={isSentByCurrentUser || msg.isSentByCurrentUser}>
											{msg.group_id
												? isSentByCurrentUser || msg.isSentByCurrentUser
													? 'You'
													: msg.user
														? `${msg.user.firstname} ${msg.user.lastname}`
														: 'Unknown'
												: msg.fromUserId !== currentRoomId
													? 'You'
													: chatBoxUsername}
										</ConversationName>
										{msg.timestamp && (
											<span className="time fw-normal text-muted me-0 me-md-4">
												{new Date(msg.timestamp).toLocaleTimeString([], {
													hour: '2-digit',
													minute: '2-digit',
												})}
											</span>
										)}
									</div>
									<CtextWrap>
										<CtextWrapContent
											isRight={isSentByCurrentUser || msg.isSentByCurrentUser}>
											<p className="mb-0">{msg.message}</p>
											{msg.file_url && (
												<div>{renderFilePreview(msg, isSentByCurrentUser)}</div>
											)}
										</CtextWrapContent>
										<UncontrolledDropdown className="align-self-start">
											<DropdownToggle tag="a">
												<i className="ri-more-2-fill"></i>
											</DropdownToggle>
											<DropdownMenu>
												{!msg.file_url && (
													<DropdownItem
														onClick={(e) => copyMsg(e.target as HTMLElement)}>
														Copy
													</DropdownItem>
												)}
												<DropdownItem onClick={() => openForwardModal(msg)}>
													Forward
												</DropdownItem>
												{isMessageToSelf && !isGroupChat ? (
													<DropdownItem
														onClick={() => deleteSelfMessage(msg.id)}>
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
																deleteGroupMessageForMe(msg.id, currentRoomId)
															}>
															Delete for Me
														</DropdownItem>
													</>
												) : isSentByCurrentUser ? (
													<>
														<DropdownItem
															onClick={() =>
																deleteMessageForEveryone(msg.id, currentRoomId)
															}>
															Delete for Everyone
														</DropdownItem>
														<DropdownItem
															onClick={() => deleteMessageForMe(msg.id)}>
															Delete for Me
														</DropdownItem>
													</>
												) : (
													<DropdownItem
														onClick={() => deleteMessageForMe(msg.id)}>
														Delete for Me
													</DropdownItem>
												)}
											</DropdownMenu>
										</UncontrolledDropdown>
									</CtextWrap>
								</div>
							</div>
						</ConversationList>
					</MessageItem>
				)
			})}
		</List>
	)
}

export default MessageList
