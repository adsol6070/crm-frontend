import { useEffect, useState } from 'react';
import { leadApi, visaCategoryApi } from '@/common/api';
import { useAuthContext } from '@/common/context';
import { toast } from 'react-toastify';
import { VisaCategory, LeadData } from '@/types';

const useEditLead = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, isAuthenticated } = useAuthContext();
  const [visaCategories, setVisaCategories] = useState<VisaCategory[]>([]);

  const editLead = async (updatedData: LeadData, leadId?: string) => {
    setLoading(true);
    try {
      console.log(updatedData);
      const updatedUserWithUserID = {
        ...updatedData, userID: user.sub
      };
      const data = await leadApi.update(updatedUserWithUserID, leadId);
      toast.success(data.message);
    } catch (err: any) {
      console.error('Failed to update lead data:', err);
      toast.error('Failed to update lead data');
      setError('Failed to update the lead data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const getCategories = async () => {
      setLoading(true);
      try {
        const categoriesData = await visaCategoryApi.getAllCategory();
        const newCategories = categoriesData.map((category: any) => ({
          value: category.category,
          label: category.category
        }));
        setVisaCategories(newCategories);
      } catch (err) {
        console.error('Failed to fetch visa categories:', err);
        toast.error('Failed to fetch visa categories');
      } finally {
        setLoading(false);
      }
    };

    getCategories();
  }, []);

  return { loading, error, editLead, visaCategories, isAuthenticated };
};

export default useEditLead;
