document.addEventListener('DOMContentLoaded', function() {
  // State Management
  const state = {
    cart: JSON.parse(localStorage.getItem('cart')) || [],
    favorites: JSON.parse(localStorage.getItem('favorites')) || [],
    products: [
      {
        id: 1,
        name: "Sony WH-1000XM4 Wireless Headphones",
        price: 349.99,
        originalPrice: 399.99,
        discount: 25,
        rating: 4.8,
        reviews: 1245,
        image: "../img/Sony WH-1000XM4 Wireless Noise Cancelling Headphones.avif",
        tags: ["wireless", "noise-cancelling", "headphones"],
        category: "audio"
      },
      {
        id: 2,
        name: "Apple Watch Series 8 GPS + Cellular 45mm",
        price: 429.00,
        originalPrice: 499.00,
        discount: 15,
        rating: 5,
        reviews: 892,
        image: "../img/Apple Watch Series 8 GPS + Cellular 45mm.avif",
        tags: ["smartwatch", "wearable", "apple"],
        category: "wearables"
      },
      {
        id: 3,
        name: "OnePlus 11 5G 256GB Dual SIM",
        price: 699.00,
        originalPrice: 799.00,
        discount: 12.5,
        rating: 5,
        reviews: 765,
        image: "../img/OnePlus 11 5G 256GB.avif",
        tags: ["smartphone", "android", "5g"],
        category: "smartphones"
      },
      {
        id: 4,
        name: "Canon EOS R6 Mark II Mirrorless Camera",
        price: 2399.00,
        originalPrice: 2799.00,
        discount: 30,
        rating: 4.7,
        reviews: 723,
        image: "../img/Canon EOS R6 Mark.avif",
        tags: ["camera", "mirrorless", "professional"],
        category: "cameras"
      }
    ],
    currentProduct: null,
    searchResults: []
  };

  // DOM Elements
  const elements = {
    navLinks: document.querySelector('.nav-links'),
    hamburger: document.querySelector('.hamburger'),
    cartIcon: document.querySelector('.cart-icon'),
    cartCount: document.querySelector('.cart-count'),
    favoriteIcon: document.querySelector('.favorite-icon'),
    favoriteCount: document.querySelector('.favorite-count'),
    floatingCart: document.querySelector('.floating-cart'),
    floatingFavorites: document.querySelector('.floating-favorites'),
    productsContainer: document.querySelector('.products-container'),
    searchInput: document.querySelector('.search-bar input'),
    searchIcon: document.querySelector('.search-bar i'),
    newsletterForm: document.querySelector('.newsletter-form'),
    heroShopBtn: document.querySelector('.hero-actions .btn-primary'),
    modalOverlay: document.createElement('div'),
    modalContent: document.createElement('div'),
    linkHome: document.querySelector("#btn-h"),
    linkcatego: document.querySelector("#btn-c"),
    linkdeals: document.querySelector("#btn-d"),
    linkfeatred: document.querySelector("#btn-f")
  };

  // ================== 1. Firebase Config ==================
  const firebaseConfig = {
    apiKey: "AIzaSyAOPGJphMdi4ZzpsxZ7kvTKErJqcQrPsF4",
    authDomain: "data-com-ea4a5.firebaseapp.com",
    projectId: "data-com-ea4a5",
    storageBucket: "data-com-ea4a5.appspot.com",
    messagingSenderId: "1078182707766",
    appId: "1:1078182707766:web:b333f3a0fbd1fbb8504e97"
  };

  // Initialize Firebase only if not already initialized
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
  const auth = firebase.auth();
  const database = firebase.database();

  // Firebase Auth State Listener - CRITICAL FOR CART SYNC
  auth.onAuthStateChanged((user) => {
    if (user) {
      // User is signed in, load cart from Firebase
      loadCartFromFirebase();
    } else {
      // User is signed out, load cart from localStorage
      state.cart = JSON.parse(localStorage.getItem('cart')) || [];
      updateCartUI();
    }
  });

  // Check if elements exist before using them
  const savedEmail = localStorage.getItem("userEmail");
  if (document.getElementsByClassName("profile-email").length > 0) {
    const PlaceEmail = document.getElementsByClassName("profile-email")[0];
    if (savedEmail) {
      PlaceEmail.textContent = savedEmail;
    } else {
      PlaceEmail.textContent = "exemple@gmail.com";
    }
  }

  // Create Modal
  function createModal() {
    elements.modalOverlay.className = 'modal-overlay';
    elements.modalContent.className = 'modal-content';
    elements.modalOverlay.appendChild(elements.modalContent);
    document.body.appendChild(elements.modalOverlay);
    
    // Close modal when clicking outside
    elements.modalOverlay.addEventListener('click', function(e) {
      if (e.target === elements.modalOverlay) {
        closeModal();
      }
    });
  }

  function openModal(content) {
    elements.modalContent.innerHTML = content;
    elements.modalOverlay.style.display = 'flex';
    setTimeout(() => {
      elements.modalOverlay.style.opacity = '1';
      elements.modalContent.style.transform = 'translateY(0)';
    }, 10);
  }

  function closeModal() {
    elements.modalOverlay.style.opacity = '0';
    elements.modalContent.style.transform = 'translateY(20px)';
    setTimeout(() => {
      elements.modalOverlay.style.display = 'none';
    }, 300);
  }

  // Initialize the app
  function init() {
    createModal();
    setupEventListeners();
    updateFavoritesUI();
    
    // Don't load cart here - it will be loaded by the auth state listener
  }

  // Setup Event Listeners
  function setupEventListeners() {
    // Mobile Menu Toggle - check if element exists
    if (elements.hamburger) {
      elements.hamburger.addEventListener('click', toggleMobileMenu);
    }

    // Product Interactions - check if element exists
    if (elements.productsContainer) {
      elements.productsContainer.addEventListener('click', handleProductActions);
    }

    // Search Functionality - check if elements exist
    if (elements.searchInput) {
      elements.searchInput.addEventListener('input', searchProducts);
      elements.searchInput.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
          event.preventDefault();
          searchProducts();
        }
      });
    }
    
    if (elements.searchIcon) {
      elements.searchIcon.addEventListener('click', showSearchModal);
    }

    // Newsletter Form - check if element exists
    if (elements.newsletterForm) {
      elements.newsletterForm.addEventListener('submit', handleNewsletterSubmit);
    }

    // Hero Shop Button - check if element exists
    if (elements.heroShopBtn) {
      elements.heroShopBtn.addEventListener('click', function() {
        scrollToSection('.products');
      });
    }
    
    // Navigation links - check if elements exist
    if (elements.linkHome) {
      elements.linkHome.addEventListener('click', function() {
        scrollToSection('.hero');
      });
    }
    
    if (elements.linkcatego) {
      elements.linkcatego.addEventListener('click', function() {
        scrollToSection('.categories');
      });
    }
    
    if (elements.linkdeals) {
      elements.linkdeals.addEventListener('click', function() {
        scrollToSection('.products');
      });
    }
    
    if (elements.linkfeatred) {
      elements.linkfeatred.addEventListener('click', function() {
        scrollToSection('.featured');
      });
    }

    // Floating Cart - check if element exists
    if (elements.floatingCart) {
      elements.floatingCart.addEventListener('click', showCartModal);
    }

    // Floating Favorites - check if element exists
    if (elements.floatingFavorites) {
      elements.floatingFavorites.addEventListener('click', showFavoritesModal);
    }

    // Cart Icon - check if element exists
    if (elements.cartIcon) {
      elements.cartIcon.addEventListener('click', showCartModal);
    }

    // Favorite Icon - check if element exists
    if (elements.favoriteIcon) {
      elements.favoriteIcon.addEventListener('click', showFavoritesModal);
    }
    
    // Cart and favorites list items
    const cartLi = document.querySelector('.open-cart');
    const favLi = document.querySelector('.open-favorites');

    if (cartLi) cartLi.addEventListener('click', showCartModal);
    if (favLi) favLi.addEventListener('click', showFavoritesModal);
    
    // Logout button
    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("user-avatar");
        // Sign out from Firebase
        auth.signOut().then(() => {
          window.location.href = "../login.html";
        });
      });
    }
    
    // Coming soon button
    const soonBtn = document.getElementById("soon-btn");
    if (soonBtn) {
      soonBtn.addEventListener("click", showComingSoon);
    }
  }

  // Toggle Mobile Menu
  function toggleMobileMenu() {
    if (elements.navLinks) {
      elements.navLinks.classList.toggle('show');
      if (elements.hamburger) {
        elements.hamburger.innerHTML = elements.navLinks.classList.contains('show') 
          ? '<i class="fas fa-times"></i>' 
          : '<i class="fas fa-bars"></i>';
      }
    }
  }

  // Handle Product Actions
  function handleProductActions(e) {
    const target = e.target.closest('.action-btn, .add-to-cart, .favorite-btn');
    if (!target) return;

    const productCard = target.closest('.product-card');
    if (!productCard) return;
    
    const productId = parseInt(productCard.dataset.id);
    const product = state.products.find(p => p.id === productId);
    if (!product) return;

    if (target.classList.contains('add-to-cart')) {
      addToCart(product);
    } else if (target.classList.contains('favorite-btn') || target.closest('.favorite-btn')) {
      toggleFavorite(product, target);
    } else if (target.querySelector('.fa-eye')) {
      showQuickView(product);
    }
  }

  // Toggle Favorite
  function toggleFavorite(product, button) {
    const index = state.favorites.findIndex(item => item.id === product.id);
    const icon = button.querySelector('i') || button;
    
    if (index === -1) {
      state.favorites.push(product);
      if (icon) icon.classList.replace('far', 'fas');
      showNotification(`${product.name} added to favorites`);
    } else {
      state.favorites.splice(index, 1);
      if (icon) icon.classList.replace('fas', 'far');
      showNotification(`${product.name} removed from favorites`);
    }
    
    // Save to localStorage
    localStorage.setItem('favorites', JSON.stringify(state.favorites));
    updateFavoritesUI();
  }

  // Update Favorites UI
  function updateFavoritesUI() {
    const totalItems = state.favorites.length;
    if (elements.favoriteCount) {
      elements.favoriteCount.textContent = totalItems;
    }
    
    if (elements.floatingFavorites) {
      const favoritesCountElement = elements.floatingFavorites.querySelector('.favorites-count');
      if (favoritesCountElement) {
        favoritesCountElement.textContent = `${totalItems} ${totalItems === 1 ? 'item' : 'items'}`;
      }
    }
    
    // Update heart icons on product cards
    document.querySelectorAll('.favorite-btn i').forEach(icon => {
      const productCard = icon.closest('.product-card');
      if (productCard) {
        const productId = parseInt(productCard.dataset.id);
        if (state.favorites.some(item => item.id === productId)) {
          icon.classList.replace('far', 'fas');
        } else {
          icon.classList.replace('fas', 'far');
        }
      }
    });
  }

  // User name display
  const userName = localStorage.getItem('userName') || 'guest';
  const userElement = document.querySelector('.user-name');
  const userProfile = document.querySelector('.profile-name');

  if (userElement) {
    userElement.textContent = userName;
  }

  if (userProfile) {
    userProfile.textContent = userName;
  }

  // Show Favorites Modal
  function showFavoritesModal() {
    if (state.favorites.length === 0) {
      showNotification('Your favorites list is empty', 'info');
      return;
    }

    let content = `
      <div class="favorites-modal">
        <button class="close-modal">&times;</button>
        <h2>Your Favorites (${state.favorites.length} items)</h2>
        <div class="favorites-items-container">
          ${state.favorites.map(item => `
            <div class="favorite-item" data-id="${item.id}">
              <img src="${item.image}" alt="${item.name}">
              <div class="favorite-item-details">
                <h4>${item.name}</h4>
                <div class="favorite-item-price">$${item.price.toFixed(2)}</div>
                <div class="favorite-item-actions">
                  <button class="action-btn add-to-cart-fav">
                    <i class="fas fa-shopping-cart"></i> Add to Cart
                  </button>
                  <button class="action-btn remove-favorite">
                    <i class="fas fa-trash"></i> Remove
                  </button>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
    
    openModal(content);
    
    // Add event listeners to favorites modal buttons
    setTimeout(() => {
      document.querySelectorAll('.add-to-cart-fav').forEach(btn => {
        btn.addEventListener('click', function() {
          const productId = parseInt(this.closest('.favorite-item').dataset.id);
          const product = state.products.find(p => p.id === productId);
          if (product) {
            addToCart(product);
            showNotification(`${product.name} added to cart`);
          }
        });
      });
      
      document.querySelectorAll('.remove-favorite').forEach(btn => {
        btn.addEventListener('click', function() {
          const productId = parseInt(this.closest('.favorite-item').dataset.id);
          const product = state.products.find(p => p.id === productId);
          if (product) {
            toggleFavorite(product, this);
            
            // If no more favorites, close modal
            if (state.favorites.length === 0) {
              closeModal();
            } else {
              showFavoritesModal(); // Refresh modal
            }
          }
        });
      });
      
      const closeBtn = document.querySelector('.close-modal');
      if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
      }
    }, 10);
  }

  // Show Quick View
  function showQuickView(product) {
    const isFavorite = state.favorites.some(item => item.id === product.id);
    const content = `
      <div class="quick-view">
        <button class="close-modal">&times;</button>
        <div class="quick-view-image">
          <img src="${product.image}" alt="${product.name}">
        </div>
        <div class="quick-view-details">
          <h3>${product.name}</h3>
          <div class="product-price">
            <span class="current-price">$${product.price.toFixed(2)}</span>
            ${product.originalPrice ? `<span class="original-price">$${product.originalPrice.toFixed(2)}</span>` : ''}
          </div>
          <div class="product-rating">
            <div class="stars">
              ${renderStars(product.rating)}
            </div>
            <span class="rating-count">(${product.reviews} reviews)</span>
          </div>
          <p>${product.tags.map(tag => `<span class="tag">${tag}</span>`).join(' ')}</p>
          <div class="quick-view-actions">
            <button class="btn btn-primary add-to-cart-modal" data-id="${product.id}">
              <i class="fas fa-shopping-cart"></i> Add to Cart
            </button>
            <button class="btn btn-secondary favorite-btn-modal" data-id="${product.id}">
              <i class="${isFavorite ? 'fas' : 'far'} fa-heart"></i> ${isFavorite ? 'Remove Favorite' : 'Add to Favorites'}
            </button>
          </div>
        </div>
      </div>
    `;
    
    openModal(content);
    
    // Add event listener to modal's add to cart button
    setTimeout(() => {
      const addToCartBtn = document.querySelector('.add-to-cart-modal');
      if (addToCartBtn) {
        addToCartBtn.addEventListener('click', function() {
          const productId = parseInt(this.dataset.id);
          const product = state.products.find(p => p.id === productId);
          if (product) {
            addToCart(product);
            showNotification(`${product.name} added to cart`);
          }
        });
      }
      
      // Add event listener to modal's favorite button
      const favoriteBtn = document.querySelector('.favorite-btn-modal');
      if (favoriteBtn) {
        favoriteBtn.addEventListener('click', function() {
          const productId = parseInt(this.dataset.id);
          const product = state.products.find(p => p.id === productId);
          if (product) {
            toggleFavorite(product, this);
            
            // Update button text
            const isNowFavorite = state.favorites.some(item => item.id === productId);
            this.innerHTML = `<i class="${isNowFavorite ? 'fas' : 'far'} fa-heart"></i> ${isNowFavorite ? 'Remove Favorite' : 'Add to Favorites'}`;
          }
        });
      }
      
      const closeBtn = document.querySelector('.close-modal');
      if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
      }
    }, 10);
  }

  // Add to Cart - Updated to sync with Firebase
  function addToCart(product, quantity = 1) {
    const existingItem = state.cart.find(item => item.id === product.id);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      state.cart.push({
        ...product,
        quantity: quantity
      });
    }
    
    // Save to localStorage as backup
    localStorage.setItem('cart', JSON.stringify(state.cart));
    
    // Save to Firebase if user is logged in
    const user = auth.currentUser;
    if (user) {
      addToCartFirebase(product, existingItem ? existingItem.quantity : quantity);
    }
    
    updateCartUI();
    showNotification(`${product.name} added to cart`);
    animateCartIcon();
  }

  // Update Cart UI
  function updateCartUI() {
    const totalItems = state.cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    if (elements.cartCount) {
      elements.cartCount.textContent = totalItems;
    }
    
    if (elements.floatingCart) {
      const cartItemsElement = elements.floatingCart.querySelector('.cart-items');
      const cartTotalElement = elements.floatingCart.querySelector('.cart-total');
      
      if (cartItemsElement) cartItemsElement.textContent = `${totalItems} ${totalItems === 1 ? 'item' : 'items'}`;
      if (cartTotalElement) cartTotalElement.textContent = `$${totalPrice.toFixed(2)}`;
    }
  }

  // Show Cart Modal
  function showCartModal() {
    if (state.cart.length === 0) {
      showNotification('Your cart is empty', 'info');
      return;
    }

    let content = `
      <div class="cart-modal">
        <button class="close-modal">&times;</button>
        <h2>Your Cart (${state.cart.reduce((sum, item) => sum + item.quantity, 0)} items)</h2>
        <div class="cart-items-container">
          ${state.cart.map(item => `
            <div class="cart-item" data-id="${item.id}">
              <img src="${item.image}" alt="${item.name}">
              <div class="cart-item-details">
                <h4>${item.name}</h4>
                <div class="cart-item-price">$${item.price.toFixed(2)} × ${item.quantity}</div>
                <div class="cart-item-actions">
                  <button class="quantity-btn minus">-</button>
                  <span class="quantity">${item.quantity}</span>
                  <button class="quantity-btn plus">+</button>
                  <button class="remove-btn">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
        <div class="cart-total">
          <span>Total:</span>
          <span>$${calculateCartTotal().toFixed(2)}</span>
        </div>
        <button class="btn btn-primary checkout-btn">
          Proceed to Checkout <i class="fas fa-arrow-right"></i>
        </button>
      </div>
    `;
    
    openModal(content);
    
    // Add event listeners to cart modal buttons
    setTimeout(() => {
      document.querySelectorAll('.quantity-btn.minus').forEach(btn => {
        btn.addEventListener('click', function() {
          const productId = parseInt(this.closest('.cart-item').dataset.id);
          updateCartItemQuantity(productId, -1);
        });
      });
      
      document.querySelectorAll('.quantity-btn.plus').forEach(btn => {
        btn.addEventListener('click', function() {
          const productId = parseInt(this.closest('.cart-item').dataset.id);
          updateCartItemQuantity(productId, 1);
        });
      });
      
      document.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', function() {
          const productId = parseInt(this.closest('.cart-item').dataset.id);
          removeFromCart(productId);
        });
      });
      
      const checkoutBtn = document.querySelector('.checkout-btn');
      if (checkoutBtn) {
        checkoutBtn.addEventListener('click', proceedToCheckout);
      }
      
      const closeBtn = document.querySelector('.close-modal');
      if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
      }
    }, 10);
  }

  // Update Cart Item Quantity - Updated to sync with Firebase
  function updateCartItemQuantity(productId, change) {
    const item = state.cart.find(item => item.id === productId);
    if (!item) return;
    
    item.quantity += change;
    
    if (item.quantity <= 0) {
      removeFromCart(productId);
    } else {
      // Save to localStorage
      localStorage.setItem('cart', JSON.stringify(state.cart));
      
      // Update in Firebase if user is logged in
      const user = auth.currentUser;
      if (user) {
        updateCartItemQuantityFirebase(productId, item.quantity);
      }
      
      updateCartUI();
      showCartModal(); // Refresh modal
    }
  }

  // Remove from Cart - Updated to sync with Firebase
  function removeFromCart(productId) {
    state.cart = state.cart.filter(item => item.id !== productId);
    
    // Save to localStorage
    localStorage.setItem('cart', JSON.stringify(state.cart));
    
    // Remove from Firebase if user is logged in
    const user = auth.currentUser;
    if (user) {
      removeFromCartFirebase(productId);
    }
    
    updateCartUI();
    showNotification('Item removed from cart');
    
    if (state.cart.length === 0) {
      closeModal();
    } else {
      showCartModal(); // Refresh modal
    }
  }

  // Proceed to Checkout
  function proceedToCheckout() {
    const content = `
      <div class="checkout-modal">
        <button class="close-modal">&times;</button>
        <h2>Checkout</h2>
        <div class="checkout-summary">
          <h3>Order Summary (${state.cart.reduce((sum, item) => sum + item.quantity, 0)} items)</h3>
          <div class="checkout-items">
            ${state.cart.map(item => `
              <div class="checkout-item">
                <span>${item.name} × ${item.quantity}</span>
                <span>$${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            `).join('')}
          </div>
          <div class="checkout-total">
            <span>Total:</span>
            <span>$${calculateCartTotal().toFixed(2)}</span>
          </div>
        </div>
        <form class="checkout-form">
          <h3>Shipping Information</h3>
          <div class="form-group">
            <input 
              type="text" 
              id="checkout-Name" 
              placeholder="Name" 
              value="${localStorage.getItem("userName") || ""}" 
              required
              readonly
            >
          </div>
          <div class="form-group">
            <input 
              type="email" 
              id="checkout-email" 
              placeholder="Email" 
              value="${localStorage.getItem("userEmail") || ""}" 
              required
            >
          </div>

          <div class="form-group">
            <input type="text" placeholder="Address" required>
          </div>
          <div class="form-row">
            <div class="form-group">
              <input type="text" placeholder="City" required>
            </div>
            <div class="form-group">
              <input type="text" placeholder="ZIP Code" required>
            </div>
          </div>
          <h3>Payment Method</h3>
          <div class="payment-methods">
            <label class="payment-method">
              <input type="radio" name="payment" checked>
              <i class="fab fa-cc-visa"></i> Credit Card
            </label>
            <label class="payment-method">
              <input type="radio" name="payment">
              <i class="fab fa-cc-paypal"></i> PayPal
            </label>
          </div>
          <button type="submit" class="btn btn-primary place-order-btn">
            Place Order <i class="fas fa-lock"></i>
          </button>
        </form>
      </div>
    `;
    
    openModal(content);
    
    setTimeout(() => {
      const checkoutForm = document.querySelector('.checkout-form');
      if (checkoutForm) {
        checkoutForm.addEventListener('submit', function(e) {
          e.preventDefault();
          placeOrder();
        });
      }
      
      const closeBtn = document.querySelector('.close-modal');
      if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
      }
    }, 10);
  }
function placeOrder() {
  const orderTotal = calculateCartTotal();
  const orderId = 'ORD-' + Math.floor(Math.random() * 1000000);

  const emailInput = document.getElementById("checkout-email");
  const email = emailInput ? emailInput.value.trim() : (localStorage.getItem("userEmail") || "N/A");

  const orderData = {
    id: orderId,
    items: state.cart.map(item => `${item.name} x ${item.quantity}`).join(", "),
    total: orderTotal.toFixed(2),
    customer_name: localStorage.getItem("userName") || "Guest",
    customer_email: email,
    customer_phone: localStorage.getItem("userPhone") || "N/A",
    date: new Date().toLocaleString()
  };

  const formData = new FormData();
  Object.keys(orderData).forEach(key => formData.append(key, orderData[key]));

  fetch("https://script.google.com/macros/s/AKfycbxgIXgYOtIbwxYDy_8qk7QSnxzvakGwF7cXyWU8uHIfEOZyfVf9OchD0QMME0jYxfO8/exec", {
    method: "POST",
    body: formData
  })
  .then(res => res.json())
  .then(data => {
    if (data.result === "success") {
      console.log("✅ Order saved:", data);
      showNotification(`Order #${data.orderId} placed successfully!`);
    } else {
      console.error("❌ Error saving order:", data.error);
    }
  })
  .catch(error => console.error("❌ Fetch error:", error))
  .finally(() => {
    state.cart = [];
    localStorage.setItem('cart', JSON.stringify(state.cart));
    updateCartUI();
    closeModal();
  });
}



