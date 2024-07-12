import React from 'react'
import GenericModal from '../components/GenericModal'
import { Button, ListGroup, ListGroupItem } from 'reactstrap'

interface AddUserToGroupModalProps {
	isOpen: boolean
	toggle: () => void
	filteredChats: any[]
	members: any[]
	currentUser: any
	selectedUsers: Set<string>
	handleUserSelect: (id: string) => void
	addUserToGroup: (groupId: string, userId: string) => void
	removeUserFromGroup: (groupId: string, userId: string) => void
	currentRoomId: string
	setShowAddUserModal: (isOpen: boolean) => void
}

const AddUserToGroupModal: React.FC<AddUserToGroupModalProps> = ({
	isOpen,
	toggle,
	filteredChats,
	members,
	currentUser,
	selectedUsers,
	handleUserSelect,
	addUserToGroup,
	removeUserFromGroup,
	currentRoomId,
	setShowAddUserModal,
}) => {
	const body = (
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
			<Button color="secondary" onClick={toggle}>
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
			isOpen={isOpen}
			toggle={toggle}
			title="Add/Remove User to Group"
			body={body}
			footer={footer}
			className="modalStyle"
		/>
	)
}

export default AddUserToGroupModal
