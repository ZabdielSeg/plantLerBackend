const router = require('express').Router();
const mongoose = require('mongoose');
const User = require('../models/User.schema');
const Plant = require('../models/Plant.schema');

const isLoggedIn = require('../middlewares/isLoggedIn');
const isSeller = require('../middlewares/isSeller');

router.get('/plant/:id', (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ message: 'Specified id is not valid' });
    return;
  }

  Plant.findById(id)
    .populate('owner')
    .then(plantFound => res.status(200).json(plantFound))
    .catch(err => {
      console.log(err);
      res.status(500).json({ message: 'An error occurred while getting the plant information' });
    });
});

router.post('/create-plant', isSeller, (req, res, next) => {
  const { plantName, description, price, light, location, imageUrl } = req.body;

  if (!plantName || description.length < 30 || !price || !light || !location) {
    res.status(400).json({ message: 'Please fill al the blanks correctly' });
    return;
  }

  Plant.create({ plantName, description, price, light, location, owner: req.user._id, imageUrl })
    .then(response => {
      return User.findByIdAndUpdate(req.user._id, { $push: { plants: response._id } });
    })
    .then(() => res.json({ message: `The plant was created succesfully` }))
    .catch(err => {
      console.log(err);
      res.status(500).json({ message: 'An error occured while creating the plant' });
    });
});

router.put('/edit-plant/:id', isSeller, (req, res, next) => {
  const { plantName, description, price, light, location, imageUrl } = req.body;
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ message: 'Specified id is not valid' });
    return;
  }

  Plant.findByIdAndUpdate(id, { plantName, description, price, light, location, imageUrl }, { new: true })
    .then(newPlant => res.status(201).json({ plant: newPlant, message: 'Plant updated correctly' }))
    .catch(err => {
      console.log(err);
      res.status(500).json({ message: 'An error occurred while saving the updates' });
    });
});

router.delete('/delete-plant/:id', isSeller, (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ message: 'Specified id is not valid' });
    return;
  }

  Plant.findByIdAndRemove(id)
    .then(() => res.status(200).json({ message: `Plant was deleted succesfully` }))
    .catch(err => {
      console.log(err);
      res.status(500).json({ message: 'An error occurred whil trying to delete the plant' });
    });
});

router.get('/all-plants', (req, res, next) => {
  Plant.find()
    .populate('owner')
    .then(allPlants => res.status(200).json(allPlants))
    .catch(err => {
      console.log(err);
      res.status(500).json({ message: 'An error occurred while getting the plants' });
    });
});

router.get('/search', (req, res, next) => {
  const { wordToSearch } = req.query;
  Plant.find()
    .then(response => response.filter(plant => plant.plantName.toLowerCase().includes(wordToSearch.toLowerCase())))
    .then(response => {
      console.log(response)
      if (response.length >= 1) {
        Plant.find({ location: response[0].location })
          .then(suggestions => {
            let allSuggestions = suggestions;
            if(suggestions.length >= 3) {allSuggestions = suggestions.slice(0, 2);}
            res.status(200).json({ plant: response, suggestions: allSuggestions});
          })
          .catch(err => console.log(err));
      } else {
        res.status(500).json({message: 'Probablemente no tenemos ese producto'});
      }
    })
    .catch(err => {
      console.log(err)
      res.status(500).json({ message: 'Sorry, something went wrong' });
    });
});

module.exports = router;