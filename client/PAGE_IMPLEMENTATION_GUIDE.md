# Page Implementation Guide - Using the Design System

This guide shows developers how to apply the new design system utilities to existing pages for a consistent, production-grade look and feel.

---

## Quick Reference

### Import Design System
```jsx
// All utilities are automatically available via Tailwind CSS
// No additional imports needed - just use the class names
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
```

### Common Page Structure Template
```jsx
export default function PageName() {
  return (
    <div className="container-page">
      {/* Page Header */}
      <div className="section-header">
        <div>
          <h1 className="h1-page">Page Title</h1>
          <p className="text-muted">Optional description</p>
        </div>
        <Button className="btn-lg">Action</Button>
      </div>

      {/* Content Sections */}
      <div className="content-wrapper">
        {/* Section 1 */}
        <div>
          <h2 className="h2-section mb-4">Section Title</h2>
          <div className="grid-cards">
            {/* Cards go here */}
          </div>
        </div>

        {/* Section 2 */}
        <Card>
          <CardHeader>
            <CardTitle>Content Title</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Content here */}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

---

## Dashboard Pages

### Layout Pattern
```jsx
import { StatsCard } from '@/components/dashboard/StatsCard';
import { AreaChartCard } from '@/components/dashboard/Charts';

export default function Dashboard() {
  return (
    <div className="container-page">
      {/* Header with title and action */}
      <div className="section-header">
        <h1 className="h1-page">Dashboard</h1>
        <Button variant="outline">Export</Button>
      </div>

      {/* Stats cards - 4 column grid */}
      <div className="grid-cards-dashboard">
        <StatsCard title="Total Users" value="8,420" icon={Users} trend="+12%" />
        <StatsCard title="Active Sessions" value="1,240" icon={Activity} trend="+8%" />
        <StatsCard title="Revenue" value="KES 2.4M" icon={TrendingUp} trend="+24%" />
        <StatsCard title="Completion" value="87%" icon={CheckCircle} trend="+5%" />
      </div>

      {/* Charts section */}
      <div className="grid-cards-lg">
        <AreaChartCard title="Enrollment Trend" />
        <PieChartCard title="User Distribution" />
      </div>

      {/* Data table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={data} />
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## Data Table Pages (Users, Students, Staff, etc.)

### Page Structure
```jsx
import { DataTable } from '@/components/dashboard/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';

export default function UsersPage() {
  const [filters, setFilters] = useState({});

  return (
    <div className="container-page">
      {/* Header */}
      <div className="section-header">
        <div>
          <h1 className="h1-page">Users Management</h1>
          <p className="text-muted">Manage system users and permissions</p>
        </div>
        <Button className="btn-lg" onClick={() => setIsAddOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      {/* Filters */}
      <Card className="card-subtle mb-6">
        <CardContent className="pt-6">
          <div className="form-grid">
            <Input placeholder="Search by name..." />
            <Select value={filters.role} onChange={(v) => setFilters({ ...filters, role: v })}>
              <option>All Roles</option>
              <option>Admin</option>
              <option>Staff</option>
            </Select>
            <Select value={filters.status} onChange={(v) => setFilters({ ...filters, status: v })}>
              <option>All Status</option>
              <option>Active</option>
              <option>Inactive</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Action buttons */}
      <div className="flex-responsive gap-3 mb-6">
        <Button variant="outline" onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
        <Button variant="outline" onClick={handleImport}>
          <Upload className="mr-2 h-4 w-4" />
          Import
        </Button>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="pt-6">
          <div className="table-wrapper">
            <DataTable
              columns={[
                { key: 'name', label: 'Name', sortable: true },
                { key: 'email', label: 'Email' },
                {
                  key: 'role',
                  label: 'Role',
                  render: (value) => (
                    <Badge variant="secondary">{value}</Badge>
                  )
                },
                { key: 'status', label: 'Status', render: (value) => <StatusBadge status={value} /> },
                {
                  key: 'actions',
                  label: 'Actions',
                  render: (_, row) => (
                    <div className="flex gap-2">
                      <Button size="icon" variant="ghost" onClick={() => handleView(row)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => handleEdit(row)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => handleDelete(row)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )
                }
              ]}
              data={filteredData}
            />
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <AddUserModal open={isAddOpen} onClose={() => setIsAddOpen(false)} />
      <EditUserModal open={isEditOpen} onClose={() => setIsEditOpen(false)} user={selectedUser} />
    </div>
  );
}
```

---

## Form Pages (Add/Edit)

### Modal Form Pattern
```jsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';

export function AddUserModal({ open, onClose }) {
  const [formData, setFormData] = useState({});

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Form fields in grid */}
          <div className="form-grid">
            <div className="form-group">
              <Label>First Name</Label>
              <Input placeholder="Enter first name" />
            </div>
            <div className="form-group">
              <Label>Last Name</Label>
              <Input placeholder="Enter last name" />
            </div>
            <div className="form-group col-span-full">
              <Label>Email</Label>
              <Input type="email" placeholder="user@example.com" />
            </div>
          </div>

          {/* Radio group or select */}
          <div className="form-group">
            <Label>Role</Label>
            <Select>
              <option>Admin</option>
              <option>Staff</option>
              <option>User</option>
            </Select>
          </div>

          {/* Checkbox */}
          <div className="flex items-center gap-2">
            <Checkbox id="active" />
            <Label htmlFor="active">Active</Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            Add User
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

---

## Academic Pages (Departments, Courses, etc.)

### Card-Based Layout
```jsx
export default function DepartmentsPage() {
  return (
    <div className="container-page">
      {/* Header */}
      <div className="section-header">
        <div>
          <h1 className="h1-page">Departments</h1>
          <p className="text-muted">Manage academic departments</p>
        </div>
        <Button className="btn-lg">
          <Plus className="mr-2 h-4 w-4" />
          Add Department
        </Button>
      </div>

      {/* Search and filter */}
      <div className="mb-6 gap-4 flex-responsive">
        <div className="flex-1">
          <Input placeholder="Search departments..." />
        </div>
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          Filter
        </Button>
      </div>

      {/* Department cards grid */}
      <div className="grid-cards-lg">
        {departments.map((dept) => (
          <Card
            key={dept.id}
            className="card-interactive cursor-pointer"
            onClick={() => handleView(dept)}
          >
            <CardHeader>
              <div className="flex-between">
                <CardTitle className="text-lg">{dept.name}</CardTitle>
                <Badge>{dept.status}</Badge>
              </div>
              <CardDescription>{dept.code}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="stack-vertical gap-2">
                <div className="flex-between text-sm">
                  <span className="text-muted">Staff</span>
                  <span className="font-medium">{dept.staffCount}</span>
                </div>
                <div className="flex-between text-sm">
                  <span className="text-muted">Students</span>
                  <span className="font-medium">{dept.studentCount}</span>
                </div>
                <div className="flex-between text-sm">
                  <span className="text-muted">Programs</span>
                  <span className="font-medium">{dept.programCount}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-4 flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  className="flex-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(dept);
                  }}
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="flex-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(dept);
                  }}
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty state */}
      {departments.length === 0 && (
        <div className="empty-state">
          <Building2 className="empty-state-icon" />
          <h3 className="h3-subsection">No departments found</h3>
          <p className="text-muted mb-4">Get started by creating your first department</p>
          <Button onClick={() => setIsAddOpen(true)}>Create Department</Button>
        </div>
      )}
    </div>
  );
}
```

---

## Finance Pages (Payments, Reports)

### Mixed Layout with Charts
```jsx
export default function PaymentsPage() {
  return (
    <div className="container-page">
      {/* Metrics cards */}
      <div className="grid-cards-dashboard mb-8">
        <StatsCard
          title="Total Collected"
          value="KES 85.2M"
          change="+12%"
          icon={CreditCard}
        />
        <StatsCard
          title="Pending Payments"
          value="KES 12.5M"
          change="+3%"
          icon={Clock}
        />
        <StatsCard
          title="Successful Transactions"
          value="2,481"
          change="+8%"
          icon={CheckCircle}
        />
        <StatsCard
          title="Failed Transactions"
          value="42"
          change="-5%"
          icon={AlertTriangle}
        />
      </div>

      {/* Charts section */}
      <div className="grid-cards-lg mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Collection Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <AreaChartCard data={chartData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
          </CardHeader>
          <CardContent>
            <PieChartCard data={methodData} />
          </CardContent>
        </Card>
      </div>

      {/* Recent transactions table */}
      <Card>
        <CardHeader className="flex-between">
          <CardTitle>Recent Transactions</CardTitle>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </CardHeader>
        <CardContent>
          <div className="table-wrapper">
            <DataTable columns={columns} data={transactions} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## Error and Empty States

### Empty State Template
```jsx
function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="empty-state">
      <Icon className="empty-state-icon" />
      <h3 className="h3-subsection">{title}</h3>
      <p className="text-muted mb-4 max-w-sm">{description}</p>
      {action && <Button>{action}</Button>}
    </div>
  );
}

