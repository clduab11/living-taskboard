import Stripe from 'stripe';
import { query } from '../config/database';
import { config } from '../config/env';
import { SubscriptionTier } from '@living-taskboard/shared';

const stripe = new Stripe(config.stripe.secretKey, {
  apiVersion: '2023-10-16',
});

export interface CreateCheckoutParams {
  userId: string;
  email: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
}

export interface SubscriptionInfo {
  id: string;
  status: string;
  plan: string;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  trialEnd?: Date;
}

export class BillingService {
  // Create or get Stripe customer
  async getOrCreateCustomer(userId: string, email: string): Promise<string> {
    // Check if user already has a customer ID
    const userResult = await query(
      'SELECT stripe_customer_id FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows[0]?.stripe_customer_id) {
      return userResult.rows[0].stripe_customer_id;
    }

    // Create new Stripe customer
    const customer = await stripe.customers.create({
      email,
      metadata: { userId },
    });

    // Save customer ID to user
    await query(
      'UPDATE users SET stripe_customer_id = $1 WHERE id = $2',
      [customer.id, userId]
    );

    return customer.id;
  }

  // Create checkout session
  async createCheckoutSession(params: CreateCheckoutParams): Promise<string> {
    const customerId = await this.getOrCreateCustomer(params.userId, params.email);

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: params.priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      subscription_data: {
        trial_period_days: 14,
        metadata: { userId: params.userId },
      },
      metadata: { userId: params.userId },
    });

    if (!session.url) {
      throw new Error('Checkout session URL not available');
    }
    return session.url;
  }

  // Create customer portal session
  async createPortalSession(userId: string): Promise<string> {
    const userResult = await query(
      'SELECT stripe_customer_id FROM users WHERE id = $1',
      [userId]
    );

    const customerId = userResult.rows[0]?.stripe_customer_id;
    if (!customerId) {
      throw new Error('No billing account found');
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${config.clientUrl}/dashboard`,
    });

    return session.url;
  }

  // Get subscription info
  async getSubscription(userId: string): Promise<SubscriptionInfo | null> {
    const result = await query(
      `SELECT * FROM subscriptions
       WHERE user_id = $1 AND status IN ('active', 'trialing', 'past_due')
       ORDER BY created_at DESC LIMIT 1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const sub = result.rows[0];
    return {
      id: sub.id,
      status: sub.status,
      plan: sub.plan_id,
      currentPeriodEnd: sub.current_period_end,
      cancelAtPeriodEnd: sub.cancel_at_period_end,
      trialEnd: sub.trial_end,
    };
  }

  // Cancel subscription
  async cancelSubscription(userId: string): Promise<void> {
    const result = await query(
      'SELECT stripe_subscription_id FROM subscriptions WHERE user_id = $1 AND status IN (\'active\', \'trialing\')',
      [userId]
    );

    if (result.rows.length === 0) {
      throw new Error('No active subscription found');
    }

    await stripe.subscriptions.update(result.rows[0].stripe_subscription_id, {
      cancel_at_period_end: true,
    });
  }

  // Resume subscription
  async resumeSubscription(userId: string): Promise<void> {
    const result = await query(
      'SELECT stripe_subscription_id FROM subscriptions WHERE user_id = $1 AND cancel_at_period_end = true',
      [userId]
    );

    if (result.rows.length === 0) {
      throw new Error('No canceled subscription found');
    }

    await stripe.subscriptions.update(result.rows[0].stripe_subscription_id, {
      cancel_at_period_end: false,
    });
  }

  // Change subscription plan
  async changePlan(userId: string, newPriceId: string): Promise<void> {
    const result = await query(
      'SELECT stripe_subscription_id FROM subscriptions WHERE user_id = $1 AND status = $2',
      [userId, 'active']
    );

    if (result.rows.length === 0) {
      throw new Error('No active subscription found');
    }

    const subscription = await stripe.subscriptions.retrieve(
      result.rows[0].stripe_subscription_id
    );

    await stripe.subscriptions.update(result.rows[0].stripe_subscription_id, {
      items: [
        {
          id: subscription.items.data[0].id,
          price: newPriceId,
        },
      ],
      proration_behavior: 'create_prorations',
    });
  }

  // Get usage stats
  async getUsageStats(userId: string): Promise<{ boards: number; storage: number }> {
    const boardCount = await query(
      'SELECT COUNT(*) as count FROM boards WHERE owner_id = $1',
      [userId]
    );

    const storageResult = await query(
      'SELECT COALESCE(SUM(size), 0) as total FROM file_uploads WHERE user_id = $1',
      [userId]
    );

    return {
      boards: parseInt(boardCount.rows[0].count),
      storage: parseInt(storageResult.rows[0].total),
    };
  }

  // Get invoices
  async getInvoices(userId: string): Promise<any[]> {
    const result = await query(
      `SELECT * FROM invoices
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 20`,
      [userId]
    );

    return result.rows;
  }

  // Webhook handlers
  async handleWebhook(event: Stripe.Event): Promise<void> {
    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.paid':
        await this.handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await this.handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  }

  private async handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
    const userId = session.metadata?.userId;
    if (!userId) return;

    console.log(`Checkout completed for user ${userId}`);
  }

  private async handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
    const userId = subscription.metadata?.userId;
    if (!userId) return;

    const planId = this.getPlanFromPriceId(subscription.items.data[0].price.id);
    const tier = this.getTierFromPlan(planId);

    // Upsert subscription
    await query(
      `INSERT INTO subscriptions (
        user_id, stripe_subscription_id, stripe_customer_id, status, plan_id,
        current_period_start, current_period_end, cancel_at_period_end,
        trial_start, trial_end
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT (stripe_subscription_id) DO UPDATE SET
        status = $4, plan_id = $5, current_period_start = $6,
        current_period_end = $7, cancel_at_period_end = $8,
        trial_start = $9, trial_end = $10, updated_at = CURRENT_TIMESTAMP`,
      [
        userId,
        subscription.id,
        subscription.customer as string,
        subscription.status,
        planId,
        new Date(subscription.current_period_start * 1000),
        new Date(subscription.current_period_end * 1000),
        subscription.cancel_at_period_end,
        subscription.trial_start ? new Date(subscription.trial_start * 1000) : null,
        subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
      ]
    );

    // Update user subscription tier
    await query(
      'UPDATE users SET subscription_tier = $1 WHERE id = $2',
      [tier, userId]
    );
  }

  private async handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
    const userId = subscription.metadata?.userId;
    if (!userId) return;

    // Update subscription status
    await query(
      `UPDATE subscriptions SET status = 'canceled', canceled_at = CURRENT_TIMESTAMP
       WHERE stripe_subscription_id = $1`,
      [subscription.id]
    );

    // Downgrade user to free tier
    await query(
      'UPDATE users SET subscription_tier = $1 WHERE id = $2',
      [SubscriptionTier.FREE, userId]
    );
  }

  private async handleInvoicePaid(invoice: Stripe.Invoice): Promise<void> {
    const customerId = invoice.customer as string;

    // Find user by customer ID
    const userResult = await query(
      'SELECT id FROM users WHERE stripe_customer_id = $1',
      [customerId]
    );

    if (userResult.rows.length === 0) return;
    const userId = userResult.rows[0].id;

    // Save invoice
    await query(
      `INSERT INTO invoices (
        user_id, stripe_invoice_id, stripe_subscription_id,
        amount_due, amount_paid, currency, status,
        invoice_pdf, hosted_invoice_url, paid_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP)
      ON CONFLICT (stripe_invoice_id) DO UPDATE SET
        status = $7, amount_paid = $5, paid_at = CURRENT_TIMESTAMP`,
      [
        userId,
        invoice.id,
        invoice.subscription as string,
        invoice.amount_due,
        invoice.amount_paid,
        invoice.currency,
        'paid',
        invoice.invoice_pdf,
        invoice.hosted_invoice_url,
      ]
    );
  }

  private async handleInvoicePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
    const customerId = invoice.customer as string;

    // Find user by customer ID
    const userResult = await query(
      'SELECT id FROM users WHERE stripe_customer_id = $1',
      [customerId]
    );

    if (userResult.rows.length === 0) return;
    const userId = userResult.rows[0].id;

    // Save failed invoice
    await query(
      `INSERT INTO invoices (
        user_id, stripe_invoice_id, stripe_subscription_id,
        amount_due, currency, status, invoice_pdf, hosted_invoice_url
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (stripe_invoice_id) DO UPDATE SET status = $6`,
      [
        userId,
        invoice.id,
        invoice.subscription as string,
        invoice.amount_due,
        invoice.currency,
        'payment_failed',
        invoice.invoice_pdf,
        invoice.hosted_invoice_url,
      ]
    );

    // TODO: Send notification email about failed payment
  }

  private getPlanFromPriceId(priceId: string): string {
    if (priceId === config.stripe.priceIds.pro) return 'pro';
    if (priceId === config.stripe.priceIds.team) return 'team';
    return 'free';
  }

  private getTierFromPlan(plan: string): SubscriptionTier {
    switch (plan) {
      case 'pro':
        return SubscriptionTier.PRO;
      case 'team':
        return SubscriptionTier.TEAM;
      default:
        return SubscriptionTier.FREE;
    }
  }
}

export const billingService = new BillingService();
