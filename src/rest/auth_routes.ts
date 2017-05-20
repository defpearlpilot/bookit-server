import {Express, Request, Response, Router} from 'express';

import {RootLog as logger} from '../utils/RootLogger';
import {sendError, sendUnauthorized} from './rest_support';
import {Credentials} from '../model/Credentials';
import {TokenOperations} from '../service/TokenOperations';
import {protectEndpoint} from './filters';
import {PasswordStore} from '../service/PasswordStore';



interface TokenInfo {
  user: string;
  password: string;
  iat: number;
  exp: number;
}


export function configureAuthenticationRoutes(app: Express,
                                              passwordStore: PasswordStore,
                                              tokenOperations: TokenOperations) {

  app.post('/authenticate', (req: Request, res: Response) => {
    const credentials = req.body as Credentials;

    const username = credentials.user;
    if (!passwordStore.validateUser(username)) {
      sendUnauthorized(res, 'Unrecognized user');
      return;
    }

    if (!passwordStore.validatePassword(username, credentials.password)) {
      sendUnauthorized(res, 'Incorrect user/password combination');
      return;
    }

    const token = tokenOperations.provideToken(credentials);
    res.json({success: true, token: token});
  });


  protectEndpoint(app, '/backdoor');
  app.get('/backdoor', (req: Request, res: Response) => {
    const credentials = req.body.credentials as TokenInfo;
    res.send(`You had a token and you are ${credentials.user}`);
  });

}
