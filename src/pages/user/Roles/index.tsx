import { useState } from 'react'
import { Button, Card, Col, Row } from 'react-bootstrap'
import { BsPencil, BsPlus, BsTrash } from 'react-icons/bs'
import { PageBreadcrumb, Table } from '@/components'
import { useRoles } from './useRoles'
import PermissionsModal from './PermissionsModal'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/ReactToastify.css'

const Roles = () => {
	const { columns, permissionsData, fetchPermissions, deletePermission } =
		useRoles()
	const [showModal, setShowModal] = useState(false)
	const [modalMode, setModalMode] = useState('create')
	const [currentPermissions, setCurrentPermissions] = useState({})

	const handleOpenModal = (mode: string, permissions = {}) => {
		setModalMode(mode)
		setCurrentPermissions(permissions)
		setShowModal(true)
	}

	const enhancedColumns = [
		...columns,
		{
			Header: 'Action',
			Cell: ({ row }) => (
				<div>
					<span className="me-2">
						<BsPencil
							color="blue"
							cursor="pointer"
							onClick={() => handleOpenModal('edit', row.original)}
						/>
					</span>
					<span>
						<BsTrash
							color="red"
							cursor="pointer"
							style={{ marginLeft: 12 }}
							onClick={() => deletePermission(row.original.id)}
						/>
					</span>
				</div>
			),
		},
	]

	return (
		<>
			<ToastContainer />
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
									<Button
										variant="success"
										onClick={() => handleOpenModal('create')}>
										<BsPlus className="me-1" /> Add New Role
									</Button>
								</div>
							</div>
						</Card.Header>
						<Card.Body>
							<Table
								columns={enhancedColumns}
								data={permissionsData}
								pageSize={7}
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
			<PermissionsModal
				showModal={showModal}
				permissions={currentPermissions.permissions || {}}
				roleName={currentPermissions.role || ''}
				permissionId={currentPermissions.id}
				mode={modalMode}
				setModalMode={setModalMode}
				setCurrentPermissions={setCurrentPermissions}
				setShowModal={setShowModal}
				onPermissionsChange={fetchPermissions}
			/>
		</>
	)
}

export default Roles
