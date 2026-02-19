# Quick Reference - Design System Cheat Sheet

## Most Used Classes

### Container & Spacing
```html
<div className="container-page">           <!-- Main page wrapper -->
<div className="container-section">        <!-- Section wrapper -->
<div className="content-wrapper">          <!-- Content with gaps -->
```

### Grids
```html
<div className="grid-cards">               <!-- 1-2-3-4 responsive grid -->
<div className="grid-cards-lg">            <!-- 1-2-3 responsive grid -->
<div className="grid-cards-dashboard">     <!-- Stats grid 1-2-3-4 -->
<div className="form-grid">                <!-- Form fields grid -->
```

### Typography
```html
<h1 className="h1-page">Title</h1>        <!-- Page title: 2xl-4xl -->
<h2 className="h2-section">Section</h2>   <!-- Section: xl-3xl -->
<h3 className="h3-subsection">Sub</h3>   <!-- Subsection: lg-xl -->
<p className="body-lg">Large text</p>      <!-- Large: 1rem -->
<p className="body-md">Normal text</p>     <!-- Normal: 0.875rem -->
<p className="body-sm">Small text</p>      <!-- Small: 0.75rem -->
<label className="label-lg">Label</label> <!-- Form label -->
```

### Cards
```html
<div className="card-elevated">            <!-- Subtle shadow -->
<div className="card-interactive">         <!-- Hover effects -->
<div className="card-outline">             <!-- Border only -->
<div className="card-subtle">              <!-- Muted background -->
<div className="card-glass">               <!-- Frosted glass -->
```

### Buttons
```html
<Button className="btn-lg">Large</Button>  <!-- Large: px-6 py-3 -->
<Button className="btn-base">Base</Button> <!-- Standard: px-4 py-2 -->
<Button className="btn-sm">Small</Button>  <!-- Small: px-3 py-1.5 -->
<Button className="btn-icon">🔍</Button>   <!-- Icon: 36px square -->
```

### Forms
```html
<div className="form-group">               <!-- Label + input group -->
  <label>Field</label>
  <input className="input-base input-focus" />
</div>

<div className="form-grid">                <!-- Multi-field grid -->
  {/* form fields */}
</div>
```

### Flex & Alignment
```html
<div className="flex-between">             <!-- space-between centered -->
<div className="flex-center">              <!-- items-center justify-center -->
<div className="flex-start">               <!-- items-center justify-start -->
<div className="flex-responsive">          <!-- Column mobile, row desktop -->
<div className="stack-vertical">           <!-- Vertical stack with gap -->
<div className="stack-horizontal">         <!-- Horizontal stack with gap -->
```

### Tables
```html
<div className="table-wrapper">            <!-- Horizontal scroll -->
  <table className="table-responsive">
    <thead className="table-header">
      <tr>
        <th className="table-cell">Header</th>
      </tr>
    </thead>
    <tbody>
      <tr className="table-row">
        <td className="table-cell">Data</td>
      </tr>
    </tbody>
  </table>
</div>
```

### Badges & Status
```html
<div className="badge-base badge-primary">Primary</div>
<div className="badge-base badge-success">Success</div>
<div className="badge-base badge-warning">Warning</div>
<div className="badge-base badge-destructive">Error</div>
```

### Responsive Visibility
```html
<div className="show-mobile">             <!-- Visible only on mobile -->
<div className="hide-mobile">             <!-- Hidden on mobile -->
<div className="show-tablet">             <!-- Visible on tablet+ -->
<div className="hide-tablet">             <!-- Hidden on tablet+ -->
<div className="show-desktop">            <!-- Visible on desktop+ -->
<div className="hide-desktop">            <!-- Hidden on desktop+ -->
```

### States
```html
<div className="empty-state">              <!-- Centered, padded container -->
<div className="error-state">              <!-- Error alert styling -->
<div className="success-state">            <!-- Success alert styling -->
<div className="warning-state">            <!-- Warning alert styling -->
<div className="disabled-state">           <!-- Disabled/inactive state -->
<div className="loading-state">            <!-- Loading animation -->
```

### Animations
```html
<div className="animate-fade-in">          <!-- Fade in animation -->
<div className="animate-slide-left">       <!-- Slide from right -->
<div className="animate-slide-right">      <!-- Slide from left -->
<div className="animate-slide-up">         <!-- Slide from bottom -->
<div className="animate-slide-down">       <!-- Slide from top -->
<div className="transition-smooth">        <!-- Smooth transition -->
```

---

## Common Page Templates

### Basic Page
```jsx
export default function PageName() {
  return (
    <div className="container-page">
      <div className="section-header">
        <h1 className="h1-page">Title</h1>
        <Button>Action</Button>
      </div>
      
      <div className="grid-cards">
        {/* Cards */}
      </div>
    </div>
  );
}
```

### Dashboard
```jsx
<div className="container-page">
  <div className="grid-cards-dashboard">
    <StatsCard />
  </div>
  
  <div className="grid-cards-lg">
    <ChartCard />
  </div>
</div>
```

### Data Table
```jsx
<div className="container-page">
  <div className="section-header">
    <h1 className="h1-page">List</h1>
    <Button>Add</Button>
  </div>
  
  <div className="table-wrapper">
    <DataTable columns={columns} data={data} />
  </div>
</div>
```

### Form
```jsx
<Card>
  <CardHeader><CardTitle>Form Title</CardTitle></CardHeader>
  <CardContent>
    <div className="space-y-6">
      <div className="form-group">
        <Label>Field 1</Label>
        <Input />
      </div>
      
      <div className="form-grid">
        <div className="form-group">...</div>
        <div className="form-group">...</div>
      </div>
    </div>
  </CardContent>
</Card>
```

