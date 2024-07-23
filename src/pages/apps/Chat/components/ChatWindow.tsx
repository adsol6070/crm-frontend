import { Card, UncontrolledAlert } from 'reactstrap'
import SimpleBar from 'simplebar-react'
import ChatHeader from './ChatHeader'
import MessageList from './MessageList'
import TypingIndicator from './TypingIndicator'
import MessageInput from './MessageInput'
import Spinner from './Spinner'
import styled from 'styled-components'
import { useEffect, useState } from 'react'
import { useChatContext } from '../context/chatContext'

const ChatWindow = () => {
	const {
		currentRoomId,
		messages,
		isLoadingMessages,
		scrollRef,
		copyMsgAlert,
	} = useChatContext()
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
							messages={messages}
							setFilteredMessages={setFilteredMessages}
						/>

						<SimpleBarContainer ref={scrollRef} className="p-4">
							{isLoadingMessages ? (
								<Spinner />
							) : filteredMessages.length === 0 ? (
								<NoMessagesFound>
									<h5>No chat found</h5>
								</NoMessagesFound>
							) : (
								<>
									<MessageList filteredMessages={filteredMessages} />
								</>
							)}
						</SimpleBarContainer>
						<TypingIndicator />
						{copyMsgAlert && (
							<UncontrolledAlert color="warning" dismissible role="alert">
								Message copied
							</UncontrolledAlert>
						)}
						<MessageInput />
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

const NoMessagesFound = styled.div`
	display: flex;
	justify-content: center;
	align-items: center;
	height: 100%;
`
