import { Card, UncontrolledAlert } from 'reactstrap'
import SimpleBar from 'simplebar-react'
import ChatHeader from './ChatHeader'
import MessageList from './MessageList'
import TypingIndicator from './TypingIndicator'
import MessageInput from './MessageInput'
import Spinner from './Spinner'
import styled from 'styled-components'
import { useEffect, useState } from 'react'

const ChatWindow = ({
	currentRoomId,
	chatBoxUsername,
	chatBoxUserStatus,
	chatBoxUserImage,
	groups,
	openGroupInfoModal,
	setSingleButton1,
	singleButton1,
	setSingleButton2,
	singleButton2,
	messages,
	isLoadingMessages,
	currentUser,
	openForwardModal,
	deleteSelfMessage,
	deleteGroupMessageForEveryone,
	deleteGroupMessageForMe,
	deleteMessageForEveryone,
	deleteMessageForMe,
	copyMsg,
	isGroupChat,
	renderFilePreview,
	isTyping,
	typingUsers,
	disabledGroups,
	curMessage,
	onKeyPress,
	handleTyping,
	showEmojiPicker,
	setShowEmojiPicker,
	handleEmojiClick,
	fileInputRef,
	handleFileUpload,
	addMessage,
	selectedFile,
	caption,
	handleCaptionChange,
	handleSendFileMessage,
	isDisable,
	isCaptionTyping,
	emojiPickerRef,
	scrollRef,
	copyMsgAlert,
}) => {
	const [filteredMessages, setFilteredMessages] = useState(messages)

	useEffect(() => {
		setFilteredMessages(messages)
	}, [messages])
	return (
		<div className="w-100 mt-4 mt-sm-0 ms-lg-3">
			<ChatCard>
				{currentRoomId ? (
					<>
						<ChatHeader
							chatBoxUsername={chatBoxUsername}
							chatBoxUserStatus={chatBoxUserStatus}
							chatBoxUserImage={chatBoxUserImage}
							isGroupChat={isGroupChat}
							openGroupInfoModal={openGroupInfoModal}
							setSingleButton1={setSingleButton1}
							singleButton1={singleButton1}
							setSingleButton2={setSingleButton2}
							singleButton2={singleButton2}
							messages={messages}
							setFilteredMessages={setFilteredMessages}
						/>

						<SimpleBarContainer ref={scrollRef} className="p-4">
							{isLoadingMessages ? (
								<Spinner />
							) : (
								<>
									<MessageList
										messages={filteredMessages}
										currentRoomId={currentRoomId}
										currentUser={currentUser}
										chatBoxUsername={chatBoxUsername}
										openForwardModal={openForwardModal}
										deleteSelfMessage={deleteSelfMessage}
										deleteGroupMessageForEveryone={
											deleteGroupMessageForEveryone
										}
										deleteGroupMessageForMe={deleteGroupMessageForMe}
										deleteMessageForEveryone={deleteMessageForEveryone}
										deleteMessageForMe={deleteMessageForMe}
										copyMsg={copyMsg}
										isGroupChat={isGroupChat}
										renderFilePreview={renderFilePreview}
									/>
								</>
							)}
						</SimpleBarContainer>
						<TypingIndicator
							isTyping={isTyping}
							typingUsers={typingUsers}
							isGroupChat={isGroupChat}
						/>
						{copyMsgAlert && (
							<UncontrolledAlert color="warning" dismissible role="alert">
								Message copied
							</UncontrolledAlert>
						)}
						<MessageInput
							curMessage={curMessage}
							onKeyPress={onKeyPress}
							handleTyping={handleTyping}
							showEmojiPicker={showEmojiPicker}
							setShowEmojiPicker={setShowEmojiPicker}
							handleEmojiClick={handleEmojiClick}
							fileInputRef={fileInputRef}
							handleFileUpload={handleFileUpload}
							addMessage={addMessage}
							selectedFile={selectedFile}
							caption={caption}
							handleCaptionChange={handleCaptionChange}
							handleSendFileMessage={handleSendFileMessage}
							isDisable={isDisable}
							isCaptionTyping={isCaptionTyping}
							disabledGroups={disabledGroups}
							emojiPickerRef={emojiPickerRef}
							currentRoomId={currentRoomId}
						/>
					</>
				) : (
					<NoChatSelected>
						<h5 className="text-muted">Select a user to start chatting</h5>
					</NoChatSelected>
				)}
			</ChatCard>
		</div>
	)
}

export default ChatWindow

const ChatCard = styled(Card)`
	display: flex;
	flex-direction: column;
	min-height: calc(100vh - 220px);
`

const SimpleBarContainer = styled(SimpleBar)`
	height: calc(100vh - 300px);
	@media (min-width: 992px) {
		height: calc(100vh - 400px);
	}
`

const NoChatSelected = styled.div`
	display: flex;
	justify-content: center;
	align-items: center;
	flex-grow: 1;
`
