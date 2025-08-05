import { createFileRoute } from "@tanstack/react-router";  
import { useState } from "react";  
import { Button } from "@/components/ui/button";  
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";  
import { Input } from "@/components/ui/input";  
import { Label } from "@/components/ui/label";  
import { Textarea } from "@/components/ui/textarea";  
import { Plus, ChevronLeft, ChevronRight, Edit, Trash2, MoreHorizontal } from "lucide-react";  
import {  
  Breadcrumb,  
  BreadcrumbItem,  
  BreadcrumbList,  
  BreadcrumbPage,  
} from "@/components/ui/breadcrumb";  
import { Separator } from "@/components/ui/separator";  
import { SidebarTrigger } from "@/components/ui/sidebar";  
  
export const Route = createFileRoute("/calendar")({  
  component: Calendar,  
});  
  
interface Event {  
  id: string;  
  title: string;  
  description: string;  
  date: string;  
  time: string;  
  color?: string;  
}  
  
function Calendar() {  
  const [currentDate, setCurrentDate] = useState(new Date());  
  const [events, setEvents] = useState<Event[]>([]);  
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);  
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);  
  const [isEditMode, setIsEditMode] = useState(false);  
  
  const [formData, setFormData] = useState({  
    title: "",  
    description: "",  
    date: "",  
    time: "",  
    color: "#3b82f6",  
  });  
  
  const eventColors = [  
    { name: "Azul", value: "#3b82f6" },  
    { name: "Verde", value: "#10b981" },  
    { name: "Rojo", value: "#ef4444" },  
    { name: "Amarillo", value: "#f59e0b" },  
    { name: "Púrpura", value: "#8b5cf6" },  
    { name: "Rosa", value: "#ec4899" },  
  ];  
  
  const getDaysInMonth = (date: Date) => {  
    const year = date.getFullYear();  
    const month = date.getMonth();  
    const firstDay = new Date(year, month, 1);  
    const lastDay = new Date(year, month + 1, 0);  
    const daysInMonth = lastDay.getDate();  
    const startingDayOfWeek = firstDay.getDay();  
  
    const days = [];  
      
    for (let i = 0; i < startingDayOfWeek; i++) {  
      days.push(null);  
    }  
      
    for (let day = 1; day <= daysInMonth; day++) {  
      days.push(day);  
    }  
      
    return days;  
  };  
  
  const formatDateForInput = (date: Date, day: number) => {  
    const year = date.getFullYear();  
    const month = String(date.getMonth() + 1).padStart(2, '0');  
    const dayStr = String(day).padStart(2, '0');  
    return `${year}-${month}-${dayStr}`;  
  };  
  
  const getEventsForDay = (day: number) => {  
    const dateStr = formatDateForInput(currentDate, day);  
    return events.filter(event => event.date === dateStr);  
  };  
  
  const isToday = (day: number) => {  
    const today = new Date();  
    const checkDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);  
    return checkDate.toDateString() === today.toDateString();  
  };  
  
  const handleCreateEvent = () => {  
    if (formData.title && formData.date && formData.time) {  
      const newEvent: Event = {  
        id: Date.now().toString(),  
        ...formData,  
      };  
      setEvents([...events, newEvent]);  
      setFormData({ title: "", description: "", date: "", time: "", color: "#3b82f6" });  
      setIsCreateDialogOpen(false);  
    }  
  };  
  
  const handleEditEvent = () => {  
    if (selectedEvent && formData.title && formData.date && formData.time) {  
      setEvents(events.map(event =>   
        event.id === selectedEvent.id   
          ? { ...selectedEvent, ...formData }  
          : event  
      ));  
      setIsEditMode(false);  
      setIsViewDialogOpen(false);  
      setSelectedEvent(null);  
    }  
  };  
  
  const handleDeleteEvent = (eventId: string) => {  
    setEvents(events.filter(event => event.id !== eventId));  
    setIsViewDialogOpen(false);  
    setSelectedEvent(null);  
  };  
  
  const openEventDetails = (event: Event) => {  
    setSelectedEvent(event);  
    setFormData({  
      title: event.title,  
      description: event.description,  
      date: event.date,  
      time: event.time,  
      color: event.color || "#3b82f6",  
    });  
    setIsViewDialogOpen(true);  
    setIsEditMode(false);  
  };  
  
  const monthNames = [  
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",  
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"  
  ];  
  
  const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];  
  
  return (  
    <>  
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">  
        <div className="flex items-center gap-2 px-4">  
          <SidebarTrigger className="-ml-1" />  
          <Separator  
            orientation="vertical"  
            className="mr-2 data-[orientation=vertical]:h-4"  
          />  
          <Breadcrumb>  
            <BreadcrumbList>  
              <BreadcrumbItem>  
                <BreadcrumbPage>Calendar</BreadcrumbPage>  
              </BreadcrumbItem>  
            </BreadcrumbList>  
          </Breadcrumb>  
        </div>  
      </header>  
        
      <div className="flex flex-1 flex-col gap-4 p-6 pt-0">  
        <div className="bg-background border border-border rounded-lg shadow-sm">  
          {/* Header estilo Google Calendar */}  
          <div className="flex items-center justify-between p-6 border-b border-border">  
            <div className="flex items-center gap-6">  
              <div className="flex items-center gap-2">  
                <Button  
                  variant="ghost"  
                  size="icon"  
                  className="h-8 w-8"  
                  onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}  
                >  
                  <ChevronLeft className="h-4 w-4" />  
                </Button>  
                  
                <Button  
                  variant="ghost"  
                  size="icon"  
                  className="h-8 w-8"  
                  onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}  
                >  
                  <ChevronRight className="h-4 w-4" />  
                </Button>  
              </div>  
                
              <h1 className="text-2xl font-normal text-foreground">  
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}  
              </h1>  
  
              <Button  
                variant="outline"  
                size="sm"  
                onClick={() => setCurrentDate(new Date())}  
                className="text-sm"  
              >  
                Hoy  
              </Button>  
            </div>  
              
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>  
              <DialogTrigger asChild>  
                <Button className="gap-2">  
                  <Plus className="h-4 w-4" />  
                  Crear  
                </Button>  
              </DialogTrigger>  
              <DialogContent className="sm:max-w-md">  
                <DialogHeader>  
                  <DialogTitle>Nuevo evento</DialogTitle>  
                </DialogHeader>  
                <div className="space-y-4">  
                  <div>  
                    <Input  
                      placeholder="Agregar título"  
                      value={formData.title}  
                      onChange={(e) => setFormData({...formData, title: e.target.value})}  
                      className="text-lg font-medium border-0 px-0 focus-visible:ring-0 placeholder:text-muted-foreground"  
                    />  
                  </div>  
                    
                  <div className="grid grid-cols-2 gap-4">  
                    <div>  
                      <Label htmlFor="date" className="text-sm text-muted-foreground">Fecha</Label>  
                      <Input  
                        id="date"  
                        type="date"  
                        value={formData.date}  
                        onChange={(e) => setFormData({...formData, date: e.target.value})}  
                        className="mt-1"  
                      />  
                    </div>  
                    <div>  
                      <Label htmlFor="time" className="text-sm text-muted-foreground">Hora</Label>  
                      <Input  
                        id="time"  
                        type="time"  
                        value={formData.time}  
                        onChange={(e) => setFormData({...formData, time: e.target.value})}  
                        className="mt-1"  
                      />  
                    </div>  
                  </div>  
  
                  <div>  
                    <Label className="text-sm text-muted-foreground">Color</Label>  
                    <div className="flex gap-2 mt-2">  
                      {eventColors.map((color) => (  
                        <button  
                          key={color.value}  
                          type="button"  
                          className={`w-6 h-6 rounded-full border-2 ${  
                            formData.color === color.value ? 'border-foreground' : 'border-transparent'  
                          }`}  
                          style={{ backgroundColor: color.value }}  
                          onClick={() => setFormData({...formData, color: color.value})}  
                        />  
                      ))}  
                    </div>  
                  </div>  
                    
                  <div>  
                    <Textarea  
                      placeholder="Agregar descripción"  
                      value={formData.description}  
                      onChange={(e) => setFormData({...formData, description: e.target.value})}  
                      className="resize-none"  
                      rows={3}  
                    />  
                  </div>  
                    
                  <div className="flex justify-end gap-2 pt-4">  
                    <Button variant="ghost" onClick={() => setIsCreateDialogOpen(false)}>  
                      Cancelar  
                    </Button>  
                    <Button onClick={handleCreateEvent}>  
                      Guardar  
                    </Button>  
                  </div>  
                </div>  
              </DialogContent>  
            </Dialog>  
          </div>  
  
          {/* Grid del calendario estilo Google */}  
          <div className="grid grid-cols-7">  
            {/* Headers de días */}  
            {dayNames.map((day, index) => (  
              <div   
                key={day}   
                className={`p-4 text-center text-sm font-medium text-muted-foreground border-b border-border ${  
                  index === 0 || index === 6 ? 'text-muted-foreground/70' : ''  
                }`}  
              >  
                {day}  
              </div>  
            ))}  
              
            {/* Días del mes */}  
            {getDaysInMonth(currentDate).map((day, index) => (  
              <div  
                key={index}  
                className={`min-h-[120px] border-r border-b border-border relative group hover:bg-accent/30 transition-colors ${  
                  !day ? 'bg-muted/20' : ''  
                } ${  
                  day && index % 7 === 0 || index % 7 === 6 ? 'bg-muted/10' : ''  
                }`}  
              >  
                {day && (  
                  <>  
                    <div className={`p-2 text-sm ${  
                      isToday(day)   
                        ? 'bg-primary text-primary-foreground rounded-full w-7 h-7 flex items-center justify-center font-medium m-1'   
                        : 'font-normal text-foreground'  
                    }`}>  
                      {day}  
                    </div>  
                      
                    <div className="px-1 space-y-1">  
                      {getEventsForDay(day).slice(0, 3).map(event => (  
                        <div  
                          key={event.id}  
                          className="text-xs px-2 py-1 rounded text-white cursor-pointer hover:opacity-80 transition-opacity truncate"  
                          style={{ backgroundColor: event.color || "#3b82f6" }}  
                          onClick={() => openEventDetails(event)}  
                        >  
                          {event.title}  
                        </div>  
                      ))}  
                        
                      {getEventsForDay(day).length > 3 && (  
                        <div className="text-xs text-muted-foreground px-2 py-1">  
                          +{getEventsForDay(day).length - 3} más  
                        </div>  
                      )}  
                    </div>  
                      
                    {/* Botón flotante para agregar evento */}  
                    <button  
                      className="absolute bottom-2 right-2 w-6 h-6 bg-primary text-primary-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs hover:bg-primary/90"  
                      onClick={() => {  
                        setFormData({  
                          ...formData,  
                          date: formatDateForInput(currentDate, day)  
                        });  
                        setIsCreateDialogOpen(true);  
                      }}  
                    >  
                      <Plus className="h-3 w-3" />  
                    </button>  
                  </>  
                )}  
              </div>  
            ))}  
          </div>  
        </div>  
      </div>  
  
      {/* Dialog mejorado para ver/editar eventos */}  
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>  
        <DialogContent className="sm:max-w-md">  
          <DialogHeader>  
            <DialogTitle className="flex items-center gap-3">  
              {selectedEvent && (  
                <div   
                  className="w-4 h-4 rounded-full"   
                  style={{ backgroundColor: selectedEvent.color || "#3b82f6" }}  
                />  
              )}  
              {isEditMode ? "Editar evento" : selectedEvent?.title}  
            </DialogTitle>
           </DialogHeader>  
          {selectedEvent && (  
            <div className="space-y-4">  
              {isEditMode ? (  
                <>  
                  <div>  
                    <Input  
                      placeholder="Título del evento"  
                      value={formData.title}  
                      onChange={(e) => setFormData({...formData, title: e.target.value})}  
                      className="text-lg font-medium border-0 px-0 focus-visible:ring-0"  
                    />  
                  </div>  
                    
                  <div className="grid grid-cols-2 gap-4">  
                    <div>  
                      <Label htmlFor="edit-date" className="text-sm text-muted-foreground">Fecha</Label>  
                      <Input  
                        id="edit-date"  
                        type="date"  
                        value={formData.date}  
                        onChange={(e) => setFormData({...formData, date: e.target.value})}  
                        className="mt-1"  
                      />  
                    </div>  
                    <div>  
                      <Label htmlFor="edit-time" className="text-sm text-muted-foreground">Hora</Label>  
                      <Input  
                        id="edit-time"  
                        type="time"  
                        value={formData.time}  
                        onChange={(e) => setFormData({...formData, time: e.target.value})}  
                        className="mt-1"  
                      />  
                    </div>  
                  </div>  
  
                  <div>  
                    <Label className="text-sm text-muted-foreground">Color</Label>  
                    <div className="flex gap-2 mt-2">  
                      {eventColors.map((color) => (  
                        <button  
                          key={color.value}  
                          type="button"  
                          className={`w-6 h-6 rounded-full border-2 ${  
                            formData.color === color.value ? 'border-foreground' : 'border-transparent'  
                          }`}  
                          style={{ backgroundColor: color.value }}  
                          onClick={() => setFormData({...formData, color: color.value})}  
                        />  
                      ))}  
                    </div>  
                  </div>  
                    
                  <div>  
                    <Textarea  
                      placeholder="Descripción del evento"  
                      value={formData.description}  
                      onChange={(e) => setFormData({...formData, description: e.target.value})}  
                      className="resize-none"  
                      rows={3}  
                    />  
                  </div>  
                    
                  <div className="flex justify-end gap-2 pt-4">  
                    <Button variant="ghost" onClick={() => setIsEditMode(false)}>  
                      Cancelar  
                    </Button>  
                    <Button onClick={handleEditEvent}>  
                      Guardar cambios  
                    </Button>  
                  </div>  
                </>  
              ) : (  
                <>  
                  <div className="space-y-3">  
                    <div>  
                      <p className="text-sm text-muted-foreground">Fecha y hora</p>  
                      <p className="font-medium">  
                        {new Date(selectedEvent.date).toLocaleDateString('es-ES', {  
                          weekday: 'long',  
                          year: 'numeric',  
                          month: 'long',  
                          day: 'numeric'  
                        })} a las {selectedEvent.time}  
                      </p>  
                    </div>  
                      
                    {selectedEvent.description && (  
                      <div>  
                        <p className="text-sm text-muted-foreground">Descripción</p>  
                        <p className="text-sm">{selectedEvent.description}</p>  
                      </div>  
                    )}  
                  </div>  
                    
                  <div className="flex justify-end gap-2 pt-4 border-t border-border">  
                    <Button   
                      variant="ghost"   
                      size="sm"  
                      onClick={() => handleDeleteEvent(selectedEvent.id)}  
                      className="text-destructive hover:text-destructive"  
                    >  
                      <Trash2 className="h-4 w-4 mr-2" />  
                      Eliminar  
                    </Button>  
                    <Button   
                      variant="outline"   
                      size="sm"  
                      onClick={() => setIsEditMode(true)}  
                    >  
                      <Edit className="h-4 w-4 mr-2" />  
                      Editar  
                    </Button>  
                  </div>  
                </>  
              )}  
            </div>  
          )}  
        </DialogContent>  
      </Dialog>  
    </>  
  );  
}