function submitOrderToSheets(orderId, orderTotal) {
  const emailInput = document.getElementById("checkout-email");
  const email = emailInput ? emailInput.value.trim() : (localStorage.getItem("userEmail") || "N/A");

  const orderData = {
    id: orderId,
    items: state.cart.map(item => `${item.name} x ${item.quantity}`).join(", "),
    total: orderTotal.toFixed(2),
    customer_name: localStorage.getItem("userName") || "Guest",
    customer_email: email,
    customer_phone: localStorage.getItem("userPhone") || "N/A",
    date: new Date().toLocaleString()
  };

  // Silent submission - don't wait for response
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = "https://script.google.com/macros/s/AKfycbw7bPIBvZAMnu5l1GuJRNaW85tnas0B31c2scHR3VO5se9U80FzozVBLADbA_l3jQhe/exec";
  form.style.display = 'none';
  
  Object.keys(orderData).forEach(key => {
    const input = document.createElement('input');
    input.name = key;
    input.value = orderData[key];
    form.appendChild(input);
  });
  
  document.body.appendChild(form);
  form.submit();
  setTimeout(() => document.body.removeChild(form), 1000);
}
  // Calculate Cart Total
  function calculateCartTotal() {
    return state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  // Search Products
  function searchProducts() {
    if (!elements.searchInput) return;
    
    const searchTerm = elements.searchInput.value.toLowerCase().trim();
    
    if (searchTerm.length > 0) {
      // Filter products based on search term
      state.searchResults = state.products.filter(product => 
        product.name.toLowerCase().includes(searchTerm) ||
        product.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
        product.category.toLowerCase().includes(searchTerm)
      );
      
      // Show search results in modal
      showSearchModal();
    }
  }

  // Show Search Modal
  function showSearchModal() {
    if (!elements.searchInput) return;
    
    const searchTerm = elements.searchInput.value.toLowerCase().trim();
    
    if (searchTerm.length === 0) {
      showNotification('Please enter a search term', 'info');
      return;
    }
    
    if (state.searchResults.length === 0) {
      showNotification('No products found for your search', 'info');
      return;
    }
    
    let content = `
      <div class="search-modal">
        <button class="close-modal">&times;</button>
        <h2>Search Results for "${searchTerm}"</h2>
        <p class="search-results-count">Found ${state.searchResults.length} products</p>
        <div class="search-results-container">
          ${state.searchResults.map(product => {
            const isFavorite = state.favorites.some(item => item.id === product.id);
            return `
              <div class="search-result-item" data-id="${product.id}">
                <img src="${product.image}" alt="${product.name}">
                <div class="search-result-details">
                  <h4>${product.name}</h4>
                  <div class="product-price">
                    <span class="current-price">$${product.price.toFixed(2)}</span>
                    ${product.originalPrice ? `<span class="original-price">$${product.originalPrice.toFixed(2)}</span>` : ''}
                  </div>
                  <div class="product-rating">
                    <div class="stars">
                      ${renderStars(product.rating)}
                    </div>
                    <span class="rating-count">(${product.reviews} reviews)</span>
                  </div>
                  <div class="search-result-actions">
                    <button class="action-btn add-to-cart-search">
                      <i class="fas fa-shopping-cart"></i> Add to Cart
                    </button>
                    <button class="action-btn favorite-btn-search">
                      <i class="${isFavorite ? 'fas' : 'far'} fa-heart"></i>
                    </button>
                    <button class="action-btn view-details-search">
                      <i class="fas fa-eye"></i> Details
                    </button>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
    
    openModal(content);
    
    // Add event listeners to search result buttons
    setTimeout(() => {
      document.querySelectorAll('.add-to-cart-search').forEach(btn => {
        btn.addEventListener('click', function() {
          const productId = parseInt(this.closest('.search-result-item').dataset.id);
          const product = state.products.find(p => p.id === productId);
          if (product) {
            addToCart(product);
            showNotification(`${product.name} added to cart`);
          }
        });
      });
      
      document.querySelectorAll('.favorite-btn-search').forEach(btn => {
        btn.addEventListener('click', function() {
          const productId = parseInt(this.closest('.search-result-item').dataset.id);
          const product = state.products.find(p => p.id === productId);
          if (product) {
            toggleFavorite(product, this);
            
            // Update button icon
            const isNowFavorite = state.favorites.some(item => item.id === productId);
            this.innerHTML = `<i class="${isNowFavorite ? 'fas' : 'far'} fa-heart"></i>`;
          }
        });
      });
      
      document.querySelectorAll('.view-details-search').forEach(btn => {
        btn.addEventListener('click', function() {
          const productId = parseInt(this.closest('.search-result-item').dataset.id);
          const product = state.products.find(p => p.id === productId);
          if (product) {
            closeModal();
            showQuickView(product);
          }
        });
      });
      
      const closeBtn = document.querySelector('.close-modal');
      if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
      }
    }, 10);
  }

  // Handle Newsletter Submission
  function handleNewsletterSubmit(e) {
    e.preventDefault();
    const emailInput = e.target.querySelector('input[type="email"]');
    if (!emailInput) return;
    
    const email = emailInput.value;
    
    if (email && validateEmail(email)) {
      showNotification('Thanks for subscribing! You\'ll receive our latest deals soon.');
      e.target.reset();
    } else {
      showNotification('Please enter a valid email address', 'error');
    }
  }

  // Helper: Render Stars
  function renderStars(rating) {
    let stars = '';
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < fullStars; i++) stars += '<i class="fas fa-star"></i>';
    if (hasHalfStar) stars += '<i class="fas fa-star-half-alt"></i>';
    for (let i = 0; i < 5 - fullStars - (hasHalfStar ? 1 : 0); i++) stars += '<i class="far fa-star"></i>';
    
    return stars;
  }

  // Helper: Validate Email
  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  // Helper: Show Notification
  function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.classList.add('show');
    }, 10);
    
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }

  // Helper: Scroll to Section
  function scrollToSection(selector) {
    const section = document.querySelector(selector);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  }

  // Helper: Animate Cart Icon
  function animateCartIcon() {
    if (elements.cartCount) {
      elements.cartCount.style.transform = 'scale(1.5)';
      setTimeout(() => {
        elements.cartCount.style.transform = 'scale(1)';
      }, 300);
    }
    
    if (elements.floatingCart) {
      elements.floatingCart.style.transform = 'scale(1.1)';
      setTimeout(() => {
        elements.floatingCart.style.transform = 'scale(1)';
      }, 300);
    }
  }

  // Show Coming Soon
  function showComingSoon() {
    if (typeof Swal !== 'undefined') {
      Swal.fire({
        title: "Coming Soon",
        icon: "info",
        confirmButtonText: "ok"
      });
    } else {
      showNotification("This feature is coming soon!", "info");
    }
  }

  // ================== Firebase Cart Functions ==================
  
  // Add to Cart in Firebase
  function addToCartFirebase(product, quantity) {
    const user = auth.currentUser;
    if (!user) return;

    const uid = user.uid;
    const cartRef = database.ref("users/" + uid + "/cart/" + product.id);

    cartRef.set({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: quantity,
      image: product.image
    }).catch((error) => {
      console.error("Error adding to cart in Firebase:", error);
    });
  }

  // Update Cart Item Quantity in Firebase
  function updateCartItemQuantityFirebase(productId, quantity) {
    const user = auth.currentUser;
    if (!user) return;

    const uid = user.uid;
    const cartRef = database.ref("users/" + uid + "/cart/" + productId);

    if (quantity <= 0) {
      cartRef.remove().catch((error) => {
        console.error("Error removing from cart in Firebase:", error);
      });
    } else {
      cartRef.update({ quantity: quantity }).catch((error) => {
        console.error("Error updating quantity in Firebase:", error);
      });
    }
  }

  // Remove from Cart in Firebase
  function removeFromCartFirebase(productId) {
    const user = auth.currentUser;
    if (!user) return;

    const uid = user.uid;
    database.ref("users/" + uid + "/cart/" + productId).remove()
      .catch((error) => {
        console.error("Error removing from cart in Firebase:", error);
      });
  }

  // Clear Cart in Firebase
  function clearCartFirebase() {
    const user = auth.currentUser;
    if (!user) return;

    const uid = user.uid;
    database.ref("users/" + uid + "/cart").remove()
      .catch((error) => {
        console.error("Error clearing cart in Firebase:", error);
      });
  }

  // Load Cart from Firebase - UPDATED TO HANDLE MERGING
  function loadCartFromFirebase() {
    const user = auth.currentUser;
    if (!user) return;

    const uid = user.uid;
    const cartRef = database.ref("users/" + uid + "/cart");

    cartRef.once("value").then((snapshot) => {
      const firebaseCart = [];
      
      if (snapshot.exists()) {
        snapshot.forEach((child) => {
          const item = child.val();
          // Find the complete product details from our products array
          const productDetails = state.products.find(p => p.id === item.id);
          if (productDetails) {
            firebaseCart.push({
              ...productDetails,
              quantity: item.quantity
            });
          }
        });
      }
      
      // Strategy: Use Firebase cart as source of truth for logged-in users
      state.cart = firebaseCart;
      
      // Also update localStorage as backup
      localStorage.setItem('cart', JSON.stringify(state.cart));
      
      updateCartUI();
      
    }).catch((error) => {
      console.error("Error loading cart from Firebase:", error);
      // Fallback to localStorage if Firebase fails
      state.cart = JSON.parse(localStorage.getItem('cart')) || [];
      updateCartUI();
    });
  }

  // ================== 2. Sign Up ==================
  function signUp(fullName, username, email, phone, gender, password) {
    auth.createUserWithEmailAndPassword(email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        const uid = user.uid;

        // تحديث الاسم في الحساب
        user.updateProfile({
          displayName: fullName
        });

        // تخزين بيانات المستخدم
        return database.ref("users/" + uid).set({
          fullName: fullName,
          username: username,
          email: email,
          phone: phone,
          gender: gender
        });
      })
      .then(() => {
        alert("✅ Account created successfully!");
        window.location.href = "login.html";
      })
      .catch((error) => {
        alert("❌ Error: " + error.message);
      });
  }

  // ================== 3. Login ==================
  function login(email, password) {
    auth.signInWithEmailAndPassword(email, password)
      .then((userCredential) => {
        const uid = userCredential.user.uid;

        // تحميل بيانات المستخدم
        return database.ref("users/" + uid).once("value");
      })
      .then((snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();

          // تخزين في localStorage
          localStorage.setItem("userName", data.fullName);
          localStorage.setItem("userPhone", data.phone);
          localStorage.setItem("userEmail", data.email);

          // Load cart from Firebase after login
          loadCartFromFirebase();
          
          alert("👋 Welcome " + data.fullName);
          window.location.href = "shop.html";
        }
      })
      .catch((error) => {
        alert("❌ Login Failed: " + error.message);
      });
  }

  // Initialize the app
  init();

  // Add CSS for modals and notifications
  const style = document.createElement('style');
  style.textContent = `
    /* Modal Styles */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(11, 15, 26, 0.9);
      display: none;
      justify-content: center;
      align-items: center;
      z-index: 1000;
      opacity: 0;
      transition: opacity 0.3s;
      backdrop-filter: blur(5px);
    }
    
    .modal-content {
      background: #1B2430;
      border-radius: 12px;
      padding: 2rem;
      max-width: 90%;
      max-height: 90vh;
      overflow-y: auto;
      transform: translateY(20px);
      transition: transform 0.3s;
      border: 1px solid rgba(0, 207, 255, 0.2);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    }
    
    .close-modal {
      position: absolute;
      top: 1rem;
      right: 1rem;
      background: none;
      border: none;
      font-size: 1.5rem;
      color: #00CFFF;
      cursor: pointer;
    }
    
    /* Cart Modal Styles */
    .cart-modal {
      position: relative;
      width: 100%;
      max-width: 500px;
    }
    
    .cart-items-container {
      max-height: 50vh;
      overflow-y: auto;
      margin: 1rem 0;
      padding-right: 0.5rem;
    }
    
    .cart-item {
      display: flex;
      gap: 1rem;
      padding: 1rem 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .cart-item img {
      width: 80px;
      height: 80px;
      object-fit: contain;
      background: rgba(0, 207, 255, 0.1);
      border-radius: 8px;
    }
    
    .cart-item-details {
      flex: 1;
    }
    
    .cart-item-actions {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-top: 0.5rem;
    }
    
    .quantity-btn {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      background: rgba(0, 207, 255, 0.1);
      border: none;
      color: #00CFFF;
      cursor: pointer;
    }
    
    .remove-btn {
      background: none;
      border: none;
      color: #FF4757;
      cursor: pointer;
      margin-left: auto;
    }
    
    .cart-total {
      display: flex;
      justify-content: space-between;
      font-size: 1.2rem;
      font-weight: bold;
      margin: 1.5rem 0;
      padding-top: 1rem;
      border-top: 1px solid rgba(255, 255, 255, 0.2);
    }
    
    /* Favorites Modal Styles */
    .favorites-modal {
      position: relative;
      width: 100%;
      max-width: 500px;
    }
    
    .favorites-items-container {
      max-height: 60vh;
      overflow-y: auto;
      margin: 1rem 0;
      padding-right: 0.5rem;
    }
    
    .favorite-item {
      display: flex;
      gap: 1rem;
      padding: 1rem 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .favorite-item img {
      width: 80px;
      height: 80px;
      object-fit: contain;
      background: rgba(0, 207, 255, 0.1);
      border-radius: 8px;
    }
    
    .favorite-item-details {
      flex: 1;
      position: relative;
    }
    
    .favorite-item-actions {
      display: flex;
      gap: 0.5rem;
      margin-top: 0.5rem;
    }
    
    .favorite-item-actions .action-btn {
      flex: 1;
      padding: 0.5rem;
      font-size: 0.9rem;
    }
    
    /* Search Modal Styles */
    .search-modal {
      position: relative;
      width: 100%;
      max-width: 800px;
    }
    
    .search-results-count {
      color: #00CFFF;
      margin-bottom: 1rem;
    }
    
    .search-results-container {
      max-height: 60vh;
      overflow-y: auto;
      margin: 1rem 0;
      padding-right: 0.5rem;
    }
    
    .search-result-item {
      display: flex;
      gap: 1rem;
      padding: 1rem 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .search-result-item img {
      width: 100px;
      height: 100px;
      object-fit: contain;
      background: rgba(0, 207, 255, 0.1);
      border-radius: 8px;
    }
    
    .search-result-details {
      flex: 1;
      position: relative;
    }
    
    .search-result-actions {
      display: flex;
      gap: 0.5rem;
      margin-top: 0.5rem;
    }
    
    .search-result-actions .action-btn {
      padding: 0.5rem;
      font-size: 0.9rem;
    }
    
    /* Checkout Styles */
    .checkout-form {
      margin-top: 2rem;
    }
    
    .form-group {
      margin-bottom: 1rem;
    }
    
    .form-group input {
      width: 100%;
      padding: 0.8rem;
      background: rgba(0, 207, 255, 0.05);
      border: 1px solid rgba(0, 207, 255, 0.2);
      border-radius: 8px;
      color: white;
    }
    
    .form-row {
      display: flex;
      gap: 1rem;
    }
    
    .form-row .form-group {
      flex: 1;
    }
    
    .payment-methods {
      display: flex;
      gap: 1rem;
      margin: 1rem 0;
    }
    
    .payment-method {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.8rem;
      background: rgba(0, 207, 255, 0.05);
      border-radius: 8px;
      cursor: pointer;
    }
    
    .payment-method input {
      margin-right: 0.5rem;
    }
    
    .place-order-btn {
      width: 100%;
      margin-top: 1rem;
    }
    
    /* Quick View Styles */
    .quick-view {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      max-width: 800px;
    }
    
    .quick-view-image {
      text-align: center;
    }
    
    .quick-view-image img {
      max-height: 300px;
      max-width: 100%;
      object-fit: contain;
    }
    
    .quick-view-details {
      flex: 1;
    }
    
    .quick-view-actions {
      display: flex;
      gap: 1rem;
      margin-top: 1rem;
    }
    
    .quick-view-actions .btn {
      flex: 1;
    }
    
    .tag {
      display: inline-block;
      background: rgba(0, 207, 255, 0.1);
      color: #00CFFF;
      padding: 0.3rem 0.6rem;
      border-radius: 50px;
      font-size: 0.8rem;
      margin-right: 0.5rem;
      margin-bottom: 0.5rem;
    }
    
    @media (min-width: 768px) {
      .quick-view {
        flex-direction: row;
      }
      
      .quick-view-image {
        flex: 1;
      }
      
      .quick-view-details {
        flex: 1;
      }
    }
    
    /* Notification Styles */
    .notification {
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%) translateY(100px);
      background: #00CFFF;
      color: #0B0F1A;
      padding: 12px 24px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 1000;
      transition: transform 0.3s ease;
      font-weight: 600;
    }
    
    .notification.show {
      transform: translateX(-50%) translateY(0);
    }
    
    .notification.error {
      background: #FF4757;
      color: white;
    }
    
    .notification.info {
      background: #1B2430;
      color: white;
      border: 1px solid #00CFFF;
    }
  `;
  document.head.appendChild(style);

  // Sidebar toggle functionality
  const profileSidebar = document.querySelector(".profile-sidebar");
  
  if (profileSidebar) {
    // Sidebar closed by default
    profileSidebar.classList.add("collapsed");

    const isOpen = () =>
      profileSidebar.classList.contains("active") ||
      !profileSidebar.classList.contains("collapsed");

    const showSidebar = () => {
      profileSidebar.classList.remove("collapsed");
      profileSidebar.classList.add("active");
      updateAria(true);
    };

    const hideSidebar = () => {
      profileSidebar.classList.add("collapsed");
      profileSidebar.classList.remove("active");
      updateAria(false);
    };

    const toggleSidebar = () => (isOpen() ? hideSidebar() : showSidebar());

    const updateAria = (open) => {
      const sidebarToggle = document.getElementById("sidebar-toggle");
      const profileToggle = document.getElementById("profile-toggle");
      
      if (sidebarToggle)
        sidebarToggle.setAttribute("aria-expanded", String(!!open));
      if (profileToggle)
        profileToggle.setAttribute("aria-expanded", String(!!open));
    };

    const sidebarToggle = document.getElementById("sidebar-toggle");
    if (sidebarToggle) {
      sidebarToggle.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleSidebar();
      });
    }
    
    const profileToggle = document.getElementById("profile-toggle");
    if (profileToggle) {
      profileToggle.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleSidebar();
      });
    }

    profileSidebar.addEventListener("click", (e) => e.stopPropagation());

    document.addEventListener("click", (e) => {
      const clickedInsideSidebar = profileSidebar.contains(e.target);
      const sidebarToggle = document.getElementById("sidebar-toggle");
      const profileToggle = document.getElementById("profile-toggle");
      
      const clickedToggle =
        (sidebarToggle && sidebarToggle.contains(e.target)) ||
        (profileToggle && profileToggle.contains(e.target));
      if (!clickedInsideSidebar && !clickedToggle && isOpen()) {
        hideSidebar();
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && isOpen()) hideSidebar();
    });

    // Normalize on resize
    const normalizeOnResize = () => {
      hideSidebar();
    };
    normalizeOnResize();
    window.addEventListener("resize", normalizeOnResize);

    // Avatar Upload + LocalStorage
    const avatarImg = document.getElementById("user-avatar");
    const uploadInput = document.getElementById("upload-avatar");

    if (avatarImg && uploadInput) {
      // Load saved avatar
      const savedAvatar = localStorage.getItem("user-avatar");
      if (savedAvatar) {
        avatarImg.src = savedAvatar;
      }

      // Save new avatar
      uploadInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = function (event) {
            const imageData = event.target.result;
            avatarImg.src = imageData;
            localStorage.setItem("user-avatar", imageData);
          };
          reader.readAsDataURL(file);
        }
      });
    }
  }
  
});
