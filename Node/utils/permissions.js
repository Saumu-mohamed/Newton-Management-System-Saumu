export const permissions = {
    superadmin: [
        "create:user",
        "delete:user",
        "update:user",
        "view:user",
        "create:student",
        "delete:student",
        "update:student",
        "view:student",
        "manage:system",
        "create:course",
        "delete:course",
        "view:finance"
    ],

    collegeadmin: [
        "create:user",
        "create:student",
        "update:student",
        "view:student",
        "create:course"
    ],

    registrator: [
        "view:student",
        "update:student",
        "create:student",
        "delete:student"
    ],

    finance: [
        "view:user",
        "view:finance",
    ],

    lecturer: [
        "view:student",
        "update:student",
        "create:result"
    ],

    student: [
        "view:self",
    ],
};