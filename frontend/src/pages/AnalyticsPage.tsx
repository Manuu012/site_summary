import React, { useEffect, useReducer } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { getVisitedWebsitesCount, getWebsiteVisits } from '../apis/Analytics';
import '../styles/analytics.css';
import { useNavigate } from 'react-router-dom';
import type { AnalyticsAction, AnalyticsState, WebsiteVisit } from '../types/IApp';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);


// Reducer function
function analyticsReducer(state: AnalyticsState, action: AnalyticsAction): AnalyticsState {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true, error: null };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        loading: false,
        websitesCount: action.payload.count,
        websiteVisits: action.payload.visits,
      };
    case 'FETCH_ERROR':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
}

const AnalyticsPage: React.FC = () => {

  const navigate = useNavigate();
  const { data } = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
  const [state, dispatch] = useReducer(analyticsReducer, {
    loading: true,
    error: null,
    websitesCount: null,
    websiteVisits: null,
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        dispatch({ type: 'FETCH_START' });
        const [countData, visitsData] = await Promise.all([
          getVisitedWebsitesCount(data.id),
          getWebsiteVisits(data.id),
        ]);
        dispatch({ type: 'FETCH_SUCCESS', payload: { count: countData, visits: visitsData } });
      } catch (err) {
        dispatch({ type: 'FETCH_ERROR', payload: 'Failed to fetch analytics data' });
        console.error('Analytics error:', err);
      }
    };

    fetchAnalytics();
  }, [data.id]);

  

  if (state.loading) return <div>Loading analytics...</div>;
  if (state.error) return <div>Error: {state.error}</div>;
  if (!state.websitesCount || !state.websiteVisits) return <div>No analytics data found</div>;

  // same chart code from before...

  const doughnutData = {
    labels: state.websiteVisits.websites.slice(0, 5).map((w: WebsiteVisit) =>
      w.websiteTitle || w.websiteUrl.replace('https://', '').replace('www.', '')
    ),
    datasets: [
      {
        data: state.websiteVisits.websites.slice(0, 5).map((w: WebsiteVisit) => w.visitCount),
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const barChartData = {
  labels: state.websiteVisits.websites.map((w: WebsiteVisit) => {
    const title = w.websiteTitle || w.websiteUrl.replace('https://', '').replace('www.', '');
    return title.length > 10 ? title.substring(0, 10) + '...' : title;
  }),
  datasets: [
    {
      label: 'Number of Visits',
      data: state.websiteVisits.websites.map((w: WebsiteVisit) => w.visitCount),
      backgroundColor: 'rgba(54, 162, 235, 0.6)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 1,
    },
  ],
};

  const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
    },
    tooltip: {
      callbacks: {
        title: (context: any) => {
          // Show full website title on hover
          const index = context[0].dataIndex;
          const website = state.websiteVisits.websites[index];
          const fullTitle = website.websiteTitle || website.websiteUrl;
          return `Website: ${fullTitle}`;
        },
        label: (context: any) => {
          return `Visits: ${context.parsed.y}`;
        }
      }
    }
  },
  scales: {
    x: {
      ticks: {
        maxRotation: 45,
        minRotation: 0,
        font: {
          size: 10
        }
      }
    },
    y: {
      ticks: {
        font: {
          size: 10
        }
      }
    }
  }
  };

  const handleGoToChat = () => navigate('/site_summary/chat');

  
  return (
    <div className="analytics-page">
      <header className="analytics-header">
        <h1>Your Analytics Dashboard</h1>
        <button className="chat-button" onClick={handleGoToChat}>
          Go to Chat
        </button>
      </header>

      <div className="charts-grid">
        <div className="chart-container" style={{ flex: 1 }}>
          <h3>Website Visit Frequency</h3>
          <div style={{ height: '300px', width: '100%' }}>
            <Bar data={barChartData} options={chartOptions} />
          </div>
        </div>

        <div className="chart-container" style={{ flex: 1 }}>
        <h3>Top Websites Distribution</h3>
        <div className="doughnut-container">
    <Doughnut 
      data={doughnutData} 
      options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
          }
        }
      }}
    />
        </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
