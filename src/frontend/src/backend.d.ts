import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface AuthResult {
    ok: boolean;
    token: string;
    message: string;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface RefundRequest {
    id: bigint;
    status: string;
    submittedAt: bigint;
    description: string;
    orderId: bigint;
    requesterPrincipal: Principal;
    reason: string;
}
export interface PayoutRecord {
    id: bigint;
    platformCut: bigint;
    partnerPrincipal: Principal;
    productName: string;
    timestamp: bigint;
    partnerCut: bigint;
    saleAmount: bigint;
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
    stripePaymentIntentId: string;
    items: Array<CartItem>;
}
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface PartnerProduct {
    id: bigint;
    status: string;
    name: string;
    partnerPrincipal: Principal;
    submittedAt: bigint;
    description: string;
    imageUrl: string;
    category: string;
    price: bigint;
}
export interface ShoppingItem {
    productName: string;
    currency: string;
    quantity: bigint;
    priceInCents: bigint;
    productDescription: string;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export type StripeSessionStatus = {
    __kind__: "completed";
    completed: {
        userPrincipal?: string;
        response: string;
    };
} | {
    __kind__: "failed";
    failed: {
        error: string;
    };
};
export interface StripeConfiguration {
    allowedCountries: Array<string>;
    secretKey: string;
}
export interface PartnerStats {
    referralCode: string;
    commission: bigint;
    totalSales: bigint;
    pendingPayout: bigint;
}
export interface CartItem {
    quantity: bigint;
    perfumeId: bigint;
}
export interface Review {
    id: bigint;
    orderId: bigint;
    comment: string;
    timestamp: bigint;
    reviewerPrincipal: Principal;
    rating: bigint;
    perfumeId: bigint;
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
    adminResetPassword(email: string, newPassword: string): Promise<AuthResult>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    clearCart(): Promise<void>;
    createCheckoutSession(items: Array<ShoppingItem>, successUrl: string, cancelUrl: string): Promise<string>;
    getAllPartnerProducts(): Promise<Array<PartnerProduct>>;
    getAllPayoutRecords(): Promise<Array<PayoutRecord>>;
    getAllRefundRequests(): Promise<Array<RefundRequest>>;
    getAllUserEmails(): Promise<Array<string>>;
    getAverageRating(perfumeId: bigint): Promise<number>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCart(): Promise<Array<CartItem> | null>;
    getCommissionRate(): Promise<bigint>;
    getMyPartnerProducts(): Promise<Array<PartnerProduct>>;
    getMyPayoutHistory(): Promise<Array<PayoutRecord>>;
    getMyRefundRequests(): Promise<Array<RefundRequest>>;
    getOrders(): Promise<Array<Order>>;
    getPartnerStats(): Promise<PartnerStats>;
    getPayoutAccount(): Promise<string | null>;
    getPerfumes(): Promise<Array<Perfume>>;
    getReviewsForPerfume(perfumeId: bigint): Promise<Array<Review>>;
    getSecurityQuestion(email: string): Promise<string | null>;
    /**
     * / Get the email associated with a session token
     */
    getSessionEmail(token: string): Promise<string | null>;
    getStripeSessionStatus(sessionId: string): Promise<StripeSessionStatus>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    initializePerfumes(): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    isStripeConfigured(): Promise<boolean>;
    /**
     * / Login with email and password; returns session token.
     */
    loginWithEmail(email: string, password: string): Promise<AuthResult>;
    /**
     * / Logout a session (invalidate token)
     */
    logoutSession(token: string): Promise<void>;
    placeOrder(stripePaymentIntentId: string): Promise<void>;
    /**
     * / Register with email and password.
     */
    registerWithEmail(email: string, password: string, securityQuestion: string, securityAnswer: string): Promise<AuthResult>;
    resetPasswordWithSecurityAnswer(email: string, securityAnswer: string, newPassword: string): Promise<AuthResult>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    savePayoutAccount(stripeConnectAccountId: string): Promise<void>;
    setCommissionRate(rate: bigint): Promise<void>;
    setStripeConfiguration(config: StripeConfiguration): Promise<void>;
    submitPartnerProduct(name: string, imageUrl: string, price: bigint, description: string, category: string): Promise<void>;
    submitRefundRequest(orderId: bigint, reason: string, description: string): Promise<void>;
    submitReview(perfumeId: bigint, orderId: bigint, rating: bigint, comment: string): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    updatePartnerProductStatus(productId: bigint, status: string): Promise<void>;
    updateRefundStatus(requestId: bigint, status: string): Promise<void>;
    /**
     * / Verify a session token (returns email if valid)
     */
    verifySession(token: string): Promise<string | null>;
}
