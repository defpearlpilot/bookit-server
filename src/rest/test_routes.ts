import {Express, Request, Response, Router} from 'express';


export function configureTestRoutes(app: Express) {

  app.get('/', (req: Request, res: Response) => {
    res.send('done');
  });

  app.get('/test', (req: Request, res: Response) => {
    res.send('test succeeded');
  });

}