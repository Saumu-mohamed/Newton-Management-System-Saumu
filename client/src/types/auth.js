export const ROLE_ROUTES = {
  superadmin: "/superadmin/dashboard",
  collegeadmin: "/collegeadmin/dashboard",
  registrator: "/registrator/dashboard",
  finance: "/finance/dashboard",
  lecturer: "/lecturer/dashboard",
  student: "/student/dashboard"
};

export const ROLE_LABELS = {
  superadmin: 'Superadmin',
  collegeadmin: 'Collegeadmin',
  lecturer: 'Lecturer',
  student: 'Student',
  registrator: 'Registrator',
  finance: 'Finance'
};

export const ROLES = Object.keys(ROLE_ROUTES);