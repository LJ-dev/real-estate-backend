import { ApolloError } from 'apollo-server';
import User from '../../models/User';

// Login Query
export const login = async (_, { userInput }, { ctx }) => {
	try {
		const { username, password } = userInput;

		// Check weather username exist
		const user = await User.findByUsername(username);
		if (!user) {
			return new ApolloError('User not found', 'user_not_found');
		}

		// Check password
		const passwordCheck = await user.passwordCheck(password);
		if (!passwordCheck) {
			return new ApolloError('Password Incorrect', 'invalid_password');
		}

		const token = user.generateToken();
		ctx.cookies.set('access_token', token, {
			httpOnly: true,
			maxAge: 1000 * 60 * 60 * 24 * 7,
		});

		return {
			id: user._id,
			username: user.username,
		};
	} catch (e) {
		console.log(e);
	}
};

// Register Mutation
export const register = async (_, { userInput }, { ctx }) => {
	try {
		const { username, password, passwordCheck } = userInput;

		if (password !== passwordCheck) {
			return new ApolloError(
				'Password and Password Check are not same',
				'check_password_passwordCheck',
			);
		}

		// Conflict Check
		const exist = await User.findByUsername(username);
		if (exist) {
			return new ApolloError('Username already exist', 'conflict_username');
		}

		// Create new User
		const newUser = new User({
			username,
			password,
		});

		await newUser.save();

		// Get Token
		const token = newUser.generateToken();
		ctx.cookies.set('access_token', token, {
			httpOnly: true,
			maxAge: 1000 * 60 * 60 * 24 * 7,
		});

		return { id: newUser._id, username: newUser.username };
	} catch (e) {
		console.log(e);
	}
};
