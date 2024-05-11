import { permissionService } from '@/common'
import React, { useEffect, useState } from 'react'
import { Button, Form, FormControl, InputGroup, Modal } from 'react-bootstrap'
import { toast } from 'react-toastify'

interface PermissionOperation {
	Create: boolean
	Read: boolean
	Update: boolean
	Delete: boolean
}

interface Permissions {
	[category: string]: PermissionOperation
}

interface PermissionsModalProps {
	showModal: boolean
	permissions: {}
	roleName: string
	permissionId: string
	mode: string
	setModalMode: (mode: string) => void
	setCurrentPermissions: (permissions: any) => void
	setShowModal: (show: boolean) => void
	onPermissionsChange: () => void
}

const initialPermissions: Permissions = {
	Blogs: { Create: false, Read: false, Update: false, Delete: false },
	Users: { Create: false, Read: false, Update: false, Delete: false },
}

const standardizeRoleName = (role: string) => {
	return role
		.trim()
		.toLowerCase()
		.replace(/\s+/g, ' ')
		.replace(/[^\w\s]/g, '')
}

const PermissionsModal: React.FC<PermissionsModalProps> = ({
	showModal,
	permissions = {},
	roleName = '',
	permissionId,
	mode = 'create',
	setModalMode,
	setCurrentPermissions,
	setShowModal,
	onPermissionsChange,
}) => {
	const [localPermissions, setLocalPermissions] =
		useState<Permissions>(initialPermissions)
	const [localRoleName, setLocalRoleName] = useState<string>('')
	const [isSaving, setIsSaving] = useState<boolean>(false)

	useEffect(() => {
		if (permissions && mode === 'edit') {
			setLocalPermissions(permissions)
			setLocalRoleName(roleName)
		}
	}, [permissions, roleName])

	const handleCloseModal = () => {
		setShowModal(false)
		setModalMode('create')
		setCurrentPermissions({})
		setLocalPermissions(initialPermissions)
		setLocalRoleName('')
	}

	const handleCheckboxChange = (
		category: string,
		operation: keyof PermissionOperation
	) => {
		const updatedPermissions = {
			...localPermissions,
			[category]: {
				...localPermissions[category],
				[operation]: !localPermissions[category][operation],
			},
		}
		setLocalPermissions(updatedPermissions)
	}

	const renderCategoryCheckboxes = (category: string) => {
		const operations = localPermissions[category]
		return Object.keys(operations).map((operation) => (
			<td key={operation}>
				<Form.Check
					type="checkbox"
					checked={
						localPermissions[category][operation as keyof PermissionOperation]
					}
					onChange={() =>
						handleCheckboxChange(
							category,
							operation as keyof PermissionOperation
						)
					}
				/>
			</td>
		))
	}

	const renderCategories = () => {
		if (!localPermissions) return null
		return Object.keys(localPermissions).map((category) => (
			<tr key={category}>
				<td>{category}</td>
				{renderCategoryCheckboxes(category)}
			</tr>
		))
	}

	const saveChanges = async () => {
		const standardizedRoleName = standardizeRoleName(localRoleName)
		if (!localRoleName) {
			toast.error('Role name is required.')
			return
		}
		setIsSaving(true)
		try {
			const payload = {
				role: standardizedRoleName,
				permissions: localPermissions,
			}

			await permissionService[mode === 'edit' ? 'update' : 'create'](
				payload,
				permissionId
			)
			toast.success(
				`Permissions successfully ${mode === 'edit' ? 'updated' : 'saved'}.`
			)
			handleCloseModal()
			onPermissionsChange()
		} catch (error) {
			toast.error('Failed to save permissions.')
			console.error('Failed to save permissions:', error)
		} finally {
			setIsSaving(false)
		}
	}

	return (
		<>
			<Modal show={showModal} onHide={handleCloseModal} centered>
				<Modal.Header closeButton>
					<Modal.Title>
						{mode === 'edit' ? 'Edit' : 'Manage'} Permissions
					</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<InputGroup className="mb-3">
						<InputGroup.Text id="role-name">Role Name</InputGroup.Text>
						<FormControl
							placeholder="Enter role name"
							aria-label="Role Name"
							aria-describedby="role-name"
							value={localRoleName}
							onChange={(e) => setLocalRoleName(e.target.value)}
							disabled={isSaving}
						/>
					</InputGroup>
					<table className="table">
						<thead>
							<tr>
								<th>Category</th>
								<th>Create</th>
								<th>Read</th>
								<th>Update</th>
								<th>Delete</th>
							</tr>
						</thead>
						<tbody>{renderCategories()}</tbody>
					</table>
				</Modal.Body>
				<Modal.Footer>
					<Button
						variant="secondary"
						onClick={handleCloseModal}
						disabled={isSaving}>
						Close
					</Button>
					<Button variant="primary" onClick={saveChanges} disabled={isSaving}>
						{mode === 'edit' ? 'Save Edits' : 'Save Changes'}
					</Button>
				</Modal.Footer>
			</Modal>
		</>
	)
}

export default PermissionsModal
