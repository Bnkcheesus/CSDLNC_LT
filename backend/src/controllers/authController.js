import { findAccountByID, findStaffByID, findCustomerByID } from "../models/UserModel.js";
import { comparePassword } from "../utils/password.js";
import { generateToken } from "../utils/token.js";

export const login = async (req, res) => {
    try {
        const { maTK, password } = req.body;

        if (!maTK || !password) {
            return res.status(400).json({ message: 'MaTK and password are required' });
        }

        const account = await findAccountByID(maTK);
        if (!account) {
            return res.status(404).json({ message: 'Account not found' });
        }

        const isPasswordValid = password == account.PassWord;
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid password' });
        }
        
        let role = "";
        let extraData = {};

        if (account.LoaiTK === 'KH') {
            const customer = await findCustomerByID(maTK);
            if (!customer) {
                return res.status(404).json({ message: 'Customer details not found' });
            }
            role = 'customer';
        }
        else if (account.LoaiTK === 'NV') {
            const staff = await findStaffByID(maTK);
            if (!staff) {
                return res.status(404).json({ message: 'Staff details not found' });
            }
            const jobRoleMap = {
                'QLCN': 'admin',
                'NVTT': 'receptionist',
                'NVBH': 'sales',
                'BSTY': 'doctor',
            };
            role = jobRoleMap[staff.ChucVu] || 'staff';
            extraData = { position: staff.ChucVu };
        }

        const token = generateToken({ maTK: account.MaTK, role });

        return res.status(200).json({
            success: true,
            maTK: account.MaTK,
            role,
            token,
            ...extraData
        });
    } catch (err) {
        console.error('Login error:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};