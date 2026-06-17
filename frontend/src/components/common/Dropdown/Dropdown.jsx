import { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import styles from './Dropdown.module.scss';

/**
 * Dropdown Component
 * 
 * Component dropdown tái sử dụng với nhiều tùy chọn
 * Hỗ trợ: single select, multi select, search, custom trigger, icons
 * 
 * @example
 * // Basic usage
 * <Dropdown
 *   options={[
 *     { value: '1', label: 'Option 1' },
 *     { value: '2', label: 'Option 2' }
 *   ]}
 *   value="1"
 *   onChange={(value) => setSelectedValue(value)}
 * />
 * 
 * @example
 * // With search
 * <Dropdown
 *   options={options}
 *   searchable
 *   placeholder="Tìm kiếm..."
 * />
 * 
 * @example
 * // Multi select
 * <Dropdown
 *   options={options}
 *   multiple
 *   value={['1', '2']}
 *   onChange={(values) => setSelectedValues(values)}
 * />
 */
const Dropdown = ({
  options = [],
  value = null,
  onChange,
  placeholder = 'Chọn...',
  disabled = false,
  searchable = false,
  multiple = false,
  clearable = false,
  size = 'medium', // 'small', 'medium', 'large'
  className = '',
  error = false,
  errorMessage = '',
  label = '',
  required = false,
  maxHeight = '300px',
  renderOption = null, // Custom render cho option
  renderValue = null, // Custom render cho selected value
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, searchable]);

  // Handle ESC key to close dropdown
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  // Filter options based on search term
  const filteredOptions = searchable && searchTerm
    ? options.filter(option =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options;

  // Get selected option(s)
  const getSelectedOption = () => {
    if (multiple) {
      return options.filter(opt => value?.includes(opt.value));
    }
    return options.find(opt => opt.value === value);
  };

  // Handle option click
  const handleOptionClick = (optionValue) => {
    if (multiple) {
      const newValue = value?.includes(optionValue)
        ? value.filter(v => v !== optionValue)
        : [...(value || []), optionValue];
      onChange?.(newValue);
    } else {
      onChange?.(optionValue);
      setIsOpen(false);
      setSearchTerm('');
    }
  };

  // Handle clear
  const handleClear = (e) => {
    e.stopPropagation();
    onChange?.(multiple ? [] : null);
  };

  // Toggle dropdown
  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  // Render selected value display
  const renderSelectedValue = () => {
    if (renderValue) {
      return renderValue(getSelectedOption());
    }

    if (multiple) {
      const selected = getSelectedOption();
      if (selected.length === 0) {
        return <span className={styles.placeholder}>{placeholder}</span>;
      }
      if (selected.length === 1) {
        return selected[0].label;
      }
      return `${selected.length} mục đã chọn`;
    }

    const selected = getSelectedOption();
    if (!selected) {
      return <span className={styles.placeholder}>{placeholder}</span>;
    }

    return selected.label;
  };

  // Check if option is selected
  const isOptionSelected = (optionValue) => {
    if (multiple) {
      return value?.includes(optionValue);
    }
    return value === optionValue;
  };

  return (
    <div className={`${styles.dropdownWrapper} ${className}`}>
      {label && (
        <label className={styles.label}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}

      <div
        ref={dropdownRef}
        className={`
          ${styles.dropdown}
          ${styles[size]}
          ${isOpen ? styles.open : ''}
          ${disabled ? styles.disabled : ''}
          ${error ? styles.error : ''}
        `}
      >
        <div
          className={styles.trigger}
          onClick={toggleDropdown}
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <div className={styles.value}>
            {renderSelectedValue()}
          </div>

          <div className={styles.actions}>
            {clearable && (value || (multiple && value?.length > 0)) && !disabled && (
              <button
                type="button"
                className={styles.clearButton}
                onClick={handleClear}
                aria-label="Xóa lựa chọn"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M12 4L4 12M4 4L12 12"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            )}

            <svg
              className={styles.chevron}
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
            >
              <path
                d="M4 6L8 10L12 6"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {isOpen && (
          <div className={styles.menu} style={{ maxHeight }}>
            {searchable && (
              <div className={styles.searchWrapper}>
                <svg
                  className={styles.searchIcon}
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                >
                  <path
                    d="M7 12C9.76142 12 12 9.76142 12 7C12 4.23858 9.76142 2 7 2C4.23858 2 2 4.23858 2 7C2 9.76142 4.23858 12 7 12Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M10.5 10.5L14 14"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
                <input
                  ref={searchInputRef}
                  type="text"
                  className={styles.searchInput}
                  placeholder="Tìm kiếm..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            )}

            <div className={styles.optionsList} role="listbox">
              {filteredOptions.length === 0 ? (
                <div className={styles.noOptions}>
                  {searchTerm ? 'Không tìm thấy kết quả' : 'Không có dữ liệu'}
                </div>
              ) : (
                filteredOptions.map((option) => {
                  const selected = isOptionSelected(option.value);

                  return (
                    <div
                      key={option.value}
                      className={`
                        ${styles.option}
                        ${selected ? styles.selected : ''}
                        ${option.disabled ? styles.disabled : ''}
                      `}
                      onClick={() => !option.disabled && handleOptionClick(option.value)}
                      role="option"
                      aria-selected={selected}
                    >
                      {multiple && (
                        <div className={styles.checkbox}>
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={() => {}}
                            tabIndex={-1}
                          />
                        </div>
                      )}

                      {renderOption ? (
                        renderOption(option, selected)
                      ) : (
                        <>
                          {option.icon && (
                            <span className={styles.optionIcon}>{option.icon}</span>
                          )}
                          <span className={styles.optionLabel}>{option.label}</span>
                          {option.description && (
                            <span className={styles.optionDescription}>
                              {option.description}
                            </span>
                          )}
                        </>
                      )}

                      {!multiple && selected && (
                        <svg
                          className={styles.checkIcon}
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                        >
                          <path
                            d="M3 8L6.5 11.5L13 5"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {error && errorMessage && (
        <div className={styles.errorMessage}>{errorMessage}</div>
      )}
    </div>
  );
};

Dropdown.propTypes = {
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      label: PropTypes.string.isRequired,
      icon: PropTypes.node,
      description: PropTypes.string,
      disabled: PropTypes.bool,
    })
  ).isRequired,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number])),
  ]),
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  disabled: PropTypes.bool,
  searchable: PropTypes.bool,
  multiple: PropTypes.bool,
  clearable: PropTypes.bool,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  className: PropTypes.string,
  error: PropTypes.bool,
  errorMessage: PropTypes.string,
  label: PropTypes.string,
  required: PropTypes.bool,
  maxHeight: PropTypes.string,
  renderOption: PropTypes.func,
  renderValue: PropTypes.func,
};

export default Dropdown;
