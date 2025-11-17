import { Router } from 'express';
import express from 'express';
import { billingController } from '../controllers/billing.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/pricing', billingController.getPricing.bind(billingController));

// Webhook (needs raw body)
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  billingController.handleWebhook.bind(billingController)
);

// Protected routes
router.post('/checkout', authenticate, billingController.createCheckout.bind(billingController));
router.post('/portal', authenticate, billingController.createPortal.bind(billingController));
router.get('/subscription', authenticate, billingController.getSubscription.bind(billingController));
router.post('/cancel', authenticate, billingController.cancelSubscription.bind(billingController));
router.post('/resume', authenticate, billingController.resumeSubscription.bind(billingController));
router.post('/change-plan', authenticate, billingController.changePlan.bind(billingController));
router.get('/invoices', authenticate, billingController.getInvoices.bind(billingController));

export default router;
