import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ClipboardList, Search, Download, FileText, CheckCircle, Clock, Printer, Eye, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { exportToCSV } from "@/lib/export-utils";
import { printTranscript } from "@/lib/print-utils";
import {
  getTranscriptPreview,
  getTranscriptRequests,
  updateTranscriptStatus } from
'@/services/registratorOperationsService';

const transcriptColumns = [
{ key: "student", label: "Student Name" },
{ key: "regNo", label: "Reg Number" },
{ key: "program", label: "Program" },
{ key: "type", label: "Type" },
{ key: "copies", label: "Copies" },
{ key: "fee", label: "Fee (KES)" },
{ key: "requestDate", label: "Request Date" },
{ key: "status", label: "Status" }];

const TranscriptsPage = () => {
  const [transcriptRequests, setTranscriptRequests] = useState([]);
  const [stats, setStats] = useState(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [type, setType] = useState("all");
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [actionLoading, setActionLoading] = useState("");

  const loadTranscriptRequests = async () => {
    try {
      setLoading(true);
      const response = await getTranscriptRequests({
        search,
        status,
        type
      });
      setTranscriptRequests(response.transcriptRequests || []);
      setStats(response.stats || null);
    } catch (error) {
      toast.error("Load Failed", {
        description: error?.response?.data?.message || "Failed to load transcript requests."
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTranscriptRequests();
  }, [search, status, type]);

  const statCards = useMemo(() => ([
  { title: "Total Requests", value: stats?.total ?? 0, icon: FileText, color: "text-blue-600" },
  { title: "Processing", value: stats?.processing ?? 0, icon: Clock, color: "text-yellow-600" },
  { title: "Ready for Collection", value: stats?.ready ?? 0, icon: CheckCircle, color: "text-green-600" },
  { title: "Collected", value: stats?.collected ?? 0, icon: ClipboardList, color: "text-purple-600" }]), [stats]);

  const getStatusBadge = (requestStatus) => {
    switch (requestStatus) {
      case "ready":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Ready</Badge>;
      case "processing":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Processing</Badge>;
      case "pending":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Pending</Badge>;
      case "collected":
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Collected</Badge>;
      default:
        return <Badge variant="secondary">{requestStatus}</Badge>;
    }
  };

  const handlePreview = async (request) => {
    try {
      setActionLoading(`${request.id}-preview`);
      const transcriptData = await getTranscriptPreview(request.id);
      printTranscript(transcriptData);
    } catch (error) {
      toast.error('Preview Failed', {
        description: error?.response?.data?.message || 'Failed to generate transcript preview.'
      });
    } finally {
      setActionLoading('');
    }
  };

  const handleStatusUpdate = async (request, nextStatus) => {
    try {
      setActionLoading(`${request.id}-${nextStatus}`);
      const response = await updateTranscriptStatus(request.id, nextStatus);
      toast.success('Transcript Updated', {
        description: response?.message || `Transcript request updated to ${nextStatus}.`
      });
      await loadTranscriptRequests();
    } catch (error) {
      toast.error('Update Failed', {
        description: error?.response?.data?.message || 'Failed to update transcript request.'
      });
    } finally {
      setActionLoading('');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Transcripts</h1>
          <p className="text-muted-foreground">Manage transcript requests and generation</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            disabled={isExporting}
            onClick={() => {
              setIsExporting(true);
              exportToCSV({ data: transcriptRequests, filename: 'transcripts', columns: transcriptColumns });
              setIsExporting(false);
            }}>
            {isExporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
            Export CSV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {statCards.map((stat) =>
        <Card key={stat.title}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by student name or reg no..." className="pl-10" />
              </div>
            </div>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="ready">Ready</SelectItem>
                <SelectItem value="collected">Collected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="official">Official</SelectItem>
                <SelectItem value="unofficial">Unofficial</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Transcript Requests</CardTitle>
          <CardDescription>All transcript requests and their status</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ?
          <div className="py-10 text-sm text-muted-foreground">Loading transcript requests...</div> :
          <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Reg No</TableHead>
                  <TableHead>Program</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Copies</TableHead>
                  <TableHead>Fee (KES)</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transcriptRequests.map((request) =>
                <TableRow key={request.id}>
                    <TableCell className="font-medium">{request.student}</TableCell>
                    <TableCell>{request.regNo}</TableCell>
                    <TableCell>{request.program}</TableCell>
                    <TableCell>
                      <Badge variant={request.type === "Official" ? "default" : "secondary"}>
                        {request.type}
                      </Badge>
                    </TableCell>
                    <TableCell>{request.copies}</TableCell>
                    <TableCell>{request.fee > 0 ? request.fee : "Free"}</TableCell>
                    <TableCell>{request.requestDate}</TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => handlePreview(request)} title="Preview Transcript">
                          {actionLoading === `${request.id}-preview` ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handlePreview(request)} title="Print Transcript">
                          <Printer className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handlePreview(request)} title="Download Transcript">
                          <Download className="w-4 h-4" />
                        </Button>
                        {request.status !== "ready" && request.status !== "collected" &&
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleStatusUpdate(request, "Ready for Collection")}
                          disabled={actionLoading === `${request.id}-Ready for Collection`}>
                            Mark Ready
                          </Button>
                        }
                        {request.status === "ready" &&
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleStatusUpdate(request, "Collected")}
                          disabled={actionLoading === `${request.id}-Collected`}>
                            Collect
                          </Button>
                        }
                      </div>
                    </TableCell>
                  </TableRow>
                )}
                {!transcriptRequests.length &&
                <TableRow>
                    <TableCell colSpan={9} className="text-center text-sm text-muted-foreground py-8">
                      No transcript requests found for the selected filters.
                    </TableCell>
                  </TableRow>
                }
              </TableBody>
            </Table>
          }
        </CardContent>
      </Card>
    </div>);
};

export default TranscriptsPage;
