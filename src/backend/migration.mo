import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";

module {
  // Type definitions tailored for migration
  type OldPerfume = {
    id : Nat;
    name : Text;
    imageUrl : Text;
    price : Nat;
  };

  type OldCartItem = {
    perfumeId : Nat;
    quantity : Nat;
  };

  type OldOrder = {
    id : Nat;
    items : [OldCartItem];
    total : Nat;
    timestamp : Int;
    stripePaymentIntentId : Text;
  };

  type OldPartnerProduct = {
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

  type OldPayoutRecord = {
    id : Nat;
    partnerPrincipal : Principal;
    productName : Text;
    saleAmount : Nat;
    partnerCut : Nat;
    platformCut : Nat;
    timestamp : Int;
  };

  type OldUserProfile = {
    name : Text;
  };

  type OldPartnerStats = {
    totalSales : Nat;
    commission : Nat;
    pendingPayout : Nat;
    referralCode : Text;
  };

  type OldRefundRequest = {
    id : Nat;
    requesterPrincipal : Principal;
    orderId : Nat;
    reason : Text;
    description : Text;
    status : Text;
    submittedAt : Int;
  };

  type OldReview = {
    id : Nat;
    reviewerPrincipal : Principal;
    perfumeId : Nat;
    orderId : Nat;
    rating : Nat;
    comment : Text;
    timestamp : Int;
  };

  type OldActor = {
    perfumeCatalog : Map.Map<Nat, OldPerfume>;
    partnerProducts : Map.Map<Nat, OldPartnerProduct>;
    carts : Map.Map<Principal, [OldCartItem]>;
    orders : Map.Map<Principal, [OldOrder]>;
    payoutRecords : Map.Map<Principal, [OldPayoutRecord]>;
    payoutAccounts : Map.Map<Principal, Text>;
    userProfiles : Map.Map<Principal, OldUserProfile>;
    refundRequests : Map.Map<Nat, OldRefundRequest>;
    reviews : Map.Map<Nat, OldReview>;
    commissionRate : Nat;
    nextOrderId : Nat;
    nextProductId : Nat;
    nextPayoutId : Nat;
    nextRefundId : Nat;
    nextReviewId : Nat;
    stripeConfiguration : ?{
      secretKey : Text;
      allowedCountries : [Text];
    };
  };

  // New types for the current actor state
  type NewPerfume = {
    id : Nat;
    name : Text;
    imageUrl : Text;
    price : Nat;
  };

  type NewCartItem = {
    perfumeId : Nat;
    quantity : Nat;
  };

  type NewOrder = {
    id : Nat;
    items : [NewCartItem];
    total : Nat;
    timestamp : Int;
    stripePaymentIntentId : Text;
  };

  type NewPartnerProduct = {
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

  type NewPayoutRecord = {
    id : Nat;
    partnerPrincipal : Principal;
    productName : Text;
    saleAmount : Nat;
    partnerCut : Nat;
    platformCut : Nat;
    timestamp : Int;
  };

  type NewUserProfile = {
    name : Text;
  };

  type NewPartnerStats = {
    totalSales : Nat;
    commission : Nat;
    pendingPayout : Nat;
    referralCode : Text;
  };

  type NewRefundRequest = {
    id : Nat;
    requesterPrincipal : Principal;
    orderId : Nat;
    reason : Text;
    description : Text;
    status : Text;
    submittedAt : Int;
  };

  type NewReview = {
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

  type NewActor = {
    perfumeCatalog : Map.Map<Nat, NewPerfume>;
    partnerProducts : Map.Map<Nat, NewPartnerProduct>;
    carts : Map.Map<Principal, [NewCartItem]>;
    orders : Map.Map<Principal, [NewOrder]>;
    payoutRecords : Map.Map<Principal, [NewPayoutRecord]>;
    payoutAccounts : Map.Map<Principal, Text>;
    userProfiles : Map.Map<Principal, NewUserProfile>;
    refundRequests : Map.Map<Nat, NewRefundRequest>;
    reviews : Map.Map<Nat, NewReview>;
    commissionRate : Nat;
    nextOrderId : Nat;
    nextProductId : Nat;
    nextPayoutId : Nat;
    nextRefundId : Nat;
    nextReviewId : Nat;
    nextUserId : Nat;
    stripeConfiguration : ?{
      secretKey : Text;
      allowedCountries : [Text];
    };
    emailCredentials : Map.Map<Text, EmailCredential>;
    sessions : Map.Map<Text, SessionData>;
    emailToFakePrincipal : Map.Map<Text, Principal>;
  };

  // Migration function
  public func run(old : OldActor) : NewActor {
    {
      old with
      perfumeCatalog = old.perfumeCatalog;
      partnerProducts = old.partnerProducts;
      carts = old.carts;
      orders = old.orders;
      payoutRecords = old.payoutRecords;
      payoutAccounts = old.payoutAccounts;
      userProfiles = old.userProfiles;
      refundRequests = old.refundRequests;
      reviews = old.reviews;
      nextUserId = 1;
      emailCredentials = Map.empty<Text, EmailCredential>();
      sessions = Map.empty<Text, SessionData>();
      emailToFakePrincipal = Map.empty<Text, Principal>();
    };
  };
};
