import { useState } from 'react'
import GenericModal from '../components/GenericModal'
import { Button, ListGroup, ListGroupItem } from 'reactstrap'
import { useChatContext } from '../context/chatContext'
import SocketManager from '@/common/context/SocketManager'

const ForwardMessageModal = () => {
	const {
		chats,
		isGroupChat,
		showForwardModal,
		setShowForwardModal,
		messageToForward,
		setMessageToForward,
	} = useChatContext()
	const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set())

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

	const forwardMessage = () => {
		const socket = SocketManager.getSocket()
		socket?.emit('forwardMessage', {
			messageId: messageToForward.id,
			toUserIds: Array.from(selectedUsers),
			isGroup: isGroupChat,
		})
		closeForwardModal()
	}

	const closeForwardModal = () => {
		setShowForwardModal(false)
		setMessageToForward(null)
		setSelectedUsers(new Set())
	}

	const body = (
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
	)

	const footer = (
		<>
			<Button color="secondary" onClick={closeForwardModal}>
				Cancel
			</Button>
			<Button color="primary" onClick={forwardMessage}>
				Forward
			</Button>
		</>
	)

	return (
		<GenericModal
			isOpen={showForwardModal}
			toggle={closeForwardModal}
			title="Forward Message"
			body={body}
			footer={footer}
		/>
	)
}

export default ForwardMessageModal
