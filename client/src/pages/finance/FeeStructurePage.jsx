import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Wallet, Plus, Edit, Trash2, BookOpen, GraduationCap, Building2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
const FeeStructurePage = () => {
  const feeStructures = [
  { id: 1, program: "Computer Science", level: "Undergraduate", year: 1, tuition: 120000, library: 5000, exam: 8000, activity: 3000, total: 136000, status: "active" },
  { id: 2, program: "Computer Science", level: "Undergraduate", year: 2, tuition: 125000, library: 5000, exam: 8000, activity: 3000, total: 141000, status: "active" },
  { id: 3, program: "Engineering", level: "Undergraduate", year: 1, tuition: 150000, library: 6000, exam: 10000, activity: 4000, total: 170000, status: "active" },
  { id: 4, program: "Business Admin", level: "Undergraduate", year: 1, tuition: 100000, library: 4000, exam: 7000, activity: 3000, total: 114000, status: "active" },
  { id: 5, program: "MBA", level: "Postgraduate", year: 1, tuition: 250000, library: 8000, exam: 15000, activity: 5000, total: 278000, status: "active" },
  { id: 6, program: "MSc Computer Science", level: "Postgraduate", year: 1, tuition: 200000, library: 7000, exam: 12000, activity: 4000, total: 223000, status: "draft" }];
  const stats = [
  { title: "Active Fee Structures", value: "24", icon: Wallet, color: "text-green-600" },
  { title: "Programs Covered", value: "12", icon: BookOpen, color: "text-blue-600" },
  { title: "Avg. Annual Fee", value: "KES 165K", icon: GraduationCap, color: "text-purple-600" },
  { title: "Campuses", value: "3", icon: Building2, color: "text-orange-600" }];
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Fee Structure</h1>
          <p className="text-muted-foreground">Manage program fee structures and charges</p>
        </div>
        <Button onClick={() => toast({ title: "Create Fee Structure", description: "Opening fee structure form..." })}>
          <Plus className="w-4 h-4 mr-2" />
          Add Fee Structure
        </Button>
      </div>
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat) =>
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
      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <Input placeholder="Search by program name..." />
            </div>
            <Select>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="undergraduate">Undergraduate</SelectItem>
                <SelectItem value="postgraduate">Postgraduate</SelectItem>
                <SelectItem value="diploma">Diploma</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      {/* Fee Structure Table */}
      <Card>
        <CardHeader>
          <CardTitle>Fee Structures</CardTitle>
          <CardDescription>All program fee structures for the current academic year</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Program</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Year</TableHead>
                <TableHead className="text-right">Tuition</TableHead>
                <TableHead className="text-right">Library</TableHead>
                <TableHead className="text-right">Exam</TableHead>
                <TableHead className="text-right">Activity</TableHead>
                <TableHead className="text-right">Total (KES)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {feeStructures.map((fee) =>
              <TableRow key={fee.id}>
                  <TableCell className="font-medium">{fee.program}</TableCell>
                  <TableCell>{fee.level}</TableCell>
                  <TableCell>Year {fee.year}</TableCell>
                  <TableCell className="text-right">{fee.tuition.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{fee.library.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{fee.exam.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{fee.activity.toLocaleString()}</TableCell>
                  <TableCell className="text-right font-bold">{fee.total.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant={fee.status === "active" ? "default" : "secondary"}>
                      {fee.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => toast({ title: "Edit Fee Structure", description: `Editing ${fee.program} Year ${fee.year}...` })}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => toast({ title: "Delete", description: "Are you sure you want to delete this fee structure?" })}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>);
};
export default FeeStructurePage;