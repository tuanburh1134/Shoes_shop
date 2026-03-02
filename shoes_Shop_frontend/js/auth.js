// Simple client-side auth for demo purposes
(function(){
  function $(sel){return document.querySelector(sel)}
  function getUsers(){
    try{return JSON.parse(localStorage.getItem('users')||'[]')||[];}catch(e){return[]}
  }
  function saveUsers(u){localStorage.setItem('users',JSON.stringify(u))}
  function setCurrent(user){localStorage.setItem('currentUser',JSON.stringify(user))}
  function getCurrent(){try{return JSON.parse(localStorage.getItem('currentUser')||'null')}catch(e){return null}}

  // header update & account link behaviour
  function updateHeader(){
    var cur = getCurrent()
    var acctText = document.getElementById('account-text')
    var logoutLink = document.getElementById('logout-link')
    if(cur && cur.username){
      if(acctText) acctText.textContent = cur.username
      if(logoutLink) logoutLink.classList.remove('d-none')
    } else {
      if(acctText) acctText.textContent = 'Tài khoản'
      if(logoutLink) logoutLink.classList.add('d-none')
    }
  }

  var acct = document.getElementById('account-link')
  var acctMenu = document.getElementById('account-menu')
  if(acct){
    acct.addEventListener('click', function(e){
      e.preventDefault()
      renderAccountMenu()
      if(acctMenu) acctMenu.style.display = acctMenu.style.display === 'block' ? 'none' : 'block'
    })
  }

  // close menu when clicking outside
  document.addEventListener('click', function(e){
    if(!acct) return
    var target = e.target
    if(acctMenu && acctMenu.style.display === 'block'){
      if(target !== acct && !acct.contains(target) && !acctMenu.contains(target)){
        acctMenu.style.display = 'none'
      }
    }
  })

  function renderAccountMenu(){
    if(!acctMenu) return
    var cur = getCurrent()
    acctMenu.innerHTML = ''
    if(cur && cur.username){
      // For non-admin users show account management
      if(!(cur.role && cur.role.toLowerCase() === 'admin')){
        var btnProfile = document.createElement('button')
        btnProfile.className = 'btn-menu'
        btnProfile.textContent = 'Quản lí tài khoản'
        btnProfile.addEventListener('click', function(ev){
          ev.preventDefault()
          showAccountModal()
          acctMenu.style.display = 'none'
        })
        acctMenu.appendChild(btnProfile)
      }

      // For admin role show a single "Trang quản lí" button (with icon)
      if(cur.role && cur.role.toLowerCase() === 'admin'){
        var btnAdmin = document.createElement('button')
        btnAdmin.className = 'btn-menu admin-manage-btn'
        btnAdmin.innerHTML = '<i class="fa fa-cog menu-icon" aria-hidden="true"></i> Trang quản lí'
        btnAdmin.addEventListener('click', function(ev){
          ev.preventDefault()
          // navigate to admin dashboard page
          window.location.href = 'admin/dashboard.html'
          acctMenu.style.display = 'none'
        })
        acctMenu.appendChild(btnAdmin)
      }

      var btnLogout = document.createElement('button')
      btnLogout.className = 'btn-menu'
      btnLogout.textContent = 'Đăng xuất'
      btnLogout.addEventListener('click', function(ev){
        ev.preventDefault()
        localStorage.removeItem('currentUser')
        updateHeader()
        if(acctMenu) acctMenu.style.display = 'none'
      })
      acctMenu.appendChild(btnLogout)
    } else {
      var l1 = document.createElement('button')
      l1.className = 'btn-menu'
      l1.textContent = 'Đăng nhập'
      l1.addEventListener('click', function(ev){ ev.preventDefault(); window.location.href='login.html' })
      acctMenu.appendChild(l1)

      var l2 = document.createElement('button')
      l2.className = 'btn-menu'
      l2.textContent = 'Đăng ký'
      l2.addEventListener('click', function(ev){ ev.preventDefault(); window.location.href='register.html' })
      acctMenu.appendChild(l2)
    }
  }

  // show modal and load url into iframe
  function showModalWithUrl(url, title){
    var modalEl = document.getElementById('global-modal')
    var modalTitle = document.getElementById('global-modal-title')
    var modalBody = document.getElementById('global-modal-body')
    if(!modalEl || !modalBody) return
    modalTitle.textContent = title || ''
    modalBody.innerHTML = '<iframe src="' + url + '"></iframe>'
    var modal = new bootstrap.Modal(modalEl)
    modal.show()
  }

  function showAccountModal(){
    var modalEl = document.getElementById('global-modal')
    var modalTitle = document.getElementById('global-modal-title')
    var modalBody = document.getElementById('global-modal-body')
    if(!modalEl || !modalBody) return
    var cur = getCurrent() || {}
    modalTitle.textContent = 'Thông tin tài khoản'
    modalBody.innerHTML = '\n+      <div class="p-3">\n+        <h5>Tên: ' + (cur.username || '') + '</h5>\n+        <p>Role: ' + (cur.role || 'user') + '</p>\n+        <div class="mt-3">\n+          <button id="acct-edit-btn" class="btn btn-outline-primary me-2">Chỉnh sửa thông tin</button>\n+          <button id="acct-close-btn" class="btn btn-secondary">Đóng</button>\n+        </div>\n+      </div>'
    var modal = new bootstrap.Modal(modalEl)
    modal.show()
    setTimeout(function(){
      var close = document.getElementById('acct-close-btn')
      if(close) close.addEventListener('click', function(){ modal.hide() })
      var edit = document.getElementById('acct-edit-btn')
      if(edit) edit.addEventListener('click', function(){ alert('Chức năng chỉnh sửa chưa được triển khai') })
    },100)
  }

  var logoutLink = document.getElementById('logout-link')
  if(logoutLink){
    logoutLink.addEventListener('click', function(e){
      e.preventDefault()
      localStorage.removeItem('currentUser')
      updateHeader()
      window.location.href = 'index.html'
    })
  }

  // call on load to set header state
  try{updateHeader()}catch(e){}

  // If on login page, attach login handler (calls backend)
  if(document.getElementById('login-form')){
    document.getElementById('login-form').addEventListener('submit', async function(e){
      e.preventDefault()
      var u = document.getElementById('login-username').value.trim()
      var p = document.getElementById('login-password').value
      if(!u || !p){ alert('Vui lòng nhập đầy đủ'); return }
      try{
        const resp = await fetch('http://localhost:8080/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: u, password: p })
        })
        if(!resp.ok){
          const err = await resp.json().catch(()=>({message:'Đăng nhập thất bại'}))
          alert(err.message || 'Đăng nhập thất bại')
          return
        }
        const data = await resp.json()
        // store password locally for demo admin Basic Auth (not secure for production)
        setCurrent({username: data.username, role: data.role || 'user', password: p})
        alert('Đăng nhập thành công')
        window.location.href = 'index.html'
      }catch(ex){
        console.error(ex)
        alert('Lỗi kết nối tới máy chủ')
      }
    })
  }

  // If on register page, attach register handler (calls backend)
  if(document.getElementById('register-form')){
    document.getElementById('register-form').addEventListener('submit', async function(e){
      e.preventDefault()
      var u = document.getElementById('reg-username').value.trim()
      var p = document.getElementById('reg-password').value
      var email = document.getElementById('reg-email') ? document.getElementById('reg-email').value.trim() : undefined
      if(!u || !p){alert('Vui lòng nhập đầy đủ');return}
      try{
        const resp = await fetch('http://localhost:8080/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: u, password: p, email: email })
        })
        if(!resp.ok){
          const err = await resp.json().catch(()=>({message:'Đăng ký thất bại'}))
          alert(err.message || 'Đăng ký thất bại')
          return
        }
        const data = await resp.json()
        // store password locally for demo admin Basic Auth (not secure for production)
        setCurrent({username: data.username, role: data.role || 'user', password: p})
        alert('Đăng ký thành công')
        window.location.href = 'index.html'
      }catch(ex){
        console.error(ex)
        alert('Lỗi kết nối tới máy chủ')
      }
    })
  }

})();
