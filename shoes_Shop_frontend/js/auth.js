// Simple client-side auth for demo purposes
(function(){
  function $(sel){return document.querySelector(sel)}
  function getUsers(){
    try{return JSON.parse(localStorage.getItem('users')||'[]')||[];}catch(e){return[]}
  }
  function saveUsers(u){localStorage.setItem('users',JSON.stringify(u))}
  function setCurrent(user){localStorage.setItem('currentUser',JSON.stringify(user))}
  function getCurrent(){try{return JSON.parse(localStorage.getItem('currentUser')||'null')}catch(e){return null}}

  // Seed an admin user for demo if no users exist
  try{
    var _users = getUsers();
    if(!_users || _users.length === 0){
      _users = [{username:'admin',password:'admin',role:'admin'}];
      saveUsers(_users);
    }
  }catch(e){}

  // header update & account link behaviour
  function updateHeader(){
    var cur = getCurrent()
    var acctText = document.getElementById('account-text')
    var logoutLink = document.getElementById('logout-link')
    if(cur && cur.username){
      if(acctText) acctText.textContent = cur.username
      if(logoutLink) logoutLink.classList.remove('d-none')
      // ensure account menu hidden by default
      var menu = document.getElementById('account-menu'); if(menu) menu.style.display = 'none';
    } else {
      if(acctText) acctText.textContent = 'Tài khoản'
      if(logoutLink) logoutLink.classList.add('d-none')
      var menu = document.getElementById('account-menu'); if(menu) menu.style.display = 'none';
    }
  }

  var acct = document.getElementById('account-link')
  if(acct){
    acct.addEventListener('click', function(e){
      e.preventDefault()
      var cur = getCurrent()
      var menu = document.getElementById('account-menu')
      if(!cur || !cur.username){
        // not logged in -> go to login
        window.location.href = 'login.html'
        return
      }

      // logged in
      // build a simple dropdown for logged-in users (admin gets manage link)
      if(!menu) return
      if(menu.style.display === 'block'){
        menu.style.display = 'none'
        return
      }

      // populate menu
      menu.innerHTML = ''
      var profile = document.createElement('a'); profile.href = 'profile.html'; profile.className = 'btn-menu'; profile.textContent = 'Trang cá nhân'
      menu.appendChild(profile)
      if(cur.role === 'admin'){
        var manage = document.createElement('a'); manage.href = 'admin/manage-product.html'; manage.className = 'btn-menu'; manage.textContent = 'Quản lý hàng hóa'
        menu.appendChild(manage)
        var orders = document.createElement('a'); orders.href = 'admin/manage-orders.html'; orders.className = 'btn-menu'; orders.textContent = 'Quản lý hóa đơn'
        menu.appendChild(orders)
      }

      // position menu just under the account link (relative to #user-area)
      try{
        var acctLink = document.getElementById('account-link')
        // account-menu is inside #user-area which is position:relative
        var top = acctLink.offsetTop + acctLink.offsetHeight + 6
        var left = acctLink.offsetLeft
        menu.style.top = top + 'px'
        menu.style.left = left + 'px'
        menu.style.right = 'auto'
        menu.style.zIndex = '2000'
        // ensure visible
        menu.style.display = 'block'
      }catch(e){
        menu.style.display = 'block'
      }
      return
    })
    // hide menu when clicking outside
    document.addEventListener('click', function(e){
      var menu = document.getElementById('account-menu')
      var acctLink = document.getElementById('account-link')
      if(menu && menu.style.display === 'block'){
        if(!menu.contains(e.target) && !acctLink.contains(e.target)){
          menu.style.display = 'none'
        }
      }
    })
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

  // If on login page, attach login handler
  if(document.getElementById('login-form')){
    document.getElementById('login-form').addEventListener('submit', function(e){
      e.preventDefault()
      var u = document.getElementById('login-username').value.trim()
      var p = document.getElementById('login-password').value
      var users = getUsers()
      var found = users.find(x=>x.username===u && x.password===p)
      if(!found){alert('Thông tin đăng nhập không đúng');return}
      // store role and password (client-side demo) so admin actions can send Basic auth
      setCurrent({
        username:found.username,
        password: found.password,
        role: found.role || 'user',
        addresses: found.addresses || [],
        avatarUrl: found.avatarUrl,
        avatarDataUrl: found.avatarDataUrl,
        email: found.email
      })
      alert('Đăng nhập thành công')
      window.location.href = 'index.html'
    })
  }

  // If on register page, attach register handler
  if(document.getElementById('register-form')){
    document.getElementById('register-form').addEventListener('submit', function(e){
      e.preventDefault()
      var u = document.getElementById('reg-username').value.trim()
      var p = document.getElementById('reg-password').value
      if(!u || !p){alert('Vui lòng nhập đầy đủ');return}
      var users = getUsers()
      if(users.find(x=>x.username===u)){alert('Tên đăng nhập đã tồn tại');return}
      var user = {username:u,password:p, role:'user', addresses: []}
      users.push(user)
      saveUsers(users)
      setCurrent({username:u, password:p, role:'user', addresses: []})
      alert('Đăng ký thành công')
      window.location.href = 'index.html'
    })
  }

})();
