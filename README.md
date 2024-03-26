# For umzug report

## Step1
```bash
$ npm i
$ npm run start
```

## Step2
look the database result.

We see the tables was created  
![](./docs/assets/result-tables.png)

and the `sequelize_meta` data was:  
![](./docs/assets/sequelize-meta.png)

there is no `author` column.

## What we want

1. User can override types  
![](./docs/assets/want-1-override-types.png)

2. User can use self defined properties with types  
![](./docs/assets/want-2-add-self-params.png)

3. The properties can taken effected.  
![](./docs/assets/want-3-can-take-effect.png)