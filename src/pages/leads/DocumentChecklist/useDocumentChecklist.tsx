import { useAuthContext } from '@/common';
import { leadApi } from '@/common/api';
import { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';

export default function useAddDocumentChecklist(leadId: string) {
    const { user } = useAuthContext();
    const [loading, setLoading] = useState(false);

    const getDocuments = useCallback(async () => {
        if (!leadId) return '';
        setLoading(true);
        try {
            const response = await leadApi.getUploadChecklistbyId(leadId);
            const blob = new Blob([response]);
            const url = URL.createObjectURL(blob);
            return url;
        } catch (error) {
            console.error('Error fetching documents:', error);
            return '';
        } finally {
            setLoading(false);
        }
    }, [leadId]);

    useEffect(() => {
        getDocuments();
    }, [getDocuments]);
    
    const fetchUploadedDocuments = useCallback(async (leadId: string) => {
        if (!leadId) return [];
        try {
            const response = await leadApi.getUploadedDocuments(leadId);
            return response;
        } catch (error) {
            console.error('Error fetching uploaded documents:', error);
            return [];
        }
    }, [leadId]);

    const getSingleDocument = useCallback(async (leadId: string, filename: string) => {
        if (!leadId || !filename) return '';
        try {
            const response = await leadApi.getSingleDocument(leadId, filename);
            const blob = new Blob([response], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob)
            return url;
        } catch (error) {
            console.error('Error fetching document:', error);
            return '';
        }
    }, [leadId]);

    const addDocuments = useCallback(async (formData: FormData) => {
        setLoading(true);
        try {
            const data = await leadApi.uploadChecklist(formData, leadId);
            getDocuments(); 
            toast.success(data.message);
        } catch (error: any) {
            console.error('Error uploading documents:', error);
            toast.error('Documents not added');
        } finally {
            setLoading(false);
        }
    }, [leadId, fetchUploadedDocuments]);

    const deleteSingleDocument = useCallback(async (leadId: string, filename: string) => {
        setLoading(true);
        try {
            await leadApi.deleteSingleDocument(leadId, filename);
            toast.success("Document deleted successfully");
            getDocuments();
        } catch (error: any) {
            console.error('Error deleting documents:', error);
            toast.error('Document not deleted');
        } finally {
            setLoading(false);
        }
    }, [fetchUploadedDocuments]);

    const deleteDocuments = useCallback(async (leadId: string) => {
        setLoading(true);
        try {
            await leadApi.deleteDocuments(leadId);
            toast.success("Documents deleted successfully");
            getDocuments();
        } catch (error: any) {
            console.error('Error deleting documents:', error);
            toast.error('Document not deleted');
        } finally {
            setLoading(false);
        }
    }, [fetchUploadedDocuments]);

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

        await addDocuments(formData);
    };

    return { loading, onSubmit, getDocuments, fetchUploadedDocuments, getSingleDocument, deleteSingleDocument, deleteDocuments  };
}
