module.exports = ({ env }) => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET', 'b9f73eaa6f03491a0caa991540423f2b'),
  },
});
