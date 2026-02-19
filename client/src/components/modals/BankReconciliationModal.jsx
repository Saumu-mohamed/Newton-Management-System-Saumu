import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Upload,
    CheckCircle,
    AlertTriangle,
    XCircle,
    FileText,
    Search,
    RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

export function BankReconciliationModal({ open, onOpenChange }) {
    const [step, setStep] = useState(1);
    const [isUploading, setIsUploading] = useState(false);

    const handleUpload = () => {
        setIsUploading(true);
        setTimeout(() => {
            setIsUploading(false);
            setStep(2);
            toast.success('File Uploaded', { description: 'Bank statement processed successfully.' });
        }, 2000);
    };

    const handleReconcile = () => {
        toast.success('Reconciliation Complete', { description: '45 transactions matched automatically.' });
        onOpenChange(false);
        setStep(1);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Bank Reconciliation</DialogTitle>
                    <DialogDescription>
                        Match bank statements with system transactions to ensure financial accuracy.
                    </DialogDescription>
                </DialogHeader>

                {step === 1 ? (
                    <div className="space-y-6 py-4">
                        <div className="grid w-full items-center gap-1.5">
                            <Label htmlFor="bank">Select Bank Account</Label>
                            <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                                <option>Equity Bank - Corporate (***4567)</option>
                                <option>KCB - Operational (***8901)</option>
                                <option>Standard Chartered - Fee Collection (***2345)</option>
                            </select>
                        </div>

                        <div
                            className="border-2 border-dashed rounded-lg p-10 flex flex-col items-center justify-center gap-4 bg-muted/50 hover:bg-muted/80 transition-colors cursor-pointer"
                            onClick={() => document.getElementById('file-upload').click()}
                        >
                            <Input id="file-upload" type="file" className="hidden" onChange={handleUpload} />
                            <div className="p-3 rounded-full bg-primary/10">
                                <Upload className="h-6 w-6 text-primary" />
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-medium">Click to upload or drag and drop</p>
                                <p className="text-xs text-muted-foreground">CSV or Excel files (Max 5MB)</p>
                            </div>
                        </div>

                        {isUploading && (
                            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                                <RefreshCw className="h-4 w-4 animate-spin" />
                                Processing statement...
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-6 py-4">
                        <div className="grid grid-cols-3 gap-4">
                            <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-center">
                                <p className="text-2xl font-bold text-green-600">45</p>
                                <p className="text-[10px] uppercase tracking-wider font-semibold text-green-600">Matched</p>
                            </div>
                            <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-center">
                                <p className="text-2xl font-bold text-yellow-600">8</p>
                                <p className="text-[10px] uppercase tracking-wider font-semibold text-yellow-600">Partial</p>
                            </div>
                            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-center">
                                <p className="text-2xl font-bold text-destructive">12</p>
                                <p className="text-[10px] uppercase tracking-wider font-semibold text-destructive">Unmatched</p>
                            </div>
                        </div>

                        <ScrollArea className="h-[200px] w-full rounded-md border p-4">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between text-sm py-2 border-b">
                                    <div className="flex items-center gap-3">
                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                        <div>
                                            <p className="font-medium">MPE123456 - John Doe</p>
                                            <p className="text-xs text-muted-foreground">KES 45,000 • Jan 15</p>
                                        </div>
                                    </div>
                                    <Badge variant="outline">Exact Match</Badge>
                                </div>
                                <div className="flex items-center justify-between text-sm py-2 border-b">
                                    <div className="flex items-center gap-3">
                                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                                        <div>
                                            <p className="font-medium">BNK789012 - Jane Smith</p>
                                            <p className="text-xs text-muted-foreground">KES 35,000 • Jan 14</p>
                                        </div>
                                    </div>
                                    <Badge variant="outline" className="text-yellow-600 border-yellow-200">Date Mismatch</Badge>
                                </div>
                                <div className="flex items-center justify-between text-sm py-2 border-b">
                                    <div className="flex items-center gap-3">
                                        <XCircle className="h-4 w-4 text-destructive" />
                                        <div>
                                            <p className="font-medium">CRD901234 - Unknown</p>
                                            <p className="text-xs text-muted-foreground">KES 12,500 • Jan 13</p>
                                        </div>
                                    </div>
                                    <Badge variant="destructive">No Match</Badge>
                                </div>
                            </div>
                        </ScrollArea>
                    </div>
                )}

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    {step === 2 && (
                        <Button onClick={handleReconcile}>
                            Complete Reconciliation
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
