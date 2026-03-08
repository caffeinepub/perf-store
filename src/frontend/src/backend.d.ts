import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface CartItem {
    quantity: bigint;
    perfumeId: bigint;
}
export interface PartnerStats {
    referralCode: string;
    commission: bigint;
    totalSales: bigint;
}
export interface Perfume {
    id: bigint;
    name: string;
    imageUrl: string;
    price: bigint;
}
export interface Order {
    id: bigint;
    total: bigint;
    timestamp: bigint;
    items: Array<CartItem>;
}
export interface UserProfile {
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addToCart(perfumeId: bigint, quantity: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    clearCart(): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCart(): Promise<Array<CartItem> | null>;
    getOrders(): Promise<Array<Order>>;
    getPartnerStats(): Promise<PartnerStats>;
    getPerfumes(): Promise<Array<Perfume>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    initializePerfumes(): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    placeOrder(): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
}
