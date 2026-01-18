import { NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { stripe } from "../../../../lib/stripe";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  const body = await req.text();
  const sig = (await headers()).get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.log("❌ Stripe signature error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  console.log("✅ STRIPE EVENT:", event.type);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // 1) Checkout terminé -> le meilleur cas (client_reference_id = userId)
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const userId = (session.client_reference_id as string) || null;
    const customerId = (session.customer as string) || null;
    const subscriptionId = (session.subscription as string) || null;

    console.log("checkout.session.completed:", { userId, customerId, subscriptionId });

    if (!userId) {
      return NextResponse.json({ received: true });
    }

    let status: string | null = null;
    let currentPeriodEnd: number | null = null;

    if (subscriptionId) {
      const sub = await stripe.subscriptions.retrieve(subscriptionId);
      status = sub.status;
      currentPeriodEnd = sub.current_period_end;
    }

    const isPro = status === "active" || status === "trialing";

    const { error } = await supabase.from("profiles").upsert({
      id: userId,
      is_pro: isPro,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId,
      subscription_status: status,
      current_period_end: currentPeriodEnd
        ? new Date(currentPeriodEnd * 1000).toISOString()
        : null,
      updated_at: new Date().toISOString(),
    });

    if (error) console.log("❌ Supabase upsert error:", error.message);

    return NextResponse.json({ received: true });
  }

  // 2) Abonnement créé/mis à jour -> maintien du statut pro
  if (
    event.type === "customer.subscription.created" ||
    event.type === "customer.subscription.updated"
  ) {
    const sub = event.data.object as Stripe.Subscription;

    const customerId = (sub.customer as string) || null;
    if (!customerId) return NextResponse.json({ received: true });

    const { data: prof, error: profErr } = await supabase
      .from("profiles")
      .select("id")
      .eq("stripe_customer_id", customerId)
      .maybeSingle();

    if (profErr) console.log("❌ Supabase select error:", profErr.message);
    if (!prof?.id) return NextResponse.json({ received: true });

    const status = sub.status;
    const isPro = status === "active" || status === "trialing";

    const { error } = await supabase.from("profiles").upsert({
      id: prof.id,
      is_pro: isPro,
      stripe_customer_id: customerId,
      stripe_subscription_id: sub.id,
      subscription_status: status,
      current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (error) console.log("❌ Supabase upsert error:", error.message);

    return NextResponse.json({ received: true });
  }

  return NextResponse.json({ received: true });
}
