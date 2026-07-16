import { useRef, useCallback } from 'react';
import PropTypes from 'prop-types';

/**
 * Format raw digits to dot-separated display: "1500000" → "1.500.000"
 * @param {string} raw - digits only
 * @returns {string}
 */
const formatDisplay = (raw) => {
  if (!raw) return '';
  return raw.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

/**
 * Extract raw digits from formatted string: "1.500.000" → "1500000"
 * @param {string} formatted
 * @returns {string}
 */
const parseRaw = (formatted) => {
  if (!formatted) return '';
  return formatted.replace(/[^0-9]/g, '');
};

/**
 * CurrencyInput - Input hiển thị tiền với dấu chấm phân cách hàng nghìn
 *
 * Props:
 * - value: number|string (raw value, e.g. 1500000)
 * - onChange: (rawValue: string) => void
 * - placeholder: string
 * - disabled: boolean
 * - className: string
 * - id: string
 * - min: number
 * - max: number
 */
const CurrencyInput = ({
  value,
  onChange,
  placeholder = '0',
  disabled = false,
  className = '',
  id,
  min,
  max,
  ...rest
}) => {
  const inputRef = useRef(null);

  const handleChange = useCallback(
    (e) => {
      const input = e.target;
      const cursorPos = input.selectionStart;
      const oldRaw = parseRaw(input.value);

      // Strip non-digits
      let newRaw = oldRaw.replace(/[^0-9]/g, '');

      // Enforce min/max
      if (newRaw) {
        const num = Number(newRaw);
        if (min !== undefined && num < min) newRaw = String(min);
        if (max !== undefined && num > max) newRaw = String(max);
      }

      // Count dots before cursor in old value
      const oldFormatted = formatDisplay(oldRaw);
      const dotsBeforeCursorOld = (oldFormatted.slice(0, cursorPos).match(/\./g) || []).length;

      // Format new value
      const newFormatted = formatDisplay(newRaw);

      // Count dots before cursor in new value (same logical position)
      const logicalPos = cursorPos - dotsBeforeCursorOld;
      const newSlice = newFormatted.slice(0, logicalPos + (newFormatted.length - newRaw.length));
      const dotsBeforeCursorNew = (newSlice.match(/\./g) || []).length;

      // Calculate new cursor position
      const newCursorPos = Math.min(
        logicalPos + dotsBeforeCursorNew,
        newFormatted.length
      );

      // Notify parent with raw value
      onChange(newRaw);

      // Restore cursor position after React re-render
      requestAnimationFrame(() => {
        if (inputRef.current) {
          inputRef.current.setSelectionRange(newCursorPos, newCursorPos);
        }
      });
    },
    [onChange, min, max]
  );

  const handleBlur = useCallback(() => {
    // Enforce min on blur
    if (min !== undefined && value && Number(value) < min) {
      onChange(String(min));
    }
  }, [value, onChange, min]);

  const displayValue = formatDisplay(String(value || ''));

  return (
    <input
      ref={inputRef}
      id={id}
      type="text"
      inputMode="numeric"
      className={className}
      value={displayValue}
      onChange={handleChange}
      onBlur={handleBlur}
      placeholder={placeholder}
      disabled={disabled}
      autoComplete="off"
      {...rest}
    />
  );
};

CurrencyInput.propTypes = {
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  disabled: PropTypes.bool,
  className: PropTypes.string,
  id: PropTypes.string,
  min: PropTypes.number,
  max: PropTypes.number,
};

export default CurrencyInput;
