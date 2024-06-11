import { leadApi, useAuthContext } from '@/common'
import { useState } from 'react'
import { toast } from 'react-toastify'

interface Note {
    id?: string;
    lead_id?: string;
    user_id?: string;
    note?: string;
}

export default function useCreateLeadNote(leadId: string) {
    const [loading, setLoading] = useState(false)
    const { user } = useAuthContext()
    const createLeadNote = async (note: Note) => {
        setLoading(true)
        try {
            const noteData = {
                ...note,
                user_id: user.sub
            }
            const data = await leadApi.createLeadNote(leadId, noteData)
            toast.success(data.message)
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    const fetchNotes = async () => {
        setLoading(true);
        try {
            return await leadApi.getLeadNotes(leadId);
        } catch (error: any) {
            return toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const deleteNotesById = async (noteId: string) => {
        setLoading(true);
        try {
            await leadApi.deleteLeadNoteById(noteId);
            toast.success("Note deleted successfully")
        } catch (error: any) {
            return toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const deleteAllLeadNotes = async () => {
        setLoading(true);
        try {
            await leadApi.deleteLeadNotes(leadId);
            toast.success("Notes deleted successfully")
        } catch (error: any) {
            return toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const updateLeadNote = async (noteId: string, updatedNoteData: Note) => {
        setLoading(true);
        try {
            const data = await leadApi.updateLeadNote(noteId, updatedNoteData);
            toast.success(data.message);
            return data;
        } catch (error: any) {
            toast.error(error.message);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    return {
        createLeadNote,
        fetchNotes,
        deleteNotesById,
        deleteAllLeadNotes,
        updateLeadNote,
        loading,
    }
}
