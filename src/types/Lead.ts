export type LeadData = {
	id: string;
	tenantID: string;
	permanentAddress: string;
    currentAddress: string;
    passportExpiry: string;
    passportNumber: string;
    maritalStatus: string;
    nationality: string;
    country: string;
    state: string;
    district: string;
    city: string;
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
    status: string; 
    referralContact: string;
    leadSource: string;
    notes: string;
    preferredContactTime: string;
    communicationMode: string;
    created_at: string
}

export type VisaCategory = {
    id: string
    category: string
}

export type LeadNote = {
    id: string
    lead_id: string
    user_id: string
    note: string
}
