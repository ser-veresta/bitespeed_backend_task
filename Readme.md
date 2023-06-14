## Table of contents

- [General info](#general-info)
- [Assumption](#assumption)
- [Technologies](#technologies)
- [Setup](#setup)
- [Resume](./Gopal_Resume_.pdf)

## General info

Refer [here](https://bitespeed.notion.site/Bitespeed-Backend-Task-Identity-Reconciliation-53392ab01fe149fab989422300423199) for requirement.

Deployed Project **/identity** Endpoint link: https://bitespeed.ser-veresta.dev/api/identity

###Assumption
Assuming we should not create a new user when the request email and phone number has a exactly matching data in DB

## Technologies

Project is created with:

- NodeJS
- Typscript
- Express
- Postgres

## Setup

To run this project follow the bellow steps (Need Docker Compose installed locally):

```
$ git clone https://github.com/ser-veresta/bitespeed_backend_task.git
$ cd bitespeed_backend_task
$ docker-compose up -d

```

The Server start in PORT 8080 as per the docker compose file.
