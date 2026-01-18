import { NextResponse } from "next/server";
import { stripe } from "../../../lib/stripe";

export async function POST(req: Request) {
  try {
    const { userId, email } = await req.json();

    if (!userId || !email) {
      return NextResponse.json(
        { error: "Missing userId/email" },
        { status: 400 }
      );
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: email,
      client_reference_id: userId, // ✅ indispensable pour retrouver l’utilisateur
      line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
      success_url: `${siteUrl}/app?checkout=success`,
      cancel_url: `${siteUrl}/pricing?checkout=cancel`,
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: session.url });
  } catch (e: any) {
    console.log("Checkout error:", e?.message);
    return NextResponse.json(
      { error: e?.message || "Checkout error" },
      { status: 500 }
    );
  }
}
