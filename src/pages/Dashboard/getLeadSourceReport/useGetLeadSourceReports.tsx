import { reportsApi } from "@/common";
import { useEffect, useState } from "react";
import { LeadReport } from '@/types'

const useGetLeadSourceReports = () => {
    const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')
	const [report, setReport] = useState<LeadReport[]>([])
    
	useEffect(() => {
		const fetchLeadReportBasedOnSource = async () => {
			
			try {
				const response = await reportsApi.getLeadReportBasedOnSource();
				setReport(response)
			} catch (err) {
				console.error('Failed to fetch Report', err)
				setError('Failed to fetch report.')
			}finally{
				setLoading(false)
			}
		}
        fetchLeadReportBasedOnSource();
	}, [])

    return { error, loading, report }
};

export default useGetLeadSourceReports;
