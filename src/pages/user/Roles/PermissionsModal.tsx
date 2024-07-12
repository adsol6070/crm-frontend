import { permissionService } from '@/common'
import React, { useEffect, useState } from 'react'
import {
	Button,
	Form,
	FormControl,
	InputGroup,
	Modal,
	Table,
} from 'react-bootstrap'
import { toast } from 'react-toastify'

interface PermissionOperation {
	[key: string]: boolean
}

interface Permissions {
	[category: string]: PermissionOperation
}

interface PermissionsModalProps {
	showModal: boolean
	permissions: Permissions
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
	Leads: {
		Create: false,
		View: false,
		Assign: false,
		Status: false,
		AddNotes: false,
		EditNote: false,
		DeleteNote: false,
		DeleteNotes: false,
		History: false,
		Edit: false,
		Delete: false,
		DeleteAll: false,
		ImportBulk: false,
		DownloadCSV: false,
		DownloadCSVFormat: false,
	},
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
			setLocalPermissions((prevPermissions) => {
				const updatedPermissions = { ...prevPermissions }
				Object.keys(permissions).forEach((category) => {
					if (updatedPermissions[category]) {
						updatedPermissions[category] = {
							...updatedPermissions[category],
							...permissions[category],
						}
					} else {
						updatedPermissions[category] = { ...permissions[category] }
					}
				})
				return updatedPermissions
			})
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

	const handleCheckboxChange = (category: string, operation: string) => {
		const updatedPermissions = {
			...localPermissions,
			[category]: {
				...localPermissions[category],
				[operation]: !localPermissions[category][operation],
			},
		}
		setLocalPermissions(updatedPermissions)
	}

	const handleSelectAllChange = (category: string) => {
		const allChecked = Object.values(localPermissions[category]).every(Boolean)
		const updatedPermissions = {
			...localPermissions,
			[category]: Object.keys(localPermissions[category]).reduce((acc, key) => {
				acc[key] = !allChecked
				return acc
			}, {} as PermissionOperation),
		}
		setLocalPermissions(updatedPermissions)
	}

	const renderPermissions = (category: string) => {
		const operations = localPermissions[category]
		const operationKeys = Object.keys(operations)
		const rows = []

		for (let i = 0; i < operationKeys.length; i += 4) {
			const row = operationKeys.slice(i, i + 4).map((operation) => (
				<td key={operation}>
					<Form.Check
						type="checkbox"
						label={operation}
						checked={!!localPermissions[category][operation]}
						onChange={() => handleCheckboxChange(category, operation)}
					/>
				</td>
			))
			rows.push(<tr key={i}>{row}</tr>)
		}
		return rows
	}

	const renderCategories = () => {
		if (!localPermissions) return null
		return Object.keys(localPermissions).map((category) => (
			<React.Fragment key={category}>
				<tr>
					<td colSpan={4} className="fw-bold">
						<Form.Check
							type="checkbox"
							label={`All Permissions on ${category}`}
							checked={Object.values(localPermissions[category]).every(Boolean)}
							onChange={() => handleSelectAllChange(category)}
						/>
					</td>
				</tr>
				{renderPermissions(category)}
			</React.Fragment>
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
		<Modal show={showModal} onHide={handleCloseModal} centered size="lg">
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
				<Table responsive bordered hover>
					<thead className="thead-light">
						<tr>
							<th>Category</th>
							<th colSpan={3}>Permissions</th>
						</tr>
					</thead>
					<tbody>{renderCategories()}</tbody>
				</Table>
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
	)
}

export default PermissionsModal
