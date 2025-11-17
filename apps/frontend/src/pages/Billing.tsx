import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Check, CreditCard, FileText, Loader2 } from 'lucide-react';

interface PricingPlan {
  name: string;
  price: number;
  priceId?: string;
  features: string[];
  limits: {
    boards: number;
    storage: number;
    teamMembers?: number;
  };
}

interface Subscription {
  id: string;
  status: string;
  plan: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  trialEnd?: string;
}

interface Usage {
  boards: number;
  storage: number;
}

export const Billing: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [pricing, setPricing] = useState<Record<string, PricingPlan> | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [usage, setUsage] = useState<Usage | null>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

  useEffect(() => {
    loadData();

    // Check for success/cancel from Stripe
    const sessionId = searchParams.get('session_id');
    if (sessionId) {
      toast.success('Subscription activated successfully!');
      navigate('/billing', { replace: true });
    }
  }, []);

  const loadData = async () => {
    try {
      const [pricingRes, subscriptionRes, invoicesRes] = await Promise.all([
        api.get('/api/billing/pricing'),
        api.get('/api/billing/subscription'),
        api.get('/api/billing/invoices'),
      ]);

      setPricing(pricingRes.data.data);
      setSubscription(subscriptionRes.data.data.subscription);
      setUsage(subscriptionRes.data.data.usage);
      setInvoices(invoicesRes.data.data);
    } catch (error) {
      console.error('Error loading billing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async (planType: string) => {
    setCheckoutLoading(planType);
    try {
      const response = await api.post('/api/billing/checkout', { planType });
      window.location.href = response.data.data.url;
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to start checkout');
      setCheckoutLoading(null);
    }
  };

  const handleManageSubscription = async () => {
    try {
      const response = await api.post('/api/billing/portal');
      window.location.href = response.data.data.url;
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to open billing portal');
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription?')) return;

    try {
      await api.post('/api/billing/cancel');
      toast.success('Subscription will be canceled at the end of the billing period');
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to cancel subscription');
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 mb-4"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Billing & Subscription
          </h1>
        </div>

        {/* Current Plan & Usage */}
        {subscription && usage && (
          <div className="card mb-8">
            <h2 className="text-xl font-semibold mb-4">Current Plan</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-2xl font-bold text-primary-600 capitalize">
                  {subscription.plan}
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  {subscription.status === 'trialing' && subscription.trialEnd && (
                    <>Trial ends {formatDate(subscription.trialEnd)}</>
                  )}
                  {subscription.status === 'active' && (
                    <>Renews {formatDate(subscription.currentPeriodEnd)}</>
                  )}
                  {subscription.cancelAtPeriodEnd && (
                    <span className="text-red-600"> (Canceling)</span>
                  )}
                </p>
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={handleManageSubscription}
                    className="btn-secondary text-sm"
                  >
                    <CreditCard className="w-4 h-4 mr-2 inline" />
                    Manage Payment
                  </button>
                  {!subscription.cancelAtPeriodEnd && (
                    <button
                      onClick={handleCancelSubscription}
                      className="btn text-sm text-red-600 hover:bg-red-50"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
              <div>
                <h3 className="font-medium mb-2">Usage</h3>
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-sm">
                      <span>Boards</span>
                      <span>
                        {usage.boards} / {pricing?.[subscription.plan]?.limits.boards === -1
                          ? '∞'
                          : pricing?.[subscription.plan]?.limits.boards}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full"
                        style={{
                          width: pricing?.[subscription.plan]?.limits.boards === -1
                            ? '10%'
                            : `${(usage.boards / (pricing?.[subscription.plan]?.limits.boards || 1)) * 100}%`
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm">
                      <span>Storage</span>
                      <span>
                        {formatBytes(usage.storage)} / {formatBytes(pricing?.[subscription.plan]?.limits.storage || 0)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full"
                        style={{
                          width: `${(usage.storage / (pricing?.[subscription.plan]?.limits.storage || 1)) * 100}%`
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pricing Plans */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">
            {subscription ? 'Available Plans' : 'Choose a Plan'}
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {pricing && Object.entries(pricing).map(([key, plan]) => (
              <div
                key={key}
                className={`card border-2 ${
                  user?.subscriptionTier === key
                    ? 'border-primary-500'
                    : 'border-transparent'
                }`}
              >
                <h3 className="text-xl font-bold">{plan.name}</h3>
                <div className="mt-2 mb-4">
                  <span className="text-3xl font-bold">${plan.price}</span>
                  {plan.price > 0 && (
                    <span className="text-gray-500">/month</span>
                  )}
                </div>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center text-sm">
                      <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                {user?.subscriptionTier === key ? (
                  <button
                    disabled
                    className="btn w-full bg-gray-100 text-gray-500 cursor-not-allowed"
                  >
                    Current Plan
                  </button>
                ) : plan.price === 0 ? (
                  <button
                    disabled
                    className="btn w-full bg-gray-100 text-gray-500 cursor-not-allowed"
                  >
                    Free Tier
                  </button>
                ) : (
                  <button
                    onClick={() => handleCheckout(key)}
                    disabled={checkoutLoading === key}
                    className="btn-primary w-full"
                  >
                    {checkoutLoading === key ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : subscription ? (
                      'Upgrade'
                    ) : (
                      'Start Free Trial'
                    )}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Invoices */}
        {invoices.length > 0 && (
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Invoice History</h2>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="py-3 flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium">
                      ${(invoice.amount_paid / 100).toFixed(2)} {invoice.currency.toUpperCase()}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatDate(invoice.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span
                      className={`text-sm px-2 py-1 rounded ${
                        invoice.status === 'paid'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {invoice.status}
                    </span>
                    {invoice.invoice_pdf && (
                      <a
                        href={invoice.invoice_pdf}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:text-primary-700"
                      >
                        <FileText className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
