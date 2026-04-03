const BACKEND = 'http://localhost:8080';
const API_URL = BACKEND + '/api/products';

// Helpers to parse inventory and stock
function parseInventory(raw){
    if(!raw) return null;
    try{
        return typeof raw === 'string' ? JSON.parse(raw) : raw;
    }catch(e){ console.warn('Cannot parse inventory', e); return null; }
}

function getAvailableSizesFromInventory(inv){
    if(!inv) return null;
    const set = new Set();
    Object.values(inv).forEach(colorMap => {
        if(!colorMap || typeof colorMap !== 'object') return;
        Object.keys(colorMap).forEach(size => set.add(String(size)));
    });
    return Array.from(set).sort();
}

function qs(name){
    const u = new URL(window.location.href);
    return u.searchParams.get(name);
}

async function loadProduct(){
    const id = qs('id');
    if(!id) return;
    let product = null;
    try{
        const res = await axios.get(API_URL);
        const items = res.data || [];
        product = items.find(p => String(p.id) === String(id));
    }catch(e){
        console.error(e);
    }
    if(!product){
        // No product found — show friendly message instead of sample data
        const crumb = document.getElementById('crumb-name'); if(crumb) crumb.textContent = 'Sản phẩm không tồn tại';
        const main = document.getElementById('main-image'); if(main) main.innerHTML = '<div class="alert alert-warning">Sản phẩm không tồn tại hoặc đã bị xóa.</div>';
        const nameEl = document.getElementById('pd-name'); if(nameEl) nameEl.textContent = '';
        const brandEl = document.getElementById('pd-brand'); if(brandEl) brandEl.textContent = '';
        const priceEl = document.getElementById('pd-price'); if(priceEl) priceEl.textContent = '';
        const oldEl = document.getElementById('pd-oldprice'); if(oldEl) oldEl.textContent = '';
        const detailEl = document.getElementById('pd-detail'); if(detailEl) detailEl.innerHTML = '';
        return;
    }

    renderProduct(product);
}

