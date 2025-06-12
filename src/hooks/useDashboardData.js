import { api } from "@/services/api"
import { useQuery } from "@tanstack/react-query"


const fetchDashboardData = async () => {
  const response = await api.get("/dashboard/")
  return response.data
}


export function useDashboardData() {
  return useQuery({
    queryKey: ["dashboardData"],
    queryFn: fetchDashboardData,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false, 
  })
}

