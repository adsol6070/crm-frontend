import React, { ChangeEvent } from 'react'
import GenericModal from '../components/GenericModal'
import {
	Button,
	Form,
	FormGroup,
	Input,
	Label,
	ListGroup,
	ListGroupItem,
} from 'reactstrap'
import withReactContent from 'sweetalert2-react-content'
import Swal from 'sweetalert2'

const MySwal = withReactContent(Swal)

interface CreateGroupModalProps {
	isOpen: boolean
	toggle: () => void
	groupName: string
	setGroupName: (name: string) => void
	handleGroupImageChange: (e: ChangeEvent<HTMLInputElement>) => void
	chats: any[]
	currentUser: any
	selectedUsers: Set<string>
	handleUserSelect: (id: string) => void
	handleCreateGroup: () => void
}

const CreateGroupModal: React.FC<CreateGroupModalProps> = ({
	isOpen,
	toggle,
	groupName,
	setGroupName,
	handleGroupImageChange,
	chats,
	currentUser,
	selectedUsers,
	handleUserSelect,
	handleCreateGroup,
}) => {
	const validateAndCreateGroup = () => {
		if (selectedUsers.size < 1) {
			MySwal.fire({
				text: 'Please select at least one user to create a group.',
				icon: 'warning',
				confirmButtonText: 'Ok',
			})
		} else {
			handleCreateGroup()
		}
	}

	const body = (
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
										onChange={(e) => handleUserSelect(chat.id)}
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
											<p className="text-muted mb-0">{chat.description}</p>
										</div>
									</div>
								</div>
							</ListGroupItem>
						))}
				</ListGroup>
			</FormGroup>
		</Form>
	)

	const footer = (
		<>
			<Button color="secondary" onClick={toggle}>
				Cancel
			</Button>
			<Button color="primary" onClick={validateAndCreateGroup}>
				Create
			</Button>
		</>
	)

	return (
		<GenericModal
			isOpen={isOpen}
			toggle={toggle}
			title="Create Group"
			body={body}
			footer={footer}
		/>
	)
}

export default CreateGroupModal
