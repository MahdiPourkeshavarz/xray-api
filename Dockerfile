FROM node:18-alpine AS base

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to leverage Docker layer caching
COPY package*.json ./

# ---

# Stage 2: Install production dependencies
FROM base AS dependencies
RUN npm install

# ---

# Stage 3: Build the application
FROM base AS build
# Copy the dependencies from the previous stage
COPY --from=dependencies /usr/src/app/node_modules ./node_modules
# Copy the rest of the application source code
COPY . .
# Run the build command to compile TypeScript to JavaScript
RUN npm run build

# ---

# Stage 4: Create the final, small production image
FROM base AS production
# Copy only the production dependencies from the 'dependencies' stage
COPY --from=dependencies /usr/src/app/node_modules ./node_modules
# Copy the built application from the 'build' stage
COPY --from=build /usr/src/app/dist ./dist

# Expose the port the application runs on
EXPOSE 3000

# The command to run the application when the container starts
CMD ["node", "dist/main"]