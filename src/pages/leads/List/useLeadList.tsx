import { Column } from 'react-table'
import { PageSize } from '@/components'
import { useEffect, useState } from 'react'
import { Lead } from '@/types'
import { leadApi } from '@/common'
import { RiEdit2Line, RiDeleteBinLine, RiEyeLine } from 'react-icons/ri'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'

interface LeadListHookResult {
	columns: ReadonlyArray<Column>
	sizePerPageList: PageSize[]
	leadRecords: Lead[]
	loading: boolean
	downloadCSV: () => void
}

export const useLeadList = (): LeadListHookResult => {
	const navigate = useNavigate()
	const [loading, setLoading] = useState(false)
	const [leadRecords, setLeadRecords] = useState<Lead[]>([])

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
			Header: 'Gender',
			accessor: 'gender',
			defaultCanSort: false,
		},
        {
			Header: 'View',
			accessor: 'view',
			disableSortBy: true,
			Cell: ({ cell }: any) => (
				<RiEyeLine
				size={24}
				color="#007bff"
				cursor="pointer"
				onClick={() => handleView(cell.row.original.id)}
			/>
			),
		},
		{
			Header: 'Edit',
			accessor: 'edit',
			disableSortBy: true,
			Cell: ({ cell }: any) => (
				<RiEdit2Line
					size={24}
					color="#007bff"
					cursor="pointer"
					onClick={() => handleEdit(cell.row.original.id, cell.row.original)}
				/>
			),
		},
		{
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
		},
	]

	const handleEdit = (leadId: string, leadData: any) => {
		// navigate(`/lead/edit/${leadId}`, { state: { leadData } })
	}

	const handleView = (leadId: string) => {
		navigate(`/lead/read/${leadId}`)
	}

	const handleDelete = async (leadId: string) => {
		await leadApi.delete(leadId)
		const updatedLeadRecords = leadRecords.filter((lead) => lead.id !== leadId)
		setLeadRecords(updatedLeadRecords)
		toast.success('Lead deleted successfully.')
	}

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
	]

	useEffect(() => {
		const getLeads = async () => {
			setLoading(true)
			const leadData = await leadApi.get()
			setLeadRecords(leadData.map((lead: any, index: any) => ({ ...lead, sno: index + 1 }))) 
            setLoading(false)
		}

		getLeads()
	}, [])
    const convertToCSV = (array: any[]) => {
        const header = Object.keys(array[0]).join(',') + '\n'
        const rows = array.map(obj => Object.values(obj).join(',')).join('\n')
        return header + rows
    }

    const downloadCSV = () => {
        if (leadRecords.length === 0) {
            alert('No data to download')
            return
        }

        const csv = convertToCSV(leadRecords)
        const blob = new Blob([csv], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.setAttribute('hidden', '')
        a.setAttribute('href', url)
        a.setAttribute('download', 'leads.csv')
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
    }

    return { columns, sizePerPageList, leadRecords, loading, downloadCSV }
}
