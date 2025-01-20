


import './App.css';


function App() {

   // Parse cookies into an object

  const isCustomer = new RegExp("(?=customer)");
  const isSalesman = new RegExp("(?=salesman)");
  const isRoot = new RegExp("(?=root)");
  function parseCookies() {
    const cookies = document.cookie.split(';');
    const cookieObj = {};
    cookies.forEach(cookie => {
      const [key, value] = cookie.split('=');
      cookieObj[key.trim()] = value;
    });
    return cookieObj;
  }

  const cookies=parseCookies();
  
  if (isCustomer.test(cookies.type)) {
    return (
      <div className="App">
        <div id='search'>
          <form action='/search_good_customer' method="post">
            <input type="text" id="search_text" name="search_text" placeholder="Search..." required />
            <input type="submit" value="Search" />
          </form>
        </div>
        <div id='welcome'>
          <button onClick={()=>{
            document.cookie = "";
            window.location.reload();
          }}>Log out</button>
          <h1>Welcome, {cookies.username}</h1>
        </div>
        <div id='cart_action'>
          <form action='/act_to_cart' method="post">
            <input type="text" id="product_id" name="product_id" placeholder="Enter product ID" required />
            <input type="number" id="quantity" name="quantity" placeholder="Enter quantity" required />
            <label>
              <input type="radio" name="action" value="add" checked /> Add
            </label>
            <label>
              <input type="radio" name="action" value="remove" /> Remove
            </label>
            <input type="submit" value="Add to cart" />
          </form>
        </div>
        <div id='Cart'>
          <h2>Cart:</h2>
          <p>{cookies.cart}</p>
          <form action='/checkout' method="post">
            <input type="submit" value="Checkout" />
          </form>
        </div>
      </div>
    );
  } else if (isSalesman.test(cookies.type)) {
    return (
      <div className="App">
        <div id='search'>
          <form action='/search_good_salesman' method="post">
            <input type="text" id="search_text" name="search_text" placeholder="Search..." required />
            <input type="submit" value="Search" />
          </form>
        </div>
        <div id='welcome'>
          <button onClick={()=>{
            document.cookie = "";
            window.location.reload();
          }}>Log out</button>
          <h1>Welcome, {cookies.username}</h1>
        </div>
        <div id='manage_good'>
          <form action='/manage_good' method="post">
            <input type="text" id="product_name" name="product_name" placeholder="Enter product name" required />
            <input type="number" id="price" name="price" placeholder="Enter price" required />
            <textarea id="description" name="description" placeholder="Enter product description" required></textarea>
            <p>Important! The image information can only be changed once a day; otherwise, there may be errors.</p>
            <input type="file" id="product_image" name="product_image" accept="image/*" />
            <label>
              <input type="radio" name='action' value="add" checked /> Add
            </label>
            <label>
              <input type="radio" name='action' value="remove" /> Remove
            </label>
            <label>
              <input type="radio" name='action' value="update" /> Update
            </label>
          </form>
        </div>
        <div id='good_list'>
          <h2>Good List:</h2>
          <p>{cookies.good_list}</p>
        </div>
      </div>
    );
  } else if (isRoot.test(cookies.type)) {
    window.location.href = 'http://127.0.0.1:8000/root'; // Redirect to external URL
    return null;
  } else {
    
  
    return (
      <div className="App">
        <form action='/login_or_signup' method="post">
          <input type="text" id="name" name="name" placeholder="Enter your name" required />
          <input type="email" id="email" name="email" placeholder="Enter your email" required />
          <input type="password" id="password" name="password" placeholder="Enter your password (if signing up, create a new password; if logging in, use your password)" required />
          <label>
            <input type="radio" name="type" value="customer" defaultChecked /> Customer
          </label>
          <label>
            <input type="radio" name="type" value="salesman" /> Salesman
          </label>
          <input type="submit" value="Submit" />
        </form>
        
      </div>
    );
  }
}

export default App;