// hooks/useReadBlog.js
import { useEffect, useState } from 'react'
import { leadApi } from '@/common' // Ensure this path is correct

interface LeadData {
    permanentAddress: string;
    currentAddress: string;
    passportExpiry: string;
    passportNumber: string;
    maritalStatus: string;
    nationality: string;
    dob: string;
    gender: string;
    phone: string;
    email: string;
    lastname: string;
    firstname: string;
    highestQualification: string;
    fieldOfStudy: string;
    institutionName: string;
    graduationYear: string;
    grade: string;
    testType: string;
    testScore: string;
    countryOfInterest: string;
    courseOfInterest: string;
    desiredFieldOfStudy: string;
    preferredInstitutions: string;
    intakeSession: string;
    reasonForImmigration: string;
    financialSupport: string;
    sponsorDetails: string;
    proofOfFunds: Record<string, any>;
    scholarships: string;
    visaCategory: string;
    languageTestReport: Record<string, any>;
    passportCopy: Record<string, any>; 
    certificates: Record<string, any>;
    transcripts: Record<string, any>; 
    sop: Record<string, any>;
    recommendationLetter: Record<string, any>;
    resume: Record<string, any>; 
    leadNotes: string;
    leadRating: string;
    followUpDates: string;
    assignedAgent: string;
    leadStatus: string;
    referralContact: string;
    leadSource: string;
    notes: string;
    preferredContactTime: string;
    communicationMode: string;
    created_at: string
}

const useReadLead = (leadId: string) => {
	const [leadData, setLeadData] = useState<LeadData | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')

    useEffect(() => {
        const fetchLeadData = async () => {
            try {
                const data = (await leadApi.getLeadById(leadId)) as LeadData;
                if (data) {
                    setLeadData(data);
                }
                setLoading(false);
            } catch (err) {
                console.error('Failed to fetch lead data:', err);
                setError('Failed to load the lead data.');
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

	return { leadData, loading, error }
}

export default useReadLead
