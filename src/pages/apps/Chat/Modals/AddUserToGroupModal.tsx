import { useState } from 'react'
import GenericModal from '../components/GenericModal'
import { Button, ListGroup, ListGroupItem } from 'reactstrap'
import { useChatContext } from '../context/chatContext'
import SocketManager from '@/common/context/SocketManager'

const AddUserToGroupModal = () => {
	const {
		chats,
		currentUser,
		members,
		currentRoomId,
		showAddUserModal,
		setShowAddUserModal,
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

	const closeAddRemoveUserModal = () => {
		setShowAddUserModal(false)
		setSelectedUsers(new Set())
	}

	const addUserToGroup = async (groupId: string, userId: string) => {
		const socket = SocketManager.getSocket()
		socket?.emit('addUserToGroup', { groupId, userId })
	}

	const removeUserFromGroup = async (groupId: string, userId: string) => {
		const socket = SocketManager.getSocket()
		socket?.emit('removeUserFromGroup', { groupId, userId })
	}

	const body = (
		<ListGroup>
			{chats.map((chat) => {
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
									onClick={() => removeUserFromGroup(currentRoomId, chat.id)}
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
	)

	const footer = (
		<>
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
		</>
	)

	return (
		<GenericModal
			isOpen={showAddUserModal}
			toggle={closeAddRemoveUserModal}
			title="Add/Remove User to Group"
			body={body}
			footer={footer}
			className="modalStyle"
		/>
	)
}

export default AddUserToGroupModal
