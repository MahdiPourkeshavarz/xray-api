# PANTOhealth X-ray IoT Data Management API

This project is a NestJS application designed to process, store, and analyze X-ray data received from IoT devices. It acts as the central consumer and API layer in an IoT data pipeline, using RabbitMQ for message queuing and MongoDB for data persistence.

This repository contains the **consumer and API** part of the system. The producer application, which simulates an IoT device sending data, can be found in a separate repository.

---

## Features

- **Asynchronous Data Ingestion**: Uses a RabbitMQ consumer to reliably process incoming data without blocking.
- **Rich Data Processing**: Not only stores basic metadata but also calculates and stores relevant analytical parameters like `averageSpeed`, `maxSpeed`, and `durationMs` for each signal.
- **RESTful API**: Provides a comprehensive set of CRUD endpoints to manage and retrieve signal data.
- **Advanced Filtering**: Allows for powerful data retrieval with filtering by device ID and date ranges, as well as ranges for the calculated metrics.
- **Fully Dockerized**: The entire application stack, including the producer, consumer, database, and message queue, can be run with a single command using Docker Compose.
- **Interactive API Documentation**: Comes with a pre-configured Swagger UI for easy API exploration and testing.

---

## System Architecture

The complete system consists of multiple services that communicate via a containerized network:

1.  **Producer Application (IoT Device Simulator)**
    - A simple NestJS application that sends sample X-ray data to a RabbitMQ queue.
    - **Repository**: [https://github.com/MahdiPourkeshavarz/xray-producer.git](https://github.com/MahdiPourkeshavarz/xray-producer.git)

2.  **Consumer & API Application (This Project)**
    - Listens to the RabbitMQ queue for incoming messages.
    - Parses the raw data, performs calculations, and stores the structured result in a MongoDB database.
    - Exposes a RESTful API for clients to interact with the stored data.
    - **Repository**: [https://github.com/MahdiPourkeshavarz/xray-api.git](https://github.com/MahdiPourkeshavarz/xray-api.git)

3.  **MongoDB Service**: The database where all processed signal data is stored.
4.  **RabbitMQ Service**: The message broker that decouples the producer and consumer.

**Flow:** `xray-producer container` → `rabbitmq container` → `xray-api container` → `mongo container`

---

## Prerequisites

- [Docker](https://www.docker.com/products/docker-desktop/)
- [Docker Compose](https://docs.docker.com/compose/install/) (usually included with Docker Desktop)

---

## Getting Started (Docker Compose)

This is the **recommended** way to run the entire system. It will build and run all required services, including the database and message queue.

1.  **Clone both repositories** into the same parent directory:

    ```bash
    git clone [https://github.com/MahdiPourkeshavarz/xray-api.git](https://github.com/MahdiPourkeshavarz/xray-api.git)
    git clone [https://github.com/MahdiPourkeshavarz/xray-producer.git](https://github.com/MahdiPourkeshavarz/xray-producer.git)
    ```

2.  **Create the Docker Compose file:**
    In the **parent directory** (the one containing both project folders), create a `docker-compose.yml` file and add the content provided in the project documentation.

3.  **Set up environment variables:**
    In the root of the `xray-api` project, create a `.env` file with the following content. **Note:** The hostnames (`mongo`, `rabbitmq`) refer to the service names in the `docker-compose.yml` file.

    ```env
    # xray-api/.env
    MONGO_URI=mongodb://root:example@mongo:27017/
    RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672
    RABBITMQ_XRAY_QUEUE=x-ray_queue
    ```

    In the root of the `xray-producer` project, create a `.env` file:

    ```env
    # xray-producer/.env
    RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672
    RABBITMQ_XRAY_QUEUE=x-ray_queue
    ```

4.  **Build and run the services:**
    From the parent directory containing the `docker-compose.yml` file, run:
    ```bash
    docker-compose up --build
    ```
    This command will build the images for both applications and start all four containers.

---

## Running with Docker (Single Service)

Use this method if you want to build and run only the `xray-api` service as a standalone container. **Note:** This requires you to have MongoDB and RabbitMQ running and accessible from your Docker container (e.g., on `localhost`).

1.  **Build the Docker Image:**
    From the root of this project, run:

    ```bash
    docker build -t xray-api .
    ```

2.  **Run the Docker Container:**
    Make sure your `.env` file is configured to point to your running database and message queue. Then run:
    ```bash
    docker run -p 3001:3000 --env-file ./.env --name xray-api-container xray-api
    ```

    - `-p 3001:3000`: Maps port 3001 on your machine to port 3000 inside the container.
    - `--env-file ./.env`: Passes your local environment variables into the container.

---

## Manual Setup (Without Docker)

This method is for development and testing individual components without running the full stack.

1.  **Prerequisites**: Node.js, npm, a running MongoDB instance, a running RabbitMQ instance.
2.  **Clone and set up** each repository individually as described in the initial setup instructions.
3.  **Update your `.env` files** to point to your local services (e.g., `localhost` instead of the Docker service names).
4.  **Run each application** in a separate terminal using `npm run start:dev`.
