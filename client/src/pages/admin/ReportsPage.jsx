import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Download,
  FileText,
  Users,
  GraduationCap,
  Wallet,
  TrendingUp,
  Building2,
  Clock,
  PieChart,
  Loader2 } from
'lucide-react';
import { exportToCSV, exportToPDF } from '@/lib/export-utils';
import { getReportData, getReportOverview } from '@/services/adminUtilityService';

const iconMap = {
  GraduationCap,
  Wallet,
  Users,
  Building2,
};

export default function ReportsPage() {
  const [summary, setSummary] = useState({ availableReports: 0, downloadsThisMonth: 0, scheduledReports: 0, generatedToday: 0 });
  const [reportCategories, setReportCategories] = useState([]);
  const [recentReports, setRecentReports] = useState([]);
  const [generatingReport, setGeneratingReport] = useState(null);

  useEffect(() => {
    const loadReports = async () => {
      try {
        const data = await getReportOverview();
        setSummary(data.summary || {});
        setReportCategories(data.reportCategories || []);
        setRecentReports(data.recentReports || []);
      } catch (error) {
        toast.error('Load Failed', { description: error?.response?.data?.message || 'Failed to load report center.' });
      }
    };

    loadReports();
  }, []);

  const decoratedCategories = useMemo(() => reportCategories.map((category) => ({
    ...category,
    icon: iconMap[category.icon] || FileText
  })), [reportCategories]);

  const handleGenerateReport = async (reportKey, reportName, format = 'csv') => {
    setGeneratingReport(reportKey);
    try {
      const response = await getReportData(reportKey);
      const { data, columns } = response.report;
      const filename = reportKey;
      if (format === 'pdf') {
        exportToPDF({ data, columns, filename, title: reportName });
      } else {
        exportToCSV({ data, columns, filename });
      }
      const refreshed = await getReportOverview();
      setSummary(refreshed.summary || {});
      setRecentReports(refreshed.recentReports || []);
    } catch (error) {
      toast.error('Generation Failed', { description: error?.response?.data?.message || 'Failed to generate report.' });
    } finally {
      setGeneratingReport(null);
    }
  };
  const handleDownload = (report) => {
    handleGenerateReport(report.key, report.type, 'csv');
  };
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">Generate and download system reports</p>
        </div>
        <Button size="sm" onClick={() => handleGenerateReport('department-summary', 'Department Summary', 'csv')}>
          <PieChart className="h-4 w-4 mr-2" />
          Quick Summary
        </Button>
      </div>
      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{summary.availableReports || 0}</p>
                <p className="text-xs text-muted-foreground">Available Reports</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Download className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{summary.downloadsThisMonth || 0}</p>
                <p className="text-xs text-muted-foreground">Downloads This Month</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{summary.scheduledReports || 0}</p>
                <p className="text-xs text-muted-foreground">Scheduled Reports</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{summary.generatedToday || 0}</p>
                <p className="text-xs text-muted-foreground">Generated Today</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Recent Reports */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">Recent Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentReports.length ? recentReports.map((report, idx) =>
            <div key={idx} className="flex items-center justify-between py-2 border-b last:border-0">
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{report.name}</p>
                    <p className="text-xs text-muted-foreground">Generated {report.generated} by {report.by}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary">{report.size}</Badge>
                  <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDownload(report)}
                  disabled={generatingReport === report.key}>
                    {generatingReport === report.type ?
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" /> :
                  <Download className="h-3 w-3 mr-1" />
                  }
                    Download
                  </Button>
                </div>
              </div>
            ) :
            <div className="py-8 text-sm text-muted-foreground">No generated reports yet. Exporting a report will create the first audit entry here.</div>
            }
          </div>
        </CardContent>
      </Card>
      {/* Report Categories */}
      <div className="grid gap-6 md:grid-cols-2">
        {decoratedCategories.map((category) =>
        <Card key={category.title}>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${category.bgColor}`}>
                  <category.icon className={`h-5 w-5 ${category.color}`} />
                </div>
                <CardTitle className="text-base">{category.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {category.reports.map((report, idx) =>
              <div key={idx} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div>
                      <p className="text-sm font-medium">{report.name}</p>
                      <p className="text-xs text-muted-foreground">{report.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">{report.format}</Badge>
                      {report.format.includes('Excel') &&
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleGenerateReport(report.key, report.name, 'csv')}
                    disabled={generatingReport === report.key}
                    title="Download CSV">
                          {generatingReport === report.key ?
                    <Loader2 className="h-3 w-3 animate-spin" /> :
                    <Download className="h-3 w-3" />
                    }
                        </Button>
                  }
                      {report.format.includes('PDF') &&
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleGenerateReport(report.key, report.name, 'pdf')}
                    disabled={generatingReport === report.key}
                    title="Download PDF">
                          {generatingReport === report.key ?
                    <Loader2 className="h-3 w-3 animate-spin" /> :
                    <FileText className="h-3 w-3" />
                    }
                        </Button>
                  }
                    </div>
                  </div>
              )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>);
}
