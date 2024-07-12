import React from 'react'
import GenericModal from '../components/GenericModal'
import { Button, ListGroup, ListGroupItem } from 'reactstrap'

interface ForwardMessageModalProps {
	isOpen: boolean
	toggle: () => void
	chats: any[]
	selectedUsers: Set<string>
	handleUserSelect: (id: string) => void
	forwardMessage: () => void
}

const ForwardMessageModal: React.FC<ForwardMessageModalProps> = ({
	isOpen,
	toggle,
	chats,
	selectedUsers,
	handleUserSelect,
	forwardMessage,
}) => {
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
			<Button color="secondary" onClick={toggle}>
				Cancel
			</Button>
			<Button color="primary" onClick={forwardMessage}>
				Forward
			</Button>
		</>
	)

	return (
		<GenericModal
			isOpen={isOpen}
			toggle={toggle}
			title="Forward Message"
			body={body}
			footer={footer}
		/>
	)
}

export default ForwardMessageModal
