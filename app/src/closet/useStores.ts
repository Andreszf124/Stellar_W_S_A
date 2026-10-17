import { useQuery } from "@tanstack/react-query"
import { fetchStores } from "../lib/supabase"

/** Store directory; failures surface as isError and never throw. */
export const useStores = () =>
	useQuery({
		queryKey: ["stores"],
		queryFn: fetchStores,
		retry: 1,
		staleTime: 60_000,
	})
