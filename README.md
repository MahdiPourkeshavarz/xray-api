# PANTOhealth X-ray IoT Data Management API

This project is a NestJS application designed to process, store, and analyze X-ray data received from IoT devices. It acts as the central consumer and API layer in an IoT data pipeline, using RabbitMQ for message queuing and MongoDB for data persistence.

This repository contains the **consumer and API** part of the system. The producer application, which simulates an IoT device sending data, can be found in a separate repository.

---

## Features

- **Asynchronous Data Ingestion**: Uses a RabbitMQ consumer to reliably process incoming data without blocking.
- **Rich Data Processing**: Not only stores basic metadata but also calculates and stores relevant analytical parameters like `averageSpeed`, `maxSpeed`, and `durationMs` for each signal.
- **RESTful API**: Provides a comprehensive set of CRUD endpoints to manage and retrieve signal data.
- **Advanced Filtering**: Allows for powerful data retrieval with filtering by device ID and date ranges, as well as ranges for the calculated metrics.
- **Configuration Driven**: Uses `.env` files to manage environment-specific configurations like database URIs and message queue URLs.
- **Validation**: Leverages built-in NestJS validation pipes and DTOs to ensure data integrity for API requests.

---

## System Architecture

The complete system consists of two separate applications that communicate via a message queue:

1.  **Producer Application (IoT Device Simulator)**
    - A simple NestJS application that sends sample X-ray data to a RabbitMQ queue.
    - **Repository**: [https://github.com/MahdiPourkeshavarz/xray-producer.git](https://github.com/MahdiPourkeshavarz/xray-producer.git)

2.  **Consumer & API Application (This Project)**
    - Listens to the RabbitMQ queue for incoming messages.
    - Parses the raw data, performs calculations, and stores the structured result in a MongoDB database.
    - Exposes a RESTful API for clients to interact with the stored data.
    - **Repository**: [https://github.com/MahdiPourkeshavarz/xray-api.git](https://github.com/MahdiPourkeshavarz/xray-api.git)

**Flow:** `Producer App` → `RabbitMQ Message Queue` → `Consumer App (This Project)` → `MongoDB`

---

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- [Node.js](httpss://nodejs.org/en/) (v18 or later recommended)
- [npm](httpss://www.npmjs.com/)
- [MongoDB](httpss://www.mongodb.com/try/download/community) (or a MongoDB Atlas account)
- [RabbitMQ](httpss://www.rabbitmq.com/download.html)

---

## Setup and Installation

1.  **Clone the repository:**

    ```bash
    git clone [https://github.com/MahdiPourkeshavarz/xray-api.git](https://github.com/MahdiPourkeshavarz/xray-api.git)
    cd xray-api
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the root of the project and add the following configuration. Replace the placeholder values with your actual credentials.

    ```env
    # .env

    # Your MongoDB connection string
    MONGO_URI=mongodb+srv://<user>:<password>@<cluster-address>/<database-name>

    # URL for your RabbitMQ server
    RABBITMQ_URL=amqp://guest:guest@localhost:5672

    # Name for the queue the application will listen to
    RABBITMQ_XRAY_QUEUE=x-ray_queue
    ```

---

## Running the Application

To run the application in development mode with hot-reloading:

```bash
npm run start:dev
```

The application will be running on `http://localhost:3000`. The console will log messages indicating a successful connection to RabbitMQ and the database.

---

## API Endpoints Reference

All endpoints are prefixed with `/signals`.

| Method   | Endpoint | Description                                                                    | Query Parameters                                                                                           | Request Body      |
| :------- | :------- | :----------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------- | :---------------- |
| `POST`   | `/`      | Creates a new signal. (Primarily for testing; main data flow is via RabbitMQ). |                                                                                                            | `CreateSignalDto` |
| `GET`    | `/`      | Retrieves all signals with advanced filtering.                                 | `deviceId`, `startDate`, `endDate`, `minAverageSpeed`, `maxAverageSpeed`, `minDurationMs`, `maxDurationMs` |                   |
| `GET`    | `/:id`   | Retrieves a single signal by its unique ID.                                    |                                                                                                            |                   |
| `PATCH`  | `/:id`   | Updates a signal's metadata. Only non-calculated fields can be updated.        |                                                                                                            | `UpdateSignalDto` |
| `DELETE` | `/:id`   | Deletes a signal by its unique ID.                                             |                                                                                                            |                   |

#### Example `GET` Request with Filtering:

```
http://localhost:3000/signals?deviceId=some-device-id&startDate=2025-01-01&minAverageSpeed=2.5
```

---

## Assumptions and Design Decisions

- **"Any other relevant x-ray data parameters"**: The project description included this clause. Based on this, I made the decision to enhance the data processing by calculating and storing three additional relevant metrics: `averageSpeed`, `maxSpeed`, and `durationMs`. This provides richer data for potential analysis without storing the voluminous raw data points.

- **Immutable Calculated Data**: The `PATCH /:id` endpoint intentionally does not allow for updating the calculated fields (`averageSpeed`, etc.). These fields are derived directly from the source message and should not be modified independently to maintain data integrity.
