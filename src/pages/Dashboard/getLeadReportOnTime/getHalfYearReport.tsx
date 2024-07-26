import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FaCalendarAlt } from 'react-icons/fa';
import styles from './getLeadReportOnTime.module.css';
import useGetLeadReportsOnTime from './getLeadReportOnTime';
import ReactApexChart from 'react-apexcharts';
import { format, eachMonthOfInterval, startOfMonth, endOfMonth } from 'date-fns';
import { chartStyle } from '@/utils';
import { useThemeContext } from '@/common';

interface GetLeadReportOnTimeProps {
  start: Date;
  end: Date;
}

const GetLeadHalfYearReportOnTime: React.FC<GetLeadReportOnTimeProps> = ({ start, end}) => {
  const { settings } = useThemeContext();
  const [startDate, setStartDate] = useState<Date | undefined>(start);
  const [endDate, setEndDate] = useState<Date | undefined>(end);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  const { report } = useGetLeadReportsOnTime(
    startDate ? startDate.toISOString() : null,
    endDate ? endDate.toISOString() : null
  );

  useEffect(() => {
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkMode(darkModeMediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setIsDarkMode(e.matches);
    };

    darkModeMediaQuery.addEventListener('change', handleChange);
    return () => darkModeMediaQuery.removeEventListener('change', handleChange);
  }, []);

  const handleDateChange = (date: Date | null, isStart: boolean) => {
    if (isStart) {
      setStartDate(date ? new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0)) : undefined);
    } else {
      setEndDate(date ? new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59)) : undefined);
    }
  };

  const getDateIntervals = (start: Date, end: Date) => {
    return eachMonthOfInterval({ start, end }).map(monthStart => 
      format(monthStart, 'MMM yyyy')
    );
  };

  useEffect(() => {
    if (startDate && endDate) {
      processChartData(report, startDate, endDate);
    }
  }, [report, startDate, endDate]);

  const processChartData = (data: any[], start: Date, end: Date) => {
    const filteredData = data.filter(d => new Date(d.date) >= start && new Date(d.date) <= end);
    const groupedData = filteredData.reduce((acc, curr) => {
      const monthStart = startOfMonth(new Date(curr.date));
      const monthKey = format(monthStart, 'MMM yyyy');
      acc[monthKey] = (acc[monthKey] || 0) + parseInt(curr.lead_count, 10);
      return acc;
    }, {});

    const categories = getDateIntervals(start, end);
    const seriesData = categories.map(month => groupedData[month] || 0);

    // Define an array of colors for the pie chart
    const pieColors = ['#3498db', '#2ecc71', '#e74c3c', '#e67e22', '#1abc9c', '#9b59b6', '#f1c40f', '#34495e', '#16a085', '#f39c12'];

    setChartData({
      series: seriesData,
      options: {
        chart: {
          type: 'pie',
          height: 350,
          toolbar: {
            show: true,
          },
        },
        labels: categories,
        dataLabels: {
          enabled: true,
          formatter: function (val: number, opts: any) {
            return `${opts.w.globals.labels[opts.seriesIndex]}: ${val.toFixed(1)}%`;
          }
        },
        tooltip: {
          y: {
            formatter: function (val: number) {
              return `${val} leads`;
            }
          }
        },
        title: {
          text: 'Leads Created Per Month',
          align: 'left',
          style: {
            fontSize: '16px',
            fontWeight: 'bold',
            color: '#263238'
          }
        },
        colors: pieColors,
        legend: {
          position: 'bottom',
          labels: {
            colors: isDarkMode ? '#fff' : '#333',
            useSeriesColors: false
          }
        },
      }
    });
  };

  const [chartData, setChartData] = useState<any>({
    series: [],
    options: {}
  });

  return (
    <div>
      <div className={`${styles.customDatepickerWrapper} ${isDarkMode ? 'dark' : ''}`}>
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
          <FaCalendarAlt />
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
          <FaCalendarAlt />
        </div>
      </div>
      <div style={chartStyle(settings.theme === "dark")}>
        <ReactApexChart 
          options={chartData.options} 
          series={chartData.series} 
          type="pie" 
          height={350} 
        />
      </div>
    </div>
  );
};

export default GetLeadHalfYearReportOnTime;