---

## Responsive Breakpoints

| Class | Size | Usage |
|-------|------|-------|
| `sm:` | 640px | Mobile landscape |
| `md:` | 768px | Tablet |
| `lg:` | 1024px | Desktop |
| `xl:` | 1280px | Large desktop |
| `2xl:` | 1536px | Extra large |

**Example:**
```html
<div className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
  <!-- 1 col mobile, 2 cols tablet, 3 cols desktop -->
</div>
```

---

## Color System

### Semantic Colors
```
Primary:      #4F7DFF (Blue)    - Actions, highlights
Secondary:    #E5E8F0 (Light)   - Backgrounds, subtle
Accent:       #00D99F (Teal)    - Emphasis, interactive
Success:      #52B669 (Green)   - Positive, confirmed
Warning:      #FFAA00 (Orange)  - Caution, attention
Destructive:  #FF4545 (Red)     - Danger, delete
Muted:        #888E99 (Gray)    - Disabled, secondary text
```

### Usage
```css
.bg-primary           /* Primary background */
.text-primary         /* Primary text */
.border-primary       /* Primary border */
.bg-success           /* Success background */
.text-destructive     /* Destructive text */
```

---

## Spacing Scale (4px Grid)

| Value | Pixels | Classes |
|-------|--------|---------|
| xs | 4px | p-1 m-1 gap-1 |
| sm | 8px | p-2 m-2 gap-2 |
| md | 16px | p-4 m-4 gap-4 |
| lg | 24px | p-6 m-6 gap-6 |
| xl | 32px | p-8 m-8 gap-8 |
| 2xl | 48px | p-12 m-12 gap-12 |
| 3xl | 64px | p-16 m-16 gap-16 |

---

## Quick Copy-Paste Snippets

### Section with Header
```jsx
<div className="section-header">
  <div>
    <h2 className="h2-section">Section Title</h2>
    <p className="text-muted">Optional description</p>
  </div>
  <Button>Action</Button>
</div>
```

### Stats Cards
```jsx
<div className="grid-cards-dashboard">
  <StatsCard title="Total" value="1,234" trend="+12%" />
</div>
```

### Filter Controls
```jsx
<div className="form-grid">
  <Input placeholder="Search..." />
  <Select><option>All</option></Select>
  <Select><option>Status</option></Select>
</div>
```

### Action Buttons
```jsx
<div className="flex-responsive gap-3">
  <Button variant="outline">Export</Button>
  <Button variant="outline">Import</Button>
  <Button>Add New</Button>
</div>
```

### Status Badge
```jsx
<Badge className="badge-base badge-success">Active</Badge>
<Badge className="badge-base badge-warning">Pending</Badge>
<Badge className="badge-base badge-destructive">Error</Badge>
```

### Empty State
```jsx
<div className="empty-state">
  <Icon className="empty-state-icon" />
  <h3 className="h3-subsection">No items</h3>
  <p className="text-muted">Create your first item</p>
  <Button>Create</Button>
</div>
```

### Alert/Error
```jsx
<div className="error-state">
  <AlertTriangle className="h-5 w-5 text-destructive" />
  <div>
    <h3 className="font-semibold">Error Title</h3>
    <p className="text-sm mt-1">Error message</p>
  </div>
</div>
```

---

## Debugging Tips

### Check Responsive
1. Press `F12` to open DevTools
2. Press `Ctrl+Shift+M` for Responsive Mode
3. Test at: 320px, 640px, 1024px, 1440px

### Check Contrast
1. Use [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
2. All text must be 4.5:1 or higher
3. Status colors are pre-verified

### Check Accessibility
1. Press `Tab` to navigate with keyboard
2. Focus indicator should be visible (2px ring)
3. All buttons/links accessible via Tab
4. Use NVDA or Mac VoiceOver screen reader

### Performance Check
1. DevTools → Lighthouse → Performance
2. Target: 90+ score
3. Check First Paint, LCP, CLS metrics

---

## Common Mistakes to Avoid

❌ **Don't use generic `p-4` instead of section padding**
```jsx
// ❌ Wrong
<div className="p-4">Content</div>

// ✅ Right
<div className="container-page">Content</div>
```

❌ **Don't mix responsive prefixes incorrectly**
```jsx
// ❌ Wrong
<div className="grid-cols-2 sm:grid-cols-3 lg:grid-cols-2">

// ✅ Right (mobile-first)
<div className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
```

❌ **Don't forget form-group wrapper**
```jsx
// ❌ Wrong
<label>Email</label>
<input />

// ✅ Right
<div className="form-group">
  <label>Email</label>
  <input className="input-base input-focus" />
</div>
```

❌ **Don't use hardcoded colors**
```jsx
// ❌ Wrong
<div style={{ color: '#4F7DFF' }}>Text</div>

// ✅ Right
<div className="text-primary">Text</div>
```

❌ **Don't skip accessibility attributes**
```jsx
// ❌ Wrong
<Button onClick={logout}><LogOut /></Button>

// ✅ Right
<Button onClick={logout} aria-label="Log out" title="Log out">
  <LogOut className="h-4 w-4" />
</Button>
```

---

## When to Reference Documentation

- **Design Principles** → [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)
- **Page Templates** → [PAGE_IMPLEMENTATION_GUIDE.md](./PAGE_IMPLEMENTATION_GUIDE.md)
- **Full Summary** → [ENHANCEMENT_SUMMARY.md](./ENHANCEMENT_SUMMARY.md)
- **Main README** → [README.md](./README.md)

---

**Tip:** Bookmark this page in your browser for quick reference!  
**Last Updated:** February 19, 2026
