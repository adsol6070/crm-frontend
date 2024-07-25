import { reportsApi } from "@/common";
import { useEffect, useState } from "react";
import { LeadReport } from '@/types'

const useGetLeadReportsOnTime = (startDate: any, endDate: any) => {
    const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')
	const [report, setReport] = useState<LeadReport[]>([])
    
	useEffect(() => {
		const fetchLeadReportBasedOnStatus = async () => {
			try {
				const response = await reportsApi.getLeadReportBasedOnTime(startDate, endDate);
				console.log("Response ", response)
				setReport(response)
			} catch (err) {
				console.error('Failed to fetch Report', err)
				setError('Failed to fetch report.')
			}finally{
				setLoading(false)
			}
		}
        if (startDate && endDate) {
            fetchLeadReportBasedOnStatus();
        }
	}, [startDate, endDate])

    return { error, loading, report }
};

export default useGetLeadReportsOnTime;
