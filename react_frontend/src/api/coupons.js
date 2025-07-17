//
// Simple coupon/discount logic for local demo. Extend/replace with real backend API calls in production.
//
// Supported coupons for demo (case-insensitive):
//   - "SAVE10": 10% off
//   - "FIVEOFF": $5 off (min cart $25)
//   - "FREESHIP": Free shipping (not applied here; example placeholder)
//

const COUPONS = [
  {
    code: "SAVE10",
    type: "percent",
    value: 10,
    description: "10% off your order",
  },
  {
    code: "FIVEOFF",
    type: "amount",
    value: 5,
    description: "$5 off orders above $25",
    minOrder: 25,
  },
  {
    code: "FREESHIP",
    type: "free_shipping",
    description: "Free shipping!", // used by backend only
  },
];

// PUBLIC_INTERFACE
export function validateCoupon(inputCode, cartTotal) {
  if (!inputCode) return { valid: false, reason: "Enter a code." };
  const code = inputCode.trim().toUpperCase();
  const coupon = COUPONS.find((c) => c.code === code);
  if (!coupon) {
    return { valid: false, reason: "Invalid or expired coupon code." };
  }
  // For demo, "FREESHIP" not supported (just a mock placeholder)
  if (coupon.type === "free_shipping")
    return { valid: false, reason: "Free shipping is not enabled in this demo." };
  // "FIVEOFF" has min cart check
  if (coupon.code === "FIVEOFF" && cartTotal < (coupon.minOrder || 0)) {
    return { valid: false, reason: "Order must be $25 or more for $5 off." };
  }
  return { valid: true, coupon };
}

// PUBLIC_INTERFACE
export function getDiscountAmount(cartTotal, appliedCoupon) {
  if (!appliedCoupon) return 0;
  if (appliedCoupon.type === "percent")
    return +(cartTotal * appliedCoupon.value / 100).toFixed(2);
  if (appliedCoupon.type === "amount") {
    return cartTotal >= (appliedCoupon.minOrder || 0) ? Math.min(appliedCoupon.value, cartTotal) : 0;
  }
  return 0;
}