// Usage
{data.length === 0 && (
  <EmptyState
    icon={FileText}
    title="No items found"
    description="Get started by creating your first item"
    action="Create Item"
  />
)}
```

### Error State Template
```jsx
function ErrorState({ title, message, action }) {
  return (
    <div className="error-state">
      <div className="flex gap-4">
        <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-semibold text-destructive">{title}</h3>
          <p className="text-sm text-destructive/80 mt-1">{message}</p>
          {action && <Button size="sm" variant="outline" className="mt-3">{action}</Button>}
        </div>
      </div>
    </div>
  );
}

// Usage
{error && (
  <ErrorState
    title="Failed to load data"
    message="Unable to fetch the requested information. Please try again."
    action="Retry"
  />
)}
```

---

## Responsive Tables

### Mobile-Friendly Table
```jsx
const columns = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'email', label: 'Email' },
  { key: 'status', label: 'Status', render: (val) => <StatusBadge status={val} /> },
  {
    key: 'actions',
    label: 'Actions',
    render: (_, row) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon" variant="ghost">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => handleView(row)}>View</DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleEdit(row)}>Edit</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => handleDelete(row)}>Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }
];
```

---

## Common Patterns

### Filter Controls
```jsx
<div className="form-grid">
  <Input placeholder="Search..." />
  <Select>
    <option>All Departments</option>
    {/* options */}
  </Select>
  <Select>
    <option>All Status</option>
    <option>Active</option>
    <option>Inactive</option>
  </Select>
