import { PageBreadcrumb, Table } from '@/components'
import { Row, Col, Card, Spinner } from 'react-bootstrap'
import { useResultList } from './useListResults'
import { Result } from '@/types'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/ReactToastify.css'
import styles from "./listResults.module.css"
import { useAuthContext, usePermissions } from '@/common'
import { hasPermission } from '@/utils'

const ListResults: React.FC = () => {
    const { permissions } = usePermissions();
    const { user } = useAuthContext();
    const { columns, sizePerPageList, resultRecords, deleteAllResults, loading } = useResultList()

    const handleDeleteAll = () => {
        deleteAllResults(user.tenantID);
    }

    return (
        <>
            <ToastContainer />
            <PageBreadcrumb title="Calculate CRS" subName="Results List" />
            <Row>
                <Col>
                    <Card>
                        <Card.Header>
                            <div className={styles.topSection}>
                                <div>
                                    <h4 className="header-title">Saved CRS Score</h4>
                                </div>
                                <div>
                                    {(hasPermission(permissions, 'Scores', 'DeleteAll')) &&
                                        <button className="btn btn-danger" onClick={handleDeleteAll}>
                                            Delete All Results
                                        </button>
                                    }
                                </div>
                            </div>
                        </Card.Header>
                        <Card.Body>
                            {loading ? (<div className="text-center" style={{height: "500px", display: "flex", alignItems: "center", justifyContent: "center"}}>
                                <Spinner animation="border" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </Spinner>
                            </div>) : (
                                <Table<Result>
                                    columns={columns}
                                    data={resultRecords}
                                    pageSize={5}
                                    sizePerPageList={sizePerPageList}
                                    isSortable={true}
                                    pagination={true}
                                    isSearchable={true}
                                />)}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </>
    )
}

export default ListResults

