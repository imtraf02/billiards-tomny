import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/eden";
import type { 
	CreateProductInput, 
	CreateCategoryInput, 
	UpdateCategoryInput,
	GetProductsQuery,
	GetInventoryLogsQuery
} from "@/shared/schemas/product";

interface GetProductsParams {
  search?: string;
  category?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export function useGetProducts(params?: GetProductsParams) {
  return useQuery({
    queryKey: ["products", params],
    queryFn: async () => {
      const res = await api.products.get({
        query: {
          search: params?.search,
          category: params?.category,
          status: params?.status,
          page: params?.page || 1,
          limit: params?.limit || 12,
        },
      });
      
      if (res.status === 200) {
        return res.data;
      }
      
      return {
        data: [],
        meta: { total: 0, page: 1, limit: 12, totalPages: 1 },
      };
    },
  });
}

export function useGetCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await api.products.categories.get();
      if (res.status === 200) {
        return res.data;
      }
      return [];
    },
  });
}

export function useCreateCategory(onSuccess?: () => void) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (data: CreateCategoryInput) => {
			const res = await api.products.categories.post(data);
			if (res.error) throw res.error;
			return res.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["categories"] });
			onSuccess?.();
		},
	});
}

export function useUpdateCategory(onSuccess?: () => void) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({ id, data }: { id: string; data: UpdateCategoryInput }) => {
			const res = await api.products.categories({ id }).put(data);
			if (res.error) throw res.error;
			return res.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["categories"] });
			onSuccess?.();
		},
	});
}

export function useDeleteCategory(onSuccess?: () => void) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (id: string) => {
			const res = await api.products.categories({ id }).delete();
			if (res.error) throw res.error;
			return res.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["categories"] });
			queryClient.invalidateQueries({ queryKey: ["products"] });
			onSuccess?.();
		},
	});
}

export function useCreateProduct(onSuccess?: () => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateProductInput) => {
      const res = await api.products.post(data);
      if (res.error) throw res.error;
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      onSuccess?.();
    },
  });
}

export function useUpdateProduct(onSuccess?: () => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: CreateProductInput;
    }) => {
      const res = await api.products({ id }).patch(data);
      if (res.error) throw res.error;
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      onSuccess?.();
    },
  });
}

export function useDeleteProduct(onSuccess?: () => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.products({ id }).delete();
      if (res.error) throw res.error;
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      onSuccess?.();
    },
  });
}

export function useGetAllProducts(query: any = {}) {
  return useQuery({
    queryKey: ["products", "all", query],
    queryFn: async () => {
      const res = await api.products.get({ query });
      if (res.status === 200) {
        return res.data;
      }
      return { data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } };
    },
  });
}

// Hook cho inventory (nhập/xuất kho)
interface InventoryInput {
  productId: string;
  quantity: number;
  type: "IMPORT" | "EXPORT";
  note?: string;
}

export function useUpdateInventory(onSuccess?: () => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InventoryInput) => {
      const res = await api.products.inventory.post(data);
      if (res.error) throw res.error;
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      onSuccess?.();
    },
  });
}

// Hook cho inventory logs
export function useGetInventoryLogs(productId?: string) {
  return useQuery({
    queryKey: ["inventory-logs", productId],
    queryFn: async () => {
      const res = await api.products.inventory.get({
        query: productId ? { productId } : undefined,
      });
      if (res.status === 200) {
        return res.data;
      }
      return [];
    },
    enabled: !!productId, // Chỉ chạy khi có productId
  });
}

export function useGetInventoryLogs(query: Partial<GetInventoryLogsQuery> = {}) {
	return useQuery({
		queryKey: ["inventory-logs", query],
		queryFn: async () => {
			const res = await api.products.inventory.get({ query });
			if (res.status === 200) {
				return res.data;
			}
			return { data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } };
		},
	});
}
