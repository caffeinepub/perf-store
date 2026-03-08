import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  type Perfume = {
    id : Nat;
    name : Text;
    imageUrl : Text;
    price : Nat; // Price in dollars
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
  };

  type PartnerStats = {
    totalSales : Nat;
    commission : Nat;
    referralCode : Text;
  };

  public type UserProfile = {
    name : Text;
  };

  let perfumeCatalog = Map.empty<Nat, Perfume>();
  var nextOrderId = 1;

  let carts = Map.empty<Principal, [CartItem]>();
  let orders = Map.empty<Principal, [Order]>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func initializePerfumes() : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can initialize perfumes");
    };

    let perfumes : [Perfume] = [
      {
        id = 1;
        name = "Dior Sauvage";
        imageUrl = "https://cdn.ilbisonte.com/image/data/IMG_PRODD/800x800/800x800_HTTP://WWW.ILBISONTE.COM/IMG_PRODD/222222222/2020-11-23-SDS0OB0G-222222222.222222.rabbit.a000.6000.800x800.Phdp.fsn.5001.jpg";
        price = 95;
      },
      {
        id = 2;
        name = "Chanel No.5";
        imageUrl = "https://cdn.ilbisonte.com/image/data/IMG_PRODD/800x800/800x800_HTTP://WWW.ILBISONTE.COM/IMG_PRODD/222222222/2020-11-23-SDS0OB0G-222222222.222222.rabbit.a000.6000.800x800.Phdp.fsn.5001.jpg";
        price = 120;
      },
      {
        id = 3;
        name = "Versace Eros";
        imageUrl = "https://cdn.ilbisonte.com/image/data/IMG_PRODD/800x800/800x800_HTTP://WWW.ILBISONTE.COM/IMG_PRODD/222222222/2020-11-23-SDS0OB0G-222222222.222222.rabbit.a000.6000.800x800.Phdp.fsn.5001.jpg";
        price = 110;
      },
    ];

    perfumes.forEach(
      func(perfume) {
        perfumeCatalog.add(perfume.id, perfume);
      }
    );
  };

  public query ({ caller }) func getPerfumes() : async [Perfume] {
    perfumeCatalog.values().toArray();
  };

  public shared ({ caller }) func addToCart(perfumeId : Nat, quantity : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can add to cart");
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

  public shared ({ caller }) func placeOrder() : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can place orders");
    };

    let cart = switch (carts.get(caller)) {
      case (null) { Runtime.trap("Cart is empty") };
      case (?items) { items };
    };

    let total = cart.foldLeft(0, func(acc, item) { acc + getPerfumePrice(item.perfumeId) * item.quantity });

    let newOrder : Order = {
      id = nextOrderId;
      items = cart;
      total;
      timestamp = Time.now();
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

  public query ({ caller }) func getPartnerStats() : async PartnerStats {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only partners can view stats");
    };

    let userOrders = switch (orders.get(caller)) {
      case (null) { [] };
      case (?o) { o };
    };

    let totalSales = userOrders.foldLeft(0, func(acc, order) { acc + order.total });
    let commission = totalSales / 10;
    let referralCode = caller.toText();

    {
      totalSales;
      commission;
      referralCode;
    };
  };

  func getPerfumePrice(perfumeId : Nat) : Nat {
    switch (perfumeCatalog.get(perfumeId)) {
      case (null) { Runtime.trap("Perfume not found") };
      case (?perfume) { perfume.price };
    };
  };
};
