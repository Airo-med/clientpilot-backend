import {
  IconCreditCard,
  IconFileInvoice,
  IconFolder,
  IconLayoutDashboard,
  IconUsers,
} from "@tabler/icons-react";

const Menuitems = [
  {
    navlabel: true,
    subheader: "HOME",
  },
  {
    id: "nav-dashboard",
    title: "Dashboard",
    icon: IconLayoutDashboard,
    href: "/",
  },
  {
    navlabel: true,
    subheader: "WORK",
  },
  {
    id: "nav-clients",
    title: "Clients",
    icon: IconUsers,
    href: "/clients",
  },
  {
    id: "nav-projects",
    title: "Projects",
    icon: IconFolder,
    href: "/projects",
  },
  {
    id: "nav-invoices",
    title: "Invoices",
    icon: IconFileInvoice,
    href: "/invoices",
  },
  {
    navlabel: true,
    subheader: "ACCOUNT",
  },
  {
    id: "nav-subscription",
    title: "Subscription",
    icon: IconCreditCard,
    href: "/subscription",
  },
];

export default Menuitems;
