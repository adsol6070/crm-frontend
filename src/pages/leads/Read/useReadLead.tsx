import { useEffect, useState } from 'react';
import { leadApi } from '@/common'; // Ensure this path is correct
import { LeadData } from '@/types';

const useReadLead = (leadId: string) => {
    const [leadData, setLeadData] = useState<LeadData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchLeadData = async () => {
            setLoading(true);
            setError('');

            try {
                const data = (await leadApi.getLeadById(leadId)) as LeadData;
                if (data) {
                    setLeadData(data);
                }
            } catch (err) {
                console.error('Failed to fetch lead data:', err);
                setError('Failed to load the lead data.');
            } finally {
                setLoading(false);
            }
        };

        if (leadId) {
            fetchLeadData();
        } else {
            setError('Lead ID is missing.');
            setLoading(false);
        }
    }, [leadId]);

    return { leadData, loading, error };
};

export default useReadLead;
