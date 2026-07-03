import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, FileText, FileSpreadsheet, FileImage } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { SkeletonLoader } from "@/components/demo/SkeletonLoader";
import { NOTES_DATA, FILES_DATA } from "@/lib/demo-data";

export const DemoNotes = () => {
  const [loading, setLoading] = useState(true);
  const [selectedNoteId, setSelectedNoteId] = useState(NOTES_DATA[0].id);
  const [showSidebar, setShowSidebar] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const selectedNote = NOTES_DATA.find(n => n.id === selectedNoteId)!;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <h2 className="text-xl md:text-2xl font-black tracking-tight">Notes & Files</h2>
        <Button className="w-full md:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          New Note
        </Button>
      </div>

      <Tabs defaultValue="notes">
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="notes" className="text-xs md:text-sm">Notes</TabsTrigger>
          <TabsTrigger value="files" className="text-xs md:text-sm">Files</TabsTrigger>
        </TabsList>

        <TabsContent value="notes" className="mt-6">
          {loading ? (
            <div className="flex flex-col lg:flex-row gap-4 h-[500px]">
              <div className="w-full lg:w-72 flex-shrink-0 space-y-3">
                {[1,2,3,4,5,6].map(i => <SkeletonLoader key={i} className="h-14 rounded-xl" />)}
              </div>
              <SkeletonLoader className="flex-1 rounded-2xl" />
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-4 h-[500px]">
              {/* Notes sidebar */}
              <div className="w-full lg:w-72 flex-shrink-0 border border-border rounded-2xl bg-card overflow-y-auto">
                {NOTES_DATA.map((note, i) => (
                  <motion.button
                    key={note.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => {
                      setSelectedNoteId(note.id);
                    }}
                    className={`w-full text-left p-4 border-b border-border transition-all ${
                      selectedNoteId === note.id
                        ? "bg-primary/5"
                        : "hover:bg-muted/50"
                    }`}
                  >
                    <p className="font-bold truncate">{note.title}</p>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {note.content}
                    </p>
                  </motion.button>
                ))}
              </div>

              {/* Note editor */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedNoteId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex-1 border border-border rounded-2xl bg-card p-6 md:p-8 overflow-y-auto"
                >
                  <h3 className="text-2xl font-black mb-6">{selectedNote.title}</h3>
                  <div className="whitespace-pre-wrap text-muted-foreground">
                    {selectedNote.content}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          )}
        </TabsContent>

        <TabsContent value="files" className="mt-6">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[1,2,3,4].map(i => <SkeletonLoader key={i} className="h-40 rounded-2xl" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {FILES_DATA.map((file, i) => {
                const Icon =
                  file.type === "pdf" ? FileText :
                  file.type === "xlsx" ? FileSpreadsheet :
                  FileImage;
                return (
                  <motion.div
                    key={file.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="p-6 rounded-2xl border border-border bg-card text-center hover:shadow-md transition-shadow"
                  >
                    <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Icon className="w-6 h-6" />
                    </div>
                    <p className="font-bold truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">{file.size}</p>
                  </motion.div>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
