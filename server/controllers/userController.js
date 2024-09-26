const User = require('../models/userModel.js');
const jwt = require('jsonwebtoken');
const cookie = require('cookie');

// Get all users
module.exports.getAllUsers = async function getAllUsers(req, res) {
  try {
    const users = await User.find({});
    return res.status(200).json({ count: users.length, data: users });
  } catch (error) {
    console.error(error.message);
    res.status(500).send({ message: error.message });
  }
}

// Get a specific user by ID
module.exports.getUserById = async function getUserById(req, res) {
  try {
    const user = await User.findById(req.params.id);

    if (!user) return res.status(404).send({ message: 'user not found' });
    return res.status(200).send(user);

  } catch (error) {
    console.error(error.message);

    res.status(500).send({ message: error.message });
  }
}

// Check if assocoation exist in the user's favorite list
module.exports.existUserFavorite = async function existUserFavorite(req, res) {
  const { userId } = req.params;
  const { associationNumber } = req.body;
 

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }

    if (!associationNumber) {
      return res.send({ message: 'Send all required fields' });
    }

    const associationExists = user.Association.some(
      (assoc) => assoc.associationNumber === associationNumber
    );

    return res.status(200).json({ exists: associationExists });

  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: 'Internal server error', error });
  }
};

// Update and add assocoation to the user's favorites assocoation list
module.exports.addUserFavorite = async function addUserFavorite(req, res) {
  const { userId } = req.params;
  const { associationName, associationNumber } = req.body

  try {
    const user = await User.findById(userId);

    if (!associationName || !associationNumber) {
      return res.json({ message: 'Send all required fields' });
    }

    user.Association.push({ associationName, associationNumber });
    const result = await User.findByIdAndUpdate(userId, user);

    if (!result) {
      return res.status(404).send({ message: 'User not found' });
    }

    return res.status(200).json({ message: 'User updated successfully', user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error', error });
  }
}

// Update and remove assocoation from the user's favorite assocoation list
module.exports.removeUserFavorite = async function removeUserFavorite(req, res) {
  const { userId } = req.params;
  const { associationNumber } = req.body;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Validate existence of assos in request body
    if (!associationNumber) {
      return res.json({ message: 'Send all required fields' });
    }

    // Update Association array using filter
    user.Association = user.Association.filter(
      (existingAssoc) => existingAssoc.associationNumber !== associationNumber);

    await user.save();  // Save changes to database

    return res.status(200).json({ message: 'User association removed from favorites' });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: 'Internal server error', error });
  }
}

// get the favorite associations of the user
module.exports.getFavoriteAssociations = async function getFavoriteAssociations(req, res) {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId)
    
    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }

    const favoriteAssociations = user.Association.map(assoc => ({
      name: assoc.associationName,
      number: assoc.associationNumber
    }));

    return res.status(200).json({ favoriteAssociations })

  } catch (error) {
    return res.status(500).json({ message: "Error fetching favorite associations", error });
  }
}

// Remove user from DB
module.exports.deleteUserById = async function deleteUserById(req, res) {
  const userId = req.params.id;
  try {
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.status(200).json({ message: 'User deleted successfully', user });
  } catch (error) {
    return res.status(500).json({ message: 'Error deleting user', error });
  }
};

// Remove all users from DB
module.exports.deleteAllUsers = async function deleteAllUsers(req, res) {
  try {
    const result = await User.deleteMany({});
    return res.status(200).json({ message: 'All users have been deleted', result });
  } catch (error) {
    return res.status(500).json({ message: 'Error deleting users', error });
  }
};