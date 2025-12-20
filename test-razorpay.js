// Quick test to verify Razorpay credentials
require('dotenv').config();
const Razorpay = require('razorpay');

console.log('Testing Razorpay integration...\n');

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

console.log('RAZORPAY_KEY_ID:', keyId ? keyId.substring(0, 15) + '...' : 'NOT FOUND');
console.log('RAZORPAY_KEY_SECRET:', keySecret ? '***' + keySecret.substring(keySecret.length - 4) : 'NOT FOUND');
console.log('');

if (!keyId || !keySecret || keyId === 'your-key-id') {
  console.error('❌ ERROR: Razorpay credentials not properly configured in .env file');
  process.exit(1);
}

const razorpay = new Razorpay({
  key_id: keyId,
  key_secret: keySecret,
});

// Try to create a test order
async function testOrder() {
  try {
    console.log('Creating test order...');
    const order = await razorpay.orders.create({
      amount: 50000, // ₹500 in paise
      currency: 'INR',
      receipt: 'test_receipt_' + Date.now(),
      notes: {
        test: 'true'
      }
    });

    console.log('✅ SUCCESS! Order created:');
    console.log('Order ID:', order.id);
    console.log('Amount:', order.amount / 100, 'INR');
    console.log('Currency:', order.currency);
    console.log('Status:', order.status);
    console.log('\nRazorpay integration is working correctly! 🎉');
  } catch (error) {
    console.error('❌ ERROR creating order:');
    if (error.error) {
      console.error('Error Code:', error.error.code);
      console.error('Error Description:', error.error.description);
      console.error('Error Field:', error.error.field);
      console.error('Error Source:', error.error.source);
      console.error('Error Step:', error.error.step);
      console.error('Error Reason:', error.error.reason);
    } else {
      console.error(error.message || error);
    }
    console.error('\nFull error object:', JSON.stringify(error, null, 2));
  }
}

testOrder();
