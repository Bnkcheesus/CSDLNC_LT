import bycrypt from 'bcryptjs';

export const hashPassword = async (password) => {
    const salt = await bycrypt.genSalt(10);
    return await bycrypt.hash(password, salt);
}

export const comparePassword = async (password, hashedPassword) => {
    return await bycrypt.compare(password, hashedPassword);
}