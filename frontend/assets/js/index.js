const url = 'http://localhost:5001'



const messages = (message, status) => {
  let klase = status === "success" ? "alert-success" : "alert-danger";
  messageDiv.innerHTML = message;
  messageDiv.classList.remove("alert-success", "alert-danger");
  messageDiv.classList.add("show", klase);

  setTimeout(() => {
    messageDiv.classList.remove("show");
  }, 8000);
};

const transferData = async (url, method = 'GET', data = {}) => {
    let options = {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        }
    }

    if(method != 'GET')
        options.body = JSON.stringify(data)

    const resp = await fetch(url, options)

    return resp.json()
}

const validator = (fields) => {
    let valid = true
    let entries = Object.entries(fields)

    if(!fields.product) {
        valid = false
    }

    entries.forEach(value => {
        if(value[1] == '') {
            valid = false
            return
        }
    })

    return valid
}

const totalsCalculator = () => {
    const product = document.querySelector('input[name="product"]:checked')
    if(product === null)
        return false
    
    const productPrice = product.getAttribute('data-price') 
    const shippingMethod = document.querySelector('select[name="shipping_method"]').value
    const shippingCost = 3.00
    let calculatedTotal = parseFloat(productPrice)

    if(shippingMethod === 'delivery')
        calculatedTotal += shippingCost
    
    document.querySelector('input[name="total"]').value = calculatedTotal.toFixed(2)
    document.querySelector('.totalPrice').textContent = '€ ' + calculatedTotal.toFixed(2)
}

const newOrderForm = async () => {
    const root = document.querySelector('#newOrderForm')
    const productsContainer = root.querySelector('.productSelect')

    const products = await transferData(url + '/products/show-products')

    let html = '<ul>'
    
    products.forEach(product => {
        let price = `<span class="normalPrice">${product.price}</span>`
        let dataPrice = product.discount_price ? product.discount_price : product.price

        if(product.discount_price) 
            price = `<span class="specialPrice">${product.discount_price}</span>
                    <span class="originalPrice">${product.price}</span>`

        html += `<li>
                    <label>
                        <input type="radio" data-price="${dataPrice}" name="product" value="${product._id}">
                        <div class="contents">
                            <div class="name">${product.product_name}</div>
                            <div class="description">${product.description}</div>
                            <div class="price">${price}</div>
                        </div>
                    </label>
                </li>`
    })

    html += '<ul>'

    productsContainer.innerHTML = html

    root.querySelector('button.checkout-button').addEventListener('click', () => {
        const form = root.querySelector('form')
        const formData = new FormData(form)
        const formJson = Object.fromEntries(formData)
        
        
        if( validator(formJson) ) {
            transferData(url + '/orders/save-order', 'POST', formJson)
            .then(resp => {
                console.log(resp)
            })
        }
    })

    root.querySelectorAll('input[name="product"]').forEach(product => {

        product.addEventListener('click', () => {
            totalsCalculator()
        })

    })

    root.querySelector('select[name="shipping_method"]').addEventListener('change', () => {
        totalsCalculator()
    })
    
}

const ordersList = async () => {
    const listEl = document.querySelector('.ordersList')
    const orders = await transferData(url + '/orders/get-orders')
    let html = '<h2>Jūs neturite jokių užsakymų</h2>'

    if(orders.length > 0) {
        html = `<h2>Jūsų užsakymai</h2>
                    <table class="table">
                   <thead>
                        <th>Vardas</th>
                        <th>Pavardė</th>
                        <th>Telefono nr.</th>
                        <th>El. paštas</th>
                        <th>Produktas</th>
                        <th>Pristatymo būdas</th>
                        <th>Suma</th>
                    </thead>
                    <tbody>`

        orders.forEach(order => {
            html += `<tr>
                        <td>${order.first_name}</td>
                        <td>${order.last_name}</td>
                        <td>${order.phone}</td>
                        <td>${order.email}</td>
                        <td>${order.product}</td>
                        <td>${order.shipping_method}</td>
                        <td>€ ${order.total}</td>
                    </tr>`
        })

        html += `</tbody></table>`

    }

    listEl.innerHTML = html
}

window.addEventListener('load', () => {
    ordersList()
})

document.querySelector('.add-new-order').addEventListener('click', (event) => {
    const element = event.target
    const activeLabel = element.getAttribute('data-active-label') 
    const hiddenLabel = element.getAttribute('data-hidden-label')

    const root = document.querySelector('#newOrderForm')

    element.textContent = root.classList.contains('show') ? hiddenLabel : activeLabel

    root.classList.toggle('show')
    
    newOrderForm()
})