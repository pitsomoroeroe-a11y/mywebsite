 // ---------- DATA LAYER (localStorage persistence, no auth) ----------
  let bakeryData = {
    products: [],
    orders: [],
    transactions: [],
    inquiries: []
  };

  // Helper functions
  function saveToLocal() { localStorage.setItem('lavos_bakery_v2', JSON.stringify(bakeryData)); }
  function loadFromLocal() {
    const raw = localStorage.getItem('lavos_bakery_v2');
    if(raw) {
      try {
        const parsed = JSON.parse(raw);
        bakeryData = parsed;
      } catch(e) { console.warn(e); seedInitialData(); }
    } else { seedInitialData(); }
  }

  function generateOrderNumber() { return 'ORD' + new Date().getFullYear() + (Math.floor(Math.random()*9000)+1000); }
  function generateTxnId() { return 'TXN' + Date.now() + Math.floor(Math.random()*10000); }

  // Seed demo data (rich)
  function seedInitialData() {
    bakeryData.products = [
      { id: 1001, name: "Royal Wedding Cake", description: "3-tier gold leaf", price: 299.99, stock: 12, image_url: "https://images.pexels.com/photos/1721934/pexels-photo-1721934.jpeg?w=300", category: "wedding" },
      { id: 1002, name: "Elegant Pearl Cake", description: "Buttercream pearls", price: 349.99, stock: 8, image_url: "https://images.pexels.com/photos/1854652/pexels-photo-1854652.jpeg?w=300", category: "wedding" },
      { id: 1003, name: "Rainbow Birthday", description: "Colorful layers", price: 89.99, stock: 20, image_url: "https://images.pexels.com/photos/291528/pexels-photo-291528.jpeg?w=300", category: "birthday" },
      { id: 1004, name: "Chocolate Fudge", description: "Rich ganache", price: 79.99, stock: 15, image_url: "https://images.pexels.com/photos/1854651/pexels-photo-1854651.jpeg?w=300", category: "birthday" },
      { id: 1005, name: "Gold Celebration", description: "Edible gold drip", price: 159.99, stock: 7, image_url: "https://images.pexels.com/photos/746016/pexels-photo-746016.jpeg?w=300", category: "celebration" },
      { id: 1006, name: "Anniversary Rose", description: "Red velvet roses", price: 129.99, stock: 5, image_url: "https://images.pexels.com/photos/1126359/pexels-photo-1126359.jpeg?w=300", category: "celebration" }
    ];
    bakeryData.orders = [
      { id: 2001, order_number: "ORD20251001A1", product_id: 1001, product_name: "Royal Wedding Cake", quantity: 1, unit_price: 299.99, total: 299.99, customer_name: "Elena V.", customer_email: "elena@example.com", customer_phone: "555111", status: "delivered", payment_status: "paid", order_date: "2025-03-10 14:30:00", payment_method: "Credit Card" },
      { id: 2002, order_number: "ORD20251002B2", product_id: 1003, product_name: "Rainbow Birthday", quantity: 2, unit_price: 89.99, total: 179.98, customer_name: "Michael T.", customer_email: "mike@example.com", customer_phone: "555222", status: "processing", payment_status: "paid", order_date: "2025-03-12 09:15:00", payment_method: "PayPal" }
    ];
    bakeryData.transactions = bakeryData.orders.map(ord => ({
      id: 'txn_'+ord.id, transaction_id: generateTxnId(), order_id: ord.id, amount: ord.total, payment_method: ord.payment_method, status: "completed", transaction_date: ord.order_date
    }));
    bakeryData.inquiries = [
      { id: 3001, customer_name: "Sarah Connor", customer_email: "sarah@future.com", subject: "Wedding cake customization", message: "Can I get vegan tier?", status: "replied", admin_response: "Yes, we offer vegan options!", created_at: "2025-03-01" },
      { id: 3002, customer_name: "John Wick", customer_email: "john@continental.com", subject: "Delivery date", message: "Need by March 20", status: "unread", admin_response: null, created_at: "2025-03-14" }
    ];
    saveToLocal();
  }

  // Core business ops
  function createOrder(productId, customerName, email, phone, quantity, method) {
    const product = bakeryData.products.find(p => p.id == productId);
    if(!product) return { error: "Product missing" };
    if(product.stock < quantity) return { error: `Only ${product.stock} left in stock.` };
    const total = product.price * quantity;
    const orderId = Date.now() + Math.floor(Math.random()*10000);
    const orderNumber = generateOrderNumber();
    const newOrder = {
      id: orderId, order_number: orderNumber, product_id: product.id, product_name: product.name, quantity, unit_price: product.price, total,
      customer_name: customerName, customer_email: email, customer_phone: phone, status: "pending", payment_status: "paid",
      order_date: new Date().toISOString().slice(0,19).replace('T',' '), payment_method: method
    };
    product.stock -= quantity;
    const transaction = {
      id: 'txn'+orderId, transaction_id: generateTxnId(), order_id: orderId, amount: total, payment_method: method, status: "completed", transaction_date: newOrder.order_date
    };
    bakeryData.orders.unshift(newOrder);
    bakeryData.transactions.unshift(transaction);
    saveToLocal();
    return { success: true, orderNumber };
  }

  function cancelOrder(orderId) {
    const idx = bakeryData.orders.findIndex(o => o.id == orderId);
    if(idx === -1) return false;
    const order = bakeryData.orders[idx];
    if(order.status === 'cancelled' || order.status === 'delivered') return false;
    const product = bakeryData.products.find(p => p.id == order.product_id);
    if(product) product.stock += order.quantity;
    order.status = 'cancelled';
    order.payment_status = 'refunded';
    const txn = bakeryData.transactions.find(t => t.order_id == order.id);
    if(txn) txn.status = 'refunded';
    saveToLocal();
    return true;
  }

  function updateOrderStatus(orderId, newStatus) {
    const order = bakeryData.orders.find(o => o.id == orderId);
    if(order && order.status !== 'cancelled') { order.status = newStatus; saveToLocal(); return true; }
    return false;
  }
  function updateTransactionStatus(txnId, stat) { const txn = bakeryData.transactions.find(t => t.transaction_id == txnId); if(txn) { txn.status = stat; saveToLocal(); return true; } return false; }
  function addProduct(data) { const newId = Date.now() + Math.floor(Math.random()*1000); bakeryData.products.push({ ...data, id: newId }); saveToLocal(); return true; }
  function updateProduct(pid, data) { const index = bakeryData.products.findIndex(p=>p.id==pid); if(index!==-1){ bakeryData.products[index]={...bakeryData.products[index], ...data}; saveToLocal(); return true; } return false; }
  function deleteProduct(pid) { bakeryData.products = bakeryData.products.filter(p=>p.id!=pid); saveToLocal(); return true; }
  function addInquiry(name, email, subject, msg) { const newInq = { id: Date.now(), customer_name: name, customer_email: email, subject, message: msg, status: "unread", admin_response: null, created_at: new Date().toISOString().slice(0,10) }; bakeryData.inquiries.unshift(newInq); saveToLocal(); return true; }
  function replyInquiry(inqId, replyText) { const inq = bakeryData.inquiries.find(i=>i.id==inqId); if(inq){ inq.admin_response = replyText; inq.status = "replied"; saveToLocal(); return true; } return false; }

  // ---------- RENDER ENGINE ----------
  let currentModule = 'dashboard';
  let chartInstance = null;

  function showToast(msg, isError=false) { const toastEl = document.getElementById('liveToast'); const msgDiv = document.getElementById('toastMsg'); msgDiv.innerText = msg; const bsToast = new bootstrap.Toast(toastEl, { autohide: true, delay: 2800 }); bsToast.show(); }

  function renderDashboard() {
    const totalProducts = bakeryData.products.length;
    const totalOrders = bakeryData.orders.length;
    const totalRevenue = bakeryData.transactions.filter(t=>t.status==='completed').reduce((s,t)=>s+t.amount,0);
    const pendingOrders = bakeryData.orders.filter(o=>o.status==='pending' || o.status==='processing').length;
    const recentOrders = [...bakeryData.orders].slice(0,5);
    // chart revenue by last 7 days simulation dynamic
    const ctx = document.getElementById('revenueChart')?.getContext('2d');
    if(ctx && chartInstance) chartInstance.destroy();
    const monthlyLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const randomRev = [320, 450, 280, 670, 890, 540, 760];
    if(ctx) { chartInstance = new Chart(ctx, { type: 'line', data: { labels: monthlyLabels, datasets: [{ label: 'Revenue ($)', data: randomRev, borderColor: '#c5724a', tension: 0.3, fill: true, backgroundColor: 'rgba(197,114,74,0.1)' }] }, options: { responsive: true, maintainAspectRatio: true } }); }
    return `
      <div class="row g-4 mb-4">
        <div class="col-md-3"><div class="stat-card"><i class="bi bi-box-seam fs-1 text-warning"></i><h2 class="mt-2">${totalProducts}</h2><span class="text-muted">Artisan Products</span></div></div>
        <div class="col-md-3"><div class="stat-card"><i class="bi bi-cart-check fs-1 text-success"></i><h2>${totalOrders}</h2><span>Total Orders</span></div></div>
        <div class="col-md-3"><div class="stat-card"><i class="bi bi-currency-dollar fs-1 text-primary"></i><h2>$${totalRevenue.toFixed(2)}</h2><span>Revenue</span></div></div>
        <div class="col-md-3"><div class="stat-card"><i class="bi bi-clock-history fs-1 text-danger"></i><h2>${pendingOrders}</h2><span>Pending/Processing</span></div></div>
      </div>
      <div class="row">
        <div class="col-lg-7 mb-4"><div class="card border-0 shadow-sm rounded-4 p-3"><canvas id="revenueChart" height="200"></canvas></div></div>
        <div class="col-lg-5"><div class="card border-0 shadow-sm rounded-4"><div class="card-header bg-white fw-bold">📋 Latest Orders</div><div class="list-group list-group-flush">${recentOrders.map(o=>`<div class="list-group-item d-flex justify-content-between"><span><b>${o.order_number}</b> - ${o.customer_name}</span><span class="badge bg-secondary">${o.status}</span></div>`).join('') || '<div class="p-3 text-muted">No orders</div>'}</div></div></div>
      </div>
    `;
  }

  function renderCakeGallery() {
    const categories = { wedding: '💍 Wedding Cakes', birthday: '🎂 Birthday Cakes', celebration: '✨ Celebration Cakes' };
    let html = `<h3 class="mb-4"><i class="bi bi-images"></i> Premium Cake Gallery</h3>`;
    for(let [cat, title] of Object.entries(categories)) {
      const items = bakeryData.products.filter(p=>p.category===cat);
      html += `<h5 class="mt-3"><i class="bi bi-tag-fill"></i> ${title}</h5><div class="row g-4 mb-5">`;
      items.forEach(p => {
        html += `<div class="col-md-4 col-lg-3"><div class="cake-card"><img src="${p.image_url}" class="product-img" onerror="this.src='https://placehold.co/300x200?text=Cake'"><div class="p-3"><h6>${escapeHtml(p.name)}</h6><p class="small text-muted">${p.description.substring(0,50)}</p><div class="d-flex justify-content-between align-items-center"><span class="fw-bold text-dark">$${p.price}</span><button class="btn btn-sm btn-warm quick-order" data-id="${p.id}" data-name="${escapeHtml(p.name)}" data-price="${p.price}">Order Now</button></div></div></div></div>`;
      });
      html += `</div>`;
    }
    return html;
  }

  function renderProducts() {
    let html = `<div class="d-flex justify-content-between mb-3"><h3>🍰 Product Inventory</h3><button class="btn btn-warm" id="openAddProductBtn"><i class="bi bi-plus-lg"></i> New Product</button></div><div class="row g-4">`;
    bakeryData.products.forEach(p => {
      html += `<div class="col-md-4 col-lg-3"><div class="product-card"><img src="${p.image_url}" class="product-img"><div class="p-3"><h6>${escapeHtml(p.name)}</h6><p class="small">${escapeHtml(p.description.substring(0,60))}</p><div><span class="fw-bold">$${p.price}</span> <span class="badge bg-secondary ms-2">Stock: ${p.stock}</span></div><div class="mt-2 d-flex gap-2"><button class="btn btn-sm btn-outline-warm edit-product" data-id="${p.id}" data-name="${escapeHtml(p.name)}" data-desc="${escapeHtml(p.description)}" data-price="${p.price}" data-stock="${p.stock}" data-img="${p.image_url}" data-cat="${p.category}">Edit</button><button class="btn btn-sm btn-outline-danger delete-product" data-id="${p.id}">Delete</button></div></div></div></div>`;
    });
    html += `</div>`;
    return html;
  }

  function renderOrders() {
    let html = `<h3>📦 Order Management (All orders)</h3><div class="table-container bg-white rounded-4 p-3 shadow-sm"><div class="table-responsive"><table class="table table-hover align-middle"><thead><tr><th>Order #</th><th>Customer</th><th>Product</th><th>Qty</th><th>Total</th><th>Status</th><th>Payment</th><th>Actions</th></tr></thead><tbody>`;
    bakeryData.orders.forEach(o => {
      html += `<tr><td>${o.order_number}</td><td>${escapeHtml(o.customer_name)}<br><small>${escapeHtml(o.customer_email)}</small></td><td>${o.product_name}</td><td>${o.quantity}</td><td>$${o.total.toFixed(2)}</td><td><select class="form-select form-select-sm status-update" data-id="${o.id}" style="width:130px">${['pending','processing','shipped','delivered','cancelled'].map(s=>`<option ${o.status===s?'selected':''} ${o.status==='cancelled'?'disabled':''}>${s}</option>`).join('')}</select></td><td><span class="badge ${o.payment_status==='paid'?'bg-success':'bg-secondary'}">${o.payment_status}</span></td><td>${o.status !== 'cancelled' && o.status !== 'delivered' ? `<button class="btn btn-sm btn-danger cancel-order-btn" data-id="${o.id}">Cancel</button>` : '—'}</td></tr>`;
    });
    html += `</tbody></table></div></div>`;
    return html;
  }

  function renderTransactions() {
    let html = `<h3>💎 Transaction Ledger</h3><div class="table-container bg-white rounded-4 p-3 shadow-sm"><table class="table"><thead><tr><th>Txn ID</th><th>Order Ref</th><th>Amount</th><th>Method</th><th>Status</th><th>Update</th></tr></thead><tbody>`;
    bakeryData.transactions.forEach(t => {
      html += `<tr><td>${t.transaction_id}</td><td>${t.order_id}</td><td>$${t.amount.toFixed(2)}</td><td>${t.payment_method}</td><td><span class="badge bg-${t.status==='completed'?'success':t.status==='refunded'?'danger':'warning'}">${t.status}</span></td><td><select class="form-select form-select-sm txn-status-update" data-txn="${t.transaction_id}" style="width:110px"><option ${t.status==='pending'?'selected':''}>pending</option><option ${t.status==='completed'?'selected':''}>completed</option><option ${t.status==='failed'?'selected':''}>failed</option><option ${t.status==='refunded'?'selected':''}>refunded</option></select></td></tr>`;
    });
    html += `</tbody></table></div>`;
    return html;
  }

  function renderInquiries() {
    let html = `<div class="row"><div class="col-lg-7"><h3>✉️ Customer Inquiries</h3>`;
    bakeryData.inquiries.forEach(inq => {
      html += `<div class="card mb-3 border-0 shadow-sm"><div class="card-body"><div class="d-flex justify-content-between"><b>${escapeHtml(inq.customer_name)}</b> <span class="badge ${inq.status==='unread'?'bg-danger':'bg-success'}">${inq.status}</span></div><div><small>${escapeHtml(inq.customer_email)} | ${inq.subject}</small></div><p class="mt-2">${escapeHtml(inq.message)}</p>${inq.admin_response ? `<div class="alert alert-warning p-2 small"><i class="bi bi-reply-fill"></i> Reply: ${escapeHtml(inq.admin_response)}</div>` : ''}<button class="btn btn-sm btn-outline-warm reply-inquiry-trigger" data-id="${inq.id}" data-name="${escapeHtml(inq.customer_name)}">Reply</button></div></div>`;
    });
    html += `</div><div class="col-lg-5"><div class="card shadow-sm border-0 rounded-4"><div class="card-header bg-white fw-bold">📬 New Inquiry</div><div class="card-body"><input type="text" id="inqName" class="form-control mb-2" placeholder="Your Name"><input type="email" id="inqEmail" class="form-control mb-2" placeholder="Email"><input type="text" id="inqSubject" class="form-control mb-2" placeholder="Subject"><textarea id="inqMsg" rows="3" class="form-control mb-2" placeholder="Message..."></textarea><button id="submitInquiryBtn" class="btn btn-warm w-100">Submit Inquiry</button></div></div></div></div>`;
    return html;
  }

  function escapeHtml(str) { if(!str) return ''; return str.replace(/[&<>]/g, function(m){if(m==='&') return '&amp;';if(m==='<') return '&lt;';if(m==='>') return '&gt;';return m;}); }

  function attachGlobalEvents() {
    document.querySelectorAll('.quick-order').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = btn.dataset.id, name = btn.dataset.name, price = btn.dataset.price;
        document.getElementById('orderProductId').value = id;
        document.getElementById('orderProductName').value = name;
        document.getElementById('orderProductPrice').value = `$ ${price}`;
        new bootstrap.Modal(document.getElementById('orderModal')).show();
      });
    });
    document.getElementById('confirmOrderBtn')?.addEventListener('click', () => {
      const pid = document.getElementById('orderProductId').value;
      const qty = parseInt(document.getElementById('orderQuantity').value);
      const name = document.getElementById('orderCustomerName').value;
      const email = document.getElementById('orderCustomerEmail').value;
      const phone = document.getElementById('orderCustomerPhone').value;
      const method = document.getElementById('orderPaymentMethod').value;
      if(!name || !email || !qty) { showToast("Fill all required fields", true); return; }
      const res = createOrder(pid, name, email, phone, qty, method);
      if(res.error) showToast(res.error, true);
      else { showToast(`Order ${res.orderNumber} created!`); bootstrap.Modal.getInstance(document.getElementById('orderModal')).hide(); renderActiveModule(); }
    });
    document.getElementById('openAddProductBtn')?.addEventListener('click', () => { document.getElementById('productModalTitle').innerText = 'Add Product'; document.getElementById('editProductId').value=''; document.getElementById('productForm').reset(); new bootstrap.Modal(document.getElementById('productModal')).show(); });
    document.getElementById('saveProductBtn')?.addEventListener('click', () => {
      const id = document.getElementById('editProductId').value;
      const data = { name: document.getElementById('prodName').value, description: document.getElementById('prodDesc').value, price: parseFloat(document.getElementById('prodPrice').value), stock: parseInt(document.getElementById('prodStock').value), image_url: document.getElementById('prodImage').value, category: document.getElementById('prodCategory').value };
      if(!data.name || !data.price) { showToast("Name/Price required", true); return; }
      if(id) updateProduct(parseInt(id), data); else addProduct(data);
      bootstrap.Modal.getInstance(document.getElementById('productModal')).hide();
      renderActiveModule(); showToast("Product saved");
    });
    document.addEventListener('click', (e) => {
      if(e.target.classList.contains('edit-product')) { const btn=e.target; document.getElementById('productModalTitle').innerText='Edit Product'; document.getElementById('editProductId').value=btn.dataset.id; document.getElementById('prodName').value=btn.dataset.name; document.getElementById('prodDesc').value=btn.dataset.desc; document.getElementById('prodPrice').value=btn.dataset.price; document.getElementById('prodStock').value=btn.dataset.stock; document.getElementById('prodImage').value=btn.dataset.img; document.getElementById('prodCategory').value=btn.dataset.cat; new bootstrap.Modal(document.getElementById('productModal')).show(); }
      if(e.target.classList.contains('delete-product')) { if(confirm('Delete product permanently?')) { deleteProduct(parseInt(e.target.dataset.id)); renderActiveModule(); showToast("Product removed"); } }
      if(e.target.classList.contains('cancel-order-btn')) { if(confirm('Cancel order?')) { cancelOrder(parseInt(e.target.dataset.id)); renderActiveModule(); showToast("Order cancelled & stock restored"); } }
      if(e.target.classList.contains('reply-inquiry-trigger')) { document.getElementById('replyInquiryId').value = e.target.dataset.id; new bootstrap.Modal(document.getElementById('replyInquiryModal')).show(); }
    });
    document.getElementById('sendReplyBtn')?.addEventListener('click', () => { const inqId = parseInt(document.getElementById('replyInquiryId').value); const reply = document.getElementById('replyMessage').value; if(reply.trim()) { replyInquiry(inqId, reply); showToast("Reply sent"); bootstrap.Modal.getInstance(document.getElementById('replyInquiryModal')).hide(); renderActiveModule(); } else showToast("Enter reply", true); });
    document.getElementById('submitInquiryBtn')?.addEventListener('click', () => { const name=document.getElementById('inqName').value, email=document.getElementById('inqEmail').value, subj=document.getElementById('inqSubject').value, msg=document.getElementById('inqMsg').value; if(!name||!email||!msg){showToast("All fields required",true);return;} addInquiry(name,email,subj,msg); showToast("Inquiry submitted"); document.getElementById('inqName').value=''; document.getElementById('inqEmail').value=''; document.getElementById('inqSubject').value=''; document.getElementById('inqMsg').value=''; renderActiveModule(); });
    document.querySelectorAll('.status-update').forEach(sel => { sel.addEventListener('change', function() { const orderId = parseInt(this.dataset.id); updateOrderStatus(orderId, this.value); renderActiveModule(); showToast("Status updated"); }); });
    document.querySelectorAll('.txn-status-update').forEach(sel => { sel.addEventListener('change', function() { updateTransactionStatus(this.dataset.txn, this.value); renderActiveModule(); showToast("Transaction updated"); }); });
  }

  function renderActiveModule() {
    const container = document.getElementById('appRoot');
    let content = '';
    if(currentModule === 'dashboard') content = renderDashboard();
    else if(currentModule === 'cakes') content = renderCakeGallery();
    else if(currentModule === 'products') content = renderProducts();
    else if(currentModule === 'orders') content = renderOrders();
    else if(currentModule === 'transactions') content = renderTransactions();
    else if(currentModule === 'inquiries') content = renderInquiries();
    container.innerHTML = content;
    setTimeout(() => { if(currentModule==='dashboard' && document.getElementById('revenueChart')) renderDashboard(); attachGlobalEvents(); if(currentModule==='products') document.getElementById('openAddProductBtn')?.addEventListener('click', ()=>{}); }, 20);
  }

  function init() {
    loadFromLocal();
    document.querySelectorAll('[data-module]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('[data-module]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentModule = btn.dataset.module;
        renderActiveModule();
      });
    });
    renderActiveModule();
    // back to top
    const backBtn = document.createElement('div'); backBtn.className='back-to-top'; backBtn.innerHTML='<i class="bi bi-arrow-up text-white"></i>'; document.body.appendChild(backBtn); backBtn.addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'})); window.addEventListener('scroll',()=>backBtn.classList.toggle('show',window.scrollY>300));
  }
  init();