</div>
```

### Action Buttons
```jsx
<div className="flex-responsive gap-3">
  <Button variant="outline" size="sm">
    <Download className="mr-2 h-4 w-4" />
    Export
  </Button>
  <Button variant="outline" size="sm">
    <Upload className="mr-2 h-4 w-4" />
    Import
  </Button>
  <Button size="sm">
    <Plus className="mr-2 h-4 w-4" />
    Add
  </Button>
</div>
```

### Status Badge System
```jsx
const statusBadgeVariants = {
  active: 'badge-success',
  inactive: 'badge-warning',
  pending: 'badge-info',
  error: 'badge-destructive'
};

function StatusBadge({ status }) {
  return (
    <Badge className={statusBadgeVariants[status]}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}
```

---

## Migration Checklist

When updating an existing page:

- [ ] Wrap main content in `<div className="container-page">`
- [ ] Use `.h1-page` for page title
- [ ] Use `.section-header` for title + action layout
- [ ] Replace grid styling with `.grid-cards` or variants
- [ ] Use `.form-grid` for multi-field forms
- [ ] Replace card styling with card utilities
- [ ] Add `.flex-responsive` for button groups
- [ ] Apply `.table-wrapper` to tables
- [ ] Update typography to use new scale classes
- [ ] Add proper ARIA labels to interactive elements
- [ ] Test responsive behavior on mobile (320px)
- [ ] Verify color contrast with WebAIM
- [ ] Test keyboard navigation (Tab key)
- [ ] Check with screen reader

---

## Quick Copy-Paste Examples

### Stats Dashboard
```jsx
<div className="grid-cards-dashboard">
  {stats.map(stat => (
    <StatsCard
      key={stat.id}
      title={stat.title}
      value={stat.value}
      icon={stat.icon}
      trend={stat.trend}
    />
  ))}
</div>
```

### List View
```jsx
<Card>
  <CardHeader>
    <CardTitle>Items</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="space-y-3">
      {items.map(item => (
        <div key={item.id} className="card-subtle p-3 rounded-lg">
          <div className="flex-between">
            <span className="font-medium">{item.name}</span>
            <Badge>{item.status}</Badge>
          </div>
        </div>
      ))}
    </div>
  </CardContent>
</Card>
```

### Action Confirmation
```jsx
{isDeleteOpen && (
  <ConfirmModal
    title="Delete Item?"
    description="This action cannot be undone."
    onConfirm={handleConfirm}
    onCancel={() => setIsDeleteOpen(false)}
    confirmText="Delete"
    confirmVariant="destructive"
  />
)}
```

---

**Note:** All utilities are available without imports. Just start using the class names in your components. For component-specific styling, use the existing UI components from `/components/ui/`.
