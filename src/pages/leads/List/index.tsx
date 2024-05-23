import { PageBreadcrumb, Table } from '@/components'
import { Row, Col, Card, Button } from 'react-bootstrap'
import { useLeadList } from './useLeadList'
import { Lead } from '@/types'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/ReactToastify.css'

const LeadList = () => {
    const { columns, sizePerPageList, leadRecords, downloadCSV } = useLeadList()
    return (
        <>
            <ToastContainer />
            <PageBreadcrumb title="Leads List" subName="Leads" />
            <Row>
                <Col>
                    <Card>
                        <Card.Header>
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h4 className="header-title">Lead Management</h4>
                                    <p className="text-muted mb-0">
                                        View and manage Lead accounts in the system.
                                    </p>
                                </div>
                                <div>
                                    
                                    <Button
                                        variant="primary"
                                        onClick={downloadCSV}>
                                        Download CSV
                                    </Button>
                                </div>
                            </div>
                        </Card.Header>
                        <Card.Body>
                            <Table<Lead>
                                columns={columns}
                                data={leadRecords}
                                pageSize={6}
                                sizePerPageList={sizePerPageList}
                                isSortable={true}
                                pagination={true}
                                isSelectable={true}
                                isSearchable={true}
                            />
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </>
    )
}

export default LeadList
