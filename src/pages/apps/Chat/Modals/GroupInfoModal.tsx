import React from 'react'
import GenericModal from '../components/GenericModal'
import { ListGroup, ListGroupItem } from 'reactstrap'

interface GroupInfoModalProps {
	isOpen: boolean
	toggle: () => void
	members: any[]
	renderAddRemoveUserOptions: () => JSX.Element | null
	renderLeaveGroupButton: () => JSX.Element | null
}

const GroupInfoModal: React.FC<GroupInfoModalProps> = ({
	isOpen,
	toggle,
	members,
	renderAddRemoveUserOptions,
	renderLeaveGroupButton,
}) => {
	const body = (
		<ListGroup>
			{members.map((member) => (
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
			))}
		</ListGroup>
	)

	const footer = <>{renderLeaveGroupButton()}</>

	return (
		<GenericModal
			isOpen={isOpen}
			toggle={toggle}
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
