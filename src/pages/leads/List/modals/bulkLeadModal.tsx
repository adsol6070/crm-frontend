import { Modal, Button, Form } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useLeadList } from '../useLeadList';
import { useAuthContext } from '@/common';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

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

    const { handleSubmit, setValue, reset, formState: { errors } } = useForm({
        resolver: yupResolver(schema),
    });

    const onSubmit = async (data: any) => {
        const formData = new FormData();
        formData.append('tenantID', user.tenantID);
        formData.append('userID', user.sub);
        formData.append('uploadType', "Lead Files");
        formData.append('leadFile', data.leadFile[0]);

        try {
            await uploadLeads(formData);
            handleClose();
            refreshLeads();
            reset();
        } catch (error) {
            toast.error('Failed to upload file');
        }
    };

    const handleFileChange = (e: any) => {
        setValue('leadFile', e.target.files); 
    };

    return (
        <>
            <Modal show={show} onHide={handleClose}>
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
                        <Button variant="primary" className="my-2" type="submit">
                            Upload
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </>
    );
};

export default BulkLeadModal;
