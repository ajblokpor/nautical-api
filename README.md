
# Introduction
This is the home of the international Nautical Location API.
## Definitions
For the definition of the API see the Open API definiton (Swagger) [document](blob/main/design/swagger.yaml). 
## Code
### Demo API
To try the API as a client you can run the Demo API application. This will provide a number of fictive terminals, berths and optionally berth positions that you can check with any REST client like [Postman](https://www.postman.com/).
You must install [NodeJS](https://nodejs.org/) on your machine to be able to run the application.
### Map
To look at the location data on a map you can run the Maps application. This show the information on a map. On this map you can select a terminal or berth and see the corresponding information. 
You can use this application in combination with the Demo API or with your own developed location API.
## Test
For testing your API you can run the [Postman](https://www.postman.com/) collection. This will call your API and run a number of tests to look if the data conforms to the API.
