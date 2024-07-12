import React from 'react'
import { Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap'

interface GenericModalProps {
	isOpen: boolean
	toggle: () => void
	title: string | React.ReactNode
	body: React.ReactNode
	footer: React.ReactNode
	className?: string
}

const GenericModal: React.FC<GenericModalProps> = ({
	isOpen,
	toggle,
	title,
	body,
	footer,
	className,
}) => {
	return (
		<Modal isOpen={isOpen} toggle={toggle}>
			<ModalHeader toggle={toggle}>{title}</ModalHeader>
			<ModalBody className={className}>{body}</ModalBody>
			<ModalFooter>{footer}</ModalFooter>
		</Modal>
	)
}

export default GenericModal
