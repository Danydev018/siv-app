import { createFileRoute } from "@tanstack/react-router";  
import { useState, useEffect } from "react";  
import Database from '@tauri-apps/plugin-sql';  
import { Button } from "@/components/ui/button";  
import {   
  Breadcrumb,  
  BreadcrumbItem,  
  BreadcrumbList,  
  BreadcrumbPage,  
} from "@/components/ui/breadcrumb";  
import { Separator } from "@/components/ui/separator";  
import { SidebarTrigger } from "@/components/ui/sidebar";  
import { Bell, Check, Trash2 } from "lucide-react";  
  
export const Route = createFileRoute("/calendar/notifications")({  
  component: Notifications,  
});  
  
interface Notification {  
  id: string;  
  event_id: string;  
  type: string;  
  message: string;  
  is_read: boolean;  
  created_at: string;  
}  
  
function Notifications() {  
  const [notifications, setNotifications] = useState<Notification[]>([]);  
  
  useEffect(() => {  
    loadNotifications();  
  }, []);  
  
  const loadNotifications = async () => {  
    try {  
      const db = await Database.load('sqlite:siv.db');  
      const result = await db.select('SELECT * FROM notifications ORDER BY created_at DESC');  
      setNotifications(result as Notification[]);  
    } catch (error) {  
      console.error('Error loading notifications:', error);  
    }  
  };  
  
  const markAsRead = async (notificationId: string) => {  
    try {  
      const db = await Database.load('sqlite:siv.db');  
      await db.execute('UPDATE notifications SET is_read = TRUE WHERE id = ?', [notificationId]);  
      setNotifications(notifications.map(n =>   
        n.id === notificationId ? { ...n, is_read: true } : n  
      ));  
    } catch (error) {  
      console.error('Error marking notification as read:', error);  
    }  
  };  
  
  const deleteNotification = async (notificationId: string) => {  
    try {  
      const db = await Database.load('sqlite:siv.db');  
      await db.execute('DELETE FROM notifications WHERE id = ?', [notificationId]);  
      setNotifications(notifications.filter(n => n.id !== notificationId));  
    } catch (error) {  
      console.error('Error deleting notification:', error);  
    }  
  };  
  
  return (  
    <>  
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">  
        <div className="flex items-center gap-2 px-4">  
          <SidebarTrigger className="-ml-1" />  
          <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />  
          <Breadcrumb>  
            <BreadcrumbList>  
              <BreadcrumbItem>  
                <BreadcrumbPage>Calendar</BreadcrumbPage>  
              </BreadcrumbItem>  
              <BreadcrumbItem>  
                <BreadcrumbPage>Notifications</BreadcrumbPage>  
              </BreadcrumbItem>  
            </BreadcrumbList>  
          </Breadcrumb>  
        </div>  
      </header>  
  
      <div className="flex flex-1 flex-col gap-4 p-6 pt-0">  
        <div className="bg-background border border-border rounded-lg shadow-sm">  
          <div className="p-6 border-b border-border">  
            <h1 className="text-2xl font-semibold flex items-center gap-2">  
              <Bell className="h-6 w-6" />  
              Notificaciones de Eventos  
            </h1>  
          </div>  
  
          <div className="p-6">  
            {notifications.length === 0 ? (  
              <p className="text-muted-foreground text-center py-8">  
                No tienes notificaciones pendientes  
              </p>  
            ) : (  
              <div className="space-y-4">  
                {notifications.map((notification) => (  
                  <div  
                    key={notification.id}  
                    className={`p-4 border rounded-lg ${  
                      notification.is_read ? 'bg-muted/20' : 'bg-background'  
                    }`}  
                  >  
                    <div className="flex items-start justify-between">  
                      <div className="flex-1">  
                        <p className={`text-sm ${  
                          notification.is_read ? 'text-muted-foreground' : 'text-foreground font-medium'  
                        }`}>  
                          {notification.message}  
                        </p>  
                        <p className="text-xs text-muted-foreground mt-1">  
                          {new Date(notification.created_at).toLocaleString('es-ES')}  
                        </p>  
                      </div>  
                      <div className="flex gap-2">  
                        {!notification.is_read && (  
                          <Button  
                            variant="ghost"  
                            size="sm"  
                            onClick={() => markAsRead(notification.id)}  
                          >  
                            <Check className="h-4 w-4" />  
                          </Button>  
                        )}  
                        <Button  
                          variant="ghost"  
                          size="sm"  
                          onClick={() => deleteNotification(notification.id)}  
                          className="text-destructive hover:text-destructive"  
                        >  
                          <Trash2 className="h-4 w-4" />  
                        </Button>  
                      </div>  
                    </div>  
                  </div>  
                ))}  
              </div>  
            )}  
          </div>  
        </div>  
      </div>  
    </>  
  );  
}