import React, { useRef } from 'react';
import useReadLead from './useReadLead';
import { useParams } from 'react-router-dom';
import { Table, Button, Card, Container, Row, Col, Spinner } from 'react-bootstrap';
import ReactToPrint from 'react-to-print';
import { format } from 'date-fns';
import { Badge } from 'react-bootstrap';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PageBreadcrumb } from '@/components';
import styles from './ReadLead.module.css';

interface LeadData {
    [key: string]: any;
}

const ReadLead: React.FC = () => {
    const { leadId } = useParams<{ leadId: string }>();
    const { leadData, loading, error } = useReadLead(leadId as string);
    const data = leadData as LeadData;
    const printRef = useRef<HTMLDivElement>(null);

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100">
                <Spinner animation="border" />
            </div>
        );
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (!data) {
        return <div>No data available</div>;
    }

    const formatDate = (dateString: string) => {
        if (dateString === null) return "N/A";
        try {
            return format(new Date(dateString), 'dd/MM/yyyy');
        } catch {
            return "N/A";
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
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pageWidth = pdf.internal.pageSize.getWidth();

        pdf.setFontSize(18);
        pdf.text('Lead Detail', pageWidth / 2, 10, { align: 'center' });

        pdf.setFontSize(12);
        pdf.text(`Lead ID: ${data.id}`, 10, 17);
        pdf.text(`Created At: ${data.created_at}`, 10, 25);
        pdf.text(`Status: ${data.leadStatus ? data.leadStatus.charAt(0).toUpperCase() + data.leadStatus.slice(1) : 'No Status'}`, 10, 35);

        const formatField = (key: string, value: any) => {
            if (key === 'dob' || key === 'passportExpiry' || key === 'visaExpiryDate') {
                return formatDate(value);
            }
            if (value === "" || value === null || value === undefined) {
                return "N/A";
            }
            return String(value);
        };

        const sections = [
            { title: 'Personal Information', fields: ["firstname", "lastname", "email", "phone", "gender", "dob", "nationality", "maritalStatus", "currentAddress", "permanentAddress"] },
            { title: 'Immigration Information', fields: ["visaCategory", "countryOfInterest", "passportExpiry", "visaExpiryDate", "courseOfInterest", "desiredFieldOfStudy", "preferredInstitutions", "intakeSession", "reasonForImmigration", "financialSupport", "sponsorDetails"] },
            { title: 'Academic Information', fields: ["highestQualification", "scholarships", "fieldOfStudy", "institutionName", "graduationYear", "grade", "testType", "testScore"] },
            { title: 'Address Information', fields: ["pincode", "country", "state", "district", "city"] }
        ];

        const tableData = sections.map(section => {
            return section.fields.map(key => {
                const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                const value = formatField(key, data[key]);
                return [formattedKey, value];
            });
        }).flat();

        autoTable(pdf, {
            head: [['Field', 'Value']],
            body: tableData,
            startY: 40,
            theme: 'striped',
            headStyles: { fillColor: [41, 128, 185] },
            alternateRowStyles: { fillColor: [230, 230, 230] },
            styles: { fontSize: 10 },
            margin: { top: 10 },
            columnStyles: {
                0: { cellWidth: 70 },
                1: { cellWidth: 'auto' }
            }
        });

        pdf.save(`Lead_${data.firstname}.pdf`);
    };

    const renderTableRows = (fields: string[]) => (
        fields.map(key => (
            <tr key={key}>
                <td className={styles.fontWeightBold}>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</td>
                <td style={key === 'email' ? { textTransform: 'lowercase' } : { textTransform: 'capitalize' }}>
                    {formatField(key, data[key])}
                </td>
            </tr>
        ))
    );

    const formatField = (key: string, value: any) => {
        if (key === 'dob' || key === 'passportExpiry' || key === 'visaExpiryDate') {
            return formatDate(value);
        }
        if (value === "" || value === null || value === undefined) {
            return "N/A";
        }
        return String(value);
    };

    const sections = [
        { title: 'Personal Information', fields: ["firstname", "lastname", "email", "phone", "gender", "dob", "nationality", "maritalStatus", "currentAddress", "permanentAddress"] },
        { title: 'Immigration Information', fields: ["visaCategory", "countryOfInterest", "passportExpiry", "visaExpiryDate", "courseOfInterest", "desiredFieldOfStudy", "preferredInstitutions", "intakeSession", "reasonForImmigration", "financialSupport", "sponsorDetails"] },
        { title: 'Academic Information', fields: ["highestQualification", "scholarships", "fieldOfStudy", "institutionName", "graduationYear", "grade", "testType", "testScore"] },
        { title: 'Address Information', fields: ["pincode", "country", "state", "district", "city"] }
    ];

    return (
        <>
            <PageBreadcrumb title="Lead Details" subName="Leads" />
            <Container ref={printRef} className={`my-4 ${styles.leadDetailsContainer}`}>
                <Card className="shadow-sm">
                    <Card.Body className={styles.printContainer}>
                        <Row className="mb-4">
                            <Col>
                                <h5 className={`text-muted ${styles.textMuted}`}>Lead ID: {data.id}</h5>
                                <div><p>Created At - {formatDate(data.created_at)}</p></div>
                                <Badge className={styles.styleStatus} bg={getStatusBadgeClass(data.leadStatus)}>
                                    {data.leadStatus ? data.leadStatus.charAt(0).toUpperCase() + data.leadStatus.slice(1) : 'No Status'}
                                </Badge>
                            </Col>
                        </Row>
                        {sections.map(section => (
                            <Row className="mb-4" key={section.title}>
                                <Col>
                                    <Card.Title as="h4" className={styles.detailTitle}>{section.title}</Card.Title>
                                    <Table bordered hover striped className={styles.table}>
                                        <tbody>
                                            {renderTableRows(section.fields)}
                                        </tbody>
                                    </Table>
                                </Col>
                            </Row>
                        ))}
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
