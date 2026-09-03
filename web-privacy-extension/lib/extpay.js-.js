// ExtPay - Simple implementation for Chrome Extension
// This is a simplified version for testing purposes

function ExtPay(extensionId) {
  const extpay = {
    extensionId: extensionId,
    user: null,

    async getUser() {
      // Simulate API call
      return new Promise((resolve) => {
        setTimeout(() => {
          // Check localStorage for subscription status
          const isPaid = localStorage.getItem('extpay_paid') === 'true';
          const subscriptionType = localStorage.getItem('extpay_subscription_type') || 'none';
          
          this.user = {
            paid: isPaid,
            subscriptionType: subscriptionType,
            email: localStorage.getItem('extpay_email') || 'user@example.com'
          };
          
          resolve(this.user);
        }, 100);
      });
    },

    async pay(productId) {
      // Simulate payment flow
      return new Promise((resolve) => {
        // Show payment dialog
        const confirmed = confirm(`Subscribe to ${productId}?\n\nThis is a demo payment. Click OK to simulate successful payment.`);
        
        if (confirmed) {
          // Simulate successful payment
          localStorage.setItem('extpay_paid', 'true');
          localStorage.setItem('extpay_subscription_type', productId);
          localStorage.setItem('extpay_email', 'user@example.com');
          
          this.user = {
            paid: true,
            subscriptionType: productId,
            email: 'user@example.com'
          };
          
          resolve(this.user);
        } else {
          // Payment cancelled
          resolve({
            paid: false,
            subscriptionType: 'none',
            email: null
          });
        }
      });
    },

    async openPaymentPage() {
      // Simulate opening payment page
      alert('Opening payment page...\n\nThis would normally open the ExtPay payment page.');
    },

    startBackground() {
      // Simulate background script functionality
      console.log('ExtPay background started for extension:', this.extensionId);
    }
  };

  return extpay;
}

// Make ExtPay available globally
window.ExtPay = ExtPay;