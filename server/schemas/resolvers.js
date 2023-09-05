const { AuthenticationError } = require('apollo-server-express');
const { User } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
  Query: {
    // fetches the logged in user from the context
    me: async (parent, args, context) => {
      if (context.user) {
        return User.findOne({ _id: context.user._id });
      }
      throw new AuthenticationError('You must be logged in to perform this action.');
    },
  },

  Mutation: {
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });
      if (!user) {
        throw new AuthenticationError('No user with this email found.');
      }
      const correctPassword = await user.isCorrectPassword(password);
      if (!correctPassword) {
        throw new AuthenticationError('Incorrect password. Please try again.');
      }
      const token = signToken(user);
      return { token, user };
    },

    addUser: async (parent, { username, email, password }) => {
      const user = await User.create({ username, email, password });
      const token = signToken(user);
      return { token, user};
    },

    // Save the book to the logged in user's savedBooks field
    saveBook: async (parent, book, context) => {
      // if user is logged in
      if (context.user) {
        return User.findOneAndUpdate(
          { _id: context.user._id},
          {
            $addToSet: { savedBooks: book}, // add the book to the set of existing books
          },
          {
            new: true,
            runValidators: true 
          }
        );
      } else {
        throw new AuthenticationError('You must be logged in to perform this action.');
      }
    },
    
    // Delete the book from the logged in user's savedBooks field
    removeBook: async (parent, { bookId }, context) => {
      if (context.user) {
        return User.findOneAndUpdate(
          { _id: context.user._id },
          { $pull: { savedBooks: { bookId: bookId } } },
          { new: true }
        );
      } else {
        throw new AuthenticationError('You must be logged in to perform this action.');
      }
    },
  },
};

module.exports = resolvers;