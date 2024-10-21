import React from 'react';

interface ProgressBarProps {
  totalDocuments: any;
  uploadedDocuments: any;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ totalDocuments, uploadedDocuments }) => {
  const progressPercentage = totalDocuments ? (uploadedDocuments / totalDocuments) * 100 : 0;

  return (
    <div style={{ width: '100%', borderRadius: '5px' }}>
      <div style={{
        backgroundColor: '#b5b5b5',
        height: '20px',
        borderRadius: '5px',
        position: 'relative' 
      }}>
        <div
          style={{
            width: `${progressPercentage}%`,
            backgroundColor: '#4caf50',
            height: '20px',
            borderRadius: '5px',
          }}
        />
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white', 
          fontWeight: 'bold',
        }}>
          {`${uploadedDocuments} of ${totalDocuments}`}
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;
