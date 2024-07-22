import { reportsApi } from "@/common";
import { useEffect, useState } from "react";
import { LeadReport } from '@/types'

const useGetLeadReports = () => {
    const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')
	const [report, setReport] = useState<LeadReport[]>([])
    
	useEffect(() => {
		const fetchLeadReportBasedOnStatus = async () => {
			
			try {
				const response = await reportsApi.getLeadReportBasedOnStatus();
				setReport(response)
			} catch (err) {
				console.error('Failed to fetch Report', err)
				setError('Failed to fetch report.')
			}finally{
				setLoading(false)
			}
		}
        fetchLeadReportBasedOnStatus();
	}, [])

    return { error, loading, report }
};

export default useGetLeadReports;
