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
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-gray-50 p-4 rounded-lg">
        <div className="flex flex-1 gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select 
            value={filtersState['status']} 
            onValueChange={(val) => 
                setFiltersState(prev => ({ ...prev, 'status': val}))
            }
          >
            <SelectTrigger className="w-36 select-none desktop">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Status" />
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
                setFiltersState(prev => ({ ...prev, [filter.label]: val}))
            }
          >
            <SelectTrigger className="w-[200px] select-none desktop">
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
        <div className="text-sm text-gray-500">
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
        {paginatedData.map((item) => (
          <div key={item._id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="space-y-3">
              {columns
                .filter((col) => col.key !== 'actions')
                .map((column) => (
                  <div key={String(column.key)} className="flex justify-between items-start">
                    <span className="text-sm font-medium text-gray-500 capitalize">
                      {column.label}:
                    </span>
                    <span className="text-sm text-gray-900 text-right">
                      {formatValue(item[column.key], String(column.key))}
                    </span>
                  </div>
                ))}
              <div className="flex justify-end space-x-2 pt-3 border-t border-gray-100">
                {onView && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onView(item)}
                    className="h-8"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    View
                  </Button>
                )}
                {onEdit && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(item._id)}
                    className="h-8"
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete(item)}
                    className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Delete
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
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
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
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
