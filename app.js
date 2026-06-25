/* ==========================================================================
   ANGAARA Restaurant Bachupally - Interactive Javascript Controller
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  
  // ==========================================================================
  // 1. PAGE LOADER & INTRO
  // ==========================================================================
  const loader = document.getElementById('page-loader');
  window.addEventListener('load', () => {
    setTimeout(() => {
      loader.classList.add('fade-out');
      // Start counter animations after loading finishes
      animateCounters();
    }, 400); // Slight delay for branding visibility
  });

  // Safe fallback if window load event already fired
  if (document.readyState === 'complete') {
    setTimeout(() => {
      loader.classList.add('fade-out');
      animateCounters();
    }, 400);
  }

  // ==========================================================================
  // 2. STICKY HEADER & ACTIVE SCROLL LINKS
  // ==========================================================================
  const header = document.getElementById('header');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section');

  window.addEventListener('scroll', () => {
    // Toggle sticky class on header
    if (window.scrollY > 50) {
      header.classList.add('sticky');
    } else {
      header.classList.remove('sticky');
    }

    // Scroll spy: Update active navigation link
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 150; // offset for sticky nav
      const sectionHeight = section.clientHeight;
      if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });

  // Mobile navigation drawer toggle
  const mobileToggle = document.getElementById('mobile-nav-toggle');
  const navMenu = document.getElementById('nav-menu');

  mobileToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    const icon = mobileToggle.querySelector('i');
    if (navMenu.classList.contains('active')) {
      icon.className = 'fa-solid fa-xmark';
    } else {
      icon.className = 'fa-solid fa-bars';
    }
  });

  // Close mobile nav when clicking a link
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('active');
      mobileToggle.querySelector('i').className = 'fa-solid fa-bars';
    });
  });

  // ==========================================================================
  // 3. TOAST NOTIFICATION SYSTEM
  // ==========================================================================
  const toastContainer = document.getElementById('toast-container');

  function showToast(message, iconClass = 'fa-circle-check') {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <i class="fa-solid ${iconClass}"></i>
      <span>${message}</span>
    `;
    toastContainer.appendChild(toast);

    // Auto remove after 3.4 seconds (matching CSS fadeout delay)
    setTimeout(() => {
      toast.remove();
    }, 3400);
  }

  // ==========================================================================
  // 4. ANIMATED COUNTERS (MICRO INTERACTIONS)
  // ==========================================================================
  function animateCounters() {
    // Rating counter (1.0 -> 3.9)
    const ratingEl = document.getElementById('hero-rating');
    let ratingVal = 1.0;
    const ratingInterval = setInterval(() => {
      ratingVal += 0.1;
      if (ratingVal >= 3.9) {
        ratingEl.textContent = '3.9';
        clearInterval(ratingInterval);
      } else {
        ratingEl.textContent = ratingVal.toFixed(1);
      }
    }, 50);

    // Reviews badge has a count animation if we want to build it.
    // Let's add review counter effect to make it dynamic.
    const badgeText = document.querySelector('.hero-badge .rating-text');
    let count = 0;
    const reviewInterval = setInterval(() => {
      count += 55;
      if (count >= 2200) {
        badgeText.innerHTML = '2,200+ Happy Reviews';
        clearInterval(reviewInterval);
      } else {
        badgeText.innerHTML = `${count.toLocaleString()}+ Happy Reviews`;
      }
    }, 30);
  }

  // ==========================================================================
  // 5. SCROLL REVEAL (INTERSECTION OBSERVER)
  // ==========================================================================
  const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
  
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.15
  };

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        // Unobserve once shown to prevent refiring
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  revealElements.forEach(el => {
    revealObserver.observe(el);
  });

  // ==========================================================================
  // 6. MENU FILTERING
  // ==========================================================================
  const tabBtns = document.querySelectorAll('.menu-tab-btn');
  const menuCards = document.querySelectorAll('.menu-card');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Set active button style
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const targetCategory = btn.getAttribute('data-category');

      // Filter cards
      menuCards.forEach(card => {
        const cardCategory = card.getAttribute('data-category');
        
        // Quick scaling transition during filter
        card.style.opacity = '0';
        card.style.transform = 'scale(0.8) translateY(20px)';
        
        setTimeout(() => {
          if (targetCategory === 'all' || cardCategory === targetCategory) {
            card.style.display = 'flex';
            setTimeout(() => {
              card.style.opacity = '1';
              card.style.transform = 'scale(1) translateY(0)';
            }, 50);
          } else {
            card.style.display = 'none';
          }
        }, 300);
      });
    });
  });

  // ==========================================================================
  // 7. ONLINE ORDER (CART SYSTEM & DRAWER)
  // ==========================================================================
  const orderDrawer = document.getElementById('order-drawer');
  const modalBackdrop = document.getElementById('modal-backdrop');
  
  const cartItemsContainer = document.getElementById('cart-items-container');
  const cartSubtotalEl = document.getElementById('cart-subtotal');
  const cartTaxEl = document.getElementById('cart-tax');
  const cartTotalEl = document.getElementById('cart-total');
  const checkoutBtn = document.getElementById('cart-checkout-btn');

  // Trigger elements
  const orderHeaderBtn = document.getElementById('order-btn-header');
  const heroOrderBtn = document.getElementById('hero-order-btn');
  const drawerCloseBtn = document.getElementById('drawer-close-btn');

  // Cart Array state
  let cart = [];

  // Toggle Order Drawer
  function openOrderDrawer() {
    orderDrawer.classList.add('active');
    modalBackdrop.classList.add('active');
    document.body.style.overflow = 'hidden'; // prevent scrolling main page
  }

  function closeOrderDrawer() {
    orderDrawer.classList.remove('active');
    // Only close backdrop if reservation modal is also closed
    if (!reservationModal.classList.contains('active')) {
      modalBackdrop.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  orderHeaderBtn.addEventListener('click', openOrderDrawer);
  heroOrderBtn.addEventListener('click', openOrderDrawer);
  drawerCloseBtn.addEventListener('click', closeOrderDrawer);

  // Add Item to Cart click binding
  const addToCartBtns = document.querySelectorAll('.add-to-cart-btn');
  
  addToCartBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      const name = btn.getAttribute('data-name');
      const price = parseFloat(btn.getAttribute('data-price'));
      const img = btn.getAttribute('data-img');

      addToCart(id, name, price, img);
      
      // Open cart automatically on first item addition
      openOrderDrawer();
    });
  });

  function addToCart(id, name, price, img) {
    const existingItem = cart.find(item => item.id === id);
    if (existingItem) {
      existingItem.qty += 1;
      showToast(`Increased quantity of ${name} in cart!`, 'fa-circle-plus');
    } else {
      cart.push({ id, name, price, qty: 1, img });
      showToast(`${name} added to your cart!`, 'fa-cart-shopping');
    }
    updateCartUI();
  }

  function updateCartUI() {
    if (cart.length === 0) {
      cartItemsContainer.innerHTML = `
        <div class="cart-empty-message">
          <i class="fa-solid fa-basket-shopping"></i>
          <p>Your cart is empty.</p>
          <span style="font-size: 0.8rem; color: rgba(255,255,255,0.4); margin-top: 10px; display: block;">Select items from our menu to start ordering.</span>
        </div>
      `;
      checkoutBtn.disabled = true;
      cartSubtotalEl.textContent = '₹0';
      cartTaxEl.textContent = '₹0';
      cartTotalEl.textContent = '₹0';
      
      // Update order header btn state to normal
      orderHeaderBtn.innerHTML = 'Order Online';
      return;
    }

    checkoutBtn.disabled = false;
    cartItemsContainer.innerHTML = '';
    let subtotal = 0;

    cart.forEach(item => {
      subtotal += item.price * item.qty;
      const itemEl = document.createElement('div');
      itemEl.className = 'cart-item';
      itemEl.innerHTML = `
        <img src="${item.img}" alt="${item.name}">
        <div class="cart-item-details">
          <span class="cart-item-title">${item.name}</span>
          <div class="cart-item-price">₹${item.price}</div>
          <div class="cart-item-controls">
            <button class="cart-qty-btn qty-minus" data-id="${item.id}"><i class="fa-solid fa-minus"></i></button>
            <span class="cart-item-qty">${item.qty}</span>
            <button class="cart-qty-btn qty-plus" data-id="${item.id}"><i class="fa-solid fa-plus"></i></button>
          </div>
        </div>
        <div class="cart-item-remove" data-id="${item.id}">
          <i class="fa-solid fa-trash-can"></i>
        </div>
      `;
      cartItemsContainer.appendChild(itemEl);
    });

    // Calculations
    const gstRate = 0.05; // 5% GST
    const tax = Math.round(subtotal * gstRate);
    const total = subtotal + tax;

    cartSubtotalEl.textContent = `₹${subtotal}`;
    cartTaxEl.textContent = `₹${tax}`;
    cartTotalEl.textContent = `₹${total}`;

    // Update main order button counter
    const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
    orderHeaderBtn.innerHTML = `<i class="fa-solid fa-basket-shopping" style="margin-right: 8px;"></i> Cart (${totalQty})`;

    // Bind quantity increment/decrement buttons
    const minusBtns = cartItemsContainer.querySelectorAll('.qty-minus');
    const plusBtns = cartItemsContainer.querySelectorAll('.qty-plus');
    const removeBtns = cartItemsContainer.querySelectorAll('.cart-item-remove');

    minusBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const item = cart.find(i => i.id === id);
        if (item.qty > 1) {
          item.qty -= 1;
        } else {
          cart = cart.filter(i => i.id !== id);
          showToast(`${item.name} removed from your cart.`, 'fa-trash-can');
        }
        updateCartUI();
      });
    });

    plusBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const item = cart.find(i => i.id === id);
        item.qty += 1;
        updateCartUI();
      });
    });

    removeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const item = cart.find(i => i.id === id);
        cart = cart.filter(i => i.id !== id);
        showToast(`${item.name} removed from your cart.`, 'fa-trash-can');
        updateCartUI();
      });
    });
  }

  // Checkout submit handler
  checkoutBtn.addEventListener('click', () => {
    const deliveryOption = document.getElementById('cart-delivery-option').value;
    const deliveryMsg = deliveryOption === 'takeaway' 
      ? "Your takeaway order is confirmed! Please collect it at Bachupally counter in 20 mins."
      : "Your home delivery order is confirmed! Sizzling fresh food is on its way to you.";
    
    // Simulating checkout success
    checkoutBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin" style="margin-right: 8px;"></i> Submitting Order...';
    checkoutBtn.disabled = true;

    setTimeout(() => {
      cart = [];
      updateCartUI();
      closeOrderDrawer();
      checkoutBtn.innerHTML = 'Confirm & Checkout Order';
      showToast(deliveryMsg, 'fa-circle-check');
    }, 1500);
  });

  // ==========================================================================
  // 8. TABLE RESERVATION SYSTEM (MODAL & FORMS)
  // ==========================================================================
  const reservationModal = document.getElementById('reservation-modal');
  const reserveHeaderBtn = document.getElementById('reserve-btn-header');
  const heroReserveBtn = document.getElementById('hero-reserve-btn');
  const bannerReserveBtn = document.getElementById('banner-reserve-btn');
  const modalCloseBtn = document.getElementById('modal-close-btn');

  function openReservationModal() {
    reservationModal.classList.add('active');
    modalBackdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeReservationModal() {
    reservationModal.classList.remove('active');
    if (!orderDrawer.classList.contains('active')) {
      modalBackdrop.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  reserveHeaderBtn.addEventListener('click', openReservationModal);
  heroReserveBtn.addEventListener('click', openReservationModal);
  bannerReserveBtn.addEventListener('click', openReservationModal);
  modalCloseBtn.addEventListener('click', closeReservationModal);
  
  // Close everything if backdrop is clicked
  modalBackdrop.addEventListener('click', () => {
    closeReservationModal();
    closeOrderDrawer();
  });

  // Set minimum date picker values to Today
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('reserve-date').min = today;
  document.getElementById('popup-date').min = today;

  // Sidebar Form submit
  const contactForm = document.getElementById('contact-reserve-form');
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('reserve-name').value;
    const phone = document.getElementById('reserve-phone').value;
    const guests = document.getElementById('reserve-guests').value;
    const date = document.getElementById('reserve-date').value;
    const message = document.getElementById('reserve-message').value;

    const reservationData = { name, phone, guests, date, message, type: 'sidebar' };
    localStorage.setItem('angaara_reservation', JSON.stringify(reservationData));

    showToast(`Table booked successfully for ${guests} guests on ${date}!`, 'fa-calendar-check');
    contactForm.reset();
  });

  // Popup Form submit
  const popupForm = document.getElementById('popup-reserve-form');
  popupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('popup-name').value;
    const phone = document.getElementById('popup-phone').value;
    const guests = document.getElementById('popup-guests').value;
    const date = document.getElementById('popup-date').value;
    const message = document.getElementById('popup-message').value;

    const reservationData = { name, phone, guests, date, message, type: 'popup' };
    localStorage.setItem('angaara_reservation', JSON.stringify(reservationData));

    closeReservationModal();
    showToast(`Table booked successfully for ${guests} guests on ${date}!`, 'fa-calendar-check');
    popupForm.reset();
  });

  // ==========================================================================
  // 9. PREMIUM GALLERY MASONRY LIGHTBOX
  // ==========================================================================
  const galleryItems = document.querySelectorAll('.gallery-item');
  const lightbox = document.getElementById('gallery-lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const lightboxClose = document.getElementById('lightbox-close-btn');
  const lightboxPrev = document.getElementById('lightbox-prev-btn');
  const lightboxNext = document.getElementById('lightbox-next-btn');

  let currentGalleryIndex = 0;

  function openLightbox(index) {
    currentGalleryIndex = index;
    const item = galleryItems[index];
    const imgSrc = item.querySelector('img').src;
    const caption = item.getAttribute('data-caption') || '';

    lightboxImg.src = imgSrc;
    lightboxCaption.textContent = caption;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }

  galleryItems.forEach((item, index) => {
    item.addEventListener('click', () => {
      openLightbox(index);
    });
  });

  lightboxClose.addEventListener('click', closeLightbox);
  
  lightboxPrev.addEventListener('click', (e) => {
    e.stopPropagation();
    let index = currentGalleryIndex - 1;
    if (index < 0) index = galleryItems.length - 1;
    openLightbox(index);
  });

  lightboxNext.addEventListener('click', (e) => {
    e.stopPropagation();
    let index = currentGalleryIndex + 1;
    if (index >= galleryItems.length) index = 0;
    openLightbox(index);
  });

  // Close lightbox on backdrop click
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
      closeLightbox();
    }
  });

  // Keyboard controls for lightbox
  document.addEventListener('keydown', (e) => {
    if (lightbox.classList.contains('active')) {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') lightboxPrev.click();
      if (e.key === 'ArrowRight') lightboxNext.click();
    }
  });

  // ==========================================================================
  // 10. CUSTOM TESTIMONIALS SLIDER
  // ==========================================================================
  const slider = document.getElementById('testimonial-slider');
  const slides = document.querySelectorAll('.testimonial-slide');
  const prevBtn = document.getElementById('slider-prev');
  const nextBtn = document.getElementById('slider-next');
  const dotsContainer = document.getElementById('slider-dots');
  
  let currentSlideIndex = 0;
  let slideInterval;

  // Initialize navigation dots
  slides.forEach((_, idx) => {
    const dot = document.createElement('div');
    dot.className = `slider-dot ${idx === 0 ? 'active' : ''}`;
    dot.addEventListener('click', () => goToSlide(idx));
    dotsContainer.appendChild(dot);
  });

  const dots = dotsContainer.querySelectorAll('.slider-dot');

  function goToSlide(index) {
    currentSlideIndex = index;
    slider.style.transform = `translateX(-${index * 100}%)`;
    
    // Update active dot styles
    dots.forEach((dot, idx) => {
      dot.className = `slider-dot ${idx === index ? 'active' : ''}`;
    });
  }

  function nextSlide() {
    let index = currentSlideIndex + 1;
    if (index >= slides.length) index = 0;
    goToSlide(index);
  }

  function prevSlide() {
    let index = currentSlideIndex - 1;
    if (index < 0) index = slides.length - 1;
    goToSlide(index);
  }

  nextBtn.addEventListener('click', () => {
    nextSlide();
    resetSlideAutoplay();
  });

  prevBtn.addEventListener('click', () => {
    prevSlide();
    resetSlideAutoplay();
  });

  // Autoplay function
  function startSlideAutoplay() {
    slideInterval = setInterval(nextSlide, 5000); // cycle slides every 5 seconds
  }

  function resetSlideAutoplay() {
    clearInterval(slideInterval);
    startSlideAutoplay();
  }

  startSlideAutoplay();

  // Pause slides when mouse is hovering
  const sliderContainer = document.querySelector('.testimonial-slider-container');
  sliderContainer.addEventListener('mouseenter', () => clearInterval(slideInterval));
  sliderContainer.addEventListener('mouseleave', startSlideAutoplay);

  // ==========================================================================
  // 11. FLOATING CONTROL BUTTONS
  // ==========================================================================
  const backToTopBtn = document.getElementById('back-to-top');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      backToTopBtn.classList.add('active');
    } else {
      backToTopBtn.classList.remove('active');
    }
  });

  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });

});
