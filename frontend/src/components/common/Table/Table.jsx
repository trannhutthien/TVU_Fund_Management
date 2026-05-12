import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import './Table.scss';

/**
 * Table Component
 * 
 * Table component với sorting, pagination, selection
 * Có hover effect, loading state, empty state
 * 
 * @param {Array} columns - Cấu hình columns: [{ key, label, sortable, render, width }]
 * @param {Array} data - Dữ liệu hiển thị
 * @param {boolean} loading - Loading state
 * @param {boolean} striped - Striped rows (màu xen kẽ)
 * @param {boolean} hoverable - Hover effect
 * @param {boolean} bordered - Border cho cells
 * @param {string} size - Kích thước: 'sm' | 'md' | 'lg'
 * @param {boolean} selectable - Cho phép chọn rows
 * @param {Array} selectedRows - Rows đã chọn (controlled)
 * @param {function} onSelectionChange - Callback khi selection thay đổi
 * @param {function} onRowClick - Callback khi click row
 * @param {boolean} pagination - Hiện pagination
 * @param {number} pageSize - Số rows mỗi page
 * @param {number} currentPage - Page hiện tại (controlled)
 * @param {function} onPageChange - Callback khi đổi page
 * @param {React.ReactNode} emptyText - Text khi không có data
 * @param {string} className - Custom class
 */
