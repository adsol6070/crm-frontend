import { useMemo, useState } from 'react'
import { Button, Card, Col, Row, Spinner } from 'react-bootstrap'
import { BsPencil, BsPlus, BsTrash } from 'react-icons/bs'
import { PageBreadcrumb, Table } from '@/components'
import { useRoles } from './useRoles'
import PermissionsModal from './PermissionsModal'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/ReactToastify.css'

const Roles = () => {
	const { columns, permissionsData, fetchPermissions, deletePermission, loading } =
		useRoles()
	const [showModal, setShowModal] = useState(false)
	const [modalMode, setModalMode] = useState('create')
	const [currentPermissions, setCurrentPermissions] = useState({})
	const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([])
	console.log("SelectedIds ", selectedRoleIds)

	let toggleAllRowsSelected: (() => void) | undefined

	const showDeleteSelectedButton = selectedRoleIds?.length > 0

	const handleDeleteSelected = async (selectedRoleIds: any[]) => {
		try {
			// await leadApi.deleteSelectedLeads({ leadIds: selectedUserIds })
			toast.success('Roles deleted successfully.')
			setSelectedRoleIds([])
			toggleAllRowsSelected && toggleAllRowsSelected(false)
		} catch (error) {
			toast.error('Failed to delete roles.')
			console.error(error)
		}
	}

	const handleDeleteSelectedRoles = () => {
		handleDeleteSelected(selectedRoleIds)
	}

	const handleOpenModal = (mode: string, permissions = {}) => {
		setModalMode(mode)
		setCurrentPermissions(permissions)
		setShowModal(true)
	}

	const enhancedColumns = useMemo(() => [
		...columns,
		{
			Header: 'Action',
			Cell: ({ row }: any) => (
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
	], [])

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
								<div className="d-flex justify-content-between align-items-center">
									<div>
										{showDeleteSelectedButton && (
											<Button
												variant="danger"
												onClick={handleDeleteSelectedRoles}
												className="mx-2">
												{`Delete ${selectedRoleIds.length} Selected`}
											</Button>
										)}
									</div>
									<div>
										<Button
											variant="success"
											onClick={() => handleOpenModal('create')}>
											<BsPlus className="me-1" /> Add New Role
										</Button>
									</div>
								</div>
							</div>
						</Card.Header>
						<Card.Body>
							{loading ? (
								<div className="text-center" style={{ height: "500px", display: "flex", alignItems: "center", justifyContent: "center" }}>
									<Spinner animation="border" role="status">
										<span className="visually-hidden">Loading...</span>
									</Spinner>
								</div>
							) : (
								<Table
									columns={enhancedColumns}
									data={permissionsData}
									pageSize={5}
									isSortable={true}
									pagination={true}
									isSelectable={true}
									isSearchable={true}
									setSelectedUserIds={setSelectedRoleIds}
									toggleAllRowsSelected={(val) => (toggleAllRowsSelected = val)}
								/>)}
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
