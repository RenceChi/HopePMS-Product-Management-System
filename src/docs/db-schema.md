# HopePMS Database Schema

## product table
| Column        | Type         | Constraint                        |
|---------------|--------------|-----------------------------------|
| prodcode      | VARCHAR      | PRIMARY KEY, NOT NULL             |
| description   | VARCHAR      | NULL                              |
| unit          | VARCHAR      | NULL, CHECK ('pc','ea','mtr',...) |
| record_status | VARCHAR      | NULL, DEFAULT 'ACTIVE'            |
| stamp         | VARCHAR      | NULL                              |

## pricehist table
| Column        | Type         | Constraint                                   |
|---------------|--------------|----------------------------------------------|
| effdate       | DATE         | PRIMARY KEY, NOT NULL                        |
| prodcode      | VARCHAR      | PRIMARY KEY, FOREIGN KEY (product), NOT NULL |
| unitprice     | NUMERIC      | NULL, CHECK (unitprice > 0)                  |
| stamp         | VARCHAR      | NULL                                         |

## user table
| Column        | Type         | Constraint                                                  |
|---------------|--------------|-------------------------------------------------------------|
| userid        | VARCHAR      | PRIMARY KEY, NOT NULL                                       |
| email         | VARCHAR      | UNIQUE, NOT NULL                                            |
| username      | VARCHAR      | NULL                                                        |
| user_type     | VARCHAR      | NULL, DEFAULT 'USER', CHECK ('SUPERADMIN', 'ADMIN', 'USER') |
| record_status | VARCHAR      | NULL, DEFAULT 'ACTIVE'                                      |
| firstname     | VARCHAR      | NULL                                                        |
| lastname      | VARCHAR      | NULL                                                        |
| stamp         | VARCHAR      | NULL                                                        |

## module table
| Column        | Type         | Constraint                    |
|---------------|--------------|-------------------------------|
| module_id     | VARCHAR      | PRIMARY KEY, NOT NULL         |
| module_name   | VARCHAR      | NULL                           |

## user_module table
| Column        | Type         | Constraint                                  |
|---------------|--------------|---------------------------------------------|
| userid        | VARCHAR      | PRIMARY KEY, NOT NULL                       |
| module_id     | VARCHAR      | PRIMARY KEY, FOREIGN KEY (module), NOT NULL |
| rights_value  | INTEGER      | NULL, DEFAULT 0                             |
| record_status | VARCHAR      | NULL, DEFAULT 'ACTIVE'                      |
| stamp         | VARCHAR      | NULL                                        |

## rights table
| Column        | Type         | Constraint                    |
|---------------|--------------|-------------------------------|
| right_id      | VARCHAR      | PRIMARY KEY, NOT NULL         |
| right_name    | VARCHAR      | NULL                           |

## user_module_rights
| Column        | Type         | Constraint                                  |
|---------------|--------------|---------------------------------------------|
| userid        | VARCHAR      | PRIMARY KEY, FOREIGN KEY (user), NOT NULL   |
| module_id     | VARCHAR      | PRIMARY KEY, FOREIGN KEY (module), NOT NULL |
| right_id      | VARCHAR      | PRIMARY KEY, FOREIGN KEY (rights), NOT NULL |
| rights_value  | INTEGER      | NULL, DEFAULT 0                             |
| record_status | VARCHAR      | NULL, DEFAULT 'ACTIVE'                      |
| stamp         | VARCHAR      | NULL                                        |


## Key Rules
- No hard deletes anywhere in the app
- INACTIVE records invisible to USER accounts
- stamp column hidden from USER accounts
- Only ADMIN/SUPERADMIN can recover INACTIVE records