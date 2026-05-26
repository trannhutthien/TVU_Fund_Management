import PropTypes from 'prop-types';
import styles from './AppliSectionLayout.module.scss';

const AppliSectionLayout = ({ leftContent, rightContent }) => {
  return (
    <div className={styles.layout}>
      <div className={styles.container}>
        <div className={styles.leftCol}>
          {leftContent}
        </div>
        <div className={styles.rightCol}>
          {rightContent}
        </div>
      </div>
    </div>
  );
};

AppliSectionLayout.propTypes = {
  leftContent: PropTypes.node,
  rightContent: PropTypes.node,
};

export default AppliSectionLayout;
