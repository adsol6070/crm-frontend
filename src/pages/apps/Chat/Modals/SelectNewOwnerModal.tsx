import GenericModal from '../components/GenericModal'
import { Button, ListGroup, ListGroupItem } from 'reactstrap'
import { useChatContext } from '../context/chatContext'
import SocketManager from '@/common/context/SocketManager'

const SelectNewOwnerModal = () => {
	const {
		currentUser,
		currentRoomId,
		showSelectNewOwnerModal,
		handleCloseSelectNewOwnerModal,
		selectedMember,
		setSelectedMember,
		members,
	} = useChatContext()

	const filteredMembers = members.filter(
		(member) => member.id !== currentUser?.id
	)

	const handleSelectNewOwner = (id: string) => {
		setSelectedMember(id)
	}

	const handleConfirmNewOwner = () => {
		const socket = SocketManager.getSocket()
		if (selectedMember) {
			socket?.emit('transferGroupOwnership', {
				groupId: currentRoomId,
				newOwnerId: selectedMember,
			})
			handleCloseSelectNewOwnerModal()
		}
	}

	const body = (
		<ListGroup>
			{filteredMembers.map((member) => (
				<ListGroupItem
					key={member.id}
					onClick={() => handleSelectNewOwner(member.id)}
					className={`d-flex align-items-center ${selectedMember === member.id ? 'bg-light' : ''}`}
					style={{ cursor: 'pointer', userSelect: 'none' }}>
					<input
						type="checkbox"
						checked={selectedMember === member.id}
						onChange={() => handleSelectNewOwner(member.id)}
						className="me-3"
						onClick={(e) => e.stopPropagation()}
						style={{ userSelect: 'none' }}
					/>
					<img
						src={member.profileImage}
						className="rounded-circle me-3"
						alt=""
						style={{ height: '2.6rem', width: '2.6rem', userSelect: 'none' }}
					/>
					<div>
						<h5
							className="mb-0"
							style={{
								userSelect: 'none',
							}}>{`${member.firstname} ${member.lastname}`}</h5>
						<p className="text-muted mb-0" style={{ userSelect: 'none' }}>
							{member.online
								? 'Online'
								: `Last seen at ${new Date(
										member.last_active
									).toLocaleTimeString([], {
										hour: '2-digit',
										minute: '2-digit',
									})}`}
						</p>
					</div>
				</ListGroupItem>
			))}
		</ListGroup>
	)

	const footer = (
		<>
			<Button color="secondary" onClick={handleCloseSelectNewOwnerModal}>
				Cancel
			</Button>
			<Button color="primary" onClick={handleConfirmNewOwner}>
				Confirm
			</Button>
		</>
	)

	return (
		<GenericModal
			isOpen={showSelectNewOwnerModal}
			toggle={handleCloseSelectNewOwnerModal}
			title="Select New Group Owner"
			body={body}
			footer={footer}
		/>
	)
}

export default SelectNewOwnerModal
