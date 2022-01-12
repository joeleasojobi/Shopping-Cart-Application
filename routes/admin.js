var express = require('express');
const { render, response } = require('../app');
const productHelpers = require('../helpers/product-helpers');
var router = express.Router();
const userHelpers = require('../helpers/user-helpers')
const { ADMIN_COLLECTION } = require('../config/collection');

const verifyLogin = (req, res, next) => {
  if (req.session.admin.loggedIn) {
    next()
  } else {
    res.redirect('/login')
  }
}

router.get('/', async (req, res, next) => {
  let admin = req.session.admin
  console.log(admin);
  if (req.session.admin) {
    productHelpers.getAllProducts().then((products) => {
      res.render('admin/view-products', { products,admin:true,admin})
    })
  } else {
    res.render('admin/login',{admin})
  }
});

router.get('/login', (req, res) => {
  let admin = req.session.admin
  if (req.session.admin) {
    res.redirect('/admin',{admin})
  } else {
    res.render('admin/login', { "loginErr": req.session.adminLoginErr })
  }
  req.session.adminLoginErr = false
})

router.post('/login', (req, res) => {
  productHelpers.doLogin(req.body).then((response) => {
    if (response.status) {
      let admin = req.session.admin
      req.session.admin = response.admin
      req.session.admin.loggedIn = true
      productHelpers.getAllProducts().then((products) => {
        res.render('admin/view-products', {products,admin:true})
      })
    } else {
      req.session.adminLoginErr = "Invalid Username or Password"
      res.render('admin/login', { "loginErr": req.session.adminLoginErr })      
    }
  })
})

router.get('/signup', (req, res) => {
  res.render('admin/signup')
})

router.post('/signup', (req, res) => {
  productHelpers.doSignup(req.body).then((response) => {
    console.log(response);
    res.redirect('/admin/login')
  })
});

router.get('/logout', (req, res) => {
  req.session.admin = null
  // req.session.userLoggedIn = false
  res.redirect('/admin/login')
})

router.get('/add-product',(req, res) =>{
  let admin = req.session.admin
  res.render('admin/add-product',{admin})
})

router.post('/add-product', (req, res) => {
  let admin = req.session.admin
  productHelpers.addProduct(req.body, (id) => {
    let image = req.files.Image
    console.log(id);
    image.mv('./public/product-images/' + id + '.jpg', (err) => {
      if (!err) {
        res.render("admin/add-product",{admin})
      } else {
        console.log(err);
      }
    })
  })
})

router.get('/edit-product/:id', async (req, res) => {
  let admin = req.session.admin
  let product = await productHelpers.getProductDetails(req.params.id)
  console.log(product);
  res.render('admin/edit-product', { product,admin })
})

router.post('/edit-product/:id', (req, res) => {
  console.log(req.params.id);
  let id = req.params.id
  let admin = req.session.admin
  productHelpers.updateProduct(req.params.id, req.body).then(() => {
    res.redirect('/admin')
    if (req.files.Image) {
      let image = req.files.Image
      image.mv('./public/product-images/' + id + '.jpg')
    }
  })
})

router.get('/delete-product/:id',(req, res) => {
  let proId = req.params.id
  console.log(proId);
  productHelpers.deleteProduct(proId).then((response) => {
    res.redirect('/admin')
  })
})

module.exports = router;