import { ChangeEvent, useState } from 'react'
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
import styled from 'styled-components'
import { useChatContext } from '../context/chatContext'
import SocketManager from '@/common/context/SocketManager'
import { chatApi, useAuthContext } from '@/common'

const MySwal = withReactContent(Swal)

const CustomListGroup = styled(ListGroup)`
	max-height: 200px;
	overflow-y: auto;

	&::-webkit-scrollbar {
		width: 8px;
	}

	&::-webkit-scrollbar-track {
		background: #f1f1f1;
	}

	&::-webkit-scrollbar-thumb {
		background: #888;
		border-radius: 10px;
	}

	&::-webkit-scrollbar-thumb:hover {
		background: #555;
	}
`

const CreateGroupModal = () => {
	const { user } = useAuthContext()
	const { chats, currentUser, showCreateGroupModal, setShowCreateGroupModal } =
		useChatContext()
	const [groupName, setGroupName] = useState<string>('')
	const [groupImage, setGroupImage] = useState<any | null>(null)
	const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set())

	const handleGroupImageChange = (e: ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (file) {
			setGroupImage(file)
		}
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

	const handleCreateGroup = async () => {
		if (!groupName.trim()) {
			MySwal.fire({
				text: 'Please enter a group name.',
				icon: 'warning',
				confirmButtonText: 'Ok',
			})
			return
		}

		if (selectedUsers.size < 1) {
			MySwal.fire({
				text: 'Please select at least one user to create a group.',
				icon: 'warning',
				confirmButtonText: 'Ok',
			})
			return
		}

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

		const userIds = Array.from(selectedUsers)
		userIds.push(currentUser?.id as string)

		socket?.emit('createGroup', {
			tenantID: user.tenantID,
			groupName,
			userIds,
			image: imageUrl,
		})
		handleCloseCreateGroupModal()
	}

	const handleCloseCreateGroupModal = () => {
		setShowCreateGroupModal(false)
		setGroupName('')
		setGroupImage(null)
		setSelectedUsers(new Set())
	}

	// Filter out the currentUser from the chats array
	const filteredChats = chats.filter((chat) => chat.id !== currentUser?.id)

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
				<CustomListGroup className="mt-3 chat-list modalStyle">
					{filteredChats.length > 0 ? (
						filteredChats.map((chat) => (
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
						))
					) : (
						<p className="text-center">No members except you.</p>
					)}
				</CustomListGroup>
			</FormGroup>
		</Form>
	)

	const footer = (
		<>
			<Button color="secondary" onClick={handleCloseCreateGroupModal}>
				Cancel
			</Button>
			<Button color="primary" onClick={handleCreateGroup}>
				Create
			</Button>
		</>
	)

	return (
		<GenericModal
			isOpen={showCreateGroupModal}
			toggle={handleCloseCreateGroupModal}
			title="Create Group"
			body={body}
			footer={footer}
		/>
	)
}

export default CreateGroupModal
