import { ApolloServer } from 'apollo-server-express';
import connectRedis from 'connect-redis';
import express from 'express';
import session from 'express-session';
import { createConnection } from 'typeorm';
import { createSchema } from './utils/createSchema';
import { redis } from './utils/redis';

const main = async () => {
  await createConnection();

  const schema = await createSchema();

  const apolloServer = new ApolloServer({
    schema,
    context: ({ req, res }) => ({ req, res, redis }),
  });

  const app = express();

  const RedisStore = connectRedis(session);

  // app.use(
  //   cors({
  //     credentials: true,
  //     origin: 'http://localhost:3000',
  //   })
  // );

  // User.delete({})

  app.use(
    session({
      name: 'cookie',
      store: new RedisStore({
        client: redis,
      }),
      cookie: {
        httpOnly: true,
        sameSite: 'strict',
        maxAge: 1000 * 60 * 60 * 24 * 7, //7 days
        secure: false,
      },
      saveUninitialized: false,
      secret: 'This is a secret',
      resave: false,
    })
  );

  apolloServer.applyMiddleware({ app, cors: false });

  app.listen(4000, () => {
    console.log(`Server started at http://localhost:4000/graphql`);
  });
};

main().catch((err) => {
  console.log(err);
});
