import { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useLeadList } from './useLeadList';
import { FormInput } from '@/components';
import { useAuthContext } from '@/common';

interface ParameterUpload {
    show: boolean;
    handleClose: () => void;
    refreshLeads: () => void;
}

const BulkLeadModal: React.FC<ParameterUpload> = ({ show, handleClose, refreshLeads }) => {
    const { uploadLeads } = useLeadList();
    const [file, setFile] = useState<File | null>(null);
    const { user } = useAuthContext()

    const handleFileChange = (e: any) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!file) {
            toast.error("Please select a file to upload");
            return;
        }
        const formData = new FormData();
        formData.append('tenantID', user.tenantID)
        formData.append('userID', user.sub)
        formData.append('uploadType', "Lead Files");
        formData.append('leadFile', file, file.name);
        await uploadLeads(formData);
        handleClose();
        refreshLeads();
    };

    return (
        <>
            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Import Bulk Leads</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                        <FormInput
                            label="Upload Lead File"
                            type="file"
                            name="leadFile"
                            onChange={handleFileChange}
                            containerClass="mb-3"
                        />
                        <Button variant="primary" type="submit">
                            Upload
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </>
    );
};

export default BulkLeadModal;
