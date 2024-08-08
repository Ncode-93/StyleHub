import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useParams } from 'react-router-dom';
import { ShoppingBag, X } from 'lucide-react';

const App = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    fetch('/data/products.json')
      .then(response => response.json())
      .then(data => setProducts(data))
      .catch(error => console.error('Error loading products:', error));
  }, []);

  const addToCart = (product, size) => {
    const sizeDetails = product.sizes.find(s => s.size === size);
    const price = sizeDetails ? sizeDetails.price : product.price;
    setCart([...cart, { ...product, size, price }]);
    setIsCartOpen(true);
  };

  const removeFromCart = (index) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-white shadow-md">
          <div className="container mx-auto px-6 py-10 flex justify-between items-center">
            <Link to="/" className="text-2xl font-bold text-gray-800">StyleHub</Link>
            <button onClick={() => setIsCartOpen(true)} className="relative">
              <ShoppingBag className="w-6 h-6 text-gray-600" />
              {cart.length > 0 && (
      <>
        <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
          {cart.length}
        </span>
        <span className="absolute top-8 -right-4 bg-white text-black-800 rounded-md px-2 py-1 text-bold">
          ${cart.reduce((total, item) => total + item.price, 0).toFixed(2)}
        </span>
      </>
    )}
            </button>
          </div>
        </nav>

        <div className="container mx-auto px-6 py-8">
          <Routes>
            <Route path="/" element={<ProductList products={products} />} />
            <Route path="/product/:id" element={<ProductDetail products={products} addToCart={addToCart} />} />
          </Routes>
        </div>

        <Cart cart={cart} isOpen={isCartOpen} setIsOpen={setIsCartOpen} removeFromCart={removeFromCart} />
      </div>
    </Router>
  );
};

const ProductList = ({ products }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    {products.map((product) => (
      <Link key={product.id} to={`/product/${product.id}`} className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:scale-105">
        <img src={product.image} alt={product.name} className="w-full h-64 object-contain" />
        <div className="p-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">{product.name}</h2>
          <p className="text-gray-600 font-bold">${product.price.toFixed(2)}</p>
        </div>
      </Link>
    ))}
  </div>
);

const ProductDetail = ({ products, addToCart }) => {
  const { id } = useParams();
  const product = products.find((p) => p.id === parseInt(id));
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedPrice, setSelectedPrice] = useState(product?.price);

  useEffect(() => {
    if (selectedSize) {
      const sizeDetails = product.sizes.find(size => size.size === selectedSize);
      setSelectedPrice(sizeDetails ? sizeDetails.price : product.price);
    }
  }, [selectedSize, product]);

  if (!product) return <div className="text-center text-2xl mt-10">Product not found</div>;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="md:flex">
        <img src={product.image} alt={product.name} className="w-full md:w-1/2 h-96 object-contain" />
        <div className="p-6 md:w-1/2">
          <h1 className="text-3xl font-semibold mb-2">{product.name}</h1>
          <p className="text-2xl text-gray-600 mb-4">${selectedPrice.toFixed(2)}</p>
          <p className="text-gray-700 mb-6">{product.description}</p>
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Select Size:</h3>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((size) => (
                <button
                  key={size.size}
                  onClick={() => setSelectedSize(size.size)}
                  className={`px-4 py-2 rounded ${
                    selectedSize === size.size 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  } transition-colors duration-200`}
                >
                  {size.size}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={() => selectedSize && addToCart(product, selectedSize)}
            className={`w-full py-3 rounded ${
              selectedSize 
                ? 'bg-blue-500 text-white hover:bg-blue-600' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            } transition-colors duration-200`}
            disabled={!selectedSize}
          >
            {selectedSize ? 'Add to Cart' : 'Select a Size'}
          </button>
        </div>
      </div>
    </div>
  );
};

const Cart = ({ cart, isOpen, setIsOpen, removeFromCart }) => {
  const total = cart.reduce((sum, item) => sum + item.price, 0);

  return (
<div className={`fixed inset-y-0 right-0 w-full sm:w-96 bg-white shadow-lg transform ${isOpen ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-300 ease-in-out z-50`}>      <div className="p-6 h-full flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Your Cart</h2>
          <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        {cart.length === 0 ? (
          <p className="text-center text-gray-500 my-auto">Your cart is empty.</p>
        ) : (
          <div className="flex-grow overflow-y-auto mb-6">
            {cart.map((item, index) => (
              <div key={index} className="flex items-center justify-between py-4 border-b">
                <div className="flex items-center">
                  <img src={item.image} alt={item.name} className="w-16 h-16 object-contain rounded mr-4" />
                  <div>
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-gray-600">Size: {item.size}</p>
                    <p className="text-gray-600">${item.price.toFixed(2)}</p>
                  </div>
                </div>
                <button onClick={() => removeFromCart(index)} className="text-red-500 hover:text-red-700">
                  <X className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-auto">
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-semibold">Total:</span>
            <span className="text-lg font-bold">${total.toFixed(2)}</span>
          </div>
          <button className="w-full bg-blue-500 text-white py-3 rounded hover:bg-blue-600 transition-colors duration-200">
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;