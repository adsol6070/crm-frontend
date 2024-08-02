import { Col, Row } from 'react-bootstrap';
import Statistics from './getCardsData/Statistics';
import { PageBreadcrumb } from '@/components';
import useGetCardsData from './getCardsData/useGetcardsData';
import LeadStatusReport from './getLeadStatusReport/index';
import LeadSourceReport from './getLeadSourceReport/index';
import GetLeadReportOnTime from './getLeadReportOnTime/index';
import { startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths, startOfWeek, endOfWeek } from 'date-fns';

const Dashboard = () => {
    const { data: cardData } = useGetCardsData();

    const getUTCStartOfDay = (date: any) => new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const getUTCEndOfDay = (date: any) => new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59));

    const startHalf = getUTCStartOfDay(subMonths(new Date(), 6));
    const endHalf = getUTCEndOfDay(new Date());

    const currentDate = new Date();
    const utcDate = new Date(currentDate.toISOString().slice(0, -1));

    const startWeek = getUTCStartOfDay(startOfWeek(utcDate, { weekStartsOn: 1 }));
    const endWeek = getUTCEndOfDay(endOfWeek(utcDate, { weekStartsOn: 1 }));

    const startMonth = getUTCStartOfDay(startOfMonth(new Date()));
    const endMonth = getUTCEndOfDay(endOfMonth(new Date()));

    const startYear = getUTCStartOfDay(startOfYear(new Date()));
    const endYear = getUTCEndOfDay(endOfYear(new Date()));

    return (
        <>
            <PageBreadcrumb title="Welcome!" subName="Dashboards" />
            <Row>
                {(cardData || []).map((item, idx) => (
                    <Col xxl={3} sm={6} key={idx}>
                        <Statistics
                            title={item.title}
                            count={item.count}
                            icon={item.icon}
                            variant={item.variant}
                        />
                    </Col>
                ))}
            </Row>

            <Row className='my-1'>
                <LeadStatusReport />
                <LeadSourceReport />
                <Col md={4}>
                    <h5>Weekly Report</h5>
                    <GetLeadReportOnTime start={startWeek} end={endWeek} barColor={"#3b4158"} chartType="bar" />
                </Col>
            </Row>
            <Row className='my-2'>
                <Col md={4}>
                    <h5>Monthly Report</h5>
                    <GetLeadReportOnTime start={startMonth} end={endMonth} barColor={"#546E7A"} chartType="bar" />
                </Col>
                <Col md={4}>
                    <h5>Half Yearly Report</h5>
                    <GetLeadReportOnTime start={startHalf} end={endHalf} barColor={"#54557a"} chartType="donut" />
                </Col>
                <Col md={4}>
                    <h5>Yearly Report</h5>
                    <GetLeadReportOnTime start={startYear} end={endYear} barColor={"#547a68"} chartType="area" />
                </Col>
            </Row>
        </>
    );
};

export default Dashboard;
