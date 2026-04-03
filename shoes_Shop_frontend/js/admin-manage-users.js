(function(){
  const API = 'http://localhost:8080/api/users'

  function getAuthHeaders(){
    try{
      const cur = JSON.parse(localStorage.getItem('currentUser')||'null')
      if(cur && cur.username && cur.password){
        const token = btoa(cur.username + ':' + cur.password)
        return { Authorization: 'Basic ' + token }
      }
    }catch(e){ }
    return {}
  }

  function el(sel){return document.querySelector(sel)}
  function render(users){
    const tbody = el('#users-table tbody')
    tbody.innerHTML = ''
    users.forEach(u=>{
      const tr = document.createElement('tr')
      const banText = u.bannedForever ? 'Vĩnh viễn' : (u.bannedUntil ? new Date(u.bannedUntil).toLocaleString() : '---')
      tr.innerHTML = `
        <td>${u.id}</td>
        <td>${u.username}</td>
        <td>${u.email || ''}</td>
        <td>
          <select class="form-select form-select-sm role-select" data-id="${u.id}">
            <option value="user" ${u.role==='user'?'selected':''}>Người dùng</option>
            <option value="admin" ${u.role==='admin'?'selected':''}>Quản trị</option>
          </select>
        </td>
        <td>${banText}</td>
        <td>
          <div class="btn-group">
            <button class="btn btn-sm btn-primary btn-set-role" data-id="${u.id}">Cập nhật</button>
            <button class="btn btn-sm btn-warning btn-ban" data-id="${u.id}">Khóa</button>
            <button class="btn btn-sm btn-secondary btn-unban" data-id="${u.id}">Gỡ khóa</button>
          </div>
        </td>
      `
      tbody.appendChild(tr)
    })

    // attach handlers
    document.querySelectorAll('.btn-set-role').forEach(b=>b.addEventListener('click', onSetRole))
    document.querySelectorAll('.btn-ban').forEach(b=>b.addEventListener('click', onBan))
    document.querySelectorAll('.btn-unban').forEach(b=>b.addEventListener('click', onUnban))
  }

  async function load(){
    try{
      const r = await axios.get(API, { headers: getAuthHeaders() })
      render(r.data || [])
    }catch(e){console.error(e); showNotification('Không thể tải danh sách người dùng', 'error')}
  }

  async function onSetRole(e){
    const id = e.currentTarget.dataset.id
    const sel = document.querySelector('.role-select[data-id="'+id+'"]')
    if(!sel) return
    const role = sel.value
    try{
      await axios.put(API + '/' + id + '/role?role=' + encodeURIComponent(role), null, { headers: getAuthHeaders() })
      showNotification('Đã cập nhật quyền', 'success')
      load()
    }catch(e){console.error(e); showNotification('Cập nhật quyền thất bại', 'error')}
  }

  async function onBan(e){
    const id = e.currentTarget.dataset.id
    const choice = prompt('Nhập số ngày khóa tài khoản này . Nhập "lock" để khóa vĩnh viễn:')
    if(choice === null) return
    if(choice === 'lock'){
      try{ await axios.put(API + '/' + id + '/ban?forever=true', null, { headers: getAuthHeaders() }); showNotification('Khóa vĩnh viễn', 'success'); load(); }catch(e){console.error(e); showNotification('Thất bại', 'error')}
      return
    }
    const days = parseInt(choice)
    if(!days || days<=0) return showNotification('Giá trị ngày không hợp lệ', 'error')
    try{ await axios.put(API + '/' + id + '/ban?days=' + days, null, { headers: getAuthHeaders() }); showNotification('Đã khóa ' + days + ' ngày', 'success'); load(); }catch(e){console.error(e); showNotification('Thất bại', 'error')}
  }

  async function onUnban(e){
    const id = e.currentTarget.dataset.id
    try{
      var ok = true
      if(window.showConfirm){
        ok = await window.showConfirm('Gỡ khóa tài khoản này?', 'Xác nhận')
      } else {
        ok = confirm('Gỡ khóa tài khoản này?')
      }
      if(!ok) return
      await axios.put(API + '/' + id + '/ban', null, { headers: getAuthHeaders() }); showNotification('Đã gỡ khóa', 'success'); load();
    }catch(e){console.error(e); showNotification('Thất bại', 'error')}
  }

  document.addEventListener('DOMContentLoaded', load)
})();
