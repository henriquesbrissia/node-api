export const protect = async (req, res) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = await req.jwtVerify(token);

      req.user = decoded;
    } catch (error) {
      return res.status(401).send({ message: 'Not authorized, invalid token' });
    }
  } else {
    return res.status(401).send({ message: 'Not authorized, absent token' });
  }
};
