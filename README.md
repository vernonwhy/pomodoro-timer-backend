# Promodoro Timer Backend

Build with [Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

Backend session handler to serve a Pomodoro Timer frontend application.

<span style="color:red" >**⚠️ This project is not production ready ⚠️**</span>

  <details>
    <summary style="cursor: pointer">Requirements</summary>

- Migration files support to control database schema versioning
- Authentication and authorization support
- Application logging support

  </details>

## Installation

```bash
$ npm install
```

## Running the app

### Prerequisites

- Docker
- Rename `.env.sample` to `.env`

### Running the app

```bash
$ docker-compose up

# watch mode
$ npm run start:dev

```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ docker compose up
$ npm run test:e2e
```

## License

Nest is [MIT licensed](LICENSE).