function renderProduct(p){
    const inventory = parseInventory(p.inventory);
    const colors = inventory ? Object.keys(inventory) : [];
    let selectedColor = colors.length > 0 ? colors[0] : null;

    document.getElementById('pd-name').textContent = p.name || '';
    document.getElementById('pd-brand').textContent = p.brand || '';
    document.getElementById('pd-price').textContent = (window.formatVND ? formatVND(p.price) : (p.price||''));
    document.getElementById('pd-oldprice').textContent = (p.oldPrice ? (window.formatVND ? formatVND(p.oldPrice) : p.oldPrice) : '');
    document.getElementById('pd-detail').innerHTML = p.detail || p.description || '';
    document.getElementById('crumb-name').textContent = p.name || 'Sản phẩm';

    const main = document.getElementById('main-image');
    main.innerHTML = '';
    const imgUrl = (p.image && p.image.startsWith && p.image.startsWith('/') ? BACKEND + p.image : p.image) || 'https://via.placeholder.com/640x420?text=Product';
    const img = document.createElement('img'); img.src = imgUrl; img.style.maxWidth = '100%'; img.style.maxHeight = '520px'; img.style.objectFit='contain';
    main.appendChild(img);

    const thumbs = document.getElementById('thumbs'); thumbs.innerHTML = '';
    const thumbUrls = [];
    // primary image first
    if(p.image) thumbUrls.push((p.image && p.image.startsWith('/')? BACKEND + p.image : p.image));
    // detailImage fallback
    if(p.detailImage) thumbUrls.push((p.detailImage && p.detailImage.startsWith('/')? BACKEND + p.detailImage : p.detailImage));
    // parse detailImages JSON (array of urls) and append all
    try{
        if(p.detailImages){
            let arr = [];
            if(typeof p.detailImages === 'string') arr = JSON.parse(p.detailImages || '[]');
            else if(Array.isArray(p.detailImages)) arr = p.detailImages;
            arr.forEach(u => { if(u) thumbUrls.push((u && u.startsWith('/')? BACKEND + u : u)); })
        }
    }catch(e){ /* ignore parse errors */ }
    // remove duplicates while preserving order
    const seen = new Set();
    const uniq = thumbUrls.filter(u => { if(!u) return false; if(seen.has(u)) return false; seen.add(u); return true; });
    if(uniq.length === 0) uniq.push('https://via.placeholder.com/240x140?text=Product');

    uniq.forEach(u => {
        const t = document.createElement('div');
        t.className = 'p-1 border me-2';
        t.style.cursor = 'pointer';
        t.style.width = '72px';
        t.innerHTML = `<img src="${u}" style="width:100%;height:64px;object-fit:contain">`;
        t.addEventListener('click', ()=>{ main.querySelector('img').src = u });
        thumbs.appendChild(t);
    });

    // Color picker (if inventory provides colors)
    const colorWrap = document.getElementById('pd-colors') || (()=>{
        const host = document.getElementById('pd-color-block');
        if(host) return host;
        const cont = document.createElement('div');
        cont.id = 'pd-colors';
        const label = document.createElement('div'); label.className='mb-1 fw-semibold'; label.textContent = 'Màu sắc';
        cont.appendChild(label);
        const btnRow = document.createElement('div'); btnRow.id='pd-color-row'; btnRow.className='d-flex gap-2 flex-wrap'; cont.appendChild(btnRow);
        const sizesBlock = document.getElementById('pd-sizes-block') || document.getElementById('pd-sizes');
        if(sizesBlock && sizesBlock.parentNode){ sizesBlock.parentNode.insertBefore(cont, sizesBlock); }
        else document.body.appendChild(cont);
        return cont;
    })();
    const colorRow = document.getElementById('pd-color-row'); if(colorRow) colorRow.innerHTML='';
    if(colorRow && colors.length){
        colors.forEach(c=>{
            const b = document.createElement('button');
            b.className='btn btn-outline-secondary';
            b.textContent = c;
            if(c === selectedColor) b.classList.add('btn-primary');
            b.addEventListener('click', ()=>{
                selectedColor = c;
                colorRow.querySelectorAll('button').forEach(x=>x.classList.remove('btn-primary'));
                b.classList.add('btn-primary');
                renderSizes();
            });
            colorRow.appendChild(b);
        });
    }

    // sizes and add handlers with per-color stock
    const pdSizes = document.getElementById('pd-sizes');
    function renderSizes(){
        if(!pdSizes) return;
        pdSizes.innerHTML = '';
        const derivedSizes = getAvailableSizesFromInventory(inventory) || ['39','40','41','42','43','44'];
        derivedSizes.forEach(s => {
            const btn = document.createElement('button');
            btn.className = 'btn btn-outline-secondary d-flex flex-column align-items-center justify-content-center';
            const sizeSpan = document.createElement('span'); sizeSpan.textContent = s; sizeSpan.className = 'fw-bold';
            const stockSpan = document.createElement('small'); stockSpan.className = 'text-muted';

            // compute available
            let available = null;
            if(inventory && selectedColor && inventory[selectedColor]){
                const val = inventory[selectedColor][s];
                available = (val == null) ? 0 : Number(val);
            } else {
                const qtyKey = 'qty' + s;
                if(typeof p[qtyKey] !== 'undefined') available = p[qtyKey] || 0;
            }

            if(available === null){
                stockSpan.textContent = '';
            } else if(available <= 0){
                stockSpan.textContent = 'Hết hàng';
                btn.disabled = true;
                btn.classList.add('disabled');
            } else {
                stockSpan.textContent = 'Còn ' + available;
            }

            btn.appendChild(sizeSpan);
            btn.appendChild(stockSpan);
            btn.dataset.size = s;
            btn.addEventListener('click', ()=>{
                if(btn.disabled) return;
                pdSizes.querySelectorAll('button').forEach(b=>b.classList.remove('btn-primary'));
                btn.classList.add('btn-primary');
            });
            pdSizes.appendChild(btn);
        });
    }
    renderSizes();

    document.getElementById('pd-add').addEventListener('click', ()=>{
        const selected = pdSizes.querySelector('button.btn-primary');
        const size = selected ? selected.dataset.size : '';
        const color = selectedColor || '';
        const qty = parseInt(document.getElementById('pd-qty').value,10) || 1;
        // if selected size has no stock, block adding
        if(size){
            let available = null;
            if(inventory && color && inventory[color]){
                const v = inventory[color][size];
                available = (v == null) ? 0 : Number(v);
            } else {
                const qtyKey = 'qty' + size; available = (typeof p[qtyKey] !== 'undefined') ? (p[qtyKey] || 0) : null;
            }
            if(available !== null && available <= 0){ alert('Sản phẩm size ' + size + ' đã hết'); return }
        }
        const item = { id: p.id, name: p.name, price: parsePrice(p.price || p.priceText || ''), img: imgUrl, size: size, color: color, qty: qty };
        // add to cart storage
        if(window.cart && typeof window.cart.add === 'function'){
            window.cart.add(item);
        }else{
            // fallback: store minimal info in localStorage
            const raw = localStorage.getItem('cart_items_v1');
            let list = raw ? JSON.parse(raw) : [];
            const idx = list.findIndex(c=>String(c.id)===String(item.id) && String(c.size||'')===String(item.size||''));
            if(idx>=0) list[idx].qty = (list[idx].qty||0) + item.qty; else list.push(item);
            localStorage.setItem('cart_items_v1', JSON.stringify(list));
            // notify other tabs
            localStorage.setItem('cartUpdatedAt', String(Date.now()));
        }

        // animate image to cart and show notification
        const imgEl = main.querySelector('img');
        animateImageToCart(imgEl);
        window.showNotification && window.showNotification('Đã thêm vào giỏ', p.name || '', 'success', 1400);
    });
    document.getElementById('pd-buy').addEventListener('click', async ()=>{
        // open the same checkout modal used by the cart, pre-filled for this single product
        const selected = pdSizes.querySelector('button.btn-primary');
        const size = selected ? selected.dataset.size : '';
        const color = selectedColor || '';
        const qty = parseInt(document.getElementById('pd-qty').value,10) || 1;
        if(size){
            let available = null;
            if(inventory && color && inventory[color]){
                const v = inventory[color][size];
                available = (v == null) ? 0 : Number(v);
            } else {
                const qtyKey = 'qty' + size; available = (typeof p[qtyKey] !== 'undefined') ? (p[qtyKey] || 0) : null;
            }
            if(available !== null && available <= 0){ alert('Sản phẩm size ' + size + ' đã hết'); return }
        }
        const item = { id: p.id, name: p.name, price: parsePrice(p.price || p.priceText || ''), img: imgUrl, size: size, color: color, qty: qty };
        try{
            if(typeof window.showCheckoutModal === 'function'){
                const payload = await window.showCheckoutModal([item], (item.qty||1) * (parseInt(String(item.price||'').replace(/[^0-9]/g,''),10)||0));
                if(!payload) return;
                // mimic cart checkout flow: create local order if cash
                if(payload.method === 'cash'){
                    const ordersKey = 'orders_v1'
                    let orders = []
                    try{ orders = JSON.parse(localStorage.getItem(ordersKey)||'[]') }catch(e){ orders = [] }
                    const total = (parseInt(String(item.price||'').replace(/[^0-9]/g,''),10)||0) * (item.qty||1)
                    const order = { id: 'o_' + Date.now(), items: [item], total: total, address: payload.address, phone: payload.phone, method: payload.method, discount: payload.discount || null, status: 'pending', createdAt: Date.now() }
                    orders.unshift(order)
                    localStorage.setItem(ordersKey, JSON.stringify(orders))
                    if(window.notifications && window.notifications.add){ window.notifications.add({ title: 'Đơn hàng mới', message: 'Đơn ' + order.id + ' chờ duyệt', target: 'admin', orderId: order.id }) }
                    if(window.showNotification) window.showNotification('Đặt hàng thành công','Đơn hàng chờ xác nhận','success',2200)
                } else {
                    if(window.showNotification) window.showNotification('Phương thức chưa phát triển','Vui lòng chọn tiền mặt', 'error')
                }
            } else {
                // fallback: redirect to checkout page
                window.showNotification && window.showNotification('Chuyển đến thanh toán', p.name || '', 'info', 800);
                setTimeout(()=>{ window.location.href = 'checkout.html' }, 800);
            }
        }catch(e){ console.error('Mua ngay failed', e); if(window.showNotification) window.showNotification('Thanh toán thất bại','Vui lòng thử lại','error',2500) }
    });
}

