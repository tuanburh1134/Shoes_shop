(function(){
  const BACKEND = 'http://localhost:8081'
  const API = BACKEND + '/api/products'

  function $(s){return document.querySelector(s)}
  function $all(s){return document.querySelectorAll(s)}

  async function loadList(){
    try{
      const res = await axios.get(API)
      const list = Array.isArray(res.data) ? res.data : []
      const container = $('#admin-product-list')
      container.innerHTML = ''
      list.forEach(p => {
        const el = document.createElement('div')
        el.className = 'list-group-item d-flex justify-content-between align-items-start'
        el.innerHTML = `
          <div>
            <div class="fw-bold">${p.name}</div>
            <div class="text-muted">${p.description}</div>
            <div class="text-muted">Hãng: ${p.brand || ''}</div>
            <div><strong>${p.price} VND</strong> ${p.discount?`<span class="text-success">(-${p.discount}% )</span>`:''}</div>
          </div>
          <div>
            <button class="btn btn-sm btn-primary me-1 edit-btn" data-id="${p.id}">Sửa</button>
            <button class="btn btn-sm btn-danger del-btn" data-id="${p.id}">Xóa</button>
          </div>
        `
        container.appendChild(el)
      })

      // attach handlers
      document.querySelectorAll('.edit-btn').forEach(b=>b.addEventListener('click', onEdit))
      document.querySelectorAll('.del-btn').forEach(b=>b.addEventListener('click', onDelete))
    }catch(e){
      console.error(e);
      alert('Không thể tải danh sách sản phẩm — xem console để biết chi tiết')
    }
  }

  function resetForm(){
    const setIf = (selector, prop, value='') => {
      const el = document.querySelector(selector)
      if(el) try{ el[prop] = value }catch(e){ /* ignore */ }
    }
    setIf('#prod-id','value','')
    setIf('#prod-name','value','')
    setIf('#prod-desc','value','')
    setIf('#prod-price','value','')
    setIf('#prod-discount','value','')
    setIf('#prod-detail','value','')
    const pb = document.getElementById('prod-brand')
    if(pb) try{ pb.value = '' }catch(e){}
    // clear file inputs and previews
    const fi = document.getElementById('prod-image')
    const fd = document.getElementById('prod-detail-image')
    if(fi) fi.value = ''
    if(fd) fd.value = ''
    const p1 = document.getElementById('prod-image-preview')
    const p2 = document.getElementById('prod-detail-image-preview')
    if(p1) p1.innerHTML = ''
    if(p2) p2.innerHTML = ''
    // reset qty inputs
    try{
      const sizes = ['39','40','41','42','43','44']
      for(let i=0;i<sizes.length;i++){
        const el = document.getElementById('qty-'+sizes[i])
        if(el) el.value = ''
      }
    }catch(e){ /* ignore */ }
  }

  async function onEdit(e){
    const id = e.currentTarget.dataset.id
    try{
      const res = await axios.get(API)
      const prod = res.data.find(x=>x.id==id)
      if(!prod) return alert('Sản phẩm không tồn tại')
      $('#prod-id').value = prod.id
      $('#prod-name').value = prod.name
      $('#prod-desc').value = prod.description
      $('#prod-detail').value = prod.detail || ''
      $('#prod-price').value = prod.price
      $('#prod-discount').value = prod.discount || ''
      // populate qty fields
      const q39 = document.getElementById('qty-39')
      const q40 = document.getElementById('qty-40')
      const q41 = document.getElementById('qty-41')
      const q42 = document.getElementById('qty-42')
      const q43 = document.getElementById('qty-43')
      const q44 = document.getElementById('qty-44')
      if(q39) q39.value = prod.qty39 || ''
      if(q40) q40.value = prod.qty40 || ''
      if(q41) q41.value = prod.qty41 || ''
      if(q42) q42.value = prod.qty42 || ''
      if(q43) q43.value = prod.qty43 || ''
      if(q44) q44.value = prod.qty44 || ''
      var pb = document.getElementById('prod-brand')
      if(pb) pb.value = prod.brand || ''
      // show image previews if available
      const imgPreview = document.getElementById('prod-image-preview')
      const detPreview = document.getElementById('prod-detail-image-preview')
      if(imgPreview) imgPreview.innerHTML = prod.image ? `<img src="${(prod.image.startsWith && prod.image.startsWith('/')? BACKEND+prod.image : prod.image)}" style="max-width:120px;max-height:80px">` : ''
      if(detPreview) detPreview.innerHTML = prod.detailImage ? `<img src="${(prod.detailImage && prod.detailImage.startsWith && prod.detailImage.startsWith('/')? BACKEND+prod.detailImage : prod.detailImage)}" style="max-width:180px;max-height:120px">` : ''
    }catch(e){console.error(e)}
  }

  async function onDelete(e){
    const id = e.currentTarget.dataset.id
    if(!confirm('Bạn có chắc muốn xóa sản phẩm này?')) return
    try{
      const cur = JSON.parse(localStorage.getItem('currentUser')||'null')
      const headers = cur && cur.username && cur.password ? { Authorization: 'Basic ' + btoa(cur.username+':'+cur.password) } : {}
      await axios.delete(API + '/' + id, { headers })
      localStorage.setItem('productsUpdated', Date.now())
      await loadList()
    }catch(e){console.error(e); alert('Xóa thất bại')}
  }

  async function onSave(e){
    e.preventDefault()
    const id = $('#prod-id').value
    const form = new FormData()
    form.append('name', $('#prod-name').value.trim())
    form.append('description', $('#prod-desc').value.trim())
    form.append('detail', $('#prod-detail').value.trim())
    form.append('price', parseFloat($('#prod-price').value) || 0)
    form.append('discount', parseFloat($('#prod-discount').value) || 0)
    form.append('brand', $('#prod-brand').value || '')
    // append qtys
    form.append('qty39', parseInt(document.getElementById('qty-39').value||0))
    form.append('qty40', parseInt(document.getElementById('qty-40').value||0))
    form.append('qty41', parseInt(document.getElementById('qty-41').value||0))
    form.append('qty42', parseInt(document.getElementById('qty-42').value||0))
    form.append('qty43', parseInt(document.getElementById('qty-43').value||0))
    form.append('qty44', parseInt(document.getElementById('qty-44').value||0))

    const fileImage = document.getElementById('prod-image')
    const fileDetail = document.getElementById('prod-detail-image')
    if(fileImage && fileImage.files && fileImage.files.length>0) form.append('image', fileImage.files[0])
    if(fileDetail && fileDetail.files && fileDetail.files.length>0) form.append('detailImage', fileDetail.files[0])

    console.log('Saving product (multipart)', id || '(new)')
    try{
      const cur = JSON.parse(localStorage.getItem('currentUser')||'null')
      const headers = cur && cur.username && cur.password ? { Authorization: 'Basic ' + btoa(cur.username+':'+cur.password) } : {}
      let resp
      if(id){
        // use multipart update endpoint
        resp = await axios.put(API + '/' + id + '/upload', form, { headers: { ...headers, 'Content-Type': 'multipart/form-data' } })
      } else {
        resp = await axios.post(API + '/upload', form, { headers: { ...headers, 'Content-Type': 'multipart/form-data' } })
      }
      // update flag and try best-effort post-save UI updates without failing the success path
      localStorage.setItem('productsUpdated', Date.now())
      try{
        resetForm()
      }catch(e){ console.error('resetForm failed', e) }
      try{
        await loadList()
      }catch(e){ console.error('loadList after save failed', e) }
      console.log('Server response:', resp.status, resp.data)
      alert('Lưu thành công')
    }catch(e){
      console.error(e)
      const status = e.response && e.response.status ? e.response.status : null
      const data = e.response && e.response.data ? e.response.data : null
      const msg = data && data.message ? data.message : (data ? JSON.stringify(data) : e.message)
      alert('Lưu thất bại' + (status ? ' ('+status+')' : '') + ': ' + msg)
    }
  }

  // init
  document.addEventListener('DOMContentLoaded', function(){
    loadList()
    loadBrands()
    $('#product-form').addEventListener('submit', onSave)
    $('#reset-btn').addEventListener('click', resetForm)

    // preview file inputs
    const imgInput = document.getElementById('prod-image')
    const detInput = document.getElementById('prod-detail-image')
    if(imgInput) imgInput.addEventListener('change', function(){
      const p = document.getElementById('prod-image-preview');
      if(this.files && this.files[0]) p.innerHTML = `<img src="${URL.createObjectURL(this.files[0])}" style="max-width:120px;max-height:80px">`
    })
    if(detInput) detInput.addEventListener('change', function(){
      const p = document.getElementById('prod-detail-image-preview');
      if(this.files && this.files[0]) p.innerHTML = `<img src="${URL.createObjectURL(this.files[0])}" style="max-width:180px;max-height:120px">`
    })
  })

  // populate brand select using existing product brands from API
  async function loadBrands(){
    try{
      const res = await axios.get(API)
      const brands = Array.from(new Set((res.data || []).map(p=> (p.brand||'').trim()).filter(b=>b)))
      const sel = document.getElementById('prod-brand')
      if(!sel) return
      // clear existing (except first placeholder)
      const placeholder = sel.querySelector('option[value=""]')
      sel.innerHTML = ''
      if(placeholder) sel.appendChild(placeholder)
      brands.forEach(b=>{
        const opt = document.createElement('option')
        opt.value = b
        opt.textContent = b
        sel.appendChild(opt)
      })
      // keep some common suggestions even if not in DB
      const suggestions = ['Labubu','Nike','Adidas','Puma','Lacoste','Clarks']
      suggestions.forEach(s=>{
        if(!brands.includes(s)){
          const opt = document.createElement('option')
          opt.value = s
          opt.textContent = s
          sel.appendChild(opt)
        }
      })
    }catch(e){console.error('Could not load brands',e)}
  }

})();
