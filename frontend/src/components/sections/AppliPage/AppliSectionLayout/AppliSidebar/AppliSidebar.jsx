import PropTypes from 'prop-types';
import AIAssistantPanel from './AIAssistantPanel/AIAssistantPanel';
import RulesPanel from './RulesPanel/RulesPanel';
import HelpPanel from './HelpPanel/HelpPanel';
import styles from './AppliSidebar.module.scss';

const AppliSidebar = ({ moTa, tieuDe, onApplySuggestion }) => {
  return (
    <aside className={styles.sidebar}>
      <AIAssistantPanel
        moTa={moTa}
        tieuDe={tieuDe}
        onApplySuggestion={onApplySuggestion}
      />
      <RulesPanel />
      <HelpPanel />
    </aside>
  );
};

AppliSidebar.propTypes = {
  moTa: PropTypes.string,
  tieuDe: PropTypes.string,
  onApplySuggestion: PropTypes.func,
};

export default AppliSidebar;
