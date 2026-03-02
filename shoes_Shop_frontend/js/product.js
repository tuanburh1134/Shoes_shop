const BACKEND = 'http://localhost:8081';
const API_URL = BACKEND + "/api/products";

function sampleProducts(){
    return [
        {id:1,name:'Giày Nike Dunk Low Retro Nam - Trắng Xanh',description:'Classic silhouette',price:'2.890.000đ',oldPrice:'3.550.000đ',img:'https://i.imgur.com/1Q9Z1Z2.png',badges:['SIÊU SALE','HÀNG MỚI VỀ'],rating:5},
        {id:2,name:'Giày Nike Air Jordan 1 Low Nam - Đen Đỏ',description:'Iconic Jordan',price:'3.390.000đ',oldPrice:'3.900.000đ',img:'https://i.imgur.com/2cOaJ.png',badges:['HOT'],rating:5},
        {id:3,name:'Giày adidas VL Court Base Nam - Xám Nâu',description:'Casual sneaker',price:'1.290.000đ',oldPrice:'1.600.000đ',img:'https://i.imgur.com/3bKQ.png',badges:['HÀNG MỚI VỀ'],rating:5},
        {id:4,name:'Giày Asics Runner - Navy',description:'Performance running',price:'2.790.000đ',oldPrice:'3.150.000đ',img:'https://i.imgur.com/4fPq.png',badges:[],rating:5},
        {id:5,name:'Giày Nike Court Vision Low Nữ - Panda',description:'Everyday comfort',price:'1.990.000đ',oldPrice:'2.300.000đ',img:'https://i.imgur.com/5gHk.png',badges:[],rating:5}
    ];
}

let ALL_PRODUCTS = [];
const ITEMS_PER_ROW = 3;
const ROWS_PER_PAGE = 15; // as requested
const PAGE_SIZE = ITEMS_PER_ROW * ROWS_PER_PAGE; // 45 items per page
let currentPage = 1;

async function loadProducts() {
        const container = document.getElementById("product-list");
        if(!container) return;
        container.innerHTML = "";

        try{
                const response = await axios.get(API_URL);
                // map backend ProductDTO to frontend product model
                ALL_PRODUCTS = (response.data || []).map(p => ({
                        id: p.id,
                        name: p.name,
                        description: p.description,
                        price: p.price,
                        img: p.image || 'https://via.placeholder.com/240x140?text=Product',
                        detailImage: p.detailImage || '',
                        badges: p.hot ? ['HOT'] : [],
                        brand: p.brand || '',
                        qty39: p.qty39 || 0,
                        qty40: p.qty40 || 0,
                        qty41: p.qty41 || 0,
                        qty42: p.qty42 || 0,
                        qty43: p.qty43 || 0,
                        qty44: p.qty44 || 0
                }));
        }catch(e){
                // fallback demo products
                ALL_PRODUCTS = sampleProducts();
        }

        renderPage(currentPage);
        renderPagination();
        renderCategories();
}

function renderCategories(){
        const container = document.querySelector('.categories-nav .container');
        if(!container) return;

        // Default types requested by user (these will appear even if no product yet)
        const defaultTypes = [
                {brand: 'Nike', label: 'Giày Nike'},
                {brand: 'Adidas', label: 'Giày Adidas'},
                {brand: 'Lacoste', label: 'Giày Lacoste'},
                {brand: 'Puma', label: 'Giày Puma'},
                {brand: 'Clarks', label: 'Giày Clarks'},
                {brand: 'Labubu', label: 'giày labubu'},
                {brand: 'TheThao', label: 'Giày Thể Thao'}
        ];

        // compute unique brands from ALL_PRODUCTS (preserve original spelling)
        const foundBrands = Array.from(new Set(ALL_PRODUCTS.map(p=> (p.brand||'').trim() ).filter(b=>b)));

        // Merge defaultTypes and foundBrands into a single ordered list without duplicates
        const merged = [];
        const seen = new Set();

        // first add defaults (use brand key for filtering)
        defaultTypes.forEach(d => {
                if(!seen.has(d.brand)){
                        merged.push({brand: d.brand, label: d.label});
                        seen.add(d.brand);
                }
        });

        // then add any discovered brands from products (if different / new)
        foundBrands.forEach(b => {
                if(!seen.has(b)){
                        merged.push({brand: b, label: 'Giày ' + b});
                        seen.add(b);
                }
        });

        container.innerHTML = '';

        merged.forEach(item => {
                const b = item.brand;
                const label = item.label;
                const el = document.createElement('div');
                el.className = 'category-item';
                el.setAttribute('data-brand', b);
                el.textContent = label;

                // add special badges for Labubu and Adidas (case-insensitive match)
                if(String(b).toLowerCase() === 'labubu'){
                        const span = document.createElement('span'); span.className = 'badge badge-new'; span.textContent = 'New'; el.appendChild(span)
                }
                if(String(b).toLowerCase() === 'adidas'){
                        const span = document.createElement('span'); span.className = 'badge badge-sale'; span.textContent = 'Sale'; el.appendChild(span)
                }

                container.appendChild(el);
        });

        // add spacer and % SALE to right
        const right = document.createElement('div'); right.className = 'category-item text-danger ms-auto'; right.textContent = '% SALE';
        container.appendChild(right);
}

