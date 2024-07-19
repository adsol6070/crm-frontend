import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import styles from './getLeadReportOnTime.module.css';
import useGetLeadReportsOnTime from './getLeadReportOnTime';
import ReactApexChart from 'react-apexcharts';
import { format, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval, eachQuarterOfInterval, eachYearOfInterval } from 'date-fns';

interface GetLeadReportOnTimeProps {
  start: Date;
  end: Date;
  barColor: string;
  chartType: 'bar' | 'line' | 'area' | 'pie' | 'donut' | 'radialBar' | 'scatter' | 'bubble' | 'heatmap' | 'candlestick' | 'boxPlot' | 'radar' | 'polarArea' | 'rangeBar' | 'rangeArea';
}

const GetLeadReportOnTime: React.FC<GetLeadReportOnTimeProps> = ({ start, end, barColor, chartType }) => {
  const [startDate, setStartDate] = useState<Date | undefined>(start);
  const [endDate, setEndDate] = useState<Date | undefined>(end);
  const { report } = useGetLeadReportsOnTime(
    startDate ? startDate.toISOString() : null,
    endDate ? endDate.toISOString() : null
  );

  const handleDateChange = (date: Date | null, isStart: boolean) => {
    if (isStart) {
      setStartDate(date || undefined);
    } else {
      setEndDate(date || undefined);
    }
  };

  // Function to determine the interval type (weekly, monthly, etc.)
  const getDateIntervals = (start: Date, end: Date) => {
    const diffDays = (end.getTime() - start.getTime()) / (1000 * 3600 * 24);

    if (diffDays <= 7) {
      return eachDayOfInterval({ start, end }).map(date => format(date, 'EEEE')); // Weekdays
    } else if (diffDays <= 30) {
      return eachWeekOfInterval({ start, end }).map(date => format(date, 'wo')); // Weeks
    } else if (diffDays <= 365) {
      return eachMonthOfInterval({ start, end }).map(date => format(date, 'MMM yyyy')); // Months
    } else {
      return eachYearOfInterval({ start, end }).map(date => format(date, 'yyyy')); // Years
    }
  };

  const categories = startDate && endDate ? getDateIntervals(startDate, endDate) : [];
  const data = report.map((item: any) => parseInt(item.lead_count, 10));

  const flatColors = ['#3498db', '#2ecc71', '#e74c3c', '#e67e22', '#1abc9c', '#9b59b6', '#f1c40f', '#34495e', '#16a085', '#f39c12'];

  const chartData = {
    series: chartType === 'bar' || chartType === 'line' || chartType === 'area' || chartType === 'rangeBar' || chartType === 'rangeArea'
      ? [{
          name: 'Leads Count',
          data
        }]
      : data,
    options: {
      chart: {
        type: chartType as const,
        height: 350,
        toolbar: {
          show: true,
        },
      },
      plotOptions: chartType === 'bar'
        ? {
            bar: {
              horizontal: false,
              columnWidth: '55%',
              endingShape: 'rounded'
            },
          }
        : chartType === 'radialBar'
        ? {
            radialBar: {
              hollow: {
                size: '70%',
              },
            },
          }
        : {},
      dataLabels: {
        enabled: false,
      },
      stroke: chartType === 'line' || chartType === 'area'
        ? {
            show: true,
            width: 2,
            curve: 'smooth'
          }
        : chartType === 'bar'
        ? {
            show: true,
            width: 2,
            colors: ['transparent']
          }
        : {},
      xaxis: chartType === 'bar' || chartType === 'line' || chartType === 'area' || chartType === 'rangeBar' || chartType === 'rangeArea'
        ? {
            categories,
          }
        : {},
      yaxis: chartType === 'bar' || chartType === 'line' || chartType === 'area' || chartType === 'rangeBar' || chartType === 'rangeArea'
        ? {
            title: {
              text: 'Leads Count'
            }
          }
        : {},
      fill: {
        opacity: 1
      },
      tooltip: {
        y: {
          formatter: function (val: any, opts: any) {
            return chartType === 'pie' || chartType === 'donut'
              ? `${opts.w.globals.labels[opts.seriesIndex]}: ${val} leads`
              : `${val} leads`;
          }
        }
      },
      labels: chartType === 'pie' || chartType === 'donut' || chartType === 'radialBar' ? categories : [],
      title: {
        text: 'Leads Created Per Day',
        align: 'left',
        style: {
          fontSize: '16px',
          fontWeight: 'bold',
          color: '#263238'
        }
      },
      colors: chartType === 'pie' || chartType === 'donut' ? flatColors : [barColor],
      legend: {
        position: 'bottom',
        labels: {
          colors: '#333',
          useSeriesColors: false
        }
      },
    }
  };

  return (
    <div>
      <div className={styles.customDatepickerWrapper}>
        <div className={styles.customDatepickerIcon}>
          <DatePicker
            selected={startDate}
            onChange={(date) => handleDateChange(date, true)}
            selectsStart
            startDate={startDate}
            endDate={endDate}
            placeholderText="Select Start Date"
            className={styles.customDatepickerInput}
          />
        </div>
        <div className={styles.customDatepickerIcon}>
          <DatePicker
            selected={endDate}
            onChange={(date) => handleDateChange(date, false)}
            selectsEnd
            startDate={startDate}
            endDate={endDate}
            minDate={startDate}
            placeholderText="Select End Date"
            className={styles.customDatepickerInput}
          />
        </div>
      </div>
      <div style={{ backgroundColor: "white", padding: "10px" }}>
        <ReactApexChart 
          options={chartData.options} 
          series={chartData.series} 
          type={chartType} 
          height={350} 
        />
      </div>
    </div>
  );
};

export default GetLeadReportOnTime;
