import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Download, Upload, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api-client';
import { BackupData } from '@shared/types';
export function BackupRestoreCard() {
  const [isExporting, setIsExporting] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);
  const [backupFile, setBackupFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleExport = async () => {
    setIsExporting(true);
    try {
      const data = await api<BackupData>('/api/backup');
      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
      const link = document.createElement('a');
      link.href = jsonString;
      link.download = `waterx-backup-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      toast.success('Backup exported successfully!');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to export backup.';
      toast.error(errorMessage);
    } finally {
      setIsExporting(false);
    }
  };
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setBackupFile(file);
    }
  };
  const handleRestoreClick = () => {
    if (backupFile) {
      setShowRestoreConfirm(true);
    } else {
      toast.warning('Please select a backup file to restore.');
    }
  };
  const confirmRestore = async () => {
    if (!backupFile) return;
    setIsRestoring(true);
    setShowRestoreConfirm(false);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const content = e.target?.result;
          if (typeof content !== 'string') throw new Error('Invalid file content');
          const backupData = JSON.parse(content);
          // Basic validation
          if (!backupData.customers || !backupData.products || !backupData.orders) {
            throw new Error('Invalid backup file format.');
          }
          await api('/api/restore', {
            method: 'POST',
            body: JSON.stringify(backupData),
          });
          toast.success('System restored successfully! The page will now reload.');
          setTimeout(() => window.location.reload(), 2000);
        } catch (parseError) {
          const errorMessage = parseError instanceof Error ? parseError.message : 'Failed to parse backup file.';
          toast.error(errorMessage);
          setIsRestoring(false);
        }
      };
      reader.onerror = () => {
        toast.error('Failed to read the backup file.');
        setIsRestoring(false);
      };
      reader.readAsText(backupFile);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred during restore.';
      toast.error(errorMessage);
      setIsRestoring(false);
    }
  };
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Backup & Restore</CardTitle>
          <CardDescription>Export all your application data or restore it from a backup file.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-medium mb-2">Export Data</h3>
            <p className="text-sm text-muted-foreground mb-4">Download a JSON file containing all customers, products, orders, transactions, and employees (excluding the admin account).</p>
            <Button onClick={handleExport} disabled={isExporting}>
              <Download className="mr-2 h-4 w-4" />
              {isExporting ? 'Exporting...' : 'Export Backup'}
            </Button>
          </div>
          <div className="border-t pt-6">
            <h3 className="font-medium mb-2">Restore Data</h3>
            <p className="text-sm text-muted-foreground mb-4">Upload a backup file to restore the application state. <span className="font-semibold text-destructive">Warning: This will overwrite all existing data.</span></p>
            <div className="flex items-center gap-4">
              <Label htmlFor="backup-file" className="sr-only">Choose file</Label>
              <Input id="backup-file" type="file" accept=".json" onChange={handleFileChange} ref={fileInputRef} className="max-w-xs" />
              <Button onClick={handleRestoreClick} disabled={isRestoring || !backupFile} variant="destructive">
                <Upload className="mr-2 h-4 w-4" />
                {isRestoring ? 'Restoring...' : 'Restore from File'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      <AlertDialog open={showRestoreConfirm} onOpenChange={setShowRestoreConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-destructive" />
              Are you absolutely sure?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action is irreversible. It will permanently delete all current data (except your admin account) and replace it with the data from the backup file: <span className="font-semibold">{backupFile?.name}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRestore} className="bg-destructive hover:bg-destructive/90">
              Yes, restore data
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}