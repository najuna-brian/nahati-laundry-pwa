import React, { useState } from 'react';

const Payment = ({ orderDetails, onPaymentSuccess }) => {
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [isPaid, setIsPaid] = useState(false);

    const handlePayment = () => {
        // Simulate payment processing
        setTimeout(() => {
            setIsPaid(true);
            onPaymentSuccess();
        }, 1000);
    };

    return (
        <div className="payment-container">
            <h2>Payment</h2>
            <h3>Total Amount: UGX {orderDetails.totalPrice}</h3>
            <div className="payment-methods">
                <label>
                    <input
                        type="radio"
                        value="cash"
                        checked={paymentMethod === 'cash'}
                        onChange={() => setPaymentMethod('cash')}
                    />
                    Cash on Delivery
                </label>
                <label>
                    <input
                        type="radio"
                        value="mobileMoney"
                        checked={paymentMethod === 'mobileMoney'}
                        onChange={() => setPaymentMethod('mobileMoney')}
                    />
                    Mobile Money
                </label>
                <label>
                    <input
                        type="radio"
                        value="bankTransfer"
                        checked={paymentMethod === 'bankTransfer'}
                        onChange={() => setPaymentMethod('bankTransfer')}
                    />
                    Bank Transfer
                </label>
            </div>
            <button onClick={handlePayment} disabled={isPaid}>
                {isPaid ? 'Payment Successful' : 'Pay Now'}
            </button>
            {isPaid && <p>Your payment has been processed successfully!</p>}
        </div>
    );
};

export default Payment;