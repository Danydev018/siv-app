import {  
  AudioWaveform,  
  BookOpen,  
  Bot,  
  Calendar, // ← Agregar esta línea  
  Command,  
  Frame,  
  GalleryVerticalEnd,  
  Map,  
  PieChart,  
  Settings2,  
  SquareTerminal,  
} from "lucide-react";  
  
import {  
  Sidebar,  
  SidebarContent,  
  SidebarFooter,  
  SidebarHeader,  
  SidebarRail,  
} from "@/components/ui/sidebar";  
  
import { SidebarMain } from "./SidebarMain";  
import { SidebarUser } from "./SidebarUser";  
  
// This is sample data.  
const data = {  
  user: {  
    name: "shadcn",  
    email: "m@example.com",  
    avatar: "/avatars/shadcn.jpg",  
  },  
  teams: [  
    {  
      name: "Acme Inc",  
      logo: GalleryVerticalEnd,  
      plan: "Enterprise",  
    },  
    {  
      name: "Acme Corp.",  
      logo: AudioWaveform,  
      plan: "Startup",  
    },  
    {  
      name: "Evil Corp.",  
      logo: Command,  
      plan: "Free",  
    },  
  ],  
  navMain: [  
    {  
      title: "Playground",  
      url: "#",  
      icon: SquareTerminal,  
      isActive: true,  
      items: [  
        {  
          title: "History",  
          url: "#",  
        },  
        {  
          title: "Starred",  
          url: "#",  
        },  
        {  
          title: "Settings",  
          url: "#",  
        },  
      ],  
    },  
    {  
      title: "Models",  
      url: "#",  
      icon: Bot,  
      items: [  
        {  
          title: "Genesis",  
          url: "#",  
        },  
        {  
          title: "Explorer",  
          url: "#",  
        },  
        {  
          title: "Quantum",  
          url: "#",  
        },  
      ],  
    },  
    {  
      title: "Documentation",  
      url: "#",  
      icon: BookOpen,  
      items: [  
        {  
          title: "Introduction",  
          url: "#",  
        },  
        {  
          title: "Get Started",  
          url: "#",  
        },  
        {  
          title: "Tutorials",  
          url: "#",  
        },  
        {  
          title: "Changelog",  
          url: "#",  
        },  
      ],  
    },  
    {  
      title: "Calendar", // ← Agregar este nuevo elemento  
      url: "/calendar",  
      icon: Calendar,  
      items: [  
        {  
          title: "View Calendar",  
          url: "/calendar",  
        },  
        {  
          title: "Events",  
          url: "/calendar/events",  
        },  
        {  
          title: "Schedule",  
          url: "/calendar/schedule",  
        },  
      ],  
    },  
    {  
      title: "Settings",  
      url: "#",  
      icon: Settings2,  
      items: [  
        {  
          title: "General",  
          url: "#",  
        },  
        {  
          title: "Team",  
          url: "#",  
        },  
        {  
          title: "Billing",  
          url: "#",  
        },  
        {  
          title: "Limits",  
          url: "#",  
        },  
      ],  
    },  
  ],  
  projects: [  
    {  
      name: "Design Engineering",  
      url: "#",  
      icon: Frame,  
    },  
    {  
      name: "Sales & Marketing",  
      url: "#",  
      icon: PieChart,  
    },  
    {  
      name: "Travel",  
      url: "#",  
      icon: Map,  
    },  
  ],  
};  
  
export function SidebarApp({ ...props }) {  
  return (  
    <Sidebar collapsible="icon" {...props}>  
      <SidebarHeader></SidebarHeader>  
      <SidebarContent>  
        <SidebarMain items={data.navMain} />  
      </SidebarContent>  
      <SidebarFooter>  
        <SidebarUser user={data.user} />  
      </SidebarFooter>  
      <SidebarRail />  
    </Sidebar>  
  );  
}