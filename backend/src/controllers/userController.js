import { getUserNameByID } from "../models/UserModel.js";

export const getUserName = async (req, res) => {
    try {
        const maTK = req.user.maTK;
        if (!maTK) {
            return res.status(400).json({ message: 'MaTK is required' });
        }

        const userName = await getUserNameByID(maTK);
        if (!userName) {
            return res.status(404).json({ message: 'User not found' });
        }
        return res.status(200).json({
            success: true,
            hoTen: userName
        });
    } catch (err) {
        console.error('Error in getUserName controller:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};