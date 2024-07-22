import React, { useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import ReactApexChart from 'react-apexcharts';
import useGetLeadSourceReports from './useGetLeadSourceReports';
import styles from './leadSourceReport.module.css';
import { chartStyle } from '@/utils';
import { useThemeContext } from '@/common';

const LeadSourceReport = () => {
  const { settings } = useThemeContext();
  const { report: reportData } = useGetLeadSourceReports();
  const [selectedSource, setSelectedSource] = useState<string | null>(null);

  // Filtered data based on the selected source
  const filteredData = selectedSource ? reportData.filter(item => item.status === selectedSource) : reportData;

  // Calculate total leads for percentage calculation
  const totalLeads = filteredData.reduce((acc: any, item: any) => acc + parseInt(item.lead_count, 10), 0);

  // Calculate percentages for pie chart and round them
  const percentages = filteredData.map((item: any) => Math.round((parseInt(item.lead_count, 10) / totalLeads) * 100));

  // Prepare data for pie chart
  const chartData = {
    series: percentages,
    options: {
      chart: {
        type: 'pie' as const,
        height: 350,
      },
      labels: filteredData.map((item: any) => item.source || 'Unknown'),
      dataLabels: {
        enabled: true,
        formatter: function (val: number, opts: any) {
          return `${opts.w.globals.labels[opts.seriesIndex]}: ${Math.round(val)}%`;
        }
      },
      legend: {
        position: 'bottom',
        labels: {
          colors: '#333',
          useSeriesColors: false
        }
      },
      tooltip: {
        y: {
          formatter: function (val: any, opts: any) {
            const index = opts.seriesIndex;
            const count = filteredData[index] ? filteredData[index].lead_count : 0;
            return `${opts.w.globals.labels[opts.seriesIndex]}: ${count} leads (${Math.round(val)}%)`;
          }
        }
      },
      title: {
        text: 'Leads by Source',
        align: 'left',
        style: {
          fontSize: '16px',
          fontWeight: 'bold',
          color: '#263238'
        }
      },
      colors: ['#3498db', '#2ecc71', '#e74c3c', '#e67e22', '#1abc9c', '#9b59b6', '#f1c40f', '#34495e', '#16a085', '#f39c12']
    }
  };

  return (
    <Col md={4}>
      <h5>Lead Source Report</h5>
      <Row className={`mx-2 my-2 pt-2 ${styles.customDesign}`}  style={chartStyle(settings.theme === "dark")}>
        <Col md={12} className={`d-flex justify-content-center`}>
          <div className={styles.chartContainer}>
            <ReactApexChart options={chartData.options} series={chartData.series} type="pie" height={350} />
          </div>
        </Col>
      </Row>
    </Col>
  );
};

export default LeadSourceReport;
