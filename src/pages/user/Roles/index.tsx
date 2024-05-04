import { useState } from 'react'
import { Button, Card, Col, Row } from 'react-bootstrap'
import { BsPlus } from 'react-icons/bs'
import { PageBreadcrumb, Table } from '@/components'
import { useRoles } from './useRoles'
import PermissionsModal from './PermissionsModal'

const Roles = () => {
	const { columns, sampleData } = useRoles()
	const [showModal, setShowModal] = useState(false)

	const handleAddNewRole = () => {
		setShowModal(true)
	}

	const handleCloseModal = () => {
		setShowModal(false)
	}

	return (
		<>
			<PageBreadcrumb title="Roles List" subName="Roles" />
			<Row>
				<Col>
					<Card>
						<Card.Header>
							<div className="d-flex justify-content-between align-items-center">
								<div>
									<h4 className="header-title">
										Roles And Permissions Management
									</h4>
									<p className="text-muted mb-0">
										View and manage user roles and permissions in the system.
									</p>
								</div>
								<div>
									<Button variant="success" onClick={handleAddNewRole}>
										<BsPlus className="me-1" /> Add New Role
									</Button>
								</div>
							</div>
						</Card.Header>
						<Card.Body>
							<Table
								columns={columns}
								data={sampleData}
								pageSize={10}
								isSortable={true}
								pagination={true}
								isSearchable={true}
								searchBoxClass="mt-3"
								tableClass="mt-3"
								theadClass="thead-light"
							/>
						</Card.Body>
					</Card>
				</Col>
			</Row>
			<PermissionsModal showModal={showModal} handleClose={handleCloseModal} />
		</>
	)
}

export default Roles
