import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Nat32 "mo:core/Nat32";
import Char "mo:core/Char";
import Int "mo:core/Int";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Float "mo:core/Float";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Migration "migration";

import Stripe "stripe/stripe";
import OutCall "http-outcalls/outcall";

// Use migration module for upgrade
(with migration = Migration.run)
actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Types
  type Perfume = {
    id : Nat;
    name : Text;
    imageUrl : Text;
    price : Nat;
  };

  type CartItem = {
    perfumeId : Nat;
    quantity : Nat;
  };

  type Order = {
    id : Nat;
    items : [CartItem];
    total : Nat;
    timestamp : Int;
    stripePaymentIntentId : Text;
  };

  type PartnerProduct = {
    id : Nat;
    name : Text;
    imageUrl : Text;
    price : Nat;
    description : Text;
    category : Text;
    partnerPrincipal : Principal;
    status : Text;
    submittedAt : Int;
  };

  type PayoutRecord = {
    id : Nat;
    partnerPrincipal : Principal;
    productName : Text;
    saleAmount : Nat;
    partnerCut : Nat;
    platformCut : Nat;
    timestamp : Int;
  };

  public type UserProfile = {
    name : Text;
  };

  type PartnerStats = {
    totalSales : Nat;
    commission : Nat;
    pendingPayout : Nat;
    referralCode : Text;
  };

  type RefundRequest = {
    id : Nat;
    requesterPrincipal : Principal;
    orderId : Nat;
    reason : Text;
    description : Text;
    status : Text;
    submittedAt : Int;
  };

  type Review = {
    id : Nat;
    reviewerPrincipal : Principal;
    perfumeId : Nat;
    orderId : Nat;
    rating : Nat;
    comment : Text;
    timestamp : Int;
  };

  type EmailCredential = {
    passwordHash : Text;
    salt : Text;
    userId : Nat;
  };

  type SessionData = {
    userId : Nat;
    email : Text;
    createdAt : Int;
    expiresAt : Int;
  };

  public type AuthResult = {
    ok : Bool;
    token : Text;
    message : Text;
  };

  // State
  let perfumeCatalog = Map.empty<Nat, Perfume>();
  let partnerProducts = Map.empty<Nat, PartnerProduct>();
  let carts = Map.empty<Principal, [CartItem]>();
  let orders = Map.empty<Principal, [Order]>();
  let payoutRecords = Map.empty<Principal, [PayoutRecord]>();
  let payoutAccounts = Map.empty<Principal, Text>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let refundRequests = Map.empty<Nat, RefundRequest>();
  let reviews = Map.empty<Nat, Review>();
  let emailCredentials = Map.empty<Text, EmailCredential>();
  let sessions = Map.empty<Text, SessionData>();
  let emailToFakePrincipal = Map.empty<Text, Principal>();

  stable var commissionRate = 15;
  stable var nextOrderId = 1;
  stable var nextProductId = 1;
  stable var nextPayoutId = 1;
  stable var nextRefundId = 1;
  stable var nextReviewId = 1;
  stable var nextUserId = 1;

  var stripeConfiguration : ?Stripe.StripeConfiguration = null;

  // Helper Functions
  // Basic "hash" functions for password hashing (not secure, demonstration only).
  func simpleHash(input : Text) : Text {
    var h : Nat = 5381;
    input.chars().forEach(
      func(c) {
        h := (h * 33 + c.toNat32().toNat()) % 1_000_000_007;
      }
    );
    h.toText();
  };

  func hashPassword(password : Text, salt : Text) : Text {
    simpleHash(password # salt);
  };

  func generateToken(email : Text, timestamp : Int) : Text {
    simpleHash(email # timestamp.toText() # "perf_secret_2024");
  };

  // Email Auth System

  /// Register with email and password.
  public shared ({ caller }) func registerWithEmail(email : Text, password : Text) : async AuthResult {
    if (email == "") {
      return { ok = false; token = ""; message = "Email is required" };
    };

    if (password.size() < 6) {
      return { ok = false; token = ""; message = "Password must be at least 6 characters" };
    };

    switch (emailCredentials.get(email)) {
      case (null) {};
      case (?_) {
        return { ok = false; token = ""; message = "Email already registered" };
      };
    };

    let salt = nextUserId.toText() # email;
    let passwordHash = hashPassword(password, salt);

    let credential : EmailCredential = {
      passwordHash;
      salt;
      userId = nextUserId;
    };

    emailCredentials.add(email, credential);
    nextUserId += 1;

    { ok = true; token = ""; message = "Account created successfully" };
  };

  /// Login with email and password; returns session token.
  public shared ({ caller }) func loginWithEmail(email : Text, password : Text) : async AuthResult {
    switch (emailCredentials.get(email)) {
      case (null) {
        return { ok = false; token = ""; message = "Invalid email or password" };
      };
      case (?cred) {
        let expectedHash = hashPassword(password, cred.salt);
        if (expectedHash != cred.passwordHash) {
          return { ok = false; token = ""; message = "Invalid email or password" };
        };

        let token = generateToken(email, Time.now());
        let expiresAt = Time.now() + (30 * 24 * 60 * 60 * 1_000_000_000);

        let sessionData : SessionData = {
          userId = cred.userId;
          email;
          createdAt = Time.now();
          expiresAt;
        };

        sessions.add(token, sessionData);

        { ok = true; token; message = "Login successful" };
      };
    };
  };

  /// Verify a session token (returns email if valid)
  public query ({ caller }) func verifySession(token : Text) : async ?Text {
    switch (sessions.get(token)) {
      case (null) { null };
      case (?session) {
        if (Time.now() > session.expiresAt) {
          sessions.remove(token);
          null;
        } else {
          ?session.email;
        };
      };
    };
  };

  /// Get the email associated with a session token
  public query ({ caller }) func getSessionEmail(token : Text) : async ?Text {
    switch (sessions.get(token)) {
      case (null) { null };
      case (?session) {
        if (Time.now() > session.expiresAt) { null } else {
          ?session.email;
        };
      };
    };
  };

  /// Logout a session (invalidate token)
  public shared ({ caller }) func logoutSession(token : Text) : async () {
    sessions.remove(token);
  };

  // Adapter for conversion
  func convertPerfumeToShoppingItem(perfume : Perfume) : Stripe.ShoppingItem {
    {
      currency = "USD";
      productName = perfume.name;
      productDescription = "";
      priceInCents = perfume.price;
      quantity = 1;
    };
  };

  // Stripe
  func getStripeConfiguration() : Stripe.StripeConfiguration {
    switch (stripeConfiguration) {
      case (null) { Runtime.trap("Stripe needs to be first configured") };
      case (?value) { value };
    };
  };

  public query ({ caller }) func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    stripeConfiguration := ?config;
  };

  public query func isStripeConfigured() : async Bool {
    stripeConfiguration != null;
  };

  public shared ({ caller }) func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can check session status");
    };
    await Stripe.getSessionStatus(getStripeConfiguration(), sessionId, transform);
  };

  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create checkout sessions");
    };
    await Stripe.createCheckoutSession(getStripeConfiguration(), caller, items, successUrl, cancelUrl, transform);
  };

  // Perfume Catalog
  public shared ({ caller }) func initializePerfumes() : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can initialize perfumes");
    };

    let perfumes : [Perfume] = [
      {
        id = nextProductId;
        name = "Dior Sauvage";
        imageUrl = "https://cdn.ilbisonte.com/image/data/IMG_PRODD/800x800/800x800_HTTP://WWW.ILBISONTE.COM/IMG_PRODD/222222222/2020-11-23-SDS0OB0G-222222222.222222.rabbit.a000.6000.800x800.Phdp.fsn.5001.jpg";
        price = 9500;
      },
      {
        id = nextProductId + 1;
        name = "Chanel No.5";
        imageUrl = "https://cdn.ilbisonte.com/image/data/IMG_PRODD/800x800/800x800_HTTP://WWW.ILBISONTE.COM/IMG_PRODD/222222222/2020-11-23-SDS0OB0G-222222222.222222.rabbit.a000.6000.800x800.Phdp.fsn.5001.jpg";
        price = 12000;
      },
      {
        id = nextProductId + 2;
        name = "Versace Eros";
        imageUrl = "https://cdn.ilbisonte.com/image/data/IMG_PRODD/800x800/800x800_HTTP://WWW.ILBISONTE.COM/IMG_PRODD/222222222/2020-11-23-SDS0OB0G-222222222.222222.rabbit.a000.6000.800x800.Phdp.fsn.5001.jpg";
        price = 11000;
      },
    ];

    perfumes.forEach(func(perfume) { perfumeCatalog.add(perfume.id, perfume) });
    nextProductId += 3;
  };

  public query func getPerfumes() : async [Perfume] {
    perfumeCatalog.values().toArray();
  };

  // Refunds
  public shared ({ caller }) func submitRefundRequest(orderId : Nat, reason : Text, description : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can submit refund requests");
    };

    switch (orders.get(caller)) {
      case (null) { Runtime.trap("You have no orders") };
      case (?userOrders) {
        let hasOrder = userOrders.any(func(order) { order.id == orderId });
        if (not hasOrder) {
          Runtime.trap("Order not found for user");
        };
      };
    };

    let refundRequest : RefundRequest = {
      id = nextRefundId;
      requesterPrincipal = caller;
      orderId;
      reason;
      description;
      status = "pending";
      submittedAt = Time.now();
    };

    refundRequests.add(nextRefundId, refundRequest);
    nextRefundId += 1;
  };

  public query ({ caller }) func getMyRefundRequests() : async [RefundRequest] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view refund requests");
    };

    let myRequests = refundRequests.filter(
      func(_, request) { request.requesterPrincipal == caller }
    );
    myRequests.values().toArray();
  };

  public query ({ caller }) func getAllRefundRequests() : async [RefundRequest] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all refund requests");
    };
    refundRequests.values().toArray();
  };

  public shared ({ caller }) func updateRefundStatus(requestId : Nat, status : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update refund status");
    };

    switch (refundRequests.get(requestId)) {
      case (null) { Runtime.trap("Refund request not found") };
      case (?request) {
        let updatedRequest = { request with status };
        refundRequests.add(requestId, updatedRequest);
      };
    };
  };

  // Shopping Cart
  public shared ({ caller }) func addToCart(perfumeId : Nat, quantity : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can add to cart");
    };

    switch (perfumeCatalog.get(perfumeId)) {
      case (null) { Runtime.trap("Perfume not found") };
      case (?_) {};
    };

    let currentCart = switch (carts.get(caller)) {
      case (null) { [] };
      case (?items) { items };
    };

    let newItem : CartItem = { perfumeId; quantity };
    let updatedCart = currentCart.concat([newItem]);
    carts.add(caller, updatedCart);
  };

  public query ({ caller }) func getCart() : async ?[CartItem] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view cart");
    };
    carts.get(caller);
  };

  public shared ({ caller }) func clearCart() : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can clear cart");
    };
    carts.remove(caller);
  };

  // Orders
  public shared ({ caller }) func placeOrder(stripePaymentIntentId : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can place orders");
    };

    let cart = switch (carts.get(caller)) {
      case (null) { Runtime.trap("Cart is empty") };
      case (?items) { items };
    };

    let total = cart.foldLeft(
      0,
      func(acc, item) {
        acc + getPerfumePrice(item.perfumeId) * item.quantity;
      },
    );

    let newOrder : Order = {
      id = nextOrderId;
      items = cart;
      total;
      timestamp = Time.now();
      stripePaymentIntentId;
    };

    let userOrders = switch (orders.get(caller)) {
      case (null) { [] };
      case (?o) { o };
    };
    let updatedOrders = userOrders.concat([newOrder]);
    orders.add(caller, updatedOrders);

    nextOrderId += 1;
    carts.remove(caller);
  };

  public query ({ caller }) func getOrders() : async [Order] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view orders");
    };
    switch (orders.get(caller)) {
      case (null) { [] };
      case (?userOrders) { userOrders };
    };
  };

  // Partner Products
  public shared ({ caller }) func submitPartnerProduct(
    name : Text,
    imageUrl : Text,
    price : Nat,
    description : Text,
    category : Text,
  ) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can submit partner products");
    };

    let newProduct : PartnerProduct = {
      id = nextProductId;
      name;
      imageUrl;
      price;
      description;
      category;
      partnerPrincipal = caller;
      status = "pending";
      submittedAt = Time.now();
    };

    partnerProducts.add(nextProductId, newProduct);
    nextProductId += 1;
  };

  public query ({ caller }) func getMyPartnerProducts() : async [PartnerProduct] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view partner products");
    };

    let products = partnerProducts.filter(
      func(_, product) { product.partnerPrincipal == caller }
    );
    products.values().toArray();
  };

  public query ({ caller }) func getAllPartnerProducts() : async [PartnerProduct] {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can view all partner products");
    };
    partnerProducts.values().toArray();
  };

  public shared ({ caller }) func updatePartnerProductStatus(productId : Nat, status : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can update product status");
    };

    switch (partnerProducts.get(productId)) {
      case (null) { Runtime.trap("Product not found") };
      case (?product) {
        let updatedProduct = { product with status };
        partnerProducts.add(productId, updatedProduct);
      };
    };
  };

  // Payouts
  public shared ({ caller }) func savePayoutAccount(stripeConnectAccountId : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can save payout accounts");
    };
    payoutAccounts.add(caller, stripeConnectAccountId);
  };

  public query ({ caller }) func getPayoutAccount() : async ?Text {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view payout accounts");
    };
    payoutAccounts.get(caller);
  };

  public query ({ caller }) func getMyPayoutHistory() : async [PayoutRecord] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view payout history");
    };
    switch (payoutRecords.get(caller)) {
      case (null) { [] };
      case (?records) { records };
    };
  };

  public query ({ caller }) func getAllPayoutRecords() : async [PayoutRecord] {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can view all payout records");
    };
    payoutRecords.values().toArray().flatten();
  };

  public query ({ caller }) func getPartnerStats() : async PartnerStats {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only partners can view stats");
    };

    let userRecords = switch (payoutRecords.get(caller)) {
      case (null) { [] };
      case (?records) { records };
    };

    let totalSales = userRecords.foldLeft(0, func(acc, record) { acc + record.saleAmount });
    let commission = userRecords.foldLeft(0, func(acc, record) { acc + record.partnerCut });

    {
      totalSales;
      commission;
      pendingPayout = 0;
      referralCode = caller.toText();
    };
  };

  public query func getCommissionRate() : async Nat {
    commissionRate;
  };

  public shared ({ caller }) func setCommissionRate(rate : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can set commission rate");
    };
    commissionRate := rate;
  };

  // User Profile
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile unless admin");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Reviews
  public shared ({ caller }) func submitReview(perfumeId : Nat, orderId : Nat, rating : Nat, comment : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can submit reviews");
    };

    if (rating < 1 or rating > 5) {
      Runtime.trap("Rating must be between 1 and 5");
    };

    switch (orders.get(caller)) {
      case (null) { Runtime.trap("You have no orders") };
      case (?userOrders) {
        let hasOrder = userOrders.any(func(order) { order.id == orderId });
        if (not hasOrder) {
          Runtime.trap("Order not found for user");
        };
      };
    };

    // Check if user already reviewed this perfume for this order
    let existingReview = reviews.values().find(
      func(review) { review.reviewerPrincipal == caller and review.perfumeId == perfumeId and review.orderId == orderId }
    );

    switch (existingReview) {
      case (?_) { Runtime.trap("You have already reviewed this perfume for this order") };
      case (null) {};
    };

    let review : Review = {
      id = nextReviewId;
      reviewerPrincipal = caller;
      perfumeId;
      orderId;
      rating;
      comment;
      timestamp = Time.now();
    };

    reviews.add(nextReviewId, review);
    nextReviewId += 1;
  };

  public query func getReviewsForPerfume(perfumeId : Nat) : async [Review] {
    let perfumeReviews = reviews.filter(
      func(_, review) { review.perfumeId == perfumeId }
    );
    perfumeReviews.values().toArray();
  };

  public query func getAverageRating(perfumeId : Nat) : async Float {
    let perfumeReviews = reviews.filter(
      func(_, review) { review.perfumeId == perfumeId }
    );

    if (perfumeReviews.isEmpty()) {
      return 0.0;
    };

    let ratings = perfumeReviews.map<Nat, Review, Nat>(
      func(_, review) { review.rating }
    );

    let sum = ratings.values().foldLeft(0, func(acc, rating) { acc + rating });
    sum.toFloat() / perfumeReviews.size().toFloat();
  };

  func getPerfumePrice(perfumeId : Nat) : Nat {
    switch (perfumeCatalog.get(perfumeId)) {
      case (null) { Runtime.trap("Perfume not found") };
      case (?perfume) { perfume.price };
    };
  };
};
