import { toast } from "sonner";
import { useStore } from "@/store";
import type { Task, Document, UniversityApplication } from "@/types";

/**
 * Soft-delete with undo toast (5s).
 * Removes the entity, then offers Undo which puts it back into the store.
 */
export function removeWithUndo(
  kind: "task" | "document" | "university",
  entity: Task | Document | UniversityApplication,
) {
  const s = useStore.getState();
  if (kind === "task") s.removeTask((entity as Task).id);
  if (kind === "document") s.removeDocument((entity as Document).id);
  if (kind === "university") s.removeUniversity((entity as UniversityApplication).id);

  const label =
    kind === "task" ? "Задача удалена"
    : kind === "document" ? "Документ удалён"
    : "Университет удалён";

  toast(label, {
    duration: 5000,
    action: {
      label: "Отменить",
      onClick: () => {
        const cur = useStore.getState();
        if (kind === "task") {
          const t = entity as Task;
          // Re-insert preserving id and createdAt.
          useStore.setState({ tasks: [...cur.tasks, t] });
        } else if (kind === "document") {
          useStore.setState({ documents: [...cur.documents, entity as Document] });
        } else {
          useStore.setState({ universities: [...cur.universities, entity as UniversityApplication] });
        }
      },
    },
  });
}
