import { useEffect, useState } from 'react';
import { leadApi, visaCategoryApi } from '@/common/api';
import { useAuthContext } from '@/common/context';
import { toast } from 'react-toastify';
import { VisaCategory } from '@/types'

interface LeadData {
    firstname: string;
    lastname: string;
    email: string;
    phone: string;
    gender: string;
    dob: string;
    nationality: string;
    maritalStatus: string;
    passportNumber: string;
    passportExpiry: string | null;
    currentAddress: string;
    permanentAddress: string;
    highestQualification: string;
    fieldOfStudy: string | null;
    institutionName: string | null;
    graduationYear: string | null;
    grade: string | null;
    visaCategory: string | null;
    testType: string | null;
    testScore: string | null;
    countryOfInterest: string | null;
    courseOfInterest: string | null;
    desiredFieldOfStudy: string | null;
    preferredInstitutions: string | null;
    intakeSession: string | null;
    reasonForImmigration: string | null;
    financialSupport: string | null;
    sponsorDetails: string | null;
    scholarships: string | null;
    communicationMode: string | null;
    preferredContactTime: string | null;
    notes: string | null;
    leadSource: string | null;
    referralContact: string | null;
    leadStatus: string | null;
    assignedAgent: string | null;
    followUpDates: string | null;
    leadRating: string | null;
    leadNotes: string | null;
  }

const useEditLead = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isAuthenticated } = useAuthContext();
	const [visaCategories, setVisaCategories] = useState<VisaCategory[]>([])

  const editLead = async (updatedData: LeadData, leadId?: string) => {
    setLoading(true);
    try {
      console.log(updatedData)
      // for (let [key, value] of updatedData.entries()) {
      //   console.log(`${key}: ${value}`);
      // }
      const data = await leadApi.update(updatedData, leadId);
      toast.success(data.message);
    } catch (err: any) {
      console.error('Failed to update lead data:', err);
      toast.error('Failed to update lead data:');
      setError('Failed to update the lead data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
		const getCategories = async () => {
			setLoading(true)
			const categoriesData = await visaCategoryApi.getAllCategory();
			const newCategories = categoriesData.map((category: any) => {
				return {
					value: category.category,
					label: category.category
				}
			})
			setVisaCategories(newCategories);
			setLoading(false)
		}

		getCategories()
	}, [])

  return { loading, error, editLead, visaCategories, isAuthenticated };
};

export default useEditLead;
