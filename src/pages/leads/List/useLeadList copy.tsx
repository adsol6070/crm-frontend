import { Column } from 'react-table';
import { PageSize } from '@/components';
import { useEffect, useState } from 'react';
import { Lead } from '@/types';
import { leadApi } from '@/common';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { Dropdown } from 'react-bootstrap';
import styles from './LeadList.module.css'

interface LeadListHookResult {
    columns: ReadonlyArray<Column>;
    sizePerPageList: PageSize[];
    leadRecords: Lead[];
    loading: boolean;
    downloadCSV: (category: string) => void;
    refreshLeads: () => void;
    uploadLeads: (formData: FormData) => Promise<void>;
    visaCategories: string[];
    showAssignModal: boolean;
    setShowAssignModal: React.Dispatch<React.SetStateAction<boolean>>;
    selectedLeadId: string;
    setSelectedLeadId: React.Dispatch<React.SetStateAction<string>>;
    handleAssign: (leadId: string, assignees: string[]) => void;
    showHistoryModal: boolean;
    setShowHistoryModal: React.Dispatch<React.SetStateAction<boolean>>;
    historyData: HistoryItem[];
}

const capitalizeFirstLetter = (str: string) => {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export const useLeadList = (): LeadListHookResult => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [leadRecords, setLeadRecords] = useState<Lead[]>([]);
    const [visaCategories, setVisaCategories] = useState<string[]>([]);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedLeadId, setSelectedLeadId] = useState<string>('');
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [historyData, setHistoryData] = useState<HistoryItem[]>([]);

    const handleAssignClick = (leadId: string) => {
        setSelectedLeadId(leadId);
        setShowAssignModal(true);
    };

    const transformLeadHistory = (leadHistory) => {
        return leadHistory.map((entry) => {
            const key = Object.keys(entry)[0];
            const value = entry[key];

            let action = '';
            let details = {};

            switch (key) {
                case 'createdBy':
                    action = `Created by ${value.firstname} ${value.lastname}`;
                    break;
                case 'updatedBy':
                    action = `Updated by ${value.firstname} ${value.lastname}`;
                    break;
                case 'assignedAgents':
                    action = 'Assigned Agents';
                    details.assignedAgents = value;
                    break;
                default:
                    action = key;
            }

            return {
                action,
                timestamp: new Date().toISOString(), // Assuming the current timestamp for simplicity
                details
            };
        });
    };

    const handleHistoryClick = async (leadId: string) => {
        try {
            const response = await leadApi.getLeadHistory(leadId);
            console.log(response)
            const transformedHistory = transformLeadHistory(response.fullLeadHistory);
            setHistoryData(transformedHistory);
            setShowHistoryModal(true);
        } catch (error) {
            toast.error('Failed to fetch history');
            console.error(error);
        }
    };

    const handleAssign = async (leadId: string, assignees: string[]) => {
        try {
            const response = await leadApi.assignLead({ lead_id: leadId, user_id: assignees });
            toast.success(response.message);
        } catch (error) {
            toast.error('Failed to assign lead');
            console.error(error);
        }
    };

    const columns: ReadonlyArray<Column> = [
        {
            Header: 'S.No',
            accessor: 'sno',
            defaultCanSort: true,
        },
        {
            Header: 'ID',
            accessor: 'id',
            defaultCanSort: true,
        },
        {
            Header: 'Firstname',
            accessor: 'firstname',
            defaultCanSort: true,
        },
        {
            Header: 'Lastname',
            accessor: 'lastname',
            defaultCanSort: false,
        },
        {
            Header: 'Email',
            accessor: 'email',
            defaultCanSort: true,
        },
        {
            Header: 'Phone',
            accessor: 'phone',
            defaultCanSort: false,
        },
        {
            Header: 'Visa Category',
            accessor: 'visaCategory',
            defaultCanSort: true,
            Cell: ({ cell }: any) => (
                capitalizeFirstLetter(cell.value)
            ),
        },
        {
            Header: 'Assign',
            accessor: 'assign',
            disableSortBy: true,
            Cell: ({ cell }: any) => (
                <button
                    className={`btn btn-sm btn-danger ${styles.assignButton}`}
                    onClick={() => handleAssignClick(cell.row.original.id)}
                >
                    <i className={`ri-user-add-line ${styles.riUserAddLine}`}></i> Assign
                </button>
            ),
        },
        {
            Header: 'History',
            accessor: 'history',
            disableSortBy: true,
            Cell: ({ cell }: any) => (
                <button
                    className={`btn btn-sm btn-info ${styles.historyButton}`}
                    onClick={() => handleHistoryClick(cell.row.original.id)}
                >
                    <i className={`ri-history-line ${styles.riHistoryLine}`}></i> History
                </button>
            ),
        },
        {
            Header: 'Actions',
            accessor: 'actions',
            disableSortBy: true,
            Cell: ({ cell }: any) => (
                <Dropdown>
                    <Dropdown.Toggle as="button" className={styles.customActionButton}>
                        <i className={`ri-more-2-fill ${styles.riMore2Fill}`}></i>
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                        <Dropdown.Item onClick={() => handleView(cell.row.original.id)}>View</Dropdown.Item>
                        <Dropdown.Item onClick={() => handleEdit(cell.row.original.id)}>Edit</Dropdown.Item>
                        <Dropdown.Item onClick={() => handleChecklist(cell.row.original.id)}>Checklist</Dropdown.Item>
                        <Dropdown.Item onClick={() => handleDelete(cell.row.original.id)}>Delete</Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
            ),
        },
    ];

    const handleEdit = (leadId: string) => {
        navigate(`/lead/edit/${leadId}`);
    };

    const handleChecklist = (leadId: string) => {
        navigate(`/lead/addDocument/${leadId}`);
    };

    const handleView = (leadId: string) => {
        navigate(`/lead/read/${leadId}`);
    };

    const handleDelete = async (leadId: string) => {
        await leadApi.delete(leadId);
        const updatedLeadRecords = leadRecords.filter((lead) => lead.id !== leadId);
        setLeadRecords(updatedLeadRecords);
        toast.success('Lead deleted successfully.');
    };

    const sizePerPageList: PageSize[] = [
        {
            text: '5',
            value: 5,
        },
        {
            text: '10',
            value: 10,
        },
        {
            text: '25',
            value: 25,
        },
        {
            text: 'All',
            value: leadRecords.length,
        },
    ];

    const getLeads = async () => {
        setLoading(true);
        const leadData = await leadApi.get();
        const leadsWithIndex = leadData.map((lead: any, index: any) => ({ ...lead, sno: index + 1 }));
        setLeadRecords(leadsWithIndex);
        const categories: any = [...new Set(leadData.map((lead: any) => lead.visaCategory))];
        setVisaCategories(categories);
        setLoading(false);
    };

    useEffect(() => {
        getLeads();
    }, []);

    const uploadLeads = async (formData: FormData) => {
        setLoading(true);
        try {
            for (let [key, value] of formData.entries()) {
                console.log(`${key}: ${value}`);
            }
            const data = await leadApi.uploadBulkLeads(formData);
            toast.success(data.message);
        } catch (error: any) {
            toast.error("Lead not imported");
        } finally {
            setLoading(false);
        }
    };

    const refreshLeads = () => {
        getLeads();
    };

    const convertToCSV = (array: any[]) => {
        const header = Object.keys(array[0]).join(',') + '\n';
        const rows = array.map(obj => Object.values(obj).join(',')).join('\n');
        return header + rows;
    };

    const downloadCSV = (category: string) => {
        let filteredRecords = leadRecords;
        if (category !== 'All') {
            filteredRecords = leadRecords.filter(lead => lead.visaCategory === category);
        }

        if (filteredRecords.length === 0) {
            alert('No data to download');
            return;
        }

        const csv = convertToCSV(filteredRecords);
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        a.setAttribute('download', 'leads.csv');
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    return {
        columns,
        sizePerPageList,
        leadRecords,
        loading,
        refreshLeads,
        uploadLeads,
        downloadCSV,
        visaCategories,
        showAssignModal,
        setShowAssignModal,
        selectedLeadId,
        setSelectedLeadId,
        handleAssign,
        showHistoryModal,
        setShowHistoryModal,
        historyData,
    };
};
