const jwt = require('jsonwebtoken');

//app.use(express.json());

async function authMiddleware(req, res, next) {
    console.log('auth middleware initiated');
    if (!req.headers['refresh-token']) {
        return res.status(401).send({ status: 'refresh token not present, cannot proceed !' })
    }

    if (!req.headers['authorization']) {
        console.log('auth token not present');
        // res.end();
        return res.status(401).send({ status: 'auth token not present, cannot proceed !' })
    }
    else {
        const auth_token = req.headers['authorization'].split(' ')[1];
        //console.log('auth_token from auth middleware : ' + auth_token);
        try {
            let decoded = await jwt.verify(auth_token, process.env.SHOPKEEPER_KEY);
            let decodedRefreshToken = await jwt.verify(req.headers['refresh-token'].split(' ')[1], process.env.SHOPKEEPER_KEY);
            if (decoded && decodedRefreshToken) {
                /* console.log(decoded);
                console.log('------');
                console.log(decodedRefreshToken); */
                req.auth_token = auth_token;
                next();
            }

        } catch (err) {
            console.log(err);
            if (err.message == 'jwt expired') {
                //console.log('jwt expired, checking refresh token expiry');
                const refreshToken = req.headers['refresh-token'].split(' ')[1];
                //console.log('refresh token : ' + refreshToken);
                try {
                    let decodedRefreshToken = await jwt.verify(refreshToken, process.env.SHOPKEEPER_KEY, { issuer: 'shopkeeper_backend' });
                    if (decodedRefreshToken) {
                        console.log(decodedRefreshToken);
                        try {
                            const token = jwt.sign(
                                { _id: decodedRefreshToken._id, email: decodedRefreshToken.email, name: decodedRefreshToken.name, tokenType: 'token' },
                                process.env.SHOPKEEPER_KEY,
                                { expiresIn: '6h', issuer: 'shopkeeper_backend' }
                            );
                            const refreshToken = jwt.sign(
                                { _id: decodedRefreshToken._id, email: decodedRefreshToken.email, name: decodedRefreshToken.name, tokenType: 'refreshToken' },
                                process.env.SHOPKEEPER_KEY,
                                { expiresIn: '12h', issuer: 'shopkeeper_backend' }
                            );
                            return res.status(200).send({ success: false, status: 'reset tokens', token: token, refreshToken: refreshToken});
                        } catch (err) {
                            return res.status(400).send({ success: false, status: err.message });
                        }
                    }

                } catch (err) {
                    console.log(err);
                    return res.status(400).send({ success: false, status: 'refresh and main ' + err.message });
                }
            }
        }
    }
}

module.exports = authMiddleware;