var express = require('express');
var router = express.Router();
import models from '../models/models';
var User = models.User;
var Post = models.Post;
var Product = models.Product;
var Look = models.Look;
var Rating = models.Rating;
var Wardrobe = models.Wardrobe;
var fs = require('fs');
import path from "path";
var multer  = require('multer')
const storage = multer.diskStorage({
 destination: path.resolve(__dirname,'../public/images/'),
 filename:function(req,file,cb){
   var coolbeans = file.fieldname + '-'+Date.now()+path.extname(file.originalname);
   cb(null,coolbeans)
 }
})
const upload = multer({
 storage:storage
})
//data
// GET profile //
router.post('/wardrobe/:id',function(req,res){
  Look.find({_id:req.params.id},function(err,looks){
    if(err){
      console.log(err);
    }else{
      var look = looks[0];
      Wardrobe.findOne({_id:req.user.wardrobe},function(err,ward){
        if(err){
          console.log(err)
        }else{
          var a = ward.Look.concat(look)
          Wardrobe.update({_id:req.user.wardrobe},{Look:a},function(err,updated){
            if(err){
              console.log(err);
            }else{

              console.log(updated)
              res.redirect('/feed')
            }
          })
        }
      })

    }
  })
})
router.get('/profile', function(req, res) {
  console.log(req.user.username);
  res.render('profile', {user: req.user});
});

// GET feed //
router.get('/feed', function(req, res) {
  Post.find()
    .populate('ratings fromUser')
    .populate({
      path:'Look',
      populate:[{path:'headwear'},{path:'top'},{path:'pants'},{path:'footwear'},{path:'coat'}]
    })
    .exec(function(error, posts) {
      if (error) {
        console.log('error finding posts');
      } else {
        console.log('successfully found posts');
        res.render('feed', {posts: posts.reverse(),
        user:req.user})
      }
    })
})

// GET single feed //
router.get('/feed/:id', function(req, res) {
  Post.findById(req.params.id)
    .populate('fromUser')
    .populate({
      path: 'Look',
      populate: [{path:'headwear'},{path:'top'},{path:'pants'},{path:'footwear'},{path:'coat'}]
    })
    .exec(function(error, post) {
      if (error) {
        console.log('error finding single post');
      } else {
        console.log('successfully found single post');
        res.render('feed', {posts: [post],
        user:req.user})
      }
    })
})

// POST profile pic //
router.post('/profilepic',upload.single('avatar'), function(req, res) {
 console.log(req.file)
 User.update({_id:req.user._id},{profilePic:req.file.filename},function(err,user){
   if(err){
     console.log(err)
   }else{

     res.redirect('/editprofile')
   }
 })
})

// GET new post //
router.get('/newpost', function(req, res) {
  res.render('newpost',{user:req.user});
})

