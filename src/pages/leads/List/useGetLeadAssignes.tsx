import { useEffect, useState } from 'react';
import { leadApi } from '@/common'; // Ensure this path is correct

interface LeadAssignee {
  lead_id: string;
  user_id: string[];
  created_at?: string;
  updated_at?: string;
}

const useGetLeadAssignee = (leadId: string) => {
  const [leadAssignee, setLeadAssignee] = useState<LeadAssignee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLeadAssignedData = async () => {
      setLoading(true);
      setError('');

      try {
        const data = (await leadApi.getAssigneeById(leadId)) as LeadAssignee;
        if (data) {
          setLeadAssignee(data);
        }
      } catch (err) {
        console.error('Failed to fetch assignee data:', err);
        setError('Failed to load the assignee data.');
      } finally {
        setLoading(false);
      }
    };

    if (leadId) {
      fetchLeadAssignedData();
    } else {
      setError('Lead ID is missing.');
      setLoading(false);
    }
  }, [leadId]);

  return { leadAssignee, loading, error };
};

export default useGetLeadAssignee;
