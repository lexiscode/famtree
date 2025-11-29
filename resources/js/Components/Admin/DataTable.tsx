import { ReactNode } from 'react';

interface Column {
    key: string;
    label: string;
    width?: string;
    render?: (value: any, row: any) => ReactNode;
}

interface DataTableProps {
    columns: Column[];
    data: any[];
    onRowClick?: (row: any) => void;
}

export default function DataTable({ columns, data, onRowClick }: DataTableProps) {
    return (
        <div style={{
            overflowX: 'auto',
        }}>
            <table style={{
                width: '100%',
                borderCollapse: 'collapse',
            }}>
                <thead>
                    <tr style={{
                        background: '#F9F9F9',
                        borderBottom: '1px solid #E8E8E8',
                    }}>
                        {columns.map((column) => (
                            <th
                                key={column.key}
                                style={{
                                    padding: '1rem',
                                    textAlign: 'left',
                                    fontSize: '0.85rem',
                                    fontWeight: 700,
                                    color: '#666',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px',
                                    width: column.width,
                            }}
                            >
                                {column.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, rowIndex) => (
                        <tr
                            key={rowIndex}
                            onClick={() => onRowClick?.(row)}
                            style={{
                                borderBottom: '1px solid #E8E8E8',
                                transition: 'background 0.2s ease',
                                cursor: onRowClick ? 'pointer' : 'default',
                            }}
                            onMouseEnter={(e) => {
                                if (onRowClick) {
                                    e.currentTarget.style.background = '#F9F9F9';
                                }
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'transparent';
                            }}
                        >
                            {columns.map((column) => (
                                <td
                                    key={`${rowIndex}-${column.key}`}
                                    style={{
                                        padding: '1rem',
                                        fontSize: '0.95rem',
                                        color: '#333',
                                    }}
                                >
                                    {column.render
                                        ? column.render(row[column.key], row)
                                        : row[column.key]}
                                </td>
                            ))}
                        </tr>
                    ))}
                    {data.length === 0 && (
                        <tr>
                            <td
                                colSpan={columns.length}
                                style={{
                                    padding: '2rem 1rem',
                                    textAlign: 'center',
                                    color: '#999',
                                    fontSize: '0.95rem',
                                }}
                            >
                                No data available
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