const Table = ({
  columns = [],
  data = [],
  loading = false,
  striped = true,
  hoverable = true,
  bordered = false,
  size = 'md',
  selectable = false,
  selectedRows = [],
  onSelectionChange,
  onRowClick,
  pagination = true,
  pageSize = 10,
  currentPage = 1,
  onPageChange,
  emptyText = 'Không có dữ liệu',
  className = '',
}) => {
  // Local state for sorting
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Local state for page (nếu không controlled)
  const [localPage, setLocalPage] = useState(1);
  const activePage = currentPage || localPage;

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return data;

    const sorted = [...data].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue === bValue) return 0;

      const comparison = aValue > bValue ? 1 : -1;
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }, [data, sortConfig]);

  // Paginate data
  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData;

    const startIndex = (activePage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return sortedData.slice(startIndex, endIndex);
  }, [sortedData, activePage, pageSize, pagination]);

  const totalPages = Math.ceil(sortedData.length / pageSize);

  // Handle sort
  const handleSort = (key) => {
    if (!columns.find(col => col.key === key)?.sortable) return;

    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  // Handle select all
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      onSelectionChange?.(paginatedData.map((_, index) => index));
    } else {
      onSelectionChange?.([]);
    }
  };

  // Handle select row
  const handleSelectRow = (index) => {
    const newSelection = selectedRows.includes(index)
      ? selectedRows.filter(i => i !== index)
      : [...selectedRows, index];
    onSelectionChange?.(newSelection);
  };

  // Handle page change
  const handlePageChange = (page) => {
    if (onPageChange) {
      onPageChange(page);
    } else {
      setLocalPage(page);
    }
  };

  // Check if all rows selected
  const allSelected = paginatedData.length > 0 && selectedRows.length === paginatedData.length;
  const someSelected = selectedRows.length > 0 && selectedRows.length < paginatedData.length;

  // Table classes
  const tableClasses = [
    'table',
    `table-${size}`,
    striped && 'table-striped',
    hoverable && 'table-hoverable',
    bordered && 'table-bordered',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="table-container">
      {/* Table wrapper */}
      <div className="table-wrapper">
        <table className={tableClasses}>
          {/* Table head */}
          <thead className="table-head">
            <tr>
              {/* Selection column */}
              {selectable && (
                <th className="table-cell table-cell-checkbox">
                  <label className="table-checkbox">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      ref={input => {
                        if (input) input.indeterminate = someSelected;
                      }}
                      onChange={handleSelectAll}
                    />
                    <span className="table-checkbox-mark" />
                  </label>
                </th>
              )}

              {/* Data columns */}
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={[
                    'table-cell',
                    'table-cell-head',
                    column.sortable && 'table-cell-sortable',
                    sortConfig.key === column.key && 'table-cell-sorted',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  style={{ width: column.width }}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="table-cell-content">
                    <span>{column.label}</span>
                    {column.sortable && (
                      <span className="table-sort-icon">
                        {sortConfig.key === column.key ? (
                          sortConfig.direction === 'asc' ? (
                            <svg viewBox="0 0 20 20" fill="currentColor">
                              <path d="M3 3a1 1 0 000 2h11a1 1 0 100-2H3zM3 7a1 1 0 000 2h7a1 1 0 100-2H3zM3 11a1 1 0 100 2h4a1 1 0 100-2H3zM15 8a1 1 0 10-2 0v5.586l-1.293-1.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L15 13.586V8z" />
                            </svg>
                          ) : (
                            <svg viewBox="0 0 20 20" fill="currentColor">
                              <path d="M3 3a1 1 0 000 2h11a1 1 0 100-2H3zM3 7a1 1 0 000 2h5a1 1 0 000-2H3zM3 11a1 1 0 100 2h4a1 1 0 100-2H3zM13 16a1 1 0 102 0v-5.586l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 101.414 1.414L13 10.414V16z" />
                            </svg>
                          )
                        ) : (
                          <svg viewBox="0 0 20 20" fill="currentColor">
                            <path d="M5 12a1 1 0 102 0V6.414l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L5 6.414V12zM15 8a1 1 0 10-2 0v5.586l-1.293-1.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L15 13.586V8z" />
                          </svg>
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* Table body */}
          <tbody className="table-body">
            {loading ? (
              // Loading state
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)} className="table-cell-loading">
                  <div className="table-loading">
                    <div className="table-spinner" />
                    <span>Đang tải...</span>
                  </div>
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              // Empty state
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)} className="table-cell-empty">
                  <div className="table-empty">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <span>{emptyText}</span>
                  </div>
                </td>
              </tr>
            ) : (
              // Data rows
              paginatedData.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className={[
                    'table-row',
                    selectedRows.includes(rowIndex) && 'table-row-selected',
                    onRowClick && 'table-row-clickable',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => onRowClick?.(row, rowIndex)}
                >
                  {/* Selection cell */}
                  {selectable && (
                    <td className="table-cell table-cell-checkbox">
                      <label
                        className="table-checkbox"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={selectedRows.includes(rowIndex)}
                          onChange={() => handleSelectRow(rowIndex)}
                        />
                        <span className="table-checkbox-mark" />
                      </label>
                    </td>
                  )}

                  {/* Data cells */}
                  {columns.map((column) => (
                    <td key={column.key} className="table-cell">
                      {column.render
                        ? column.render(row[column.key], row, rowIndex)
                        : row[column.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && !loading && paginatedData.length > 0 && (
        <div className="table-pagination">
          <div className="table-pagination-info">
            Hiển thị {(activePage - 1) * pageSize + 1} - {Math.min(activePage * pageSize, sortedData.length)} trong tổng số {sortedData.length}
          </div>

          <div className="table-pagination-controls">
            <button
              className="table-pagination-btn"
              onClick={() => handlePageChange(activePage - 1)}
              disabled={activePage === 1}
            >
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </button>

            {[...Array(totalPages)].map((_, index) => {
              const page = index + 1;
              // Show first, last, current, and adjacent pages
              if (
                page === 1 ||
                page === totalPages ||
                (page >= activePage - 1 && page <= activePage + 1)
              ) {
                return (
                  <button
                    key={page}
                    className={[
                      'table-pagination-btn',
                      page === activePage && 'table-pagination-btn-active',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </button>
                );
              } else if (page === activePage - 2 || page === activePage + 2) {
                return <span key={page} className="table-pagination-ellipsis">...</span>;
              }
              return null;
            })}

            <button
              className="table-pagination-btn"
              onClick={() => handlePageChange(activePage + 1)}
              disabled={activePage === totalPages}
            >
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

Table.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      sortable: PropTypes.bool,
      render: PropTypes.func,
      width: PropTypes.string,
    })
  ).isRequired,
  data: PropTypes.array.isRequired,
  loading: PropTypes.bool,
  striped: PropTypes.bool,
  hoverable: PropTypes.bool,
  bordered: PropTypes.bool,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  selectable: PropTypes.bool,
  selectedRows: PropTypes.array,
  onSelectionChange: PropTypes.func,
  onRowClick: PropTypes.func,
  pagination: PropTypes.bool,
  pageSize: PropTypes.number,
  currentPage: PropTypes.number,
  onPageChange: PropTypes.func,
  emptyText: PropTypes.node,
  className: PropTypes.string,
};

export default Table;
