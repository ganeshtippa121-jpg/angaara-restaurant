document.addEventListener('DOMContentLoaded', () => {
  
  // PAGE LOADER
  const loader = document.getElementById('page-loader');
  window.addEventListener('load', () => {
    loader.style.opacity = '0';
    setTimeout(() => loader.style.display = 'none', 500);
  });

  // STICKY HEADER
  const header = document.getElementById('header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('sticky');
    } else {
      header.classList.remove('sticky');
    }
  });

  // MENU TABS FILTERING
  const tabBtns = document.querySelectorAll('.menu-tab-btn');
  const menuCards = document.querySelectorAll('.menu-card');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.getAttribute('data-category');

      menuCards.forEach(card => {
        const cardCat = card.getAttribute('data-category');
        if (cat === 'all' || cardCat === cat) {
          card.style.display = 'block';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // SHOPPING CART (ORDER ONLINE)
  let cart = [];
  const orderDrawer = document.getElementById('order-drawer');
  const backdrop = document.getElementById('modal-backdrop');
  
  function updateCartUI() {
    const container = document.getElementById('cart-items-container');
    const checkoutBtn = document.getElementById('cart-checkout-btn');
    
    if (cart.length === 0) {
      container.innerHTML = '<div class="cart-empty-message">Your cart is empty.</div>';
      checkoutBtn.disabled = true;
      return;
    }
    
    checkoutBtn.disabled = false;
    container.innerHTML = cart.map(item => `
      <div style="display:flex; justify-content:space-between; margin-bottom:15px; border-bottom:1px solid #333; padding-bottom:10px;">
        <div>
          <h4>${item.name}</h4>
          <p>₹${item.price} x ${item.qty}</p>
        </div>
        <button onclick="removeFromCart('${item.id}')" style="color:#ff5c5c; background:none;">Remove</button>
      </div>
    `).join('');
  }

  window.removeFromCart = (id) => {
    cart = cart.filter(item => item.id !== id);
    updateCartUI();
  };

  const addBtns = document.querySelectorAll('.add-to-cart-btn');
  addBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const name = btn.getAttribute('data-name');
      const price = btn.getAttribute('data-price');
      
      const item = cart.find(i => i.id === id);
      if (item) {
        item.qty++;
      } else {
        cart.push({ id, name, price, qty: 1 });
      }
      
      updateCartUI();
      orderDrawer.classList.add('active');
      backdrop.classList.add('active');
    });
  });

  document.getElementById('drawer-close-btn').addEventListener('click', () => {
    orderDrawer.classList.remove('active');
    backdrop.classList.remove('active');
  });

  // RESERVATION MODAL
  const resModal = document.getElementById('reservation-modal');
  const openResBtns = [
    document.getElementById('reserve-btn-header'),
    document.getElementById('hero-reserve-btn')
  ];

  openResBtns.forEach(btn => {
    if(btn) {
      btn.addEventListener('click', () => {
        resModal.classList.add('active');
        backdrop.classList.add('active');
      });
    }
  });

  document.getElementById('modal-close-btn').addEventListener('click', () => {
    resModal.classList.remove('active');
    backdrop.classList.remove('active');
  });

  backdrop.addEventListener('click', () => {
    resModal.classList.remove('active');
    orderDrawer.classList.remove('active');
    backdrop.classList.remove('active');
  });
});