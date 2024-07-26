import React, { useState } from 'react';
import { Col, Row, Button } from 'react-bootstrap';
import ReactApexChart from 'react-apexcharts';
import useGetLeadReports from './useGetLeadReports';
import styles from './leadStatusReport.module.css'; // Create a new CSS module if needed
import { chartStyle } from '@/utils';
import { useThemeContext } from '@/common';

const LeadStatusReport = () => {
  const { settings } = useThemeContext();
  const { report: reportData } = useGetLeadReports();
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  const filteredData = selectedStatus ? reportData.filter(item => item.status === selectedStatus) : reportData;

  const barColor = '#33b0e0'; 

  const chartData = {
    series: [
      {
        name: 'Leads',
        data: filteredData.map(item => item.lead_count)
      }
    ],
    options: {
      chart: {
        type: 'bar' as const,
        height: 350
      },
      plotOptions: {
        bar: {
          columnWidth: '50%',
          distributed: false 
        }
      },
      dataLabels: {
        enabled: false
      },
      xaxis: {
        categories: filteredData.map(item => item.status || 'New'),
        title: {
          text: 'Status',
          style: {
            fontSize: '15px'
          }
        }
      },
      yaxis: {
        title: {
          text: 'Number of Leads',
          style: {
            fontSize: '15px'
          }
        },
        labels: {
          formatter: function (val: any) {
            return val.toFixed(0);
          }
        }
      },
      fill: {
        type: 'solid',
        colors: [barColor] 
      },
      tooltip: {
        y: {
          formatter: function (val: any) {
            return val;
          }
        }
      }
    }
  };

  const handleStatusChange = (status: string | null) => {
    setSelectedStatus(status);
  };

  return (
      <Col md={4}>
        <h5>Status Report</h5>
        <Row className={`mx-2 my-2 pt-2 ${styles.customDesign}`} style={chartStyle(settings.theme === "dark")}>
          <Col md={12} className="d-flex justify-content-center align-items-center flex-wrap">
            <Button style={{ backgroundColor: "#6c757d" }} className={`m-1 btn-sm ${styles.button} ${styles.buttonMx2}`} onClick={() => handleStatusChange(null)}>All</Button>
            <Button style={{ backgroundColor: "#ffc107" }} className={`m-1 btn-sm ${styles.button} ${styles.buttonMx2}`} onClick={() => handleStatusChange('pending')}>Pending</Button>
            <Button style={{ backgroundColor: "#17a2b8" }} className={`m-1 btn-sm ${styles.button} ${styles.buttonMx2}`} onClick={() => handleStatusChange('inprogress')}>In Progress</Button>
            <Button style={{ backgroundColor: "#28a745" }} className={`m-1 btn-sm ${styles.button} ${styles.buttonMx2}`} onClick={() => handleStatusChange('completed')}>Completed</Button>
          </Col>
          <Col md={12} className={`d-flex justify-content-center`}>
            <div className={styles.chartContainer}>
              <ReactApexChart options={chartData.options} series={chartData.series} type="bar" height={350} />
            </div>
          </Col>
        </Row>
      </Col>
  );
};

export default LeadStatusReport;