function renderProductCard(product){
                const badgesHtml = (product.badges||[]).map(b=>`<div class="badge-custom">${b}</div>`).join('');
        const ratingStars = Array.from({length: product.rating||0}).map(()=>'<i class="fa fa-star"></i>').join('');
        return `
                <div class="product-item">
                    <div class="product-card position-relative">
                                                <div class="badges">${badgesHtml}</div>
                                        <div class="media"><img src="${(product.img && product.img.startsWith && product.img.startsWith('/') ? BACKEND+product.img : product.img)||'https://via.placeholder.com/240x140?text=Product'}" alt="${product.name}" style="cursor:pointer" onclick="(function(){window.open('${(product.detailImage && product.detailImage.startsWith && product.detailImage.startsWith('/') ? BACKEND+product.detailImage : product.detailImage)||product.img}','_blank')})()"></div>
                                        ${((product.qty39||0)+(product.qty40||0)+(product.qty41||0)+(product.qty42||0)+(product.qty43||0)+(product.qty44||0))<=0?'<div class="badge-custom out-of-stock">Hết hàng</div>':''}
                        <div class="body">
                                                        <div class="mb-1" style="font-size:13px;color:#777">${product.brand||''}</div>
                            <div class="title">${product.name}</div>
                            <div class="rating">${ratingStars}</div>
                            <div class="meta">${product.description||''}</div>
                            <div class="mt-auto">
                                <span class="price">${product.price}</span>
                                ${product.oldPrice?`<span class="old-price">${product.oldPrice}</span>`:''}
                            </div>
                        </div>
                    </div>
                </div>
        `;
}

function renderPage(page){
        const container = document.getElementById("product-list");
        if(!container) return;
        container.innerHTML = "";
        const start = (page - 1) * PAGE_SIZE;
        const end = start + PAGE_SIZE;
        const pageItems = ALL_PRODUCTS.slice(start, end);
        pageItems.forEach(p => container.innerHTML += renderProductCard(p));
}

function renderPagination(){
        const pag = document.getElementById('pagination');
        if(!pag) return;
        pag.innerHTML = '';
        const total = ALL_PRODUCTS.length;
        const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

        function btn(label, disabled, dataPage){
                const el = document.createElement('button');
                el.className = 'btn btn-sm btn-outline-primary mx-1';
                if(disabled) el.classList.add('disabled');
                el.textContent = label;
                if(!disabled) el.addEventListener('click', ()=>{ currentPage = dataPage; renderPage(currentPage); renderPagination(); window.scrollTo({top:200,behavior:'smooth'}) });
                return el;
        }

        pag.appendChild(btn('‹ Prev', currentPage<=1, currentPage-1));

        // show page numbers with limit
        const maxButtons = 7;
        let startPage = Math.max(1, currentPage - Math.floor(maxButtons/2));
        let endPage = Math.min(totalPages, startPage + maxButtons - 1);
        if(endPage - startPage < maxButtons -1) startPage = Math.max(1, endPage - maxButtons +1);

        for(let i=startPage;i<=endPage;i++){
                const el = document.createElement('button');
                el.className = 'btn btn-sm mx-1 ' + (i===currentPage ? 'btn-primary' : 'btn-outline-primary');
                el.textContent = String(i);
                if(i!==currentPage) el.addEventListener('click', ()=>{ currentPage = i; renderPage(currentPage); renderPagination(); window.scrollTo({top:200,behavior:'smooth'}) });
                pag.appendChild(el);
        }

        pag.appendChild(btn('Next ›', currentPage>=totalPages, currentPage+1));
}

loadProducts();

// Reload products when another tab/page signals an update
window.addEventListener('storage', function(e){
        if(e.key === 'productsUpdated'){
                // reload data and go back to first page
                currentPage = 1;
                loadProducts().catch(console.error)
        }
});

// Reload products when another tab/page signals an update
window.addEventListener('storage', function(e){
    if(e.key === 'productsUpdated'){
        loadProducts().catch(console.error)
    }
});
