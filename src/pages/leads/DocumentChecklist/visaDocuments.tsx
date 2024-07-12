export type VisaType = 'tourist' | 'study' | 'work';

export interface DocumentRequirement {
  name: string;
  required: boolean;
}

export const visaDocuments: Record<VisaType, DocumentRequirement[]> = {
  tourist: [
    { name: 'Passport', required: true },
    { name: 'Visa Application Form', required: true },
    { name: 'Passport-sized Photographs', required: true },
    { name: 'Proof of Travel Arrangements (Flight Itinerary, Hotel Reservations)', required: true },
    { name: 'Proof of Financial Means (Bank Statements, Pay Stubs)', required: true },
    { name: 'Travel Insurance', required: true },
    { name: 'Proof of Employment or Letter from Employer (if applicable)', required: false },
    { name: 'Invitation Letter (if visiting friends or relatives)', required: false },
    { name: 'Proof of Payment for Visa Fees', required: true },
  ],
  study: [
    { name: 'Passport', required: true },
    { name: 'Visa Application Form', required: true },
    { name: 'Passport-sized Photographs', required: true },
    { name: 'Proof of Enrollment (Acceptance Letter from Educational Institution)', required: true },
    { name: 'Proof of Financial Support (Bank Statements, Scholarship Letters, etc.)', required: true },
    { name: 'Medical Examination Reports', required: true },
    { name: 'Academic Transcripts', required: true },
    { name: 'Proof of Payment for Visa Fees', required: true },
    { name: 'Proof of Accommodation', required: true },
    { name: 'English Proficiency Test Scores (e.g., TOEFL, IELTS)', required: false },
    { name: 'Study Plan or Statement of Purpose', required: false },
  ],
  work: [
    { name: 'Passport', required: true },
    { name: 'Visa Application Form', required: true },
    { name: 'Passport-sized Photographs', required: true },
    { name: 'Job Offer Letter or Contract', required: true },
    { name: 'Work Permit (if required)', required: true },
    { name: 'Proof of Qualifications (Degrees, Certificates)', required: true },
    { name: 'Proof of Relevant Work Experience (CV, Reference Letters)', required: false },
    { name: 'Proof of Financial Means (Bank Statements)', required: false },
    { name: 'Medical Examination Reports', required: true },
    { name: 'Proof of Payment for Visa Fees', required: true },
  ],
};
