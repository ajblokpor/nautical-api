# Introduction
This folder contains the Nautical Data API as specified in the PCO Guide of IAPH and IHMA, facilitated by the IHO.
The folder includes the official API specification, a demo implementation, and validation tools intended to support consistent and accurate use of the standard.

## Definitions
For the definition of the API see the Open API definition (Swagger) [document](./design/swagger.yaml).

## Code

### Demo API
The Demo API provides a local instance of the Nautical Data API for testing, evaluation, and exploration. It offers sample data of terminals and berths from the Port of Rotterdam. The API can be accessed using any REST client, including [Postman](https://www.postman.com/).
Installation of [NodeJS](https://nodejs.org/) is required to run the application.

### Map
The Maps application enables visualization of location data on an interactive map. Users can view terminals, berths, and associated details by selecting them directly on the map. The application can be used alongside the Demo API or an independently developed implementation of the Nautical Data API. Running the Maps application requires [NodeJS](https://nodejs.org/) and a [MapBox](https://www.mapbox.com/) API key, which is available free of charge for development purposes.

## Test
A [Postman](https://www.postman.com/) collection is included to verify whether an implementation conforms to the API specification. The collection performs a series of automated tests designed to assess compliance with the defined data structures, behaviors, and validation rules.
