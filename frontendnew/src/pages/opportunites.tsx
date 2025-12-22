// src/pages/OpportunitiesEntreprise.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import opportunityStatusColors from "@/config/opportuniteStatusColor";
import { CSS } from "@dnd-kit/utilities";
import { CardTitle } from "@/components/ui/card";

// ===== TYPES =====
interface Opportunity {
  id: number;
  title: string;
  company: string;
  owner: string;
  value: number;
  stage:
    | "Nouveau"
    | "En cours d'étude"
    | "Contrat accepté"
    | "En cours de développement"
    | "Livraison"
    | "Gagné"
    | "Perdu";
  closeDate: string;
  notes: string[];
}

const STAGES: Opportunity["stage"][] = [
  "Nouveau",
  "En cours d'étude",
  "Contrat accepté",
  "En cours de développement",
  "Livraison",
  "Gagné",
  "Perdu",
];

// ===== DRAGGABLE CARD =====
function DraggableOpportunity({
  opportunity,
  onView,
}: {
  opportunity: Opportunity;
  onView: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: opportunity.id.toString() });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    boxShadow: isDragging ? "0 10px 20px rgba(0,0,0,0.2)" : undefined,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <div
        className={`p-4 rounded-xl shadow-md mb-2 bg-white border ${
          isDragging ? "bg-blue-50" : ""
        }`}
      >
        <h2 className="font-semibold text-blue-900">{opportunity.title}</h2>
        <p className="text-sm text-gray-700">{opportunity.company}</p>
        <p className="text-sm text-gray-700">
          <strong>Responsable:</strong> {opportunity.owner}
        </p>
        <p className="text-sm">
          <strong>Valeur:</strong> {opportunity.value.toLocaleString()} €
        </p>
        <p className="text-sm text-gray-600">
          <strong>Clôture:</strong> {opportunity.closeDate}
        </p>

        {/* 📌 Statut */}
        <p className="mt-2 text-sm">
          <strong>Statut:</strong>{" "}
          <Badge
            style={{
              backgroundColor:
                opportunityStatusColors[opportunity.stage].background,
              color: opportunityStatusColors[opportunity.stage].text,
            }}
            variant="secondary"
          >
            {opportunity.stage}
          </Badge>
        </p>

        <Button
          className="w-full bg-blue-800 text-white rounded-xl mt-3 py-1 hover:bg-blue-700"
          onClick={onView}
        >
          <Eye className="w-4 h-4 mr-1 inline" /> Voir
        </Button>
      </div>
    </div>
  );
}

// ===== KANBAN COLUMN =====
function KanbanColumn({
  stage,
  opportunities,
  onView,
}: {
  stage: Opportunity["stage"];
  opportunities: Opportunity[];
  onView: (o: Opportunity) => void;
}) {
  const { setNodeRef } = useDroppable({ id: stage });

  return (
    <div
      ref={setNodeRef}
      className="min-w-[300px] bg-gray-100 rounded-xl p-3 flex flex-col gap-3"
    >
      <div className="flex justify-between items-center mb-2">
        <h3
          className="font-semibold text-gray-700 p-1 rounded"
        >
          {stage}
        </h3>
        <span className="text-sm text-gray-600">
          {opportunities.length} opportunité(s)
        </span>
      </div>

      <SortableContext
        items={opportunities.map((o) => o.id.toString())}
        strategy={verticalListSortingStrategy}
      >
        {opportunities.map((opportunity) => (
          <DraggableOpportunity
            key={opportunity.id}
            opportunity={opportunity}
            onView={() => onView(opportunity)}
          />
        ))}
      </SortableContext>
    </div>
  );
}

