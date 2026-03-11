import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  CartItem,
  DeliveryInfo,
  Order,
  PartnerProduct,
  PartnerStats,
  PayoutRecord,
  Perfume,
  RefundRequest,
  Review,
} from "../backend.d";
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
    queryFn: async (): Promise<Order[]> => {
      if (!actor) return [];
      return actor.getOrders();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useMyOrderDeliveries() {
  const { actor } = useActor();
  return useQuery<Array<[bigint, DeliveryInfo]>>({
    queryKey: ["orderDeliveries"],
    queryFn: async (): Promise<Array<[bigint, DeliveryInfo]>> => {
      if (!actor) return [];
      // Cast needed: backend.ts may not yet expose getMyOrderDeliveries
      const a = actor as unknown as {
        getMyOrderDeliveries: () => Promise<Array<[bigint, DeliveryInfo]>>;
      };
      return a.getMyOrderDeliveries();
    },
    enabled: !!actor,
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

export function usePayoutAccount() {
  const { actor, isFetching } = useActor();
  return useQuery<string | null>({
    queryKey: ["payoutAccount"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getPayoutAccount();
    },
    enabled: !!actor && !isFetching,
  });
}

export function usePayoutHistory() {
  const { actor, isFetching } = useActor();
  return useQuery<PayoutRecord[]>({
    queryKey: ["payoutHistory"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyPayoutHistory();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCommissionRate() {
  const { actor, isFetching } = useActor();
  return useQuery<bigint>({
    queryKey: ["commissionRate"],
    queryFn: async () => {
      if (!actor) return BigInt(15);
      return actor.getCommissionRate();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function usePartnerProducts() {
  const { actor, isFetching } = useActor();
  return useQuery<PartnerProduct[]>({
    queryKey: ["partnerProducts"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyPartnerProducts();
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
    mutationFn: async (stripePaymentIntentId: string) => {
      if (!actor) throw new Error("Not authenticated");
      await actor.placeOrder(stripePaymentIntentId);
      await actor.clearCart();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

export function usePlaceOrderWithDelivery() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      stripePaymentIntentId,
      deliveryType,
      hostelName,
      area,
      roomNumber,
      manualLocation,
    }: {
      stripePaymentIntentId: string;
      deliveryType: string;
      hostelName: string;
      area: string;
      roomNumber: string;
      manualLocation: string;
    }) => {
      if (!actor) throw new Error("Not authenticated");
      // Cast needed: placeOrderWithDelivery exists in backend.d.ts but backend.ts may not be updated
      const a = actor as unknown as {
        placeOrderWithDelivery: (
          id: string,
          dt: string,
          hn: string,
          ar: string,
          rn: string,
          ml: string,
        ) => Promise<void>;
        clearCart: () => Promise<void>;
      };
      await a.placeOrderWithDelivery(
        stripePaymentIntentId,
        deliveryType,
        hostelName,
        area,
        roomNumber,
        manualLocation,
      );
      await a.clearCart();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["orderDeliveries"] });
    },
  });
}

export function useCreateCheckoutSession() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({
      items,
      successUrl,
      cancelUrl,
    }: {
      items: Array<{
        productName: string;
        currency: string;
        quantity: bigint;
        priceInCents: bigint;
        productDescription: string;
      }>;
      successUrl: string;
      cancelUrl: string;
    }) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.createCheckoutSession(items, successUrl, cancelUrl);
    },
  });
}

export function useSavePayoutAccount() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (stripeConnectAccountId: string) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.savePayoutAccount(stripeConnectAccountId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payoutAccount"] });
    },
  });
}

export function useSubmitPartnerProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      name,
      imageUrl,
      price,
      description,
      category,
    }: {
      name: string;
      imageUrl: string;
      price: bigint;
      description: string;
      category: string;
    }) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.submitPartnerProduct(
        name,
        imageUrl,
        price,
        description,
        category,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partnerProducts"] });
    },
  });
}

// ── Refund Requests ──────────────────────────────────────────────────────────

export function useMyRefundRequests() {
  const { actor, isFetching } = useActor();
  return useQuery<RefundRequest[]>({
    queryKey: ["myRefundRequests"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyRefundRequests();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllRefundRequests() {
  const { actor, isFetching } = useActor();
  return useQuery<RefundRequest[]>({
    queryKey: ["allRefundRequests"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllRefundRequests();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSubmitRefundRequest() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      orderId,
      reason,
      description,
    }: {
      orderId: bigint;
      reason: string;
      description: string;
    }) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.submitRefundRequest(orderId, reason, description);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myRefundRequests"] });
      queryClient.invalidateQueries({ queryKey: ["allRefundRequests"] });
    },
  });
}

export function useUpdateRefundStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      requestId,
      status,
    }: {
      requestId: bigint;
      status: string;
    }) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.updateRefundStatus(requestId, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allRefundRequests"] });
      queryClient.invalidateQueries({ queryKey: ["myRefundRequests"] });
    },
  });
}

// ── Reviews & Ratings ────────────────────────────────────────────────────────

export function useReviewsForPerfume(perfumeId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Review[]>({
    queryKey: ["reviews", String(perfumeId)],
    queryFn: async () => {
      if (!actor || perfumeId === null) return [];
      return actor.getReviewsForPerfume(perfumeId);
    },
    enabled: !!actor && !isFetching && perfumeId !== null,
  });
}

export function useAverageRating(perfumeId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<number>({
    queryKey: ["averageRating", String(perfumeId)],
    queryFn: async () => {
      if (!actor || perfumeId === null) return 0;
      return actor.getAverageRating(perfumeId);
    },
    enabled: !!actor && !isFetching && perfumeId !== null,
  });
}

export function useSubmitReview() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      perfumeId,
      orderId,
      rating,
      comment,
    }: {
      perfumeId: bigint;
      orderId: bigint;
      rating: bigint;
      comment: string;
    }) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.submitReview(perfumeId, orderId, rating, comment);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["reviews", String(variables.perfumeId)],
      });
      queryClient.invalidateQueries({
        queryKey: ["averageRating", String(variables.perfumeId)],
      });
    },
  });
}

// ── Admin: User Management ────────────────────────────────────────────────────

export function useAllUserEmails() {
  const { actor, isFetching } = useActor();
  return useQuery<string[]>({
    queryKey: ["allUserEmails"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllUserEmails();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAdminResetPassword() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({
      email,
      newPassword,
    }: {
      email: string;
      newPassword: string;
    }) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.adminResetPassword(email, newPassword);
    },
  });
}
