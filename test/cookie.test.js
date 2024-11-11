const jwt = require('jsonwebtoken');
const { cookieValidator } = require("../middlewares/cookieValidator");

describe('VOU TESTAR O VALIDADOR DE COOKIE', () => {
    let req, res, next;
    process.env.jwt_secret_key = 'alguma_senha_secreta';

    beforeEach(() => {
        req = { cookies: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn()
        };
        next = jest.fn();
    });

    it('O token não existe', () => {
        cookieValidator(req, res, next);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.send).toHaveBeenCalledWith('Unauthorized: No token provided.');
        expect(next).not.toBeCalled();
    });

    it('O token existe, porém é inválido', () => {
        req.cookies.Token = 'algum_token_invalido';
        cookieValidator(req, res, next);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.send).toHaveBeenCalledWith('Unauthorized: Invalid token.');
        expect(next).not.toBeCalled();
    });

    it('O token existe e é válido', () => {
        const token = jwt.sign(
            {
                _id: 1,
                email: 'exemplo@gmail.com',
                name: 'ramon',
                admin: false
            },
            process.env.jwt_secret_key,
            { expiresIn: '3d' }
        );
        req.cookies.Token = token;
        cookieValidator(req, res, next);
        expect(next).toBeCalled();
    });
});