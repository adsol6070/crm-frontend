import { Column } from 'react-table';
import { PageSize } from '@/components';
import { useEffect, useState } from 'react';
import { Result } from '@/types';
import { scoreApi, usePermissions } from '@/common';
import { RiDeleteBinLine, RiEyeLine } from 'react-icons/ri';
import { toast } from 'react-toastify';
import { capitalizeFirstLetter, hasPermission } from '@/utils';
import { Badge } from 'react-bootstrap';

interface ResultListHookResult {
    columns: ReadonlyArray<Column>;
    sizePerPageList: PageSize[];
    resultRecords: Result[];
    loading: boolean;
    deleteAllResults: (userId: string) => void;
    selectedResult: Result | null;
    setSelectedResult: (result: Result | null) => void;
}

export const useResultList = (): ResultListHookResult => {
    const { permissions } = usePermissions();
    const [loading, setLoading] = useState(true);
    const [resultRecords, setResultRecords] = useState<Result[]>([]);
    const [selectedResult, setSelectedResult] = useState<Result | null>(null);

    const columns = [
        {
            Header: 'S.No',
            accessor: 'sno',
            defaultCanSort: true,
        },
        {
            Header: 'Name',
            accessor: 'name',
            defaultCanSort: true,
            Cell: ({ cell }: any) => capitalizeFirstLetter(cell.value)
        },
        {
            Header: 'Email',
            accessor: 'email',
            defaultCanSort: false,
        },
        {
            Header: 'Phone',
            accessor: 'phone',
            defaultCanSort: true,
        },
        {
            Header: 'Score',
            accessor: 'score',
            defaultCanSort: false,
            Cell: ({ value }: any) => (
                <Badge pill bg={value >= 450 ? 'success' : 'danger'} style={{ fontSize: "1.2em" }}>
                    {value}
                </Badge>
            ),
        },
        {
            Header: 'Details',
            accessor: 'details',
            disableSortBy: true,
            Cell: ({ row }: any) => (
                <button className="btn btn-light" onClick={() => setSelectedResult(row.original)}>
                    <RiEyeLine size={20} /> Scorecard
                </button>
            ),
        },
    ];

    if (hasPermission(permissions, 'Scores', 'Delete')) {
        columns.push({
            Header: 'Delete',
            accessor: 'delete',
            disableSortBy: true,
            Cell: ({ cell }: any) => (
                <RiDeleteBinLine
                    size={24}
                    color="#dc3545"
                    cursor="pointer"
                    onClick={() => handleDelete(cell.row.original.id)}
                />
            ),
        });
    }

    const handleDelete = async (scoreId: string) => {
        if (hasPermission(permissions, 'Scores', 'Delete')) {
            try {
                await scoreApi.deleteResultById(scoreId);
                const updatedResultRecords = resultRecords.filter(
                    (score) => score.id !== scoreId
                );
                setResultRecords(updatedResultRecords);
                toast.success('Result deleted successfully.');
            } catch (error) {
                console.error('Failed to delete result:', error);
                toast.error('Failed to delete result.');
            }
        }
    };

    const deleteAllResults = async (userId: string) => {
        try {
            await scoreApi.deleteAllResult(userId);
            setResultRecords([]);
            toast.success('Results deleted successfully.');
        } catch (error) {
            console.error('Failed to delete all results:', error);
            toast.error('Failed to delete all results.');
        }
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
            value: resultRecords.length,
        },
    ];

    useEffect(() => {
        const getResults = async () => {
            setLoading(true);
            try {
                const resultData = await scoreApi.getAllResults();
                const usersWithSno = await Promise.all(
                    resultData?.map(async (result: Result, index: any) => {
                        return { ...result, sno: index + 1 };
                    })
                );
                setResultRecords(usersWithSno);
            } catch (error) {
                console.error('Failed to fetch results:', error);
            } finally {
                setLoading(false);
            }
        };

        getResults();
    }, []);

    return { columns, sizePerPageList, resultRecords, deleteAllResults, loading, selectedResult, setSelectedResult };
};
