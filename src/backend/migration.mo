import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";

module {
  type OldEmailCredential = {
    passwordHash : Text;
    salt : Text;
    userId : Nat;
  };

  type NewEmailCredential = {
    passwordHash : Text;
    salt : Text;
    userId : Nat;
    securityQuestion : Text;
    securityAnswerHash : Text;
  };

  type OldActor = {
    perfumeCatalog : Map.Map<Nat, Perfume>;
    partnerProducts : Map.Map<Nat, PartnerProduct>;
    carts : Map.Map<Principal, [CartItem]>;
    orders : Map.Map<Principal, [Order]>;
    payoutRecords : Map.Map<Principal, [PayoutRecord]>;
    payoutAccounts : Map.Map<Principal, Text>;
    userProfiles : Map.Map<Principal, UserProfile>;
    refundRequests : Map.Map<Nat, RefundRequest>;
    reviews : Map.Map<Nat, Review>;
    emailCredentials : Map.Map<Text, OldEmailCredential>;
    sessions : Map.Map<Text, SessionData>;
    emailToFakePrincipal : Map.Map<Text, Principal>;
    commissionRate : Nat;
    nextOrderId : Nat;
    nextProductId : Nat;
    nextPayoutId : Nat;
    nextRefundId : Nat;
    nextReviewId : Nat;
    nextUserId : Nat;
    stripeConfiguration : ?StripeConfiguration;
  };

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

  type UserProfile = {
    name : Text;
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

  type SessionData = {
    userId : Nat;
    email : Text;
    createdAt : Int;
    expiresAt : Int;
  };

  type StripeConfiguration = {
    secretKey : Text;
    allowedCountries : [Text];
  };

  type NewActor = {
    perfumeCatalog : Map.Map<Nat, Perfume>;
    partnerProducts : Map.Map<Nat, PartnerProduct>;
    carts : Map.Map<Principal, [CartItem]>;
    orders : Map.Map<Principal, [Order]>;
    payoutRecords : Map.Map<Principal, [PayoutRecord]>;
    payoutAccounts : Map.Map<Principal, Text>;
    userProfiles : Map.Map<Principal, UserProfile>;
    refundRequests : Map.Map<Nat, RefundRequest>;
    reviews : Map.Map<Nat, Review>;
    emailCredentials : Map.Map<Text, NewEmailCredential>;
    sessions : Map.Map<Text, SessionData>;
    emailToFakePrincipal : Map.Map<Text, Principal>;
    commissionRate : Nat;
    nextOrderId : Nat;
    nextProductId : Nat;
    nextPayoutId : Nat;
    nextRefundId : Nat;
    nextReviewId : Nat;
    nextUserId : Nat;
    stripeConfiguration : ?StripeConfiguration;
  };

  public func run(old : OldActor) : NewActor {
    let newEmailCredentials = old.emailCredentials.map<Text, OldEmailCredential, NewEmailCredential>(
      func(_, oldCred) {
        {
          oldCred with
          securityQuestion = "";
          securityAnswerHash = "";
        };
      }
    );
    {
      old with
      emailCredentials = newEmailCredentials;
    };
  };
};
