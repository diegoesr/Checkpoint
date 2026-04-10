"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { reorderUserListEntriesAction } from "@/app/lists/actions";
import type { UserListEntryRecord } from "@/lib/supabase/user-lists";

type Props = {
  listId: string;
  entries: UserListEntryRecord[];
  onRemove: (entryId: string) => void;
  onReorderError: (message: string) => void;
};

function SortableEntryTile({
  entry,
  index,
  disabled,
  onRemove,
}: {
  entry: UserListEntryRecord;
  index: number;
  disabled: boolean;
  onRemove: (entryId: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: entry.id, disabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 40 : undefined,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`group relative overflow-hidden rounded-md border border-[#2f3642] bg-[#1f252d] ${
        isDragging ? "shadow-lg ring-2 ring-emerald-500/50" : ""
      }`}
    >
      <span className="pointer-events-none absolute left-1 top-1 z-10 flex size-6 items-center justify-center rounded bg-black/70 text-[10px] font-bold text-white">
        {index + 1}
      </span>
      <div
        {...attributes}
        {...listeners}
        className="touch-none cursor-grab select-none active:cursor-grabbing"
      >
        <div className="relative aspect-2/3 w-full overflow-hidden bg-[#2a3138]">
          {entry.background_image ? (
            // eslint-disable-next-line @next/next/no-img-element -- URLs RAWG variables
            <img
              src={entry.background_image}
              alt=""
              className="h-full w-full object-cover"
              draggable={false}
            />
          ) : null}
        </div>
      </div>
      <Link
        href={`/games/${entry.rawg_id}`}
        className="hidden px-2 py-2 text-center text-[11px] font-medium leading-tight text-[#c8d0d9] transition hover:text-[#40bcf4] sm:block"
      >
        {entry.game_name}
      </Link>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onRemove(entry.id);
        }}
        aria-label={`Quitar ${entry.game_name} de la lista`}
        className="absolute right-2 top-2 z-20 rounded-lg border border-red-400/35 bg-red-600 px-3 py-2 text-xs font-bold uppercase tracking-wide text-white shadow-md transition hover:bg-red-500 max-sm:opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100 sm:focus-visible:ring-2 sm:focus-visible:ring-red-300/80"
      >
        Quitar
      </button>
    </li>
  );
}

export function SortableListEntriesGrid({
  listId,
  entries,
  onRemove,
  onReorderError,
}: Props) {
  const router = useRouter();
  const [ordered, setOrdered] = useState(entries);
  const [isPersisting, setIsPersisting] = useState(false);

  const entryKey = entries.map((e) => e.id).join("|");
  useEffect(() => {
    setOrdered(entries);
  }, [entryKey, entries]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (isPersisting) return;
    if (!over || active.id === over.id) return;

    setOrdered((prev) => {
      const oldIndex = prev.findIndex((e) => e.id === active.id);
      const newIndex = prev.findIndex((e) => e.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return prev;
      const next = arrayMove(prev, oldIndex, newIndex);

      queueMicrotask(() => {
        setIsPersisting(true);
        void reorderUserListEntriesAction(
          listId,
          next.map((e) => e.id),
        ).then((res) => {
          setIsPersisting(false);
          if (!res.ok) {
            setOrdered(prev);
            onReorderError(res.error);
          } else {
            router.refresh();
          }
        });
      });

      return next;
    });
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={ordered.map((e) => e.id)}
        strategy={rectSortingStrategy}
      >
        <ol
          className={`mt-4 grid list-none grid-cols-4 gap-1 p-0 sm:grid-cols-3 sm:gap-3 md:grid-cols-5 md:gap-3 ${
            isPersisting ? "pointer-events-none opacity-70" : ""
          }`}
        >
          {ordered.map((e, idx) => (
            <SortableEntryTile
              key={e.id}
              entry={e}
              index={idx}
              disabled={isPersisting}
              onRemove={onRemove}
            />
          ))}
        </ol>
      </SortableContext>
    </DndContext>
  );
}
