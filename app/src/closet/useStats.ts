import { closet } from "@stellar-scaffold/app-lib/clients"
import { useQuery } from "@tanstack/react-query"

/** Live count of registered units; shows a dash when the read fails. */
export const useStats = () => {
	const query = useQuery({
		queryKey: ["closet", "item_count"],
		queryFn: async () => {
			const tx = await closet.item_count()
			return Number(tx.result)
		},
		retry: 1,
		staleTime: 30_000,
	})
	return {
		itemCount: query.isSuccess ? String(query.data) : "-",
	}
}
