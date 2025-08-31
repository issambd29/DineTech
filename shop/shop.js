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
    heroShopBtn: document.querySelector('.hero-actions .btn-primary '),
    modalOverlay: document.createElement('div'),
    modalContent: document.createElement('div'),
    linkHome: document.querySelector("#btn-h"),
    linkcatego: document.querySelector("#btn-c"),
    linkdeals: document.querySelector("#btn-d"),
    linkfeatred: document.querySelector("#btn-f")
  };

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
    updateCartUI();
    updateFavoritesUI();
  }

  // Setup Event Listeners
  function setupEventListeners() {
    // Mobile Menu Toggle
    elements.hamburger.addEventListener('click', toggleMobileMenu);

    // Product Interactions
    elements.productsContainer.addEventListener('click', handleProductActions);

    // Search Functionality
    elements.searchInput.addEventListener('input', searchProducts);
    elements.searchIcon.addEventListener('click', showSearchModal);

    // Newsletter Form
    elements.newsletterForm.addEventListener('submit', handleNewsletterSubmit);

    // Hero Shop Button
    elements.heroShopBtn.addEventListener('click', function() {
      scrollToSection('.products');
    });
    //===================
    elements.linkHome.addEventListener('click', function() {
      scrollToSection('.hero');
    });
    //==============================
    elements.linkcatego.addEventListener('click', function() {
      scrollToSection('.categories');
    });
    //=========================
    elements.linkdeals.addEventListener('click', function() {
      scrollToSection('.products');
    });
    //========================
    elements.linkfeatred.addEventListener('click', function() {
      scrollToSection('.featured');
    });


    // Floating Cart
    elements.floatingCart.addEventListener('click', showCartModal);

    // Floating Favorites
    elements.floatingFavorites.addEventListener('click', showFavoritesModal);

    // Cart Icon
    elements.cartIcon.addEventListener('click', showCartModal);

    // Favorite Icon
    elements.favoriteIcon.addEventListener('click', showFavoritesModal);
  }

  // Toggle Mobile Menu
  function toggleMobileMenu() {
    elements.navLinks.classList.toggle('show');
    elements.hamburger.innerHTML = elements.navLinks.classList.contains('show') 
      ? '<i class="fas fa-times"></i>' 
      : '<i class="fas fa-bars"></i>';
  }

  // Handle Product Actions
  function handleProductActions(e) {
    const target = e.target.closest('.action-btn, .add-to-cart, .favorite-btn');
    if (!target) return;

    const productCard = target.closest('.product-card');
    const productId = parseInt(productCard.dataset.id);
    const product = state.products.find(p => p.id === productId);

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
    elements.favoriteCount.textContent = totalItems;
    
    if (elements.floatingFavorites) {
      const favoritesCountElement = elements.floatingFavorites.querySelector('.favorites-count');
      if (favoritesCountElement) favoritesCountElement.textContent = `${totalItems} ${totalItems === 1 ? 'item' : 'items'}`;
    }
    
    // Update heart icons on product cards
    document.querySelectorAll('.favorite-btn i').forEach(icon => {
      const productId = parseInt(icon.closest('.product-card').dataset.id);
      if (state.favorites.some(item => item.id === productId)) {
        icon.classList.replace('far', 'fas');
      } else {
        icon.classList.replace('fas', 'far');
      }
    });
  }

  const userName = localStorage.getItem('userName') || 'guest';
  const userElement = document.querySelector('.user-name');

  if (userElement) {
    userElement.textContent = userName;
  }

  console.error(userName +" Your attempt to hack us makes you an enemy of our security systems.");
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
    document.querySelectorAll('.add-to-cart-fav').forEach(btn => {
      btn.addEventListener('click', function() {
        const productId = parseInt(this.closest('.favorite-item').dataset.id);
        const product = state.products.find(p => p.id === productId);
        addToCart(product);
        showNotification(`${product.name} added to cart`);
      });
    });
    
    document.querySelectorAll('.remove-favorite').forEach(btn => {
      btn.addEventListener('click', function() {
        const productId = parseInt(this.closest('.favorite-item').dataset.id);
        const product = state.products.find(p => p.id === productId);
        toggleFavorite(product, this);
        
        // If no more favorites, close modal
        if (state.favorites.length === 0) {
          closeModal();
        } else {
          showFavoritesModal(); // Refresh modal
        }
      });
    });
    
    document.querySelector('.close-modal')?.addEventListener('click', closeModal);
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
    document.querySelector('.add-to-cart-modal')?.addEventListener('click', function() {
      const productId = parseInt(this.dataset.id);
      const product = state.products.find(p => p.id === productId);
      addToCart(product);
      showNotification(`${product.name} added to cart`);
    });
    
    // Add event listener to modal's favorite button
    document.querySelector('.favorite-btn-modal')?.addEventListener('click', function() {
      const productId = parseInt(this.dataset.id);
      const product = state.products.find(p => p.id === productId);
      toggleFavorite(product, this);
      
      // Update button text
      const isNowFavorite = state.favorites.some(item => item.id === productId);
      this.innerHTML = `<i class="${isNowFavorite ? 'fas' : 'far'} fa-heart"></i> ${isNowFavorite ? 'Remove Favorite' : 'Add to Favorites'}`;
    });
    
    document.querySelector('.close-modal')?.addEventListener('click', closeModal);
  }

  // Add to Cart
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
    
    // Save to localStorage
    localStorage.setItem('cart', JSON.stringify(state.cart));
    
    updateCartUI();
    showNotification(`${product.name} added to cart`);
    animateCartIcon();
  }

  // Update Cart UI
  function updateCartUI() {
    const totalItems = state.cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    elements.cartCount.textContent = totalItems;
    
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
    
    document.querySelector('.checkout-btn')?.addEventListener('click', proceedToCheckout);
    document.querySelector('.close-modal')?.addEventListener('click', closeModal);
  }

  // Update Cart Item Quantity
  function updateCartItemQuantity(productId, change) {
    const item = state.cart.find(item => item.id === productId);
    if (!item) return;
    
    item.quantity += change;
    
    if (item.quantity <= 0) {
      removeFromCart(productId);
    } else {
      // Save to localStorage
      localStorage.setItem('cart', JSON.stringify(state.cart));
      updateCartUI();
      showCartModal(); // Refresh modal
    }
  }

  // Remove from Cart
  function removeFromCart(productId) {
    state.cart = state.cart.filter(item => item.id !== productId);
    // Save to localStorage
    localStorage.setItem('cart', JSON.stringify(state.cart));
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
            <input type="text" placeholder="Full Name" required>
          </div>
          <div class="form-group">
            <input type="email" placeholder="Email" required>
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
    
    document.querySelector('.checkout-form')?.addEventListener('submit', function(e) {
      e.preventDefault();
      placeOrder();
    });
    
    document.querySelector('.close-modal')?.addEventListener('click', closeModal);
  }

  // Place Order
  function placeOrder() {
    // In a real app, you would process payment here
    const orderTotal = calculateCartTotal();
    const orderId = 'ORD-' + Math.floor(Math.random() * 1000000);
    
    showNotification(`Order #${orderId} placed successfully! Total: $${orderTotal.toFixed(2)}`);
    
    // Clear cart
    state.cart = [];
    localStorage.setItem('cart', JSON.stringify(state.cart));
    updateCartUI();
    closeModal();
  }

  // Calculate Cart Total
  function calculateCartTotal() {
    return state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

// Search Products
function searchProducts() {
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

// Add Enter key functionality
if (elements.searchInput) {
  elements.searchInput.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      searchProducts();
    }
  });
}

