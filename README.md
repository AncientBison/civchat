# Civ Chat 🤝
### Reuniting America

CivChat is a chatroom made to help unite Americans. Our goal is to create a place for healthy conversations between people with differing views to allow mutual understanding and inspire cooperation among the polarized population.

## Technologies Used

- [React](https://react.dev)
- [Next.js 14](https://nextjs.org/docs/getting-started)
- [NextUI v2](https://nextui.org/)
- [Socket.IO](https://socket.io/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Tailwind Variants](https://tailwind-variants.org)
- [TypeScript](https://www.typescriptlang.org/)
- [Framer Motion](https://www.framer.com/motion/)
- [next-themes](https://github.com/pacocoursey/next-themes)
- [redis](https://redis.com)
- [pino](https://getpino.io)
- [ESLint](https://eslint.org)
- [Prettier](https://prettier.io/)

## How to Use

### Installing packages

Run the command `npm install` or `yarn install` to install the packages. We advise the usage of yarn which can be installed with the command `npm install --global yarn` if not already installed.

### Running the code

To run CivChat, do the following:
1. Install packages (see [Installing packages](#installing-packages))
2. Create a .env file at the root of the project containing the following:
    ```dosini
    PINO_LOG_LEVEL="info"
    REDIS_URL="<insert URL to your Redis database>" # for example, use "redis://localhost:6379" if your databse is being hosted locally 
    ```
    *The PINO_LOG_LEVEL can also be "trace", "debug", "warn","error" with "trace" being most important and "error" being least important. If using a locally hosted redis database, use REDIS_URL="redis://localhost:6379"*

3. Run either `npm run dev` or `yarn dev` in order to run the code.

You can now access CivChat at http://localhost:3000/.

## License

CivChat is a chatroom created to bring together poeple of opposing viewpoints.
Copyright (C) 2024 Ilan Bernstein and Liam Bridgers

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published
by the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see https://www.gnu.org/licenses/.