// ===== MAIN COMPONENT =====
export default function OpportunitiesEntreprise() {
  const [opportunitiesData, setOpportunitiesData] = useState<Opportunity[]>([
    {
      id: 1,
      title: "Refonte CRM",
      company: "Acme",
      owner: "Aline",
      value: 15000,
      stage: "Nouveau",
      closeDate: "2025-01-20",
      notes: ["Premier contact établi"],
    },
    {
      id: 2,
      title: "Licence logicielle",
      company: "Globex",
      owner: "Bruno",
      value: 9000,
      stage: "Contrat accepté",
      closeDate: "2025-01-18",
      notes: [],
    },
    {
      id: 3,
      title: "Module reporting",
      company: "Innotech",
      owner: "Camille",
      value: 12000,
      stage: "Gagné",
      closeDate: "2025-01-15",
      notes: ["Contrat signé"],
    },
  ]);

  const [search, setSearch] = useState("");
  const [companyFilter, setCompanyFilter] = useState("");
  const [ownerFilter, setOwnerFilter] = useState("");
  const [stageFilter, setStageFilter] = useState("");
  const [selectedOpportunity, setSelectedOpportunity] =
    useState<Opportunity | null>(null);
  const [newNote, setNewNote] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  // ===== FILTER =====
  const filtered = opportunitiesData.filter(
    (o) =>
      o.title.toLowerCase().includes(search.toLowerCase()) &&
      (companyFilter
        ? o.company.toLowerCase().includes(companyFilter.toLowerCase())
        : true) &&
      (ownerFilter ? o.owner === ownerFilter : true) &&
      (stageFilter ? o.stage === stageFilter : true)
  );

  const opportunitiesByStage: Record<Opportunity["stage"], Opportunity[]> = {
    Nouveau: [],
    "En cours d'étude": [],
    "Contrat accepté": [],
    "En cours de développement": [],
    Livraison: [],
    Gagné: [],
    Perdu: [],
  };

  STAGES.forEach((stage) => {
    opportunitiesByStage[stage] = filtered.filter((o) => o.stage === stage);
  });

  // ===== DRAG END =====
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = Number(active.id);
    const activeOpp = opportunitiesData.find((o) => o.id === activeId);
    if (!activeOpp) return;

    const overId = over.id.toString();
    const overOpp = opportunitiesData.find((o) => o.id.toString() === overId);

    const newStage: Opportunity["stage"] =
      overOpp?.stage ?? (overId as Opportunity["stage"]);

    setOpportunitiesData((prev) =>
      prev.map((o) => (o.id === activeId ? { ...o, stage: newStage } : o))
    );

    if (selectedOpportunity?.id === activeId) {
      setSelectedOpportunity({ ...selectedOpportunity, stage: newStage });
    }
  };

  const addNote = () => {
    if (!selectedOpportunity || !newNote.trim()) return;

    setOpportunitiesData((prev) =>
      prev.map((o) =>
        o.id === selectedOpportunity.id
          ? { ...o, notes: [...o.notes, newNote.trim()] }
          : o
      )
    );

    setSelectedOpportunity({
      ...selectedOpportunity,
      notes: [...selectedOpportunity.notes, newNote.trim()],
    });
    setNewNote("");
  };

  return (
    <div className="bg-slate-100 p-6 absolute left-[15%] -z-50 w-[85%] h-full">
      <CardTitle className="text-3xl font-bold text-blue-800 mb-6">Liste des Opportunités</CardTitle>

      {/* FILTERS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 bg-white p-5 rounded-xl shadow-sm border">
        <Input
          placeholder="Recherche..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <Input
          placeholder="Filtrer par entreprise..."
          value={companyFilter}
          onChange={(e) => setCompanyFilter(e.target.value)}
        />

        <Select
          onValueChange={(v) => setStageFilter(v as Opportunity["stage"])}
        >
          <SelectTrigger>
            <SelectValue placeholder="Étape" />
          </SelectTrigger>
          <SelectContent>
            {STAGES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          placeholder="Filtrer par responsable..."
          value={ownerFilter}
          onChange={(e) => setOwnerFilter(e.target.value)}
        />
      </div>

      {/* KANBAN */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {STAGES.map((stage) => (
            <KanbanColumn
              key={stage}
              stage={stage}
              opportunities={opportunitiesByStage[stage]}
              onView={(o) => setSelectedOpportunity(o)}
            />
          ))}
        </div>
      </DndContext>

      {/* MODAL */}
      {selectedOpportunity && (
        <div className="fixed inset-0 bg-[rgb(30,64,175,0.4)] flex justify-center items-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 relative">
            <button
              className="absolute top-3 right-6 text-gray-600 hover:text-gray-900 text-xl font-bold"
              onClick={() => setSelectedOpportunity(null)}
            >
              ×
            </button>

            <h2 className="text-xl font-bold text-blue-800 mb-4">
              {selectedOpportunity.title}
            </h2>

            <p>
              <strong>Société:</strong> {selectedOpportunity.company}
            </p>
            <p>
              <strong>Responsable:</strong> {selectedOpportunity.owner}
            </p>
            <p>
              <strong>Valeur:</strong>{" "}
              {selectedOpportunity.value.toLocaleString()} €
            </p>
            <p>
              <strong>Clôture:</strong> {selectedOpportunity.closeDate}
            </p>

            <div className="flex items-center gap-2 mt-2">
              <span className="font-semibold">Étape:</span>
              <Badge
                style={{
                  backgroundColor:
                    opportunityStatusColors[selectedOpportunity.stage].background,
                  color: opportunityStatusColors[selectedOpportunity.stage].text,
                }}
              >
                {selectedOpportunity.stage}
              </Badge>
            </div>

            <Select
              onValueChange={(v) =>
                setOpportunitiesData((prev) =>
                  prev.map((o) =>
                    o.id === selectedOpportunity.id
                      ? { ...o, stage: v as Opportunity["stage"] }
                      : o
                  )
                )
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Changer l'étape" />
              </SelectTrigger>
              <SelectContent>
                {STAGES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="mt-4">
              <h3 className="font-semibold mb-2">Notes:</h3>

              <div className="max-h-40 overflow-auto border p-2 rounded-md bg-gray-50 space-y-1 mb-3">
                {selectedOpportunity.notes.length === 0 && (
                  <p className="text-gray-500">Aucune note.</p>
                )}
                {selectedOpportunity.notes.map((note, i) => (
                  <div
                    key={i}
                    className="text-sm bg-white p-2 rounded-md border"
                  >
                    {note}
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Input
                  placeholder="Ajouter une note..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                />
                <Button onClick={addNote} className="bg-blue-800 text-white">
                  Ajouter
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
