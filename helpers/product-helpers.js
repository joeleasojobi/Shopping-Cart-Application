var db=require('../config/connection')
var collection=require('../config/collection')
const { response } = require('../app')
const bcrypt = require('bcrypt')
var objectId=require('mongodb').ObjectId
const { ServerDescription } = require('mongodb')

module.exports={
    //Function for admin signup
    doSignup: (adminData) => {
        return new Promise(async (resolve, reject) => {
            adminData.adminPassword = await bcrypt.hash(adminData.adminPassword, 10)
            db.get().collection(collection.ADMIN_COLLECTION).insertOne(adminData).then((data) => {
                resolve(data.insertedId)
            })
        })
    },
    //Function for admin login
    doLogin: (adminData) => {
        return new Promise(async (resolve, reject) => {
            let loginStatus = false
            let response = {}
            let admin = await db.get().collection(collection.ADMIN_COLLECTION).findOne({ adminEmail: adminData.adminEmail })
            if (admin) {
                bcrypt.compare(adminData.adminPassword, admin.adminPassword).then((status) => {
                    if (status) {
                        console.log("Login Success");
                        response.admin = admin
                        response.status = true
                        resolve(response)
                    } else {
                        console.log("Login Failed");
                        resolve({ status: false })
                    }
                })
            } else {
                console.log("Login Failed");
                resolve({ status: false })
            }
        })
    },
    //Function to add a product
    addProduct:(product,callback) => {
        db.get().collection('product').insertOne(product).then((data) => {
            callback(data.insertedId)
        })
    },
    //Function to view all products
    getAllProducts:() => {
        return new Promise(async(resolve,reject) => {
            let products=await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
            resolve(products)
        })
    },
    //Function to delete a product
    deleteProduct:(prodId) => {
        return new Promise((resolve,reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).deleteOne({_id:objectId(prodId)}).then((response) => {
                resolve(response)
            })
        })
    },
    //Function to update a product
    updateProduct:(prodId,prodDetails) => {
        return new Promise((resolve,reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:objectId(prodId)},{
               $set:{
                Name:prodDetails.Name,
                Description:prodDetails.Description,
                Price:prodDetails.Price,
                Category:prodDetails.Category
               } 
             }).then((response)=>{
                 resolve()
             })
        })
    },
    //Function to fetch details to edit a product
    getProductDetails:(prodId) => {
        return new Promise((resolve,reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:objectId(prodId)}).then((product) => {
                resolve(product)
            })
        })
    },
}