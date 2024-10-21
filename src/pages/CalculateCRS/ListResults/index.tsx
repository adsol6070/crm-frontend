import { PageBreadcrumb, Table } from '@/components';
import { Row, Col, Card, Spinner, Modal, Button } from 'react-bootstrap';
import { useResultList } from './useListResults';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/ReactToastify.css';
import styles from "./listResults.module.css";
import { useAuthContext, usePermissions, useThemeContext } from '@/common';
import { backgroundStyle, hasPermission } from '@/utils';
import { useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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

    const handleDownloadPdf = async () => {
        if (selectedResult) {
            const doc = new jsPDF();
    
            doc.setFontSize(16);
            doc.text("CRS Scorecard", 10, 10);
    
            doc.setFontSize(12);
            doc.text(`CRS Score: ${selectedResult.score}`, 10, 20);
    
            const rows = [
                ["Name", selectedResult.name],
                ["Phone", selectedResult.phone],
                ["Email", selectedResult.email],
                ["Age", selectedResult.age],
                ["Education", selectedResult.education],
                ["Foreign Experience", selectedResult.foreign_experience],
                ["Canadian Experience", selectedResult.canadian_experience],
                ["First Language", selectedResult.first_language],
                ["Second Language", selectedResult.second_language || 'N/A'],
                ["Spouse/Common-law Partner", selectedResult.spouse],
                ["Sibling in Canada", selectedResult.sibling_in_canada],
                ["Job Offer", selectedResult.job_offer],
                ["Provincial Nomination", selectedResult.provincial_nomination],
                ["Canadian Degree", selectedResult.canadian_degree],
            ];
    
            if (selectedResult.spouse === 'yes') {
                rows.push(
                    ["Spouse Education", selectedResult.spouse_education],
                    ["Spouse Language", selectedResult.spouse_language || 'N/A'],
                    ["Spouse Experience", selectedResult.spouse_experience]
                );
            }
    
            autoTable(doc, {
                head: [["Field", "Value"]],
                body: rows,
                startY: 30,  
                theme: 'grid'
            });
    
            doc.save('CRS_Scorecard.pdf');
        }
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
                                    <Col md={12}>
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
                                    <Col md={12}>
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
                                    <Col md={12}>
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
                                    <Col md={12}>
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
                        <Button variant="primary" onClick={handleDownloadPdf}>Download Scorecard</Button>
                    </Modal.Footer>
                </Modal>
            )}
        </>
    );
};

export default ListResults;
