import { useEffect, useState } from 'react';
import { DataTable } from '@/components/dashboard/DataTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import {
  Building2,
  MapPin,
  Users,
  GraduationCap,
  Phone,
  Mail,
  Eye,
  Edit,
  Trash2,
  Plus } from
'lucide-react';
import {
  ViewCampusModal,
  EditCampusModal,
  AddCampusModal,
  ConfirmModal } from
'@/components/modals';
import {
  createCampusRecord,
  deleteCampusRecord,
  getCampuses,
  updateCampusRecord } from
'@/services/adminUtilityService';

export default function CampusesPage() {
  const [campuses, setCampuses] = useState([]);
  const [stats, setStats] = useState({ totalCampuses: 0, totalStudents: 0, totalStaff: 0, countiesCovered: 0 });
  const [loading, setLoading] = useState(true);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedCampus, setSelectedCampus] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);

  const loadCampuses = async () => {
    try {
      setLoading(true);
      const data = await getCampuses();
      setCampuses(data.campuses || []);
      setStats(data.stats || { totalCampuses: 0, totalStudents: 0, totalStaff: 0, countiesCovered: 0 });
    } catch (error) {
      toast.error('Load Failed', { description: error?.response?.data?.message || 'Failed to load campuses.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCampuses();
  }, []);

  const handleView = (campus) => {
    setSelectedCampus(campus);
    setIsViewOpen(true);
  };
  const handleEdit = (campus) => {
    setSelectedCampus(campus);
    setIsEditOpen(true);
  };
  const handleDelete = (campus) => {
    setDeleteItem(campus);
    setIsDeleteOpen(true);
  };
  const confirmDelete = async () => {
    if (!deleteItem) return;
    try {
      await deleteCampusRecord(deleteItem.id);
      toast.success('Campus Deleted', { description: `${deleteItem.name} has been removed.` });
      setIsDeleteOpen(false);
      setDeleteItem(null);
      await loadCampuses();
    } catch (error) {
      toast.error('Delete Failed', { description: error?.response?.data?.message || 'Failed to delete campus.' });
    }
  };
  const handleSave = async (data) => {
    await updateCampusRecord(data.id, data);
    await loadCampuses();
  };
  const handleAdd = async (data) => {
    await createCampusRecord(data);
    await loadCampuses();
  };
  const campusColumns = [
  { key: 'name', label: 'Campus Name', sortable: true },
  { key: 'location', label: 'Location' },
  { key: 'students', label: 'Students', sortable: true },
  { key: 'staff', label: 'Staff', sortable: true },
  {
    key: 'capacity',
    label: 'Capacity',
    render: (value, row) =>
    <div className="space-y-1 min-w-[80px]">
          <span className="text-sm">{row.students}/{value}</span>
          <Progress value={row.students / value * 100} className="h-1.5" />
        </div>
  },
  {
    key: 'status',
    label: 'Status',
    render: (value) =>
    <Badge variant={value === 'Active' ? 'default' : 'secondary'}>{value}</Badge>
  },
  {
    key: 'actions',
    label: '',
    render: (_, row) =>
    <div className="flex gap-1">
          <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => handleView(row)}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => handleEdit(row)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-destructive hover:text-destructive" onClick={() => handleDelete(row)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
  }];
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Campus Management</h1>
          <p className="text-sm text-muted-foreground">Manage all college campuses and locations</p>
        </div>
        <Button size="sm" onClick={() => setIsAddOpen(true)}>
          <Plus className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">Add Campus</span>
        </Button>
      </div>
      {/* Stats */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <Card className="transition-all hover:shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                <p className="text-xl sm:text-2xl font-bold">{stats.totalCampuses}</p>
                <p className="text-xs text-muted-foreground">Total Campuses</p>
                </div>
              </div>
          </CardContent>
        </Card>
        <Card className="transition-all hover:shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <GraduationCap className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                <p className="text-xl sm:text-2xl font-bold">{stats.totalStudents.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Total Students</p>
                </div>
              </div>
          </CardContent>
        </Card>
        <Card className="transition-all hover:shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <Users className="h-5 w-5 text-green-600" />
                </div>
                <div>
                <p className="text-xl sm:text-2xl font-bold">{stats.totalStaff}</p>
                <p className="text-xs text-muted-foreground">Total Staff</p>
                </div>
              </div>
          </CardContent>
        </Card>
        <Card className="transition-all hover:shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-yellow-500/10">
                  <MapPin className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                <p className="text-xl sm:text-2xl font-bold">{stats.countiesCovered}</p>
                <p className="text-xs text-muted-foreground">Counties Covered</p>
                </div>
              </div>
          </CardContent>
        </Card>
      </div>
      {/* Campus Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        {campuses.map((campus) =>
        <Card key={campus.id} className="transition-all hover:shadow-md">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                <div>
                  <CardTitle className="text-base sm:text-lg">{campus.name}</CardTitle>
                  <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <MapPin className="h-3 w-3 shrink-0" />
                    {campus.location}
                  </p>
                </div>
                <Badge variant="outline" className="self-start">Est. {campus.established}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs">Students</p>
                    <p className="font-semibold">{campus.students.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Staff</p>
                    <p className="font-semibold">{campus.staff}</p>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs sm:text-sm mb-1">
                    <span className="text-muted-foreground">Capacity</span>
                    <span className="font-medium">{Math.round(campus.students / campus.capacity * 100)}%</span>
                  </div>
                  <Progress value={campus.students / campus.capacity * 100} className="h-2" />
                </div>
                <div className="flex flex-col sm:flex-row gap-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Phone className="h-3 w-3 shrink-0" />{campus.phone}</span>
                  <span className="flex items-center gap-1"><Mail className="h-3 w-3 shrink-0" />{campus.email}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      {/* Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm sm:text-base font-medium">All Campuses</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {loading ?
          <div className="py-8 text-sm text-muted-foreground">Loading campuses...</div> :
          <DataTable columns={campusColumns} data={campuses} searchable={false} pageSize={10} />
          }
        </CardContent>
      </Card>
      {/* Modals */}
      <ViewCampusModal
        open={isViewOpen}
        onOpenChange={setIsViewOpen}
        campus={selectedCampus} />
      <EditCampusModal
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        campus={selectedCampus}
        onSave={handleSave} />
      <AddCampusModal
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        onAdd={handleAdd} />
      <ConfirmModal
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Delete Campus"
        description={`Are you sure you want to delete ${deleteItem?.name}? This action cannot be undone.`}
        confirmText="Delete"
        variant="destructive"
        onConfirm={confirmDelete} />
    </div>);
}
