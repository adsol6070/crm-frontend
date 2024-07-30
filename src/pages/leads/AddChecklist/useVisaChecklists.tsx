import { useEffect, useState } from "react";
import { ChecklistsData, ChecklistItem } from '@/types';
import { toast } from "react-toastify";
import Swal from 'sweetalert2';
import { checklistsApi, useAuthContext } from "@/common";

export function useVisaChecklist() {
    const [visaChecklists, setVisaChecklists] = useState([]);
    const [loading, setLoading] = useState(false);
    const { user } = useAuthContext();

    const getChecklists = async () => {
        try {
            setLoading(true);
            const checklists = await checklistsApi.getChecklist();
            setVisaChecklists(checklists.checklists)
        } catch (error) {
            console.error('Error get checklists:', error);
        } finally {
            setLoading(false);
        }
    };

    const createChecklists = async (data: ChecklistsData) => {
        const visaChecklistsData = data;
        try {
            const exists = visaChecklists.some((checklist: any) => checklist.visaType === visaChecklistsData.visaType);
            if (exists) {
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'Checklist for this visa type already exists.',
                });
                return;
            }
            setLoading(true);
            const formData = new FormData();
            formData.append('tenantID', user.tenantID);
            formData.append('visaType', visaChecklistsData.visaType);
            formData.append('checklist', JSON.stringify(visaChecklistsData.checklists));

            const data = await checklistsApi.createChecklist(formData);
            getChecklists();
            toast.success(data.message);
        } catch (error) {
            console.error('Error creating checklists:', error);
            toast.error("Failed to create checklists.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getChecklists();
    }, [])

    const getChecklistsByVisaType = async (visaType: string) => {
        try {
            setLoading(true);
            const checklists = await checklistsApi.getChecklistByVisaType(visaType);
            return checklists;
        } catch (error) {
            console.error('Error get checklists:', error);
        } finally {
            setLoading(false);
        }
    };

    const deleteChecklists = async (checklistId: string) => {
        try {
            setLoading(true);
            await checklistsApi.deleteChecklist(checklistId);
            const updatedVisaChecklists = visaChecklists.filter((checklist: any) => checklist.id !== checklistId);
            console.log("Updated Checklists ", updatedVisaChecklists)
            setVisaChecklists(updatedVisaChecklists);
            console.log("Visa Checklists ", visaChecklists)
            toast.success("Checklist Deleted successfully!");
        } catch (error) {
            console.error('Error deleting checklist', error);
            toast.error("Failed to delete checklist");
        } finally {
            setLoading(false);
        }
    };

    const updateChecklists = async (checklistId: string, updatedChecklists: ChecklistItem[]) => {
        try {
            setLoading(true);
            const formData = new FormData();
            formData.append('checklist', JSON.stringify(updatedChecklists));

            await checklistsApi.updateChecklist(checklistId, formData);
            await getChecklists();
            toast.success("Checklist updated successfully!");
        } catch (error) {
            console.error('Error updating checklist:', error);
            toast.error("Failed to update checklist.");
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        createChecklists,
        visaChecklists,
        getChecklists,
        deleteChecklists,
        getChecklistsByVisaType,
        updateChecklists
    };
}