// POST new post //
router.post('/newpost', function(req, res) {
  // var counter = 0;
  // if(req.body.headwearAmazon.trim().length !=0 && req.body.headwearDes.trim().length !=0 && req.body.headwearPrice.trim().length !=0 && req.body.headwearImage.trim().length !=0){
  //   counter++;
  // }
  // if(req.body.topAmazon.trim().length !=0 && req.body.topDes.trim().length !=0 && req.body.topPrice.trim().length !=0 && req.body.topImage.trim().length !=0){
  //   counter++;
  // }
  // if(req.body.pantsAmazon.trim().length !=0 && req.body.pantsDes.trim().length !=0 && req.body.pantsPrice.trim().length !=0 && req.body.pantsImage.trim().length !=0 ){
  //   counter++;
  // }
  // if(req.body.footwearAmazon.trim().length !=0 && req.body.footwearDes.trim().length !=0 && req.body.footwearPrice.trim().length !=0 && req.body.footwearImage.trim().length !=0 ){
  //   counter++;
  // }
  // if(counter<3){
  //   res.render('newpost',{error:"Must Fill in At Least 3 Pieces of Clothing"})
  // }else{

  var newHeadwear = new Product({
    Amazonlink: req.body.headwearAmazon,
    description: req.body.headwearDes,
    type: "headwear",
    price: req.body.headwearPrice,
    image: req.body.headImage
  })
  var newTop = new Product({
    Amazonlink: req.body.topAmazon,
    description: req.body.topDes,
    type: "top",
    price: req.body.topPrice,
    image: req.body.topImage
  })
  var newPants = new Product({
    Amazonlink: req.body.pantsAmazon,
    description: req.body.pantsDes,
    type: "pants",
    price: req.body.pantsPrice,
    image: req.body.pantImage
  })
  var newFootwear = new Product({
    Amazonlink: req.body.footwearAmazon,
    description: req.body.footwearDes,
    type: "footwear",
    price: req.body.footwearPrice,
    image: req.body.footwearImage
  })
  console.log(newHeadwear)

  newHeadwear.save(function(err,header) {
    if (err) {
      console.log('error adding new headwear');
    } else {
      console.log('successfully saved new headwear');
      newTop.save(function(err,topper) {
        if (err) {
          console.log('error adding new top');
        } else {
          console.log('successfully saved new top');
          newPants.save(function(err,panter) {
            if (err) {
              console.log('error adding new pants');
            } else {
              console.log('successfully saved new pants');
              newFootwear.save(function(err,footer) {
                if (err) {
                  console.log('error adding new footwear');
                } else {
                  console.log('successfully saved new footwear');
                  var newLook = new Look({
                    headwear: header._id,
                    top: topper._id,
                    pants: panter._id,
                    footwear: footer._id
                  })
                  newLook.save(function(err, looker) {
                    if (err) {
                      console.log('error saving new look');
                    } else {
                      console.log('successfully saved new look');
                      var newRat = new Rating({
                        smileys:0,
                        meh:0,
                        frowns:0
                      })
                      newRat.save(function(err,rating){
                        if(err){
                          console.log(err)
                        }else{
                          var newPost = new Post({
                            image: req.body.image,
                            likes: 0,
                            Look: looker.id,
                            fromUser: req.user._id,
                            ratings:rating._id
                          })
                          newPost.save(function(err) {
                            if (err) {
                              console.log('error adding new post');
                            } else {
                              console.log('successfully saved new post');
                              res.redirect('/');
                            }
                          })
                        }
                      })

                    }
                  })
                }
              })
            }
          })
        }
      })
    }
  })
  // }
})

// GET edit profile //
router.get('/editprofile', function(req, res) {
  res.render('editprofile',{user:req.user,editprofile:req.user});
})

// POST edit profile //
router.post('/editprofile', function(req, res) {
  req.check('firstname', 'First Name is required').notEmpty();
  req.check('lastname', 'Last Name is required').trim().notEmpty();

  console.log("before validation edit");
  var errors = req.validationErrors();
  var returnObj = {
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    bio:req.body.bio
  }
  if(errors) {
    //TO-DO Redo this so that if the user is wrong it will put him back
    console.log(errors);
    res.render("editprofile", {
      errors: errors,
      editprofile:returnObj,
      user:req.user
    });
  } else {
    User.update({_id:req.user._id},{bio:req.body.bio,lastname: req.body.lastname,firstname: req.body.firstname},function(err){
      if(err){
        console.log('line 241')
      }else{
        res.redirect('/profile');
      }
    })
  }
})

