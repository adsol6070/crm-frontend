import GenericModal from '../components/GenericModal'
import { Button, ListGroup, ListGroupItem } from 'reactstrap'
import { useChatContext } from '../context/chatContext'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import SocketManager from '@/common/context/SocketManager'
import styled from 'styled-components'

const MySwal = withReactContent(Swal)

const CustomListGroup = styled(ListGroup)`
	max-height: 160px;
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

const GroupInfoModal = () => {
	const {
		isGroupChat,
		currentUser,
		groups,
		currentRoomId,
		members,
		setShowAddUserModal,
		showGroupInfoModal,
		setShowGroupInfoModal,
	} = useChatContext()

	const leaveGroup = async (groupId: string) => {
		const result = await MySwal.fire({
			title: 'Are you sure?',
			text: 'Are you sure you want to leave this group?',
			icon: 'warning',
			showCancelButton: true,
			confirmButtonColor: '#3085d6',
			cancelButtonColor: '#d33',
			confirmButtonText: 'Yes, leave it!',
		})

		if (result.isConfirmed) {
			const socket = SocketManager.getSocket()
			socket?.emit('leaveGroup', { groupId })
			setShowGroupInfoModal(false)
		}
	}

	const renderAddRemoveUserOptions = () => {
		if (
			isGroupChat &&
			currentUser?.id ===
				groups.find((group) => group.id === currentRoomId)?.creator_id
		) {
			return (
				<Button
					color="primary"
					onClick={() => setShowAddUserModal(true)}
					className="ms-2">
					Add or Remove User
				</Button>
			)
		}
		return null
	}

	const renderLeaveGroupButton = () => {
		if (
			isGroupChat &&
			members.some((member) => member.id === currentUser?.id)
		) {
			return (
				<Button color="danger" onClick={() => leaveGroup(currentRoomId)}>
					Leave Group
				</Button>
			)
		}
		return null
	}

	const body = (
		<CustomListGroup>
			{members.map((member) => (
				<>
					<ListGroupItem
						key={member.id}
						style={{ cursor: 'pointer', userSelect: 'none' }}>
						<div className="d-flex align-items-center">
							<img
								src={member.profileImage}
								className="rounded-circle me-3"
								alt=""
								style={{ height: '2.6rem', width: '2.6rem' }}
							/>
							<div>
								<h5 className="mb-0">
									{member.firstname} {member.lastname}
								</h5>
								<p className="text-muted mb-0">
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
						</div>
					</ListGroupItem>
				</>
			))}
		</CustomListGroup>
	)

	const footer = <>{renderLeaveGroupButton()}</>

	return (
		<GenericModal
			isOpen={showGroupInfoModal}
			toggle={() => setShowGroupInfoModal(false)}
			title={
				<div className="d-flex justify-content-between align-items-center w-100">
					<div>Group Information</div>
					{renderAddRemoveUserOptions()}
				</div>
			}
			body={body}
			footer={footer}
			className="modalStyle"
		/>
	)
}

export default GroupInfoModal
