import {
  LayoutDashboard,
  UtensilsCrossed,
  PlusCircle,
  ClipboardList,
  Crown,
  ShoppingBag,
  Users,
  CreditCard,
  UserCircle,
} from "lucide-react";

export const DASHBOARD_NAV = {
  vendor: [
    { label: "Overview", href: "/dashboard/vendor", icon: LayoutDashboard },
    { label: "My Menu Items", href: "/dashboard/vendor/menu-items", icon: UtensilsCrossed },
    { label: "Add Menu Item", href: "/dashboard/vendor/add-item", icon: PlusCircle },
    { label: "Customer Orders", href: "/dashboard/vendor/orders", icon: ClipboardList },
    { label: "Subscription", href: "/dashboard/vendor/subscription", icon: Crown },
    { label: "Profile Settings", href: "/dashboard/profile", icon: UserCircle },
  ],
  customer: [
    { label: "Overview", href: "/dashboard/customer", icon: LayoutDashboard },
    { label: "My Orders", href: "/dashboard/customer/orders", icon: ShoppingBag },
    { label: "Profile Settings", href: "/dashboard/profile", icon: UserCircle },
  ],
  admin: [
    { label: "Overview", href: "/dashboard/admin", icon: LayoutDashboard },
    { label: "Manage Users", href: "/dashboard/admin/users", icon: Users },
    { label: "Manage Menu Items", href: "/dashboard/admin/menu-items", icon: UtensilsCrossed },
    { label: "Transactions", href: "/dashboard/admin/transactions", icon: CreditCard },
    { label: "Profile Settings", href: "/dashboard/profile", icon: UserCircle },
  ],
};