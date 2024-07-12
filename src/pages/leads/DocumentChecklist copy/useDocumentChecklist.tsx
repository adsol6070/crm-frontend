import { useAuthContext } from '@/common';
import { leadApi } from '@/common/api';
import { useState } from 'react';
import { toast } from 'react-toastify';

interface Document {
    name: string;
    originalname?: string;
    filename?: string;
    path?: string;
    mimetype?: string;
    size?: number;
}

const useAddDocumentChecklist = (leadId: string) => {
    const { user } = useAuthContext();
    const [loading, setLoading] = useState(false);
    const [uploadedDocs, setUploadedDocs] = useState<Document[]>([]);

    const fetchDocuments = async () => {
        try {
            setLoading(true);
            const documents = await leadApi.getUploadedDocuments(leadId);
            setUploadedDocs(documents.documents);
        } catch (error) {
            console.error('Error fetching documents:', error);
        } finally {
            setLoading(false);
        }
    };

    const getDocumentsUrl = async () => {
        try {
            const response = await leadApi.getUploadChecklistbyId(leadId);
            const blob = new Blob([response]);
            return URL.createObjectURL(blob);
        } catch (error) {
            console.error('Error fetching documents:', error);
            return '';
        }
    };

    const getSingleDocumentUrl = async (filename: string) => {
        try {
            const response = await leadApi.getSingleDocument(leadId, filename);
            const blob = new Blob([response], { type: 'application/pdf' });
            return URL.createObjectURL(blob)
        } catch (error) {
            console.error('Error fetching document:', error);
            return '';
        }
    }

    const handleDocumentAction = async (action: () => Promise<void>, successMessage: string, errorMessage: string) => {
        try {
            setLoading(true);
            await action();
            toast.success(successMessage);
            fetchDocuments();
        } catch (error) {
            console.error(errorMessage, error);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (data: any) => {
        const formData = new FormData();
        formData.append('tenantID', user.tenantID);
        formData.append('leadID', leadId);
        formData.append('uploadType', `leadDocuments-${leadId}`);

        data.documents.forEach((doc: { name: string; file: File | null }, index: number) => {
            formData.append(`documents[${index}][name]`, doc.name);
            if (doc.file) {
                formData.append('documents', doc.file);
            }
        });

        handleDocumentAction(
            () => leadApi.uploadChecklist(formData, leadId),
            'Documents uploaded successfully',
            'Error uploading documents'
        );
    };

    const updateDocument = async (formData: FormData, filename: string) => {
        handleDocumentAction(
            () => leadApi.updateSingleDocument(formData, leadId, filename),
            'Document updated successfully',
            'Error updating document'
        );
    };

    const deleteDocument = async (filename: string) => {
        handleDocumentAction(
            () => leadApi.deleteSingleDocument(leadId, filename),
            'Document deleted successfully',
            'Error deleting document'
        );
    };

    const deleteAllDocuments = async () => {
        handleDocumentAction(
            () => leadApi.deleteDocuments(leadId),
            'All documents deleted successfully',
            'Error deleting all documents'
        );
    };

    return { loading, onSubmit, uploadedDocs, setUploadedDocs, fetchDocuments, getDocumentsUrl, getSingleDocumentUrl, deleteDocument, updateDocument, deleteAllDocuments };
}

export default useAddDocumentChecklist