// POST Emoji 1//
router.post('/emoji/:postId/1', function(req, res) {
  Post.findById(req.params.postId, function(err, thePost) {
    if (err) {
      console.log('error finding post', err);
    } else {
        console.log(thePost);
        Rating.findById(thePost.ratings._id, function(err, theRating) {
          if (err) {
            console.log('error finding post', err);
            console.log('The rating is', theRating);
          } else {
            console.log('The rating is', theRating);
            console.log('smiley is', theRating.smileys);
            var smileys = theRating.smileys;
            var newSmiley = smileys + 1;
            console.log('the new smiley value is', newSmiley);
            Rating.update({_id: theRating._id},{smileys:newSmiley},function(err,smiley){
              if(err){
                console.log('the error is', err)
              } else{
                console.log('inside else for rating.update');
                Post.find()
                .populate('ratings fromUser')
                .exec(
                function(err, posts) {
                  if (err) {
                    console.log('errors for post find are', err);
                  } else {
                    console.log('inside final post.find');
                    console.log('posts are', posts);
                    //console.log('ratings for the 4th post should be', posts[3].ratings);
                    //console.log('smileys for the 4th post should be', posts[3].ratings.smileys);
                    res.render("feed" , {posts: posts,
                      user:req.user});
                    // res.json({updated: true})
                  }
                })
              }
          })
          }
        });
    }
  })
  })

  // POST Emoji 2//
  router.post('/emoji/:postId/2', function(req, res) {
    Post.findById(req.params.postId, function(err, thePost) {
      if (err) {
        console.log('error finding post', err);
      } else {
          console.log(thePost);
          Rating.findById(thePost.ratings._id, function(err, theRating) {
            if (err) {
              console.log('error finding post', err);
              console.log('The rating is', theRating);
            } else {
              console.log('The rating is', theRating);
              console.log('smiley is', theRating.meh);
              var meh = theRating.meh;
              var newMeh = meh + 1;

              Rating.update({_id: theRating._id},{meh:newMeh},function(err,meh){
                if(err){
                  console.log('the error is', err)
                } else{
                  console.log('inside else for rating.update');
                  Post.find()
                  .populate('ratings fromUser')
                  .exec(
                  function(err, posts) {
                    if (err) {
                      console.log('errors for post find are', err);
                    } else {
                      console.log('inside final post.find');
                      console.log('posts are', posts);
                      //console.log('ratings for the 4th post should be', posts[3].ratings);
                      //console.log('smileys for the 4th post should be', posts[3].ratings.meh);
                      res.render("feed" , {posts: posts,
                        user:req.user});
                      // res.json({updated: true})
                    }
                  })
                }
            })
            }
          });
      }
    })
    })

// POST Emoji 3//
router.post('/emoji/:postId/3', function(req, res) {
  Post.findById(req.params.postId, function(err, thePost) {
    if (err) {
      console.log('error finding post', err);
    } else {
        console.log(thePost);
        Rating.findById(thePost.ratings._id, function(err, theRating) {
          if (err) {
            console.log('error finding post', err);
            console.log('The rating is', theRating);
          } else {
            console.log('The rating is', theRating);
            console.log('frown is', theRating.frowns);
            var frowns = theRating.frowns;
            var newFrowns = frowns + 1;
            console.log('the new frowns value is', newFrowns);
            Rating.update({_id: theRating._id},{frowns:newFrowns},function(err, frown){
              if(err){
                console.log('the error is', err)
              } else{
                console.log('inside else for rating.update');
                Post.find()
                .populate('ratings fromUser')
                .exec(
                function(err, posts) {
                  if (err) {
                    console.log('errors for post find are', err);
                  } else {
                    console.log('inside final post.find');
                    console.log('posts are', posts);
                    //console.log('ratings for the 4th post should be', posts[3].ratings);
                    //console.log('smileys for the 4th post should be', posts[3].ratings.frowns);
                    res.render("feed" , {posts: posts,
                      user:req.user});
                    // res.json({updated: true})
                  }
                })
              }
          })
          }
        });
    }
  })
  })

  // GET about us //
  router.get('/aboutus', function(req, res) {
    console.log(req.user);
    res.render('aboutus', {user: req.user});
  })

  // GET error page //
  router.get('/error', function(req, res) {
    res.render('autisticScreeching');
  })




module.exports = router;
