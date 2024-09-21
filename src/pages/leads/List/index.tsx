import { useState, useMemo } from 'react'
import { PageBreadcrumb, Table } from '@/components'
import { Row, Col, Card, Button, Nav, Spinner } from 'react-bootstrap'
import { useLeadList } from './useLeadList'
import { LeadData } from '@/types'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import BulkLeadModal from './modals/bulkLeadModal'
import AssignModal from './modals/assignModal'
import styles from './LeadList.module.css'
import { useUserList } from '@/pages/user/List/useUserList'
import HistoryModal from './modals/HistoryModal'
import { usePermissions, useThemeContext } from '@/common'
import { capitalizeFirstLetter, hasPermission, textStyle } from '@/utils'

const LeadList = () => {
	const { settings } = useThemeContext()
	const { permissions } = usePermissions()
	const {
		columns,
		sizePerPageList,
		leadRecords,
		refreshLeads,
		deleteAllLeads,
		downloadCSV,
		visaCategories,
		showAssignModal,
		selectedLeadId,
		handleAssign,
		showHistoryModal,
		setShowHistoryModal,
		historyData,
		handleCloseAssignModal,
		selectedAssignees,
		setSelectedAssignees,
		loading,
	} = useLeadList()

	const [showModal, setShowModal] = useState(false)
	const [selectedCategory, setSelectedCategory] = useState('All')
	const { userRecords } = useUserList()
	const [currentPage, setCurrentPage] = useState(1)

	const [selectedUserIds, setSelectedUserIds] = useState<string[]>([])

	console.log('SelectedUserIDs in Lead List page:', selectedUserIds)

	const handleShow = () => setShowModal(true)
	const handleClose = () => setShowModal(false)

	const downloadCSVTemplate = () => {
		const link = document.createElement('a')
		link.href = '/format-file.csv'
		link.setAttribute('download', 'Bulk-Lead-Format.csv')
		document.body.appendChild(link)
		link.click()
		document.body.removeChild(link)
	}

	const handleSelectCategory = (category: any) => {
		setSelectedCategory(category)
		setCurrentPage(1)
	}

	const filteredLeads = useMemo(() => {
		return selectedCategory === 'All'
			? leadRecords
			: leadRecords.filter((lead) => lead.visaCategory === selectedCategory)
	}, [selectedCategory, leadRecords])

	return (
		<>
			<ToastContainer />
			<PageBreadcrumb title="Leads List" subName="Leads" />
			<Row>
				<Col>
					<Card>
						<Card.Header>
							<Row className="align-items-center">
								<Col xs={12} md={6}>
									<h4 className="header-title">Lead Management</h4>
									<p className="text-muted mb-0">
										View and manage Lead accounts in the system.
									</p>
								</Col>
								<Col
									xs={12}
									md={6}
									className="text-md-end text-center mt-3 mt-md-0">
									{hasPermission(permissions, 'Leads', 'DownloadCSVFormat') && (
										<Button
											className="m-2"
											variant="secondary"
											onClick={downloadCSVTemplate}>
											Download CSV Format
										</Button>
									)}
									{hasPermission(permissions, 'Leads', 'ImportBulk') && (
										<Button
											className="m-2"
											variant="success"
											onClick={handleShow}>
											Import Bulk Leads
										</Button>
									)}
									{hasPermission(permissions, 'Leads', 'DownloadCSV') && (
										<Button
											className="m-2"
											variant="primary"
											onClick={() => downloadCSV(selectedCategory)}>
											Download CSV
										</Button>
									)}
								</Col>
							</Row>
						</Card.Header>
						<Card.Body>
							<div className={styles.tabStyling}>
								<Nav
									variant="pills"
									activeKey={selectedCategory}
									onSelect={handleSelectCategory}
									className={styles.customTabs}>
									<Nav.Item className={styles.navItem}>
										<Nav.Link
											eventKey="All"
											className={styles.navLink}
											style={textStyle(settings.theme === 'dark')}>
											<i className={`bi bi-list ${styles.navLinkIcon}`}></i> All
										</Nav.Link>
									</Nav.Item>
									{visaCategories.map((category) => (
										<Nav.Item key={category} className={styles.navItem}>
											<Nav.Link
												eventKey={category}
												className={styles.navLink}
												style={textStyle(settings.theme === 'dark')}>
												<i
													className={`bi bi-${category.toLowerCase()} ${styles.navLinkIcon}`}></i>{' '}
												{capitalizeFirstLetter(category)}
											</Nav.Link>
										</Nav.Item>
									))}
								</Nav>
								{hasPermission(permissions, 'Leads', 'DeleteAll') && (
									<button
										className={`${styles.deleteAllLeads}`}
										onClick={deleteAllLeads}>
										Delete All Leads
									</button>
								)}
							</div>
							{loading ? (
								<div
									className="text-center"
									style={{
										height: '500px',
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
									}}>
									<Spinner animation="border" role="status">
										<span className="visually-hidden">Loading...</span>
									</Spinner>
								</div>
							) : (
								<Table<LeadData>
									columns={columns}
									data={filteredLeads}
									pageSize={5}
									sizePerPageList={sizePerPageList}
									isSortable={true}
									pagination={true}
									isSearchable={true}
									isSelectable={true}
									setSelectedUserIds={setSelectedUserIds}
								/>
							)}
						</Card.Body>
					</Card>
				</Col>
			</Row>
			<BulkLeadModal
				show={showModal}
				handleClose={handleClose}
				refreshLeads={refreshLeads}
			/>
			<AssignModal
				show={showAssignModal}
				handleClose={handleCloseAssignModal}
				handleAssign={handleAssign}
				leadId={selectedLeadId}
				users={userRecords}
				selectedAssignees={selectedAssignees}
				setSelectedAssignees={setSelectedAssignees}
			/>
			<HistoryModal
				show={showHistoryModal}
				onHide={() => setShowHistoryModal(false)}
				historyData={historyData}
			/>
		</>
	)
}

export default LeadList
