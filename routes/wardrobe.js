var express = require('express');
var router = express.Router();
import models from '../models/models';
var User = models.User;
var Post = models.Post;
var Product = models.Product;
var Look = models.Look;
var Wardrobe=models.Wardrobe
var fs = require('fs');
import path from "path";

// GET wardrobe //
router.get('/wardrobe', function(req, res) {
  var owner = req.user._id;
  User.findById(owner)
  .populate({
    path: 'wardrobe',
    populate: [{path:'Look',populate: [{path:'headwear'},{path:'top'},{path:'pants'},{path:'footwear'}]}]
  })
  .populate({
    path: 'looks',
    populate: [{path:'headwear'},{path:'top'},{path:'pants'},{path:'footwear'}]
  })
  .exec(function(error, user) {
    if(error){
      console.log(error)
    }else{
        console.log(user.wardrobe)
        res.render('wardrobe', {wardrobe: user.wardrobe[0], user:user})
    }
  })
})
router.delete('/wardrobe/:id',function(req,res){
  Wardrobe.deleteOne({_id:req.params.id},function(err,cool){
    if(err){
      console.log(err)
    }else{
      res.redirct('/wardrobe')
    }
  })
})


module.exports = router;
