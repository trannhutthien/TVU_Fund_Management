import PropTypes from 'prop-types';
import styles from './DonationStepper.module.scss';

const DonationStepper = ({ steps, currentStep, completedSteps = [] }) => {
  return (
    <div className={styles.stepper}>
      {steps.map((step, index) => {
        const isCompleted = completedSteps.includes(step.id);
        const isCurrent = currentStep === step.id;
        const isLast = index === steps.length - 1;

        return (
          <div
            key={step.id}
            className={`${styles.stepItem} ${isCompleted ? styles.completed : ''} ${isCurrent ? styles.active : ''}`}
          >
            <div className={styles.stepIndicator}>
              <div className={`${styles.stepCircle} ${isCompleted ? styles.completedCircle : ''} ${isCurrent ? styles.activeCircle : ''}`}>
                {isCompleted ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <span>{step.id}</span>
                )}
              </div>
              {!isLast && (
                <div className={`${styles.stepLine} ${isCompleted ? styles.completedLine : ''}`} />
              )}
            </div>
            <span className={`${styles.stepLabel} ${isCurrent ? styles.activeLabel : ''} ${isCompleted ? styles.completedLabel : ''}`}>
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};

DonationStepper.propTypes = {
  steps: PropTypes.array.isRequired,
  currentStep: PropTypes.number.isRequired,
  completedSteps: PropTypes.array,
};

export default DonationStepper;
