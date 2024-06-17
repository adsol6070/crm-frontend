import React, { useRef } from 'react';
import useReadLead from './useReadLead';
import { useParams } from 'react-router-dom';
import { Table, Button, Card, Container, Row, Col, Spinner } from 'react-bootstrap';
import ReactToPrint from 'react-to-print';
import { format } from 'date-fns';
import { Badge } from 'react-bootstrap';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { PageBreadcrumb } from '@/components';
import styles from './ReadLead.module.css';

interface LeadData {
    [key: string]: any;
}

const ReadLead: React.FC = () => {
    const { leadId } = useParams() as { leadId: string };
    const { leadData, loading, error } = useReadLead(leadId);
    const data = leadData as LeadData;
    const printRef = useRef<HTMLDivElement>(null);

    if (loading) {
        return <Spinner animation="border" />;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (!data) {
        return <div>No data available</div>;
    }

    const formatDate = (dateString: string) => {
        if (dateString === null) {
            return "N/A";
        } else {
            try {
                return format(new Date(dateString), 'dd/MM/yyyy');
            } catch (error) {
                return "Invalid date";
            }
        }
    };

    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case 'pending':
                return 'warning';
            case 'inprogress':
                return 'primary';
            case 'completed':
                return 'success';
            default:
                return 'secondary';
        }
    };

    const handleSaveAsPDF = () => {
        const input = printRef.current;
        if (input) {
            html2canvas(input, { scale: 2, useCORS: true })
                .then((canvas) => {
                    const imgData = canvas.toDataURL('image/png');
                    const pdf = new jsPDF('p', 'mm', 'a4');
                    const pdfWidth = pdf.internal.pageSize.getWidth();
                    const pdfHeight = pdf.internal.pageSize.getHeight();
                    const imgProps = pdf.getImageProperties(imgData);
                    const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

                    if (imgHeight > pdfHeight) {
                        let heightLeft = imgHeight;
                        let position = 0;

                        while (heightLeft > 0) {
                            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
                            heightLeft -= pdfHeight;
                            position -= pdfHeight;
                            if (heightLeft > 0) {
                                pdf.addPage();
                            }
                        }
                    } else {
                        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeight);
                    }

                    pdf.save(`Lead_${data.firstname}.pdf`);
                })
                .catch((error) => {
                    console.error('Error generating PDF:', error);
                });
        }
    };

    return (
        <>
            <PageBreadcrumb title="Lead Details" subName="Leads" />
            <Container ref={printRef} className={`my-4 ${styles.leadDetailsContainer}`}>
                <Card className="shadow-sm">
                    <Card.Body className={styles.printContainer}>
                        <Row className="mb-4">
                            <Col>
                                <h5 className={`text-muted ${styles.textMuted}`}>Lead ID: {data.id}</h5>
                                <Badge className={styles.styleStatus} bg={getStatusBadgeClass(data.leadStatus)}>
                                    {data.leadStatus ? data.leadStatus.charAt(0).toUpperCase() + data.leadStatus.slice(1) : 'No Status'}
                                </Badge>
                            </Col>
                        </Row>
                        <Row className="mb-4">
                            <Col md={6}>
                                <Card.Title as="h4" className={styles.detailTitle}>Personal Information</Card.Title>
                                <Table bordered hover striped className={styles.table}>
                                    <tbody>
                                        {Object.keys(data).filter(key =>
                                            ["firstname", "lastname", "email", "phone", "gender", "dob", "nationality", "maritalStatus", "currentAddress", "permanentAddress"].includes(key)).map((key) => (
                                                <tr key={key}>
                                                    <td className={styles.fontWeightBold}>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</td>
                                                    <td>{key === "dob" ? formatDate(data[key]) : (String(data[key]) === "" ? "N/A" : String(data[key]))}</td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </Table>
                            </Col>
                            <Col md={6}>
                                <Card.Title as="h4" className={styles.detailTitle}>Immigration Information</Card.Title>
                                <Table bordered hover striped className={styles.table}>
                                    <tbody>
                                        {Object.keys(data).filter(key =>
                                            ["visaCategory", "countryOfInterest", "passportExpiry", "visaExpiryDate", "courseOfInterest", "desiredFieldOfStudy", "preferredInstitutions", "intakeSession", "reasonForImmigration", "financialSupport", "sponsorDetails"].includes(key)).map((key) => (
                                                <tr key={key}>
                                                    <td className={styles.fontWeightBold}>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</td>
                                                    <td>{["passportExpiry", "visaExpiryDate"].includes(key) ? formatDate(data[key]) : (String(data[key]) === "" ? "N/A" : String(data[key]))}</td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </Table>
                            </Col>
                        </Row>
                        <Row className="mb-4">
                            <Col>
                                <Card.Title as="h4" className={styles.detailTitle}>Academic Information</Card.Title>
                                <Table bordered hover striped className={styles.table}>
                                    <tbody>
                                        {Object.keys(data).filter(key =>
                                            ["highestQualification", "scholarships", "fieldOfStudy", "institutionName", "graduationYear", "grade", "testType", "testScore"].includes(key)).map((key) => (
                                                <tr key={key}>
                                                    <td className={styles.fontWeightBold}>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</td>
                                                    <td>{String(data[key]) === "" ? "N/A" : String(data[key])}</td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </Table>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>
            </Container>
            <div className={`d-flex justify-content-end mb-4 ${styles.dFlexJustifyContentEndMb4}`}>
                <ReactToPrint
                    trigger={() => <Button className="m-2" variant="secondary">Print</Button>}
                    content={() => printRef.current}
                />
                <Button className="m-2" variant="secondary" onClick={handleSaveAsPDF}>Download PDF</Button>
            </div>
        </>
    );
};

export default ReadLead;
