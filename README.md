# Discord Music Bot

A Discord bot for playing music in voice channels, built with TypeScript and Discord.js.

## Features

- Play music from YouTube
- Queue management
- Basic playback controls (pause, resume, skip)
- Now playing information

## Prerequisites

- Node.js 18+ and Yarn
- Discord Bot Token
- Discord Server (Guild)

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
APP_TOKEN=your_discord_bot_token
CLIENT_ID=your_discord_application_client_id
GUILD_ID=your_discord_server_id
```

## Local Development

1. Install dependencies:
   ```
   yarn install
   ```

2. Start the development server:
   ```
   yarn dev
   ```

## Docker

### Building the Docker Image

```bash
docker build -t discord-bot .
```

### Running the Docker Container

```bash
docker run -d --name discord-bot \
  -e APP_TOKEN=your_discord_bot_token \
  -e CLIENT_ID=your_discord_application_client_id \
  -e GUILD_ID=your_discord_server_id \
  discord-bot
```

### Environment Variables in Docker

You can pass environment variables to the Docker container using the `-e` flag as shown above, or by creating a `.env` file and mounting it:

```bash
docker run -d --name discord-bot \
  --env-file .env \
  discord-bot
```

## CI/CD Pipeline

This project includes a `cloudbuild.yaml` file for setting up a CI/CD pipeline with Google Cloud Build.

### Setup

1. Enable the Cloud Build API in your Google Cloud project
2. Connect your repository to Cloud Build
3. Configure the build trigger to use the `cloudbuild.yaml` file
4. Set up secrets in Google Cloud Secret Manager for:
   - `APP_TOKEN`: Your Discord bot token
   - `CLIENT_ID`: Your Discord application client ID
   - `GUILD_ID`: Your Discord server ID

### Pipeline Steps

1. Build the Docker image with environment variables from Secret Manager
2. Push the image to Google Container Registry with the tag name as version
3. Tag the image as latest
4. Push the latest tag

### Versioning

The CI/CD pipeline uses the Git tag name (`$TAG_NAME`) as the version for the Docker image. When you create a new release with a tag (e.g., `v1.0.0`), the pipeline will build and push an image with that tag.

### Deployment

The `cloudbuild.yaml` file includes commented-out sections for deploying to Cloud Run. Uncomment and modify these sections as needed for your deployment environment.

## License

[ISC License](LICENSE)
