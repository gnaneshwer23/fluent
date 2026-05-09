/**
 * Payment Service (Razorpay Integration)
 */

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface PaymentOptions {
  amount: number;
  currency: string;
  name: string;
  description: string;
  email: string;
  phone: string;
  onSuccess: (response: any) => void;
  onFailure: (error: any) => void;
}

export const initiatePayment = (options: PaymentOptions) => {
  if (!window.Razorpay) {
    console.error("Razorpay SDK not loaded");
    return;
  }

  const rzpOptions = {
    key: "rzp_test_YOUR_KEY_HERE", // Should be in .env but keeping placeholder for demo logic
    amount: options.amount * 100, // in paise
    currency: options.currency,
    name: "FLUENT   ACADEMY.",
    description: options.description,
    image: "https://fluent-academy.com/logo.png",
    handler: function (response: any) {
      console.log("Payment Successful", response);
      options.onSuccess(response);
    },
    prefill: {
      name: options.name,
      email: options.email,
      contact: options.phone
    },
    theme: {
      color: "#1B4F5E" // Fluent Navy
    }
  };

  const rzp = new window.Razorpay(rzpOptions);
  
  rzp.on('payment.failed', function (response: any) {
     console.error("Payment Failed", response.error);
     options.onFailure(response.error);
  });

  rzp.open();
};
