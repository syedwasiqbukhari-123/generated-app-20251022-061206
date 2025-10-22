import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import Papa from 'papaparse';
interface ExportButtonProps<T> {
  data: T[];
  filename: string;
  className?: string;
}
export function ExportButton<T extends object>({ data, filename, className }: ExportButtonProps<T>) {
  const handleExport = () => {
    if (data.length === 0) {
      return;
    }
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  return (
    <Button variant="outline" size="sm" onClick={handleExport} disabled={data.length === 0} className={className}>
      <Download className="mr-2 h-4 w-4" />
      Export CSV
    </Button>
  );
}