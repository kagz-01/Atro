import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { accountMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";

const CheckoutInput = z.object({
  projectId: z.string().uuid(),
  paymentId: z.string().uuid(),
  experience: z.enum(["local", "diaspora"]).default("local"),
});

const VerifyInput = z.object({
  reference: z.string().regex(/^ATRO-[0-9a-f]{32}$/i),
});

export const startPaystackCheckout = createServerFn({ method: "POST" })
  .validator(CheckoutInput)
  .middleware([accountMiddleware])
  .handler(async ({ context, data }) => {
    const { beginPaystackCheckout } = await import("./paystack-provider.server");
    return beginPaystackCheckout(
      await getSql(),
      context.userId,
      context.email,
      context.emailVerified,
      data,
    );
  });

export const verifyPaystackPayment = createServerFn({ method: "POST" })
  .validator(VerifyInput)
  .middleware([accountMiddleware])
  .handler(async ({ context, data }) => {
    const { verifyPaystackPaymentForUser } = await import("./paystack-provider.server");
    return verifyPaystackPaymentForUser(await getSql(), context.userId, data.reference);
  });
