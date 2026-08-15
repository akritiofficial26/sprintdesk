import { useQuery } from "@tanstack/react-query";
import { fetchBoardTasks } from "./boardApi";
import { useBoardStore } from "../../store/boardStore";

export function useEnsureBoardLoaded() {
  const hasLoaded = useBoardStore((s) => s.hasLoaded);
  const initializeFromApi = useBoardStore((s) => s.initializeFromApi);

  return useQuery({
    queryKey: ["board-tasks"],
    queryFn: fetchBoardTasks,
    enabled: !hasLoaded,
    select: (data) => {
      initializeFromApi(data);
      return data;
    },
  });
}
