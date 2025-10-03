document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('checkoutForm');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: document.getElementById('name').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        address1: document.getElementById('address1').value.trim(),
        address2: document.getElementById('address2').value.trim(),
        city: document.getElementById('city').value.trim(),
        state: document.getElementById('state').value.trim(),
        postal_code: document.getElementById('postal_code').value.trim(),
        country: document.getElementById('country').value.trim(),
      };
      const resp = await api('/checkout', { method: 'POST', body: JSON.stringify(payload) });
      document.getElementById('checkoutResult').innerHTML = `
        <p>Order placed! ID: <b>${resp.order_id}</b></p>
        <p>Payment ref: <b>${resp.payment_ref}</b></p>
        <p>Total: <b>$${Number(resp.total_amount).toFixed(2)}</b></p>
      `;
    } catch (err) {
      if (/Unauthorized/i.test(err.message)) {
        alert('Please login');
        window.location.href = '/login.html';
      } else {
        alert(err.message);
      }
    }
  });
});