// Show Search Modal
function showSearchModal() {
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
  document.querySelectorAll('.add-to-cart-search').forEach(btn => {
    btn.addEventListener('click', function() {
      const productId = parseInt(this.closest('.search-result-item').dataset.id);
      const product = state.products.find(p => p.id === productId);
      addToCart(product);
      showNotification(`${product.name} added to cart`);
    });
  });
  
  document.querySelectorAll('.favorite-btn-search').forEach(btn => {
    btn.addEventListener('click', function() {
      const productId = parseInt(this.closest('.search-result-item').dataset.id);
      const product = state.products.find(p => p.id === productId);
      toggleFavorite(product, this);
      
      // Update button icon
      const isNowFavorite = state.favorites.some(item => item.id === productId);
      this.innerHTML = `<i class="${isNowFavorite ? 'fas' : 'far'} fa-heart"></i>`;
    });
  });
  
  document.querySelectorAll('.view-details-search').forEach(btn => {
    btn.addEventListener('click', function() {
      const productId = parseInt(this.closest('.search-result-item').dataset.id);
      const product = state.products.find(p => p.id === productId);
      closeModal();
      showQuickView(product);
    });
  });
  
  document.querySelector('.close-modal')?.addEventListener('click', closeModal);
}
  // Handle Newsletter Submission
  function handleNewsletterSubmit(e) {
    e.preventDefault();
    const email = e.target.querySelector('input[type="email"]').value;
    
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
        document.body.removeChild(notification);
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
    elements.cartCount.style.transform = 'scale(1.5)';
    setTimeout(() => {
      elements.cartCount.style.transform = 'scale(1)';
    }, 300);
    
    if (elements.floatingCart) {
      elements.floatingCart.style.transform = 'scale(1.1)';
      setTimeout(() => {
        elements.floatingCart.style.transform = 'scale(1)';
      }, 300);
    }
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
});