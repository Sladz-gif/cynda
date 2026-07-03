import { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";
import { GripVertical, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { SkeletonLoader } from "@/components/demo/SkeletonLoader";
import { CRM_PIPELINE_COLUMNS, CRM_DEALS, CRM_CONTACTS } from "@/lib/demo-data";
import { cn } from "@/lib/utils";

interface SortableDealProps {
  id: string;
  deal: any;
}

const SortableDeal = ({ id, deal }: SortableDealProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="p-4 mb-3 bg-card border border-border rounded-xl cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
    >
      <div className="flex items-start gap-2">
        <GripVertical className="w-4 h-4 text-muted-foreground mt-0.5" />
        <div className="flex-1">
          <p className="font-bold text-sm">{deal.company}</p>
          <p className="text-xs text-muted-foreground mt-1">GHS {deal.value.toLocaleString()}</p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              {deal.assignee}
            </span>
            <span className="text-[10px] text-muted-foreground">
              {deal.daysInStage}d in stage
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const DemoCRM = () => {
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [deals, setDeals] = useState(CRM_DEALS);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    
    if (!over) return;
    
    if (active.id !== over.id) {
      // Check if it's a column (over.id is a column) or a deal
      const activeDeal = deals.find((d) => d.id === active.id);
      
      if (activeDeal) {
        const overColumnId = CRM_PIPELINE_COLUMNS.find(col => col.id === over.id) 
          ? over.id 
          : deals.find(d => d.id === over.id)?.columnId;
        
        if (overColumnId) {
          setDeals((prev) =>
            prev.map((d) =>
              d.id === active.id ? { ...d, columnId: overColumnId } : d
            )
          );
        } else {
          // Reordering in same column
          const oldIndex = deals.findIndex((d) => d.id === active.id);
          const newIndex = deals.findIndex((d) => d.id === over.id);
          setDeals((prev) => arrayMove(prev, oldIndex, newIndex));
        }
      }
    }
    
    setActiveId(null);
  };

  const activeDeal = activeId ? deals.find(d => d.id === activeId) : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <h2 className="text-xl md:text-2xl font-black tracking-tight">CRM</h2>
        <Button className="w-full md:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Add Contact
        </Button>
      </div>

      <Tabs defaultValue="pipeline">
        <TabsList className="w-full">
          <TabsTrigger value="pipeline" className="flex-1">Pipeline</TabsTrigger>
          <TabsTrigger value="contacts" className="flex-1">Contacts</TabsTrigger>
        </TabsList>

        <TabsContent value="pipeline" className="mt-6">
          {loading ? (
            <div className="flex gap-4 overflow-x-auto pb-4">
              {CRM_PIPELINE_COLUMNS.map((col) => (
                <div key={col.id} className="w-64 md:w-72 flex-shrink-0">
                  <SkeletonLoader className="h-8 mb-4" />
                  <div className="space-y-3">
                    {[1,2,3].map(i => (
                      <SkeletonLoader key={i} className="h-32 rounded-xl" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <div className="flex gap-4 overflow-x-auto pb-4">
                {CRM_PIPELINE_COLUMNS.map((column) => {
                  const columnDeals = deals.filter(d => d.columnId === column.id);
                  return (
                    <div
                      key={column.id}
                      className="w-64 md:w-72 flex-shrink-0"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold uppercase tracking-widest text-sm text-muted-foreground">
                          {column.title}
                        </h3>
                        <span className="bg-muted text-muted-foreground text-xs font-bold px-2 py-1 rounded-full">
                          {columnDeals.length}
                        </span>
                      </div>
                      <SortableContext
                        items={columnDeals.map(d => d.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        <div className="min-h-[300px] md:min-h-[400px] p-3 bg-muted/30 rounded-xl">
                          {columnDeals.map((deal) => (
                            <SortableDeal key={deal.id} id={deal.id} deal={deal} />
                          ))}
                        </div>
                      </SortableContext>
                    </div>
                  );
                })}
              </div>

              <DragOverlay>
                {activeDeal ? (
                  <div className="p-4 bg-card border-2 border-primary rounded-xl shadow-2xl">
                    <p className="font-bold text-sm">{activeDeal.company}</p>
                    <p className="text-xs text-muted-foreground mt-1">GHS {activeDeal.value.toLocaleString()}</p>
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          )}
        </TabsContent>

        <TabsContent value="contacts" className="mt-6">
          {loading ? (
            <div className="space-y-3">
              {[1,2,3,4,5].map(i => (
                <SkeletonLoader key={i} className="h-16 rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {CRM_CONTACTS.map((contact, i) => (
                <motion.div
                  key={contact.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-4 rounded-xl border border-border bg-card flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold flex-shrink-0">
                      {contact.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold">{contact.name}</p>
                      <p className="text-sm text-muted-foreground">{contact.company}</p>
                    </div>
                  </div>
                  <div className="text-left md:text-right text-sm w-full md:w-auto">
                    <p className="break-all">{contact.email}</p>
                    <p className="text-muted-foreground">{contact.phone}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
