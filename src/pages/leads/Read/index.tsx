import React, { useRef } from 'react';
import useReadLead from './useReadLead';
import { useParams } from 'react-router-dom';
import { Table, Button, Card, Container, Row, Col } from 'react-bootstrap';
import ReactToPrint from 'react-to-print';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface LeadData {
    [key: string]: any;
}

const ReadLead: React.FC = () => {
    const { leadId } = useParams() as { leadId: string };
    const { leadData, loading, error } = useReadLead(leadId);
    const data = leadData as LeadData
    // console.log(data)
    const printRef = useRef<HTMLDivElement>(null);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (!data) {
        return <div>No data available</div>;
    }
    const formatDate = (dateString: string) => {
        try {
            return format(new Date(dateString), 'dd/MM/yyyy');
        } catch (error) {
            return "Invalid date";
        }
    }
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
            <h2 className='p-2'>Lead Details</h2>
            <Container ref={printRef} className="mt-5">
                <Card>
                    <Card.Body className="print-container">
                        <Row className='mb-4'>
                            <Col>
                                Lead ID: {data.id}
                            </Col>
                        </Row>
                        <Row className="mb-4">
                            <Col>
                                <Card.Title as="h4">Personal Information</Card.Title>
                                <Table bordered hover>
                                    <tbody>
                                        {Object.keys(data).filter(key =>
                                            ["firstname", "lastname", "email", "phone", "gender", "dob", "nationality", "maritalStatus", "currentAddress", "permanentAddress"].includes(key)).map((key) => (
                                                <tr key={key}>
                                                    <td className="font-weight-bold">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</td>
                                                    <td>{key === "dob" ? formatDate(data[key]) : (String(data[key]) === "" ? "N/A" : String(data[key]))}</td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </Table>
                            </Col>
                            <Col>
                                <Card.Title as="h4">Immigration Information</Card.Title>
                                <Table bordered hover>
                                    <tbody>
                                        {Object.keys(data).filter(key =>
                                            ["countryOfInterest", "passportExpiry", "visaExpiryDate", "courseOfInterest", "desiredFieldOfStudy", "preferredInstitutions", "intakeSession", "reasonForImmigration", "financialSupport", "sponsorDetails"].includes(key)).map((key) => (
                                                <tr key={key}>
                                                    <td className="font-weight-bold">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</td>
                                                    <td>{["passportExpiry", "visaExpiryDate"].includes(key) ? formatDate(data[key]) : (String(data[key]) === "" ? "N/A" : String(data[key]))}</td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </Table>
                            </Col>
                        </Row>
                        <Card.Title as="h4">Document Information</Card.Title>
                        <Table bordered hover>
                            <tbody>
                                {Object.keys(data).filter(key =>
                                    ["proofOfFunds", "languageTestReport", "passportCopy", "certificates", "transcripts", "sop", "recommendationLetter", "resume"].includes(key)).map((key) => (
                                        <tr key={key}>
                                            <td className="font-weight-bold">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</td>
                                            <td>{String(data[key]) == "[object FileList]" ? "Document" : String(data[key])}</td>
                                        </tr>
                                    ))}
                            </tbody>
                        </Table>
                        <Row className="mb-4">
                            <Col>
                                <Card.Title as="h4">Academic Information</Card.Title>
                                <Table bordered hover>
                                    <tbody>
                                        {Object.keys(data).filter(key =>
                                            ["highestQualification", "scholarships", "fieldOfStudy", "institutionName", "graduationYear", "grade", "testType", "testScore"].includes(key)).map((key) => (
                                                <tr key={key}>
                                                    <td className="font-weight-bold">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</td>
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
            <ReactToPrint
                trigger={() => <Button className="m-2" variant="secondary">Print</Button>}
                content={() => printRef.current}
            />
            <Button className="m-2" variant="secondary" onClick={handleSaveAsPDF}>Download PDF</Button>
        </>
    );
}

export default ReadLead;

