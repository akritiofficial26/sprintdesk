
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchBoardTasks } from "./boardApi";
import { useBoardStore } from "../../store/boardStore";


export function useEnsureBoardLoaded() {
  const hasLoaded = useBoardStore((s) => s.hasLoaded);
  const initializeFromApi = useBoardStore((s) => s.initializeFromApi);

  const query = useQuery({
    queryKey: ["board-tasks"],
    queryFn: fetchBoardTasks,
    enabled: !hasLoaded,
    staleTime: Infinity,
  });

  const { data } = query;

  useEffect(() => {
    if (data) initializeFromApi(data);
  }, [data, initializeFromApi]);

  return query;
}
