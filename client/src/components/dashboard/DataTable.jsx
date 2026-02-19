import { useState, useCallback } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from
  '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, ChevronLeft, ChevronRight, Download, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
export function DataTable({
  columns,
  data,
  pageSize = 10,
  searchable = true,
  searchPlaceholder = 'Search...',
  onRowClick,
  exportable = false,
  exportFilename = 'export',
  onExport
}) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc');
  const [isExporting, setIsExporting] = useState(false);
  // Filter data
  const filteredData = data.filter((row) =>
    Object.values(row).some((value) =>
      String(value).toLowerCase().includes(search.toLowerCase())
    )
  );
  // Sort data
  const sortedData = sortKey ?
    [...filteredData].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      const modifier = sortDir === 'asc' ? 1 : -1;
      return aVal > bVal ? modifier : -modifier;
    }) :
    filteredData;
  // Paginate
  const totalPages = Math.ceil(sortedData.length / pageSize);
  const paginatedData = sortedData.slice((page - 1) * pageSize, page * pageSize);
  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };
  const getValue = (row, key) => {
    const keys = key.split('.');
    let value = row;
    for (const k of keys) {
      value = value?.[k];
    }
    return value;
  };
  const handleExport = useCallback(async () => {
    setIsExporting(true);
    try {
      // If custom export handler provided, use it
      if (onExport) {
        await onExport(sortedData);
        toast.success('Export', { description: 'Data exported successfully' });
        return;
      }
      // Default CSV export
      const exportColumns = columns.filter((col) => col.key !== 'actions');
      const headers = exportColumns.map((col) => col.label).join(',');
      const rows = sortedData.map((row) =>
        exportColumns.map((col) => {
          const value = getValue(row, String(col.key));
          // Escape quotes and wrap in quotes if contains comma
          const stringValue = String(value ?? '');
          if (stringValue.includes(',') || stringValue.includes('"')) {
            return `"${stringValue.replace(/"/g, '""')}"`;
          }
          return stringValue;
        }).join(',')
      ).join('\n');
      const csv = `${headers}\n${rows}`;
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${exportFilename}-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      URL.revokeObjectURL(link.href);
      toast.success('Export', { description: `Exported ${sortedData.length} records to CSV` });
    } catch (error) {
      toast.error('Export Failed', { description: 'Failed to export data' });
    } finally {
      setIsExporting(false);
    }
  }, [columns, sortedData, exportFilename, onExport]);
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {searchable &&
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-9" />
          </div>
        }
        {exportable &&
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={isExporting || sortedData.length === 0}
            className="w-full sm:w-auto">
            {isExporting ?
              <Loader2 className="h-4 w-4 mr-2 animate-spin" /> :
              <Download className="h-4 w-4 mr-2" />
            }
            {isExporting ? 'Exporting...' : 'Export'}
          </Button>
        }
      </div>
      <div className="rounded-lg border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              {columns.map((col) =>
                <TableHead
                  key={String(col.key)}
                  className={cn(
                    'font-semibold',
                    col.sortable && 'cursor-pointer hover:text-foreground'
                  )}
                  onClick={() => col.sortable && handleSort(String(col.key))}>
                  {col.label}
                  {sortKey === col.key &&
                    <span className="ml-1">{sortDir === 'asc' ? '↑' : '↓'}</span>
                  }
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length === 0 ?
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-8 text-muted-foreground">
                  No data found
                </TableCell>
              </TableRow> :
              paginatedData.map((row, idx) =>
                <TableRow
                  key={idx}
                  className={cn(onRowClick && 'cursor-pointer hover:bg-muted/50')}
                  onClick={() => onRowClick?.(row)}>
                  {columns.map((col) =>
                    <TableCell key={String(col.key)}>
                      {col.render ?
                        col.render(getValue(row, String(col.key)), row) :
                        getValue(row, String(col.key))}
                    </TableCell>
                  )}
                </TableRow>
              )
            }
          </TableBody>
        </Table>
      </div>
      {totalPages > 1 &&
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
            Showing {(page - 1) * pageSize + 1} to{' '}
            {Math.min(page * pageSize, sortedData.length)} of {sortedData.length} entries
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-xs sm:text-sm min-w-[80px] text-center">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      }
    </div>);
}
export function StatusBadge({ status }) {
  const variants = {
    active: 'default',
    pending: 'secondary',
    inactive: 'outline',
    blocked: 'destructive',
    paid: 'default',
    partial: 'secondary',
    overdue: 'destructive'
  };
  return (
    <Badge variant={variants[status.toLowerCase()] || 'secondary'}>
      {status}
    </Badge>);
}