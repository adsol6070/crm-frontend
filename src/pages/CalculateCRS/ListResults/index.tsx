import { PageBreadcrumb, Table } from '@/components';
import { Row, Col, Card, Spinner, Modal, Button } from 'react-bootstrap';
import { useResultList } from './useListResults';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/ReactToastify.css';
import styles from "./listResults.module.css";
import { scoreApi, useAuthContext, usePermissions, useThemeContext } from '@/common';
import { backgroundStyle, hasPermission } from '@/utils';
import { useState } from 'react';

const ListResults: React.FC = () => {
    const { permissions } = usePermissions();
    const { user } = useAuthContext();
    const { settings } = useThemeContext();
    const { columns, resultRecords, deleteAllResults, loading, selectedResult, setSelectedResult, handleDeleteSelected } = useResultList();
    const [selectedScoresIds, setSelectedScoresIds] = useState<string[]>([])

    let toggleAllRowsSelected: ((selected: boolean) => void) | undefined

    const showDeleteSelectedButton = selectedScoresIds?.length > 0

    const canDeleteSelected = hasPermission(
		permissions,
		'Scores',
		'DeleteSelected'
	)

    const handleDeleteSelectedScores = () => {
        handleDeleteSelected(selectedScoresIds)
        setSelectedScoresIds([])
        toggleAllRowsSelected && toggleAllRowsSelected(false)
    }

    const handleDeleteAll = () => {
        deleteAllResults(user.tenantID);
    };

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
                                <div className="d-flex justify-content-between">
                                    <div>
                                        {showDeleteSelectedButton && canDeleteSelected &&(
                                            <Button
                                                variant="danger"
                                                onClick={handleDeleteSelectedScores}
                                                className="mx-2">
                                                {`Delete ${selectedScoresIds.length} Selected`}
                                            </Button>
                                        )}
                                    </div>
                                    <div>
                                        {hasPermission(permissions, 'Scores', 'DeleteAll') && (
                                            <button className="btn btn-danger" onClick={handleDeleteAll}>
                                                Delete All Results
                                            </button>
                                        )}
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
                                    columns={columns}
                                    data={resultRecords}
                                    pageSize={5}
                                    isSortable={true}
                                    pagination={true}
                                    isSelectable={true}
                                    isSearchable={true}
                                    setSelectedUserIds={setSelectedScoresIds}
                                    toggleAllRowsSelected={(val) => (toggleAllRowsSelected = val)}
                                />
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {selectedResult && (
                <Modal show={true} onHide={() => setSelectedResult(null)} centered>
                    <Modal.Header closeButton>
                        <Modal.Title>CRS Score Details</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div id="scorecard" className={styles.scorecard} style={backgroundStyle(settings.theme === "dark")}>
                            <h3 className="text-center">
                                CRS Score: <span className={`${styles.scoreHighlight} ${selectedResult.score >= 450 ? styles.pass : styles.fail}`}>{selectedResult.score}</span>
                            </h3>
                            <div className={styles.scoreTable}>
                                <Row>
                                    <Col md={6}>
                                        <table className="table table-bordered">
                                            <tbody>
                                                <tr>
                                                    <th>Name</th>
                                                    <td>{selectedResult.name}</td>
                                                </tr>
                                                <tr>
                                                    <th>Phone</th>
                                                    <td>{selectedResult.phone}</td>
                                                </tr>
                                                <tr>
                                                    <th>Email</th>
                                                    <td>{selectedResult.email}</td>
                                                </tr>
                                                <tr>
                                                    <th>Age</th>
                                                    <td>{selectedResult.age}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </Col>
                                    <Col md={6}>
                                        <table className="table table-bordered">
                                            <tbody>
                                                <tr>
                                                    <th>Education</th>
                                                    <td>{selectedResult.education}</td>
                                                </tr>
                                                <tr>
                                                    <th>Foreign Experience</th>
                                                    <td>{selectedResult.foreign_experience}</td>
                                                </tr>
                                                <tr>
                                                    <th>Canadian Experience</th>
                                                    <td>{selectedResult.canadian_experience}</td>
                                                </tr>
                                                <tr>
                                                    <th>First Language</th>
                                                    <td>{selectedResult.first_language}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </Col>
                                    <Col md={6}>
                                        <table className="table table-bordered">
                                            <tbody>
                                                <tr>
                                                    <th>Second Language</th>
                                                    <td>{selectedResult.second_language || 'N/A'}</td>
                                                </tr>
                                                <tr>
                                                    <th>Spouse/Common-law partner</th>
                                                    <td>{selectedResult.spouse}</td>
                                                </tr>
                                                <tr>
                                                    <th>Sibling in Canada</th>
                                                    <td>{selectedResult.sibling_in_canada}</td>
                                                </tr>
                                                <tr>
                                                    <th>Job Offer</th>
                                                    <td>{selectedResult.job_offer}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </Col>
                                    <Col md={6}>
                                        <table className="table table-bordered">
                                            <tbody>
                                                <tr>
                                                    <th>Provincial Nomination</th>
                                                    <td>{selectedResult.provincial_nomination}</td>
                                                </tr>
                                                <tr>
                                                    <th>Canadian Degree</th>
                                                    <td>{selectedResult.canadian_degree}</td>
                                                </tr>
                                                {selectedResult.spouse === 'yes' && (
                                                    <>
                                                        <tr>
                                                            <th>Spouse Education</th>
                                                            <td>{selectedResult.spouse_education}</td>
                                                        </tr>
                                                        <tr>
                                                            <th>Spouse Language</th>
                                                            <td>{selectedResult.spouse_language || 'N/A'}</td>
                                                        </tr>
                                                        <tr>
                                                            <th>Spouse Experience</th>
                                                            <td>{selectedResult.spouse_experience}</td>
                                                        </tr>
                                                    </>
                                                )}
                                            </tbody>
                                        </table>
                                    </Col>
                                </Row>
                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setSelectedResult(null)}>Close</Button>
                    </Modal.Footer>
                </Modal>
            )}
        </>
    );
};

export default ListResults;
