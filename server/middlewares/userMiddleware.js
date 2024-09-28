import jwt from 'jsonwebtoken';

export const protect = (req, res, next) => {
  let token;

  // Verificar se tem o token no header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Pegar o token
      token = req.headers.authorization.split(' ')[1];

      // Verificar
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Adicionar as informações do usuário
      req.user = decoded;

      next();
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, invalid token' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, absent token' });
  }
};
