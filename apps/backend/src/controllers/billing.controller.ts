import { Response, Request } from 'express';
import Stripe from 'stripe';
import { AuthRequest } from '../middleware/auth';
import { billingService } from '../services/billing.service';
import { config } from '../config/env';

const stripe = new Stripe(config.stripe.secretKey, {
  apiVersion: '2023-10-16',
});

export class BillingController {
  // Create checkout session
  async createCheckout(req: AuthRequest, res: Response) {
    try {
      const { priceId, planType } = req.body;

      // Determine price ID
      let selectedPriceId = priceId;
      if (!selectedPriceId && planType) {
        selectedPriceId = planType === 'pro'
          ? config.stripe.priceIds.pro
          : config.stripe.priceIds.team;
      }

      if (!selectedPriceId) {
        return res.status(400).json({ success: false, error: 'Price ID required' });
      }

      const url = await billingService.createCheckoutSession({
        userId: req.user!.id,
        email: req.user!.email,
        priceId: selectedPriceId,
        successUrl: `${config.clientUrl}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${config.clientUrl}/billing/cancel`,
      });

      res.json({ success: true, data: { url } });
    } catch (error: any) {
      console.error('Checkout error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // Create portal session
  async createPortal(req: AuthRequest, res: Response) {
    try {
      const url = await billingService.createPortalSession(req.user!.id);
      res.json({ success: true, data: { url } });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  // Get subscription
  async getSubscription(req: AuthRequest, res: Response) {
    try {
      const subscription = await billingService.getSubscription(req.user!.id);
      const usage = await billingService.getUsageStats(req.user!.id);

      res.json({
        success: true,
        data: {
          subscription,
          usage,
          tier: req.user!.subscriptionTier,
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // Cancel subscription
  async cancelSubscription(req: AuthRequest, res: Response) {
    try {
      await billingService.cancelSubscription(req.user!.id);
      res.json({ success: true, message: 'Subscription will be canceled at period end' });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  // Resume subscription
  async resumeSubscription(req: AuthRequest, res: Response) {
    try {
      await billingService.resumeSubscription(req.user!.id);
      res.json({ success: true, message: 'Subscription resumed' });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  // Change plan
  async changePlan(req: AuthRequest, res: Response) {
    try {
      const { priceId } = req.body;

      if (!priceId) {
        return res.status(400).json({ success: false, error: 'Price ID required' });
      }

      await billingService.changePlan(req.user!.id, priceId);
      res.json({ success: true, message: 'Plan updated successfully' });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  // Get invoices
  async getInvoices(req: AuthRequest, res: Response) {
    try {
      const invoices = await billingService.getInvoices(req.user!.id);
      res.json({ success: true, data: invoices });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // Webhook handler
  async handleWebhook(req: Request, res: Response) {
    const sig = req.headers['stripe-signature'] as string;

    if (!sig) {
      return res.status(400).json({ error: 'Missing signature' });
    }

    try {
      const event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        config.stripe.webhookSecret
      );

      await billingService.handleWebhook(event);
      res.json({ received: true });
    } catch (error: any) {
      console.error('Webhook error:', error.message);
      res.status(400).json({ error: `Webhook Error: ${error.message}` });
    }
  }

  // Get pricing info
  async getPricing(req: Request, res: Response) {
    try {
      const pricing = {
        free: {
          name: 'Free',
          price: 0,
          features: [
            '5 boards',
            '100MB storage',
            'Basic drawing tools',
            'Community support',
          ],
          limits: {
            boards: 5,
            storage: 100 * 1024 * 1024,
          },
        },
        pro: {
          name: 'Pro',
          price: 12,
          priceId: config.stripe.priceIds.pro,
          features: [
            '100 boards',
            '10GB storage',
            'All AI features',
            'Priority support',
            'Export to all formats',
            'Version history',
          ],
          limits: {
            boards: 100,
            storage: 10 * 1024 * 1024 * 1024,
          },
        },
        team: {
          name: 'Team',
          price: 49,
          priceId: config.stripe.priceIds.team,
          features: [
            'Unlimited boards',
            '100GB storage',
            'All AI features',
            '10 team members',
            'Admin dashboard',
            'Custom integrations',
            'Priority support',
          ],
          limits: {
            boards: -1,
            storage: 100 * 1024 * 1024 * 1024,
            teamMembers: 10,
          },
        },
      };

      res.json({ success: true, data: pricing });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

export const billingController = new BillingController();
