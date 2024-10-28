import React, { useState } from 'react';
import { Modal, Button, Form, Table } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useLeadList } from '../useLeadList';
import { useAuthContext } from '@/common';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import styles from '../LeadList.module.css'

const schema = yup.object().shape({
    leadFile: yup
        .mixed()
        .required('A file is required')
        .test('fileSize', 'File size is too large (Max: 5MB)', (value) => {
            return value && value[0] && value[0].size <= 5000000;
        })
        .test('fileType', 'Only CSV or XLS files are allowed', (value) => {
            return value && value[0] && ['application/vnd.ms-excel', 'text/csv'].includes(value[0].type);
        }),
});

interface ParameterUpload {
    show: boolean;
    handleClose: () => void;
    refreshLeads: () => void;
}

const BulkLeadModal: React.FC<ParameterUpload> = ({ show, handleClose, refreshLeads }) => {
    const { uploadLeads } = useLeadList();
    const { user } = useAuthContext();
    const [previewData, setPreviewData] = useState<any[]>([]);
    const [fileError, setFileError] = useState<string | null>(null);

    const { handleSubmit, setValue, reset, formState: { errors } } = useForm({
        resolver: yupResolver(schema),
    });

    const handleRemove = () => {
        setPreviewData([]);
    }

    const onSubmit = async () => {
        const leadData = {
            tenantID: user.tenantID,
            userID: user.sub,
            importedData: previewData
        }
        
        try {
            await uploadLeads(leadData);
            console.log("Data", previewData)
            handleClose();
            refreshLeads();
            setPreviewData([]);
            reset();
        } catch (error) {
            toast.error('Failed to upload file');
            setPreviewData([]);
            reset();
        }
    };

    const handleFileChange = (e: any) => {
        const file = e.target.files[0];
        setValue('leadFile', e.target.files);
        setFileError(null);

        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const data = event.target?.result;
                if (file.type === 'text/csv') {
                    Papa.parse(data as string, {
                        header: true,
                        skipEmptyLines: 'greedy',
                        complete: (results) => {
                            setPreviewData(results.data);
                        },
                        error: (error: any) => {
                            setFileError('Error reading CSV file');
                            console.log("error", error)
                        }
                    });
                } else if (file.type === 'application/vnd.ms-excel') {
                    // Parse Excel
                    const workbook = XLSX.read(data, { type: 'binary' });
                    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                    const excelData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
                    setPreviewData(excelData);
                } else {
                    setFileError('Unsupported file format');
                }
            };
            reader.readAsText(file);
        }
    };

    return (
        <Modal show={show} onHide={handleClose} size='lg'>
            <Modal.Header closeButton>
                <Modal.Title>Import Bulk Leads</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit(onSubmit)}>
                    <Form.Group controlId="formFile">
                        <Form.Label>Upload Lead File</Form.Label>
                        <Form.Control
                            type="file"
                            onChange={handleFileChange}
                            isInvalid={!!errors.leadFile}
                        />
                        {errors.leadFile && (
                            <Form.Control.Feedback type="invalid">
                                {errors.leadFile.message}
                            </Form.Control.Feedback>
                        )}
                    </Form.Group>
                    {fileError && <p className="text-danger">{fileError}</p>}
                    {previewData.length > 0 && (
                        <div className="mt-3">
                            <h5>Preview Data</h5>
                            <div className={styles.previewTableDesign}>
                                <Table bordered>
                                    <thead>
                                        <tr>
                                            {Object.keys(previewData[0]).map((header, index) => (
                                                <th key={index}>{header}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {previewData.map((row, rowIndex) => (
                                            <tr key={rowIndex}>
                                                {Object.values(row).map((value, colIndex) => (
                                                    <td key={colIndex}>{value}</td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </div>
                            <p>Displaying {previewData.length} rows for preview...</p>
                        </div>
                    )}
                    <Button variant="primary" className="my-2 mx-1" type="submit">
                        Upload
                    </Button>
                    <Button variant="danger" className="my-2 mx-1" type="reset" onClick={handleRemove}>
                        Remove File
                    </Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default BulkLeadModal;
