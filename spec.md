# Perf Store

## Current State
OrdersPage shows order cards with items, delivery location, delivery fee badge, refund/review actions. Each order has a hardcoded "Delivered" status badge.

## Requested Changes (Diff)

### Add
- Delivery status tracker on each order card showing stages: Order Placed → Processing → Out for Delivery → Delivered
- Estimated delivery time text (e.g. "Expected by today" or "Delivered on [date]") based on order timestamp
- Visual step progress bar / stepper showing current delivery stage

### Modify
- Replace the static "Delivered" badge with a dynamic status derived from order age:
  - 0-10 min: "Order Placed"
  - 10-60 min: "Processing"
  - 1-3 hours: "Out for Delivery"
  - 3+ hours: "Delivered"
- Show estimated delivery time below the status steps

### Remove
- Static hardcoded "Delivered" badge text (replaced by tracker)

## Implementation Plan
1. Add a `DeliveryTracker` component inside OrdersPage that accepts the order timestamp and computes the current stage
2. Show 4 steps with icons, connected by a progress line; completed steps filled gold, active step pulsing, future steps muted
3. Below the tracker show estimated delivery text (e.g. "Estimated delivery: within 3 hours" or "Delivered [date]")
4. Replace old static badge with a small colored status badge that matches the current stage
