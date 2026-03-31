import { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from './ui/select';
import { Search, Eye, Edit, Trash2, Filter } from 'lucide-react';
import { cn } from '../helpers/utils';

export default function DataTable({
    fetched,
    data,
    columns,
    onEdit,
    onDelete,
    onView,
}) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filtersState, setFiltersState] = useState({
        status: 'all',
    });
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Filter data based on search term and status
    const filteredData = data.filter((item) => {
        const matchesSearch = Object.values(item).some((value) =>
            String(value).toLowerCase().includes(searchTerm.toLowerCase())
        );

        // Go through each filter
        const matchesFilters = Object.entries(filtersState).every(([key, val]) => {
            if (val === "all") return true;
            if (key === "status") {
                return item.status === val;
            }

            // Example for Category (adjust key to match your data)
            if (key === "Category") {
                return item.category_name === val;
            }
            if (key === "Type") {
                return item.type === val;
            }

            return true; // fallback
        });

        return matchesSearch && matchesFilters;
    });

    // Pagination
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

    // Helper function to change page and scroll up
    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);

        // Smoothly scroll to the top of the window
        window.scrollTo(0, 0);
    };

    const formatValue = (value, key) => {
        if (key === 'price' || key === 'product_price' && typeof value === 'number') {
            return `$${value.toFixed(2)}`;
        }
        if (key === 'status') {
            const statusColors = {
                active: 'bg-green-100 text-green-800',
                inactive: 'bg-red-100 text-red-800',
                draft: 'bg-yellow-100 text-yellow-800',
                published: 'bg-green-100 text-green-800',
                archived: 'bg-gray-100 text-gray-800',
            };
            return (
                <Badge className={cn('capitalize', statusColors[value] || 'bg-gray-100 text-gray-800')}>
                    {value}
                </Badge>
            );
        }
        if (key === 'createdAt' || key === 'date_updated') {
            return new Date(value).toLocaleDateString();
        }
        return value;
    };

    const filters = useMemo(() => {
        if (!data) return [];

        if (fetched === "products") {
            const categorySet = new Set();
            data.forEach(item => {
                if (item.category_name) categorySet.add(item.category_name);
            });

            return [
                {
                    label: "Category",
                    values: Array.from(categorySet),
                },
            ];
        }

        if (fetched === "locations") {
            const typeSet = new Set();
            data.forEach(item => {
                if (item.type) typeSet.add(item.type);
            });

            return [
                {
                    label: "Type",
                    values: Array.from(typeSet),
                },
            ];
        }

        return [];
    }, [fetched, data]);


    return (
        <div className="space-y-6 mb-[4.5rem]">
            {/* Toolbar */}
            <div id="toolbar" className="flex flex-col gap-2 bg-gray-50 p-4 rounded-lg">

                {/* Top Row: Search Bar & Desktop Results Count */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="relative w-full sm:max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 w-full bg-white"
                        />
                    </div>

                    {/* Hidden on mobile, shows on the right on desktop */}
                    <div className="hidden sm:block text-sm text-gray-500 shrink-0">
                        Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredData.length)} of{' '}
                        {filteredData.length} results
                    </div>
                </div>

                {/* Bottom Row: Filters */}
                <div className="flex flex-wrap items-center gap-2">
                    <Select
                        value={filtersState['status']}
                        onValueChange={(val) =>
                            setFiltersState(prev => ({ ...prev, 'status': val }))
                        }
                    >
                        {/* Note: Changed fixed w-36 to w-full sm:w-40 so it adapts to mobile */}
                        <SelectTrigger className="w-full sm:w-40 bg-white select-none">
                            <div className="flex items-center">
                                <Filter className="h-4 w-4 mr-2 text-gray-500" />
                                <SelectValue placeholder="Status" />
                            </div>
                        </SelectTrigger>
                        <SelectContent className="bg-white select-none cursor-pointer">
                            <SelectItem className="cursor-pointer data-[highlighted]:bg-gray-100 data-[highlighted]:text-black data-[state=checked]:font-semibold" value="all">All Status</SelectItem>
                            <SelectItem className="cursor-pointer data-[highlighted]:bg-gray-100 data-[highlighted]:text-black data-[state=checked]:font-semibold" value="active">Active</SelectItem>
                            <SelectItem className="cursor-pointer data-[highlighted]:bg-gray-100 data-[highlighted]:text-black data-[state=checked]:font-semibold" value="inactive">Inactive</SelectItem>
                            <SelectItem className="cursor-pointer data-[highlighted]:bg-gray-100 data-[highlighted]:text-black data-[state=checked]:font-semibold" value="draft">Draft</SelectItem>
                            <SelectItem className="cursor-pointer data-[highlighted]:bg-gray-100 data-[highlighted]:text-black data-[state=checked]:font-semibold" value="published">Published</SelectItem>
                            <SelectItem className="cursor-pointer data-[highlighted]:bg-gray-100 data-[highlighted]:text-black data-[state=checked]:font-semibold" value="archived">Archived</SelectItem>
                        </SelectContent>
                    </Select>

                    {filters.map(filter => (
                        <Select
                            key={filter.label}
                            value={filtersState[filter.label]}
                            onValueChange={(val) =>
                                setFiltersState(prev => ({ ...prev, [filter.label]: val }))
                            }
                        >
                            {/* Note: Changed fixed w-[200px] to w-full sm:w-48 */}
                            <SelectTrigger className="w-full sm:w-48 bg-white select-none">
                                <SelectValue placeholder={`Select ${filter.label}`} />
                            </SelectTrigger>
                            <SelectContent className="bg-white select-none cursor-pointer">
                                <SelectItem
                                    className="cursor-pointer data-[highlighted]:bg-gray-100 data-[highlighted]:text-black data-[state=checked]:font-semibold"
                                    value="all">All {filter.label}
                                </SelectItem>
                                {filter.values.map(value => (
                                    <SelectItem
                                        className="cursor-pointer data-[highlighted]:bg-gray-100 data-[highlighted]:text-black data-[state=checked]:font-semibold"
                                        key={value}
                                        value={value}> {value}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    ))}
                </div>

                {/* Mobile-only Results Count (Sits neatly at the bottom) */}
                <div className="text-sm text-gray-500 sm:hidden text-center">
                    Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredData.length)} of{' '}
                    {filteredData.length} results
                </div>
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block bg-white rounded-lg border border-gray-200 overflow-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            {columns.map((column) => (
                                <th
                                    key={String(column.key)}
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    {column.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {paginatedData.map((item, index) => (
                            <tr
                                key={item._id}
                                className={cn(
                                    'hover:bg-gray-50 transition-colors',
                                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                                )}
                            >
                                {columns.map((column) => (
                                    <td key={String(column.key)} className="px-6 py-4 whitespace-nowrap">
                                        {column.key === 'actions' ? (
                                            <div className="flex items-center space-x-2">
                                                {onView && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => onView(item)}
                                                        className="h-8 w-8 p-0 text-gray-500 hover:text-blue-600"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                )}
                                                {onEdit && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => onEdit(item._id)}
                                                        className="h-8 w-8 p-0 text-gray-500 hover:text-green-600"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                )}
                                                {onDelete && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => onDelete(item)}
                                                        className="h-8 w-8 p-0 text-gray-500 hover:text-red-600"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="text-sm text-gray-900">
                                                {formatValue(item[column.key], String(column.key))}
                                            </div>
                                        )}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
                {paginatedData.map((item) => {
                    // 1. Identify the key pieces of data to establish hierarchy
                    const titleColumn = columns[0]; // Assume first column is the main identifier
                    const statusColumn = columns.find(c => c.key === 'status');
                    const otherColumns = columns.filter(c =>
                        c.key !== 'actions' &&
                        c.key !== titleColumn.key &&
                        c.key !== 'status'
                    );

                    return (
                        <div key={item._id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden transition-all hover:shadow-md">

                            {/* Card Header: Emphasizes the main identifier and status */}
                            <div className="p-4 border-b border-gray-100 flex justify-between items-start gap-4 bg-gray-50/50">
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-base font-bold text-gray-900 truncate">
                                        {formatValue(item[titleColumn.key], String(titleColumn.key))}
                                    </h3>
                                    <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider">
                                        {titleColumn.label}
                                    </p>
                                </div>
                                {statusColumn && (
                                    <div className="shrink-0 mt-0.5">
                                        {formatValue(item[statusColumn.key], 'status')}
                                    </div>
                                )}
                            </div>

                            {/* Card Body: Compact 2-column grid for the rest of the data */}
                            <div className="p-4">
                                <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                                    {otherColumns.map((column) => (
                                        <div key={String(column.key)} className={`flex flex-col ${column.key === "product_name" || column.key === "address" && 'col-span-2'}`}>
                                            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                                                {column.label}
                                            </span>
                                            <span className="text-sm text-gray-800 font-medium truncate">
                                                {formatValue(item[column.key], String(column.key))}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Card Footer: Distinct action zone with tinted ghost buttons */}
                            {(onView || onEdit || onDelete) && (
                                <div className="px-3 py-2 bg-gray-50/50 border-t border-gray-100 flex flex-wrap justify-end gap-1">
                                    {onView && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => onView(item)}
                                            className="h-9 text-blue-600 hover:text-blue-700 hover:bg-blue-50/50"
                                        >
                                            <Eye className="h-4 w-4 mr-2" />
                                            View
                                        </Button>
                                    )}
                                    {onEdit && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => onEdit(item._id)}
                                            className="h-9 text-green-600 hover:text-green-700 hover:bg-green-50/50"
                                        >
                                            <Edit className="h-4 w-4 mr-2" />
                                            Edit
                                        </Button>
                                    )}
                                    {onDelete && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => onDelete(item)}
                                            className="h-9 text-red-600 hover:text-red-700 hover:bg-red-50/50"
                                        >
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Delete
                                        </Button>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between bg-white px-4 py-3 border border-gray-200 rounded-lg">
                    <div className="flex-1 flex justify-between sm:hidden">
                        <Button
                            variant="outline"
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                        >
                            Next
                        </Button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-gray-700">
                                Page <span className="font-medium">{currentPage}</span> of{' '}
                                <span className="font-medium">{totalPages}</span>
                            </p>
                        </div>
                        <div>
                            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                    disabled={currentPage === 1}
                                    className="rounded-r-none"
                                >
                                    Previous
                                </Button>
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    let pageNum = i + 1;
                                    if (totalPages > 5) {
                                        if (currentPage <= 3) {
                                            pageNum = i + 1;
                                        } else if (currentPage >= totalPages - 2) {
                                            pageNum = totalPages - 4 + i;
                                        } else {
                                            pageNum = currentPage - 2 + i;
                                        }
                                    }
                                    return (
                                        <Button
                                            key={pageNum}
                                            variant={currentPage === pageNum ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => setCurrentPage(pageNum)}
                                            className="rounded-none"
                                        >
                                            {pageNum}
                                        </Button>
                                    );
                                })}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                                    disabled={currentPage === totalPages}
                                    className="rounded-l-none"
                                >
                                    Next
                                </Button>
                            </nav>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

DataTable.displayName = "Data Table"
DataTable.propTypes = {
    fetched: PropTypes.string.isRequired,
    data: PropTypes.array.isRequired,
    columns: PropTypes.array.isRequired,
    onEdit: PropTypes.func,
    onDelete: PropTypes.func,
    onView: PropTypes.func,
}
