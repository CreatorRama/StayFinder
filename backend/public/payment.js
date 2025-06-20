document.addEventListener('DOMContentLoaded', () => {
  const stripe = Stripe('pk_test_51RZVvrB7dSGB0TukQACkTG5y6ZpKLlaP44Zs6plWR1mu1VJ41Fea7fdnAK6A1vZEhRIOIjPDVVgOJmxapOJnuygk00CxjKCNzC');
  const elements = stripe.elements();
   const cardElement = elements.create('card', {
    style: {
      base: {
        fontSize: '16px',
        color: '#32325d',
      }
    }
  });
  cardElement.mount('#card-element');
  
  const form = document.getElementById('payment-form');
  const message = document.getElementById('payment-message');
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    try {
      // 1. First fetch the payment intent
      const response = await fetch('/api/payments/create-payment-intent', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4NGUwZThhYzU4MzNjNWYwYThmMGM2NyIsImVtYWlsIjoicm9tYW5faHVlbHMtc2hpZWxkczIzQHlhaG9vLmNvbSIsInJvbGUiOiJob3N0IiwiaWF0IjoxNzQ5OTQ1OTk0LCJleHAiOjE3NTA1NTA3OTR9.bTL0B7Ppr0PMKR7bq63gfgpaqGSrEbaPTpg5IAzRa7k` // Add auth if needed
        },
        body: JSON.stringify({
          bookingId: "684eba293e955152186c6260"
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create payment');
      }

      const { clientSecret } = await response.json();

      // console.log(response.json());

      if (!clientSecret) {
        throw new Error('No client secret received from server');
      }

      // 2. Confirm the payment
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        }
      });
      
      if (error) {
        message.textContent = error.message;
      } else if (paymentIntent.status === 'succeeded') {
        message.textContent = 'Payment succeeded!';
      }
    } catch (err) {
      console.error('Payment error:', err);
      message.textContent = `Error: ${err.message}`;
    }
  });
});