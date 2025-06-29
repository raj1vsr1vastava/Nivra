import SocietyFinancesList from './SocietyFinancesList';
import SocietyFinanceChart from './SocietyFinanceChart';

// Export components with documentation
/**
 * SocietyFinancesList - Main component for displaying and managing finances for a society
 * @param {Object} props
 * @param {string} [props.societyId] - Optional ID of the society to display finances for
 */

/**
 * SocietyFinanceChart - Component for visualizing finance data
 * @param {Object} props
 * @param {string} props.societyId - ID of the society to display chart for
 * @param {string} [props.period='monthly'] - Time period for the chart (daily, weekly, monthly, yearly)
 */

export { SocietyFinanceChart };
export default SocietyFinancesList;
