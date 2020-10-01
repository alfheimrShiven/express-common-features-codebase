# Node.js/Express.js plug&play modules! :floppy_disk:
##### Node.js/Express.js common usecase modules which can be plugged into any Node.js project you're working on. 

### Modules included: :pushpin:
1. Initializing the Express Server (Boilerplate to get an express app up and running)
2. DB connection and basic CRUD operations using mongoose 
3. Middleware adding features like: Pagination, Sorting, Searching, Selecting
4. Establishing relationships between models
5. Using Populate & Virtuals
6. Calculating average using Aggregate
7. Image Uploads
8. Code Refactoring (example) & Advance Controlled Middleware
9. User Signup JWT token
10. User Profile creation with password encryption
11. User Authentication
12. Sending JWT as cookies
13. Protecting routes through token verification middleware
14. Role authorization mechanism
15. Permission controlled CRUD ops
16. Reset Password
17. Email Service
18. Admin Features: CRUD ops on Users
19. Review System
20. Logout & Cookie clearence 
21. Google OAuth using Passport.js

### Usage
Rename `"config/config.env.env"` to `"config/config.env"` and update the values/settings to your own.

### Install Dependencies

```
npm install
```

### Run App
##### Run in dev mode

```
npm run dev
```

##### Run in prod mode
```
npm start
```

### Database Seeder
To seed the database with users, bootcamps, courses and reviews with data from the "_data" folder, run
##### Destroy all data
```
node seeder -d
```

###### Import all data
```
node seeder -i
```

### Documentation :book:
Find the extensive API documentation here: https://documenter.getpostman.com/view/4736430/T17M7RDn 

### Author :surfer:
Version: 1.0.0
License: MIT
Author: @alfheimrShiven
