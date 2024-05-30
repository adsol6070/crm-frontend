import { useState } from 'react';
import { PageBreadcrumb, Table } from '@/components';
import { Row, Col, Card, Button, Nav } from 'react-bootstrap';
import { useLeadList } from './useLeadList';
import { Lead } from '@/types';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import BulkLeadModal from './bulkLeadModal';
import styles from './LeadList.module.css'; // Import CSS module

const LeadList = () => {
    const { columns, sizePerPageList, leadRecords, refreshLeads, downloadCSV, visaCategories } = useLeadList();
    const [showModal, setShowModal] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('All');

    const handleShow = () => setShowModal(true);
    const handleClose = () => setShowModal(false);

    const downloadCSVTemplate = () => {
        const link = document.createElement('a');
        link.href = '/format-file.csv';
        link.setAttribute('download', 'Bulk-Lead-Format.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleSelectCategory = (category: any) => {
        setSelectedCategory(category);
    };

    const capitalizeFirstLetter = (str: string) => {
        if (!str) return str;
        return str.charAt(0).toUpperCase() + str.slice(1);
    };

    const filteredLeads = selectedCategory === 'All'
        ? leadRecords
        : leadRecords.filter(lead => lead.visaCategory === selectedCategory);

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
                                <Col xs={12} md={6} className="text-md-end text-center mt-3 mt-md-0">
                                    <Button className='m-2'
                                        variant="secondary"
                                        onClick={downloadCSVTemplate}>
                                        Download CSV Format
                                    </Button>
                                    <Button className='m-2'
                                        variant="success"
                                        onClick={handleShow}>
                                        Import Bulk Leads
                                    </Button>
                                    <Button className='m-2'
                                        variant="primary"
                                        onClick={() => downloadCSV(selectedCategory)}>
                                        Download CSV
                                    </Button>
                                </Col>
                            </Row>
                        </Card.Header>
                        <Card.Body>
                            <Nav variant="pills" activeKey={selectedCategory} onSelect={handleSelectCategory} className={styles.customTabs}>
                                <Nav.Item className={styles.navItem}>
                                    <Nav.Link eventKey="All" className={styles.navLink}>
                                        <i className={`bi bi-list ${styles.navLinkIcon}`}></i> All
                                    </Nav.Link>
                                </Nav.Item>
                                {visaCategories.map(category => (
                                    <Nav.Item key={category} className={styles.navItem}>
                                        <Nav.Link eventKey={category} className={styles.navLink}>
                                            <i className={`bi bi-${category.toLowerCase()} ${styles.navLinkIcon}`}></i> {capitalizeFirstLetter(category)}
                                        </Nav.Link>
                                    </Nav.Item>
                                ))}
                            </Nav>
                            <Table<Lead>
                                columns={columns}
                                data={filteredLeads}
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
            <BulkLeadModal show={showModal} handleClose={handleClose} refreshLeads={refreshLeads} />
        </>
    );
};

export default LeadList;