loadProduct().catch(console.error);

// animate cloned image from product to cart icon in header
function animateImageToCart(imgEl){
    if(!imgEl) return;
    const cartAnchor = document.querySelector('a[href="cart.html"]');
    const cartRect = cartAnchor ? cartAnchor.getBoundingClientRect() : null;
    const imgRect = imgEl.getBoundingClientRect();

    const clone = imgEl.cloneNode(true);
    clone.style.position = 'fixed';
    clone.style.left = imgRect.left + 'px';
    clone.style.top = imgRect.top + 'px';
    clone.style.width = imgRect.width + 'px';
    clone.style.height = imgRect.height + 'px';
    clone.style.transition = 'transform 700ms cubic-bezier(.2,.8,.2,1), opacity 700ms';
    clone.style.zIndex = 9999;
    clone.style.pointerEvents = 'none';
    clone.style.objectFit = 'contain';
    document.body.appendChild(clone);

    // compute destination center (cart badge center)
    let destX = window.innerWidth - 40, destY = 20;
    if(cartRect){
        destX = cartRect.left + cartRect.width/2;
        destY = cartRect.top + cartRect.height/2;
    }

    const deltaX = destX - (imgRect.left + imgRect.width/2);
    const deltaY = destY - (imgRect.top + imgRect.height/2);

    requestAnimationFrame(()=>{
        clone.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(0.18) rotate(10deg)`;
        clone.style.opacity = '0.95';
    });

    clone.addEventListener('transitionend', ()=>{
        clone.remove();
        // small pop on badge
        const badge = document.querySelector('.cart-badge');
        if(badge){
            badge.animate([
                { transform: 'scale(1)' },
                { transform: 'scale(1.25)' },
                { transform: 'scale(1)' }
            ], { duration: 360, easing: 'cubic-bezier(.2,.8,.2,1)' });
        }
    }, { once: true });
}
