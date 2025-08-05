import { createFileRoute } from "@tanstack/react-router";  
import { useState, useEffect } from "react";  
import Database from '@tauri-apps/plugin-sql';
import { Button } from "@/components/ui/button";  
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, ChevronLeft, ChevronRight, Edit, Trash2, MoreHorizontal } from "lucide-react";   
import { Input } from "@/components/ui/input";  
import { Label } from "@/components/ui/label";  
import { Textarea } from "@/components/ui/textarea";  
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
  scope?: 'personal' | 'national' | 'worldwide';  
}
  
function Calendar() {  
  const [currentDate, setCurrentDate] = useState(new Date());  
  const [events, setEvents] = useState<Event[]>([]);  
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);  
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);  
  const [isEditMode, setIsEditMode] = useState(false);  
  const [isDateEditable, setIsDateEditable] = useState(true);
  
  const [formData, setFormData] = useState({  
    title: "",  
    description: "",  
    date: "",  
    time: "",  
    color: "#3b82f6",  
  }); 
  
  const resetForm = () => {  
    setFormData({   
      title: "",   
      description: "",   
      date: "",   
      time: "",   
      color: "#3b82f6"   
    });  
    setIsDateEditable(true); // Resetear a editable por defecto  
  };
    
  const eventColors = [  
    { name: "Azul", value: "#3b82f6" },  
    { name: "Verde", value: "#10b981" },  
    { name: "Rojo", value: "#ef4444" },  
    { name: "Amarillo", value: "#f59e0b" },  
    { name: "Púrpura", value: "#8b5cf6" },  
    { name: "Rosa", value: "#ec4899" },  
  ];  

  useEffect(() => {  
    loadEvents();  
  }, [currentDate.getFullYear()]);
  
  const getDaysInMonth = (date: Date) => {  
    const year = date.getFullYear();  
    const month = date.getMonth();  
    const firstDay = new Date(year, month, 1);  
    const lastDay = new Date(year, month + 1, 0);  
    const daysInMonth = lastDay.getDate();  
    const startingDayOfWeek = firstDay.getDay();  
  
    // Obtener días del mes anterior  
    const prevMonth = new Date(year, month - 1, 0);  
    const daysInPrevMonth = prevMonth.getDate();  
  
    const days = [];  
      
    // Días del mes anterior (desvanecidos)  
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {  
      days.push({  
        day: daysInPrevMonth - i,  
        isCurrentMonth: false,  
        isPrevMonth: true,  
        isNextMonth: false  
      });  
    }  
      
    // Días del mes actual  
    for (let day = 1; day <= daysInMonth; day++) {  
      days.push({  
        day: day,  
        isCurrentMonth: true,  
        isPrevMonth: false,  
        isNextMonth: false  
      });  
    }  
      
    // Días del mes siguiente para completar la grilla (42 casillas = 6 semanas)  
    const totalCells = 42;  
    const remainingCells = totalCells - days.length;  
    for (let day = 1; day <= remainingCells; day++) {  
      days.push({  
        day: day,  
        isCurrentMonth: false,  
        isPrevMonth: false,  
        isNextMonth: true  
      });  
    }  
      
    return days;  
  };  

  //Base de datos
  const initDatabase = async () => {  
    const db = await Database.load('sqlite:siv.db');  
      
    // Crear tabla original si no existe  
    await db.execute(`  
      CREATE TABLE IF NOT EXISTS events (  
        id TEXT PRIMARY KEY,  
        title TEXT NOT NULL,  
        description TEXT,  
        date TEXT NOT NULL,  
        time TEXT NOT NULL,  
        color TEXT DEFAULT '#3b82f6'  
      )  
    `);  
      
    // Agregar columna scope si no existe  
    try {  
      await db.execute(`ALTER TABLE events ADD COLUMN scope TEXT DEFAULT 'personal'`);  
    } catch (error) {  
      // La columna ya existe, ignorar error  
      console.log('Column scope already exists');  
    }  
      
    return db;  
  };

  useEffect(() => {  
    loadEvents();  
  }, []);  
  
  const loadEvents = async () => {  
    try {  
      const db = await initDatabase();  
      const personalEvents = await db.select('SELECT * FROM events WHERE scope = "personal" OR scope IS NULL');  
        
      const selectedYear = currentDate.getFullYear(); // Usar el año del calendario  
      const nationalHolidays = await fetchNationalHolidays(selectedYear);  
      const worldwideEvents = await fetchWorldwideEvents(selectedYear);  
        
      const allEvents = [  
        ...personalEvents,  
        ...nationalHolidays,  
        ...worldwideEvents  
      ];  
        
      setEvents(allEvents as Event[]);  
    } catch (error) {  
      console.error('Error loading events:', error);  
    }  
  }; 
  
  const fetchNationalHolidays = async (year: number) => {  
    try {  
      const response = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/VE`);  
      const holidays = await response.json();  
      return holidays.map((holiday: any) => ({  
        id: `national-${holiday.date}`,  
        title: holiday.localName || holiday.name, // Usar localName primero  
        description: `Día feriado nacional: ${holiday.localName || holiday.name}`,  
        date: holiday.date,  
        time: "00:00",  
        color: "#f59e0b",  
        scope: "national"  
      }));  
    } catch (error) {  
      console.error('Error fetching national holidays:', error);  
      return [];  
    }  
  };  
  
  const fetchWorldwideEvents = async (year: number) => {  
    // Eventos mundiales conocidos  
    const worldEvents = [  
      {  
        id: `worldwide-${year}-01-01`,  
        title: "Año Nuevo",  
        description: "Celebración mundial del Año Nuevo",  
        date: `${year}-01-01`,  
        time: "00:00",  
        color: "#ef4444", // Rojo para mundiales  
        scope: "worldwide"  
      },  
      {  
        id: `worldwide-${year}-02-14`,  
        title: "Día de San Valentín",  
        description: "Día Internacional del Amor y la Amistad",  
        date: `${year}-02-14`,  
        time: "00:00",  
        color: "#ef4444",  
        scope: "worldwide"  
      },  
      {  
        id: `worldwide-${year}-03-08`,  
        title: "Día Internacional de la Mujer",  
        description: "Día Internacional de la Mujer",  
        date: `${year}-03-08`,  
        time: "00:00",  
        color: "#ef4444",  
        scope: "worldwide"  
      },  
      {  
        id: `worldwide-${year}-04-22`,  
        title: "Día de la Tierra",  
        description: "Día Mundial de la Tierra",  
        date: `${year}-04-22`,  
        time: "00:00",  
        color: "#ef4444",  
        scope: "worldwide"  
      },  
      {  
        id: `worldwide-${year}-12-25`,  
        title: "Navidad",  
        description: "Celebración mundial de la Navidad",  
        date: `${year}-12-25`,  
        time: "00:00",  
        color: "#ef4444",  
        scope: "worldwide"  
      }  
    ];  
    return worldEvents;  
  };

  const cacheHolidays = async (holidays: Event[], year: number) => {  
    const db = await Database.load('sqlite:siv.db');  
      
    // Crear tabla para cache si no existe  
    await db.execute(`  
      CREATE TABLE IF NOT EXISTS holiday_cache (  
        id TEXT PRIMARY KEY,  
        year INTEGER,  
        data TEXT,  
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP  
      )  
    `);  
      
    // Guardar holidays del año  
    await db.execute(  
      'INSERT OR REPLACE INTO holiday_cache (id, year, data) VALUES (?, ?, ?)',  
      [`holidays-${year}`, year, JSON.stringify(holidays)]  
    );  
  };  
    
  const getCachedHolidays = async (year: number) => {  
    const db = await Database.load('sqlite:siv.db');  
    const result = await db.select(  
      'SELECT data FROM holiday_cache WHERE year = ? AND created_at > datetime("now", "-30 days")',  
      [year]  
    );  
      
    if (result.length > 0) {  
      return JSON.parse(result[0].data);  
    }  
    return null;  
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
  
  const handleCreateEvent = async () => {  
    if (formData.title && formData.date && formData.time) {  
      const newEvent: Event = {  
        id: Date.now().toString(),  
        ...formData,  
      };  
        
      try {  
        const db = await Database.load('sqlite:siv.db');  
        await db.execute(  
          'INSERT INTO events (id, title, description, date, time, color) VALUES (?, ?, ?, ?, ?, ?)',  
          [newEvent.id, newEvent.title, newEvent.description, newEvent.date, newEvent.time, newEvent.color]  
        );  
          
        setEvents([...events, newEvent]);  
        setFormData({ title: "", description: "", date: "", time: "", color: "#3b82f6" });  
        setIsCreateDialogOpen(false);  
      } catch (error) {  
        console.error('Error creating event:', error);  
      }  
    }  
  };  
  
  const handleEditEvent = async () => {  
    if (selectedEvent && formData.title && formData.date && formData.time) {  
      try {  
        const db = await Database.load('sqlite:siv.db');  
        await db.execute(  
          'UPDATE events SET title = ?, description = ?, date = ?, time = ?, color = ? WHERE id = ?',  
          [formData.title, formData.description, formData.date, formData.time, formData.color, selectedEvent.id]  
        );  
          
        setEvents(events.map(event =>   
          event.id === selectedEvent.id   
            ? { ...selectedEvent, ...formData }  
            : event  
        ));  
        setIsEditMode(false);  
        setIsViewDialogOpen(false);  
        setSelectedEvent(null);  
      } catch (error) {  
        console.error('Error updating event:', error);  
      }  
    }  
  };  
  
  const handleDeleteEvent = async (eventId: string) => {  
    try {  
      const db = await Database.load('sqlite:siv.db');  
      await db.execute('DELETE FROM events WHERE id = ?', [eventId]);  
        
      setEvents(events.filter(event => event.id !== eventId));  
      setIsViewDialogOpen(false);  
      setSelectedEvent(null);  
    } catch (error) {  
      console.error('Error deleting event:', error);  
    }  
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
              
            <Dialog   
                open={isCreateDialogOpen}   
                onOpenChange={(open) => {  
                    setIsCreateDialogOpen(open);  
                    if (!open) resetForm();  
                }}  
            > 
              <DialogTrigger asChild>  
                <Button   
                    className="gap-2"  
                    onClick={() => {  
                      const today = new Date();  
                      const todayStr = today.toISOString().split('T')[0];  
                      setFormData({  
                        ...formData,  
                        date: todayStr,  
                        time: "09:00"  
                      });  
                      setIsDateEditable(true); // Permitir edición  
                    }}  
                >  
                    <Plus className="h-4 w-4" />  
                    Crear Evento
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
                        disabled={!isDateEditable}  
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
            {getDaysInMonth(currentDate).map((dayObj, index) => (  
              <div  
                key={index}  
                className={`min-h-[120px] border-r border-b border-border relative group hover:bg-accent/70 transition-colors ${  
                  !dayObj.isCurrentMonth ? 'bg-muted/20' : ''  
                } ${  
                  dayObj.isCurrentMonth && (index % 7 === 0 || index % 7 === 6) ? 'bg-muted/10' : ''  
                }`}  
              >  
                <>  
                  <div className={`p-2 text-sm ${  
                    dayObj.isCurrentMonth && isToday(dayObj.day)   
                      ? 'bg-primary text-primary-foreground rounded-full w-7 h-7 flex items-center justify-center font-medium m-1'   
                      : dayObj.isCurrentMonth   
                        ? 'font-normal text-foreground'  
                        : 'font-normal text-muted-foreground/50'  
                  }`}>  
                    {dayObj.day}  
                  </div>  
                    
                  {dayObj.isCurrentMonth && (  
                    <>  
                      <div className="px-1 space-y-1">  
                        {getEventsForDay(dayObj.day).slice(0, 3).map(event => (  
                          <div  
                            key={event.id}  
                            className="text-xs px-2 py-1 rounded text-white cursor-pointer hover:opacity-80 transition-opacity truncate"  
                            style={{ backgroundColor: event.color || "#3b82f6" }}  
                            onClick={() => openEventDetails(event)}  
                          >  
                            {event.scope === 'national' && '🇻🇪 '}  
                            {event.scope === 'worldwide' && '🌍 '}  
                            {event.title}  
                          </div>  
                        ))} 
                          
                        {getEventsForDay(dayObj.day).length > 3 && (  
                          <div className="text-xs text-muted-foreground px-2 py-1">  
                            +{getEventsForDay(dayObj.day).length - 3} más  
                          </div>  
                        )}  
                      </div>  
                        
                      {/* Botón flotante para agregar evento */}  
                      <button  
                        className="absolute bottom-2 right-2 w-6 h-6 bg-primary text-primary-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs hover:bg-primary/90"  
                        onClick={() => {  
                          setFormData({  
                            ...formData,  
                            date: formatDateForInput(currentDate, dayObj.day),  
                            time: "09:00"  
                          });  
                          setIsDateEditable(false); // Deshabilitar edición  
                          setIsCreateDialogOpen(true);  
                        }}  
                        >  
                        <Plus className="h-3 w-3" />  
                      </button>  
                    </>  
                  )}  
                </>  
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