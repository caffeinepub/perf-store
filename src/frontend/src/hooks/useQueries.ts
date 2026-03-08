import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CartItem, Order, PartnerStats, Perfume } from "../backend.d";
import { useActor } from "./useActor";

export function usePerfumes() {
  const { actor, isFetching } = useActor();
  return useQuery<Perfume[]>({
    queryKey: ["perfumes"],
    queryFn: async () => {
      if (!actor) return [];
      await actor.initializePerfumes();
      return actor.getPerfumes();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCart() {
  const { actor, isFetching } = useActor();
  return useQuery<CartItem[] | null>({
    queryKey: ["cart"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCart();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useOrders() {
  const { actor, isFetching } = useActor();
  return useQuery<Order[]>({
    queryKey: ["orders"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getOrders();
    },
    enabled: !!actor && !isFetching,
  });
}

export function usePartnerStats() {
  const { actor, isFetching } = useActor();
  return useQuery<PartnerStats>({
    queryKey: ["partnerStats"],
    queryFn: async () => {
      if (!actor) throw new Error("No actor");
      return actor.getPartnerStats();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddToCart() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      perfumeId,
      quantity,
    }: {
      perfumeId: bigint;
      quantity: bigint;
    }) => {
      if (!actor) throw new Error("Not authenticated");
      await actor.addToCart(perfumeId, quantity);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
}

export function usePlaceOrder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not authenticated");
      await actor.placeOrder();
      await actor.clearCart();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